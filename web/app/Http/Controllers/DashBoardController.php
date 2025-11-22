<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Countdown;
use App\Models\Shop;

class DashBoardController extends Controller
{
    public function getAllData(Request $request)
    {
        try {
            $session = $request->get('shopifySession');
            
            if (!$session) {
                Log::error("No shopify session found in request");
                return response()->json([
                    'success' => false,
                    'message' => 'No session found',
                    'data' => []
                ], 401);
            }
            
            $shopDomain = $session->getShop();
            
            Log::info("✅ Current shop domain: ".$shopDomain);

            $shop = Shop::where('shop', $shopDomain)->first();
            
            if (!$shop) {
                Log::error("Shop not found in database: ".$shopDomain);
                return response()->json([
                    'success' => false,
                    'message' => 'Shop not found in database',
                    'data' => []
                ], 404);
            }

            //Countdown Timer Table (from countdown_timers)
            $countdownTimers = DB::table('countdown_timers')
                ->select(
                    'timer_name as title',
                    'timer_id as id',
                    DB::raw("'Countdown Timer' as type"),
                    'is_published',
                    'updated_at',
                    DB::raw("CASE 
                                WHEN timer_type = 'fixed' THEN CONCAT(JSON_EXTRACT(timer_config, '$.fixed_minutes'), ' min')
                                WHEN timer_type = 'generic' THEN CONCAT('Ends: ', JSON_EXTRACT(timer_config, '$.end_date'), ' ', JSON_EXTRACT(timer_config, '$.end_time'))
                                WHEN timer_type = 'daily' THEN CONCAT('Daily: ', JSON_EXTRACT(timer_config, '$.start_time'), ' - ', JSON_EXTRACT(timer_config, '$.end_time'))
                                ELSE timer_type
                             END as details")
                )
                ->where('countdown_timers.shop_id', $shop->id)
                ->get();

            // Stock Countdown Table (from stock_countdowns)
            $stockCountdowns = DB::table('stock_countdowns')
                ->select(
                    'title',
                    'stock_id as id',
                    DB::raw("'Stock Countdown' as type"),
                    'is_published',
                    'updated_at',
                    DB::raw("CONCAT('Threshold: ', stock_limit) as details")
                )
                ->where('stock_countdowns.shop_id', $shop->id)
                ->get();
            // ✅ যদি ভবিষ্যতে আরও টেবিল আসে, এখানে নতুন query যোগ করুন
            // $soldCounters = ...

            // Merge all collections
            $merged = $countdownTimers
                ->merge($stockCountdowns)
                //->merge($finalCountdownTimers)
                ->sortByDesc('updated_at') // সর্বশেষ আপডেট আগে দেখাবে
                ->values(); // index reset

            Log::info("✅ Merged data count: ".$merged->count());
            
            return response()->json([
                'success' => true,
                'data' => $merged
            ]);
        } catch (\Exception $e) {
            Log::error("Dashboard error: ".$e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error loading dashboard data: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }
}
