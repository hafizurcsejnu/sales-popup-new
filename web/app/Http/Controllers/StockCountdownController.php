<?php

namespace App\Http\Controllers;

use App\Models\StockCountdown;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class StockCountdownController extends Controller
{
    //Store Stock Countdown data
    public function store(Request $request): JsonResponse
    {
        $session = $request->get('shopifySession');
        $shopDomain = $session->getShop();
        
        Log::info("🟢 Stock Countdown Save Request:", [
            'shop' => $shopDomain,
            'data' => $request->all()
        ]);

        $shop = Shop::where('shop', $shopDomain)->firstOrFail();

        $request->validate([
            'title' => 'required|string|max:255',
            'stock_limit' => 'required|integer|min:1',
            'message_template' => 'required|string',
            'selected_variants' => 'required|array|min:1',
            'show_progress_bar' => 'boolean',
            'bar_color' => 'array',
            'bar_hex_color' => 'string',
            'progress_bar_style' => 'in:rounded,flat',
            'progress_bar_position' => 'in:above,below',
            'progress_bar_width' => 'integer|min:5|max:100',
            'progress_bar_height' => 'integer|min:5|max:30',
            'progress_bar_background_color' => 'array',
            'progress_bar_background_hex_color' => 'string',
            'design_config' => 'array',
            'placement_config' => 'array',
            'is_published' => 'boolean',
        ]);

        // Generate unique stock_id
        $stockId = Str::uuid();

        $stockCountdown = StockCountdown::create([
            'shop_id' => $shop->id,
            'stock_id' => $stockId,
            'title' => $request->title,
            'is_published' => $request->boolean('is_published', false),
            'stock_limit' => $request->stock_limit,
            'message_template' => $request->message_template,
            'selected_variants' => $request->selected_variants,
            'show_progress_bar' => $request->boolean('show_progress_bar', false),
            'bar_color' => $request->bar_color,
            'bar_hex_color' => $request->bar_hex_color,
            'progress_bar_style' => $request->progress_bar_style ?? 'rounded',
            'progress_bar_position' => $request->progress_bar_position ?? 'below',
            'progress_bar_width' => $request->progress_bar_width ?? 100,
            'progress_bar_height' => $request->progress_bar_height ?? 8,
            'progress_bar_background_color' => $request->progress_bar_background_color,
            'progress_bar_background_hex_color' => $request->progress_bar_background_hex_color,
            'design_config' => $request->design_config ?? [],
            'placement_config' => $request->placement_config ?? [],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Stock countdown saved successfully',
            'data' => $stockCountdown
        ]);
    }

    /**
     * Toggle published status
     */
    public function togglePublished($id): JsonResponse
    {
        $stockCountdown = StockCountdown::where('stock_id', $id)->firstOrFail();
        $stockCountdown->update(['is_published' => !$stockCountdown->is_published]);

        return response()->json([
            'success' => true,
            'message' => 'Published status updated successfully',
            'data' => $stockCountdown
        ]);
    }


    /**
     * Get Stock countdown
     */
    public function edit($id): JsonResponse
    {
        $stockCountdown = StockCountdown::where('stock_id', $id)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $stockCountdown
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * Update stock countdown
     */
    public function update(Request $request, $id): JsonResponse
    {
        $stockCountdown = StockCountdown::where('stock_id', $id)->firstOrFail();

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'stock_limit' => 'sometimes|integer|min:1',
            'message_template' => 'sometimes|string',
            'selected_variants' => 'sometimes|array|min:1',
            'show_progress_bar' => 'boolean',
            'bar_color' => 'array',
            'bar_hex_color' => 'string',
            'progress_bar_style' => 'in:rounded,flat',
            'progress_bar_position' => 'in:above,below',
            'progress_bar_width' => 'integer|min:5|max:100',
            'progress_bar_height' => 'integer|min:5|max:30',
            'progress_bar_background_color' => 'array',
            'progress_bar_background_hex_color' => 'string',
            'design_config' => 'array',
            'placement_config' => 'array',
            'is_published' => 'boolean',
        ]);

        $updateData = $request->only([
            'title', 'stock_limit', 'message_template', 'selected_variants',
            'show_progress_bar', 'bar_color', 'bar_hex_color', 'progress_bar_style',
            'progress_bar_position', 'progress_bar_width', 'progress_bar_height',
            'progress_bar_background_color', 'progress_bar_background_hex_color',
            'design_config', 'placement_config', 'is_published'
        ]);

        $stockCountdown->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Stock countdown updated successfully',
            'data' => $stockCountdown
        ]);
    }


    /**
     * Get all Stock countdowns for shop
     */
    public function index(Request $request): JsonResponse
    {
        $session = $request->get('shopifySession');
        $shopDomain = $session->getShop();
        
        $shop = Shop::where('shop', $shopDomain)->firstOrFail();
        
        $stockCountdowns = StockCountdown::where('shop_id', $shop->id)
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $stockCountdowns
        ]);
    }


    /**
     * Get stock countdown configuration for storefront (API route version)
     */
    public function getConfig($id): JsonResponse
    {
        try {
            Log::info("🔍 Stock Countdown getConfig request:", ['stock_id' => $id]);

            $stockCountdown = StockCountdown::where('stock_id', $id)
                ->where('is_published', true)
                ->with('shop') // Load the shop relationship
                ->first();

            if (!$stockCountdown) {
                Log::warning("❌ Stock countdown not found:", ['stock_id' => $id]);
                return response()->json([
                    'error' => 'Stock countdown not found or not published'
                ], 404);
            }

            // Safely get shop domain with null check
            $shopDomain = $stockCountdown->shop ? $stockCountdown->shop->shop : null;

            Log::info("✅ Stock countdown found:", [
                'stock_id' => $stockCountdown->stock_id,
                'shop_domain' => $shopDomain
            ]);

            return response()->json([
                'id' => $stockCountdown->id,
                'stock_id' => $stockCountdown->stock_id,
                'title' => $stockCountdown->title,
                'stock_limit' => $stockCountdown->stock_limit,
                'message_template' => $stockCountdown->message_template,
                'selected_variants' => $stockCountdown->selected_variants,
                'show_progress_bar' => $stockCountdown->show_progress_bar,
                'bar_color' => $stockCountdown->bar_color,
                'bar_hex_color' => $stockCountdown->bar_hex_color,
                'progress_bar_style' => $stockCountdown->progress_bar_style,
                'progress_bar_position' => $stockCountdown->progress_bar_position,
                'progress_bar_width' => $stockCountdown->progress_bar_width,
                'progress_bar_height' => $stockCountdown->progress_bar_height,
                'progress_bar_background_color' => $stockCountdown->progress_bar_background_color,
                'progress_bar_background_hex_color' => $stockCountdown->progress_bar_background_hex_color,
                'design_config' => $stockCountdown->design_config,
                'placement_config' => $stockCountdown->placement_config,
                'is_published' => $stockCountdown->is_published,
                'shop_domain' => $shopDomain
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Error in getConfig:", [
                'stock_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Remove the specified resource from storage.
     * Delete stock countdown
     */
    public function destroy($id): JsonResponse
    {
        $stockCountdown = StockCountdown::where('stock_id', $id)->firstOrFail();
        $stockCountdown->delete();

        return response()->json([
            'success' => true,
            'message' => 'Stock countdown deleted successfully'
        ]);
    }

    /**
     * Get inventory countdown configuration for storefront
     */
    // public function showForStorefront(Request $request): JsonResponse
    // {
    //     $stockId = $request->query('stock_id');
        
    //     Log::info("🔍 Stock Countdown Request:", [
    //         'stock_id' => $stockId,
    //         'url' => $request->fullUrl(),
    //         'ip' => $request->ip(),
    //         'user_agent' => $request->userAgent()
    //     ]);

    //     if (!$stockId) {
    //         Log::warning("❌ No stock_id provided");
    //         return response()->json(['error' => 'Stock ID is required'], 400);
    //     }

    //     Log::info("🔎 Searching for stock countdown in database:", ['stock_id' => $stockId]);
        
    //     $stockCountdown = StockCountdown::where('stock_id', $stockId)
    //         ->where('is_published', true)
    //         ->first();

    //     if (!$stockCountdown) {
    //         Log::warning("❌ Stock countdown not found or not published:", [
    //             'stock_id' => $stockId
    //         ]);
    //         return response()->json(['error' => 'Stock countdown not found or not published'], 404);
    //     }

    //     Log::info("✅ Stock countdown found in database:", [
    //         'stock_id' => $stockCountdown->stock_id,
    //         'title' => $stockCountdown->title,
    //         'is_published' => $stockCountdown->is_published,
    //         'has_design_config' => !empty($stockCountdown->design_config),
    //         'has_placement_config' => !empty($stockCountdown->placement_config)
    //     ]);

    //     // Prepare response data
    //     $responseData = [
    //         'stock_id' => $stockCountdown->stock_id,
    //         'title' => $stockCountdown->title,
    //         'stock_limit' => $stockCountdown->stock_limit,
    //         'message_template' => $stockCountdown->message_template,
    //         'selected_variants' => $stockCountdown->selected_variants,
    //         'show_progress_bar' => $stockCountdown->show_progress_bar,
    //         'bar_color' => $stockCountdown->bar_color,
    //         'bar_hex_color' => $stockCountdown->bar_hex_color,
    //         'progress_bar_style' => $stockCountdown->progress_bar_style,
    //         'progress_bar_position' => $stockCountdown->progress_bar_position,
    //         'progress_bar_width' => $stockCountdown->progress_bar_width,
    //         'progress_bar_height' => $stockCountdown->progress_bar_height,
    //         'progress_bar_background_color' => $stockCountdown->progress_bar_background_color,
    //         'progress_bar_background_hex_color' => $stockCountdown->progress_bar_background_hex_color,
    //         'design_config' => $stockCountdown->design_config,
    //         'placement_config' => $inventostockCountdownryCountdown->placement_config,
    //         'is_published' => $stockCountdown->is_published
    //     ];

    //     Log::info("📤 Returning stock countdown data:", $responseData);

    //     return response()->json($responseData);
    // }


    // get inventory new function by Dalim 

    // app/Http/Controllers/StockCountdownController.php

    public function getInventory(Request $request)
    {
        $productId = $request->query('productId');
        /** @var \Shopify\Api\AuthSession|null $session */
        $session = $request->get('shopifySession');

        if (!$productId) {
            return response()->json([
                'success' => false,
                'message' => 'Missing productId'
            ], 400);
        }

        // Prefer authenticated session; fallback to shop query if provided
        $shopDomain = $session?->getShop() ?: $request->query('shop');
        $accessToken = $session?->getAccessToken();

        if (!$accessToken) {
            // Fallback via DB if session not available (for storefront/public API calls)
            if (!$shopDomain) {
                Log::error('❌ getInventory: Missing shop domain');
                return response()->json([
                    'success' => false,
                    'message' => 'Missing authenticated session or shop'
                ], 400);
            }

            // Prefer offline access token from sessions table (source of truth)
            $dbSession = \App\Models\Session::where('shop', $shopDomain)
                ->where('is_online', 0)
                ->whereNotNull('access_token')
                ->orderByDesc('updated_at')
                ->first();

            if ($dbSession && $dbSession->access_token) {
                $accessToken = $dbSession->access_token;
                Log::info('✅ getInventory: Using offline session token', ['shop' => $shopDomain]);
            } else {
                // Fallback to shops table (backward compatibility)
                $shop = Shop::where('shop', $shopDomain)->first();
                if (!$shop) {
                    Log::error('❌ getInventory: Shop not found in database', [
                        'shop' => $shopDomain,
                        'message' => 'Shop may not be installed. Please complete OAuth installation.'
                    ]);
                    return response()->json([
                        'error' => 'Shop not found. Please ensure the app is properly installed.',
                        'shop' => $shopDomain,
                        'help' => 'The shop needs to complete OAuth installation first'
                    ], 404);
                }

                if (!$shop->access_token) {
                    Log::error('❌ getInventory: Shop has no access token', ['shop' => $shopDomain]);
                    return response()->json([
                        'error' => 'Access token missing. Please reinstall the app.',
                        'shop' => $shopDomain
                    ], 401);
                }

                $accessToken = $shop->access_token;
                Log::info('✅ getInventory: Using access token from shops table', ['shop' => $shopDomain]);
            }
        }

        $gidProductId = "gid://shopify/Product/{$productId}";

        $query = <<<GRAPHQL
        query FetchProductVariants(
          \$productId: ID!
        ) {
          product(id: \$productId) {
            id
            title
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  inventoryQuantity
                  price
                  image { url originalSrc src }
                }
              }
            }
          }
        }
        GRAPHQL;

        $variables = [ 'productId' => $gidProductId ];

        $response = Http::withHeaders([
            'X-Shopify-Access-Token' => $accessToken,
            'Content-Type' => 'application/json',
        ])->post("https://{$shopDomain}/admin/api/2024-04/graphql.json", [
            'query' => $query,
            'variables' => $variables,
        ]);

        $data = $response->json();

        if ($response->failed() || isset($data['errors'])) {
            Log::error('❌ Failed to fetch inventory data: ' . json_encode($data['errors'] ?? $data));
            return response()->json(['error' => $data['errors'] ?? 'Failed to fetch inventory data'], 500);
        }

        $inventoryData = $data['data'] ?? null;

        if (!$inventoryData) {
            Log::error('❌ "data" key not found in GraphQL response');
            return response()->json(['error' => 'Invalid response structure'], 500);
        }

        return response()->json($inventoryData);
    }
}
