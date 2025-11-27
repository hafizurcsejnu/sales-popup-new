<?php

use App\Exceptions\ShopifyProductCreatorException;
use App\Lib\AuthRedirection;
use App\Lib\EnsureBilling;
use App\Lib\ProductCreator;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Shopify\Auth\OAuth;
use Shopify\Auth\Session as AuthSession;
use Shopify\Clients\HttpHeaders;
use Shopify\Clients\Rest;
use Shopify\Clients\Graphql;
use Shopify\Context;
use Shopify\Exception\InvalidWebhookException;
use Shopify\Utils;
use Shopify\Webhooks\Registry;
use Shopify\Webhooks\Topics;
use App\Http\Controllers\StockCountdownController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
| If you are adding routes outside of the /api path, remember to also add a
| proxy rule for them in web/frontend/vite.config.js
|
*/


// stock countdown for storefront
//Route::get('/api/apps/stock_countdown', [StockCountdownController::class, 'showForStorefront']);
//Route::get('/api/apps/stock_countdown', [StockCountdownController::class, 'check']);
Route::get('/api/apps/secure_inventory', [StockCountdownController::class, 'getInventory']);

Route::fallback(function (Request $request) {
    if (Context::$IS_EMBEDDED_APP &&  $request->query("embedded", false) === "1") {
        if (env('APP_ENV') === 'production') {
            return file_get_contents(public_path('index.html'));
        } else {
            return file_get_contents(base_path('frontend/index.html'));
        }
    } else {
        return redirect(Utils::getEmbeddedAppUrl($request->query("host", null)) . "/" . $request->path());
    }
})->middleware('shopify.installed');

Route::get('/api/auth', function (Request $request) {
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    // Delete any previously created OAuth sessions that were not completed (don't have an access token)
    Session::where('shop', $shop)->where('access_token', null)->delete();

    return AuthRedirection::redirect($request);
});

Route::get('/api/auth/callback', function (Request $request) {
    $session = OAuth::callback(
        $request->cookie(),
        $request->query(),
        ['App\Lib\CookieHandler', 'saveShopifyCookie'],
    );

    $host = $request->query('host');
    $shop = Utils::sanitizeShopDomain($request->query('shop'));
    $accessToken = $session->getAccessToken();

    // Sync access token to shops table for storefront API calls
    // This ensures the token is available for public endpoints like getInventory
    // Only sync offline tokens (long-lived, not user-specific)
    if ($accessToken && !$session->isOnline()) {
        \App\Models\Shop::updateOrCreate(
            ['shop' => $shop],
            ['access_token' => $accessToken]
        );
        Log::info("✅ Synced offline access token to shops table for new installation", [
            'shop' => $shop,
            'hasToken' => !empty($accessToken)
        ]);
    }

    $response = Registry::register('/api/webhooks', Topics::APP_UNINSTALLED, $shop, $accessToken);
    if ($response->isSuccess()) {
        Log::debug("Registered APP_UNINSTALLED webhook for shop $shop");
    } else {
        Log::error(
            "Failed to register APP_UNINSTALLED webhook for shop $shop with response body: " .
                print_r($response->getBody(), true)
        );
    }

    $redirectUrl = Utils::getEmbeddedAppUrl($host);
    if (Config::get('shopify.billing.required')) {
        list($hasPayment, $confirmationUrl) = EnsureBilling::check($session, Config::get('shopify.billing'));

        if (!$hasPayment) {
            $redirectUrl = $confirmationUrl;
        }
    }

    return redirect($redirectUrl);
});

Route::get('/api/products/count', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $client = new Graphql($session->getShop(), $session->getAccessToken());
    
    // GraphQL query to get product count
    // Note: Shopify GraphQL doesn't provide a direct count field,
    // so we query products and count them with pagination
    $count = 0;
    $cursor = null;
    $hasNextPage = true;
    
    while ($hasNextPage) {
        $query = <<<'QUERY'
        query getProductsCount($cursor: String) {
          products(first: 250, after: $cursor) {
            edges {
              node {
                id
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
        QUERY;

        $variables = $cursor ? ['cursor' => $cursor] : [];
        $response = $client->query([
            'query' => $query,
            'variables' => $variables
        ]);
        
        $body = $response->getDecodedBody();
        
        if (isset($body['errors'])) {
            Log::error('GraphQL error fetching product count: ' . json_encode($body['errors']));
            return response()->json(['count' => 0, 'error' => $body['errors']], 500);
        }
        
        $products = $body['data']['products']['edges'] ?? [];
        $count += count($products);
        
        $pageInfo = $body['data']['products']['pageInfo'] ?? [];
        $hasNextPage = $pageInfo['hasNextPage'] ?? false;
        $cursor = $pageInfo['endCursor'] ?? null;
    }
    
    return response()->json(['count' => $count]);
})->middleware('shopify.auth');

Route::post('/api/products', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $success = $code = $error = null;
    try {
        ProductCreator::call($session, 5);
        $success = true;
        $code = 200;
        $error = null;
    } catch (\Exception $e) {
        $success = false;

        if ($e instanceof ShopifyProductCreatorException) {
            $code = $e->response->getStatusCode();
            $error = $e->response->getDecodedBody();
            if (array_key_exists("errors", $error)) {
                $error = $error["errors"];
            }
        } else {
            $code = 500;
            $error = $e->getMessage();
        }

        Log::error("Failed to create products: $error");
    } finally {
        return response()->json(["success" => $success, "error" => $error], $code);
    }
})->middleware('shopify.auth');

Route::post('/api/webhooks', function (Request $request) {
    try {
        $topic = $request->header(HttpHeaders::X_SHOPIFY_TOPIC, '');

        $response = Registry::process($request->header(), $request->getContent());
        if (!$response->isSuccess()) {
            Log::error("Failed to process '$topic' webhook: {$response->getErrorMessage()}");
            return response()->json(['message' => "Failed to process '$topic' webhook"], 500);
        }
    } catch (InvalidWebhookException $e) {
        Log::error("Got invalid webhook request for topic '$topic': {$e->getMessage()}");
        return response()->json(['message' => "Got invalid webhook request for topic '$topic'"], 401);
    } catch (\Exception $e) {
        Log::error("Got an exception when handling '$topic' webhook: {$e->getMessage()}");
        return response()->json(['message' => "Got an exception when handling '$topic' webhook"], 500);
    }
});
