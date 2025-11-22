<?php

namespace App\Http\Controllers;

use App\Models\CountdownTimer;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class CountdownTimerController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function save(Request $request)
    {
        //
    }

    public function store(Request $request): JsonResponse
    {
        $session = $request->get('shopifySession');

        // Log for debugging
        Log::info("🔐 Access Token:", ['token' => $session?->getAccessToken()]);
        Log::info("🛍 Shop:", ['shop' => $session?->getShop()]);
        
        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Shopify session is not available.'
            ], 401);
        }

        $request->validate([
            'timer_name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'sub_heading' => 'required|string|max:255',
            'timer_type' => 'required|in:fixed,generic,daily',
            'timer_config' => 'required|array',
            'design_config' => 'required|array',
            'placement_config' => 'required|array',
        ]);

        $shopDomain = $session->getShop();
        $accessToken = $session->getAccessToken();

        $shop = Shop::updateOrCreate(
            ['shop' => $shopDomain],
            ['access_token' => $accessToken]
        );

        // Prepare timer configuration based on type
        $timerConfig = $this->prepareTimerConfig($request->timer_type, $request->timer_config);

        $countdown = CountdownTimer::create([
            'shop_id' => $shop->id,
            'timer_id' => Str::uuid(),
            'timer_name' => $request->timer_name,
            'title' => $request->title,
            'sub_heading' => $request->sub_heading,
            'timer_labels' => $request->timer_labels ?? [
                'days' => 'Days',
                'hours' => 'Hrs',
                'minutes' => 'Mins',
                'seconds' => 'Secs'
            ],
            'timer_type' => $request->timer_type,
            'timer_config' => $timerConfig,
            'design_config' => $request->design_config,
            'placement_config' => $request->placement_config,
            'is_published' => $request->boolean('is_published', false),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Countdown timer saved successfully',
            'data' => $countdown
        ]);
    }

    /**
     * Prepare timer configuration based on type
     */
    private function prepareTimerConfig(string $timerType, array $config): array
    {
        switch ($timerType) {
            case 'fixed':
                return [
                    'fixed_minutes' => $config['fixed_minutes'] ?? 60,
                    'once_it_ends' => $config['once_it_ends'] ?? 'hide',
                    'custom_end_title' => $config['custom_end_title'] ?? 'Sales Ends',
                ];

            case 'generic':
                return [
                    'timer_start' => $config['timer_start'] ?? 'now',
                    'start_date' => $config['start_date'] ?? null,
                    'start_time' => $config['start_time'] ?? null,
                    'end_date' => $config['end_date'] ?? null,
                    'end_time' => $config['end_time'] ?? null,
                    'once_it_ends' => $config['once_it_ends'] ?? 'hide',
                    'custom_end_title' => $config['custom_end_title'] ?? 'Sales Ends',
                ];

            case 'daily':
                return [
                    'selected_days' => $config['selected_days'] ?? [1, 2, 3, 4, 5],
                    'start_date' => $config['start_date'] ?? null,
                    'end_date' => $config['end_date'] ?? null,
                    'start_time' => $config['start_time'] ?? '09:00',
                    'end_time' => $config['end_time'] ?? '17:00',
                    'once_it_ends' => $config['once_it_ends'] ?? 'hide',
                    'custom_end_title' => $config['custom_end_title'] ?? 'Sales Ends',
                ];

            default:
                return $config;
        }
    }

    /**
     * Toggle published status
     */
    public function togglePublished($id): JsonResponse
    {
        $countdown = CountdownTimer::where('timer_id', $id)->firstOrFail();
        $countdown->update(['is_published' => !$countdown->is_published]);

        return response()->json([
            'success' => true,
            'message' => 'Published status updated successfully',
            'data' => $countdown
        ]);
    }
    /**
     * Display the specified resource.
     *
     * @param  \App\Models\CountdownTimer  $countdownTimer
     * @return \Illuminate\Http\Response
     */
    public function show(CountdownTimer $countdownTimer)
    {
        //
    }

    /**
     * Get countdown timer configuration for storefront (API route version)
     * Returns data directly without wrapper (following stock.js pattern)
     */
    public function getConfig($id): JsonResponse
    {
        // For storefront, we don't need shop validation since timer_id is unique
        $countdown = CountdownTimer::where('timer_id', $id)
            ->where('is_published', true)
            ->first();

        if (!$countdown) {
            return response()->json([
                'error' => 'Timer not found or not published'
            ], 404);
        }

        // Return the data directly (following stock.js pattern exactly)
        return response()->json([
            'id' => $countdown->id,
            'timer_id' => $countdown->timer_id,
            'title' => $countdown->title,
            'sub_heading' => $countdown->sub_heading,
            'timer_labels' => $countdown->timer_labels,
            'timer_type' => $countdown->timer_type,
            'timer_config' => $countdown->timer_config,
            'design_config' => $countdown->design_config,
            'placement_config' => $countdown->placement_config,
            'is_published' => $countdown->is_published
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\CountdownTimer  $countdownTimer
     * @return \Illuminate\Http\Response
     */
    // public function edit(CountdownTimer $countdownTimer)
    // {
    //     //
    // }

    /**
     * Get countdown timer
     */
    public function edit($id): JsonResponse
    {
        $countdown = CountdownTimer::where('timer_id', $id)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $countdown
        ]);
    }
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\CountdownTimer  $countdownTimer
     * @return \Illuminate\Http\Response
     */
    // public function update(Request $request, CountdownTimer $countdownTimer)
    // {
    //     //
    // }

    /**
     * Update countdown timer
     */
    public function update(Request $request, $id): JsonResponse
    {
        $countdown = CountdownTimer::where('timer_id', $id)->firstOrFail();

        $request->validate([
            'timer_name' => 'sometimes|string|max:255',
            'title' => 'sometimes|string|max:255',
            'sub_heading' => 'sometimes|string|max:255',
            'timer_type' => 'sometimes|in:fixed,generic,daily',
            'timer_config' => 'sometimes|array',
            'design_config' => 'sometimes|array',
            'placement_config' => 'sometimes|array',
        ]);

        $updateData = $request->only([
            'timer_name', 'title', 'sub_heading', 'timer_type', 'is_published'
        ]);

        if ($request->has('timer_config')) {
            $updateData['timer_config'] = $this->prepareTimerConfig(
                $request->timer_type ?? $countdown->timer_type, 
                $request->timer_config
            );
        }

        if ($request->has('design_config')) {
            $updateData['design_config'] = $request->design_config;
        }

        if ($request->has('placement_config')) {
            $updateData['placement_config'] = $request->placement_config;
        }

        if ($request->has('timer_labels')) {
            $updateData['timer_labels'] = $request->timer_labels;
        }

        $countdown->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Countdown timer updated successfully',
            'data' => $countdown
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\CountdownTimer  $countdownTimer
     * @return \Illuminate\Http\Response
     */
    // public function destroy(CountdownTimer $countdownTimer)
    // {
    //     //
    // }

    /**
     * Delete countdown timer
     */
    public function destroy($id): JsonResponse
    {
        $countdown = CountdownTimer::where('timer_id', $id)->firstOrFail();
        $countdown->delete();

        return response()->json([
            'success' => true,
            'message' => 'Countdown timer deleted successfully'
        ]);
    }
}
