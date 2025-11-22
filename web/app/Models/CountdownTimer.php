<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CountdownTimer extends Model
{
    use HasFactory;

    protected $table = 'countdown_timers';

    protected $fillable = [
        'shop_id',
        'timer_id',
        'timer_name',
        'title',
        'sub_heading',
        'timer_labels',
        'timer_type',
        'timer_config',
        'design_config',
        'placement_config',
        'is_published',
    ];

    protected $casts = [
        'timer_labels' => 'array',
        'timer_config' => 'array',
        'design_config' => 'array',
        'placement_config' => 'array',
        'is_published' => 'boolean',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get timer configuration based on timer type
     */
    public function getTimerConfigAttribute($value)
    {
        $config = json_decode($value, true) ?? [];
        
        // Add type-specific defaults
        switch ($this->timer_type) {
            case 'fixed':
                return array_merge([
                    'fixed_minutes' => 60,
                    'once_it_ends' => 'hide',
                    'custom_end_title' => 'Sales Ends',
                ], $config);
                
            case 'generic':
                return array_merge([
                    'timer_start' => 'now',
                    'start_date' => null,
                    'start_time' => null,
                    'end_date' => null,
                    'end_time' => null,
                    'once_it_ends' => 'hide',
                    'custom_end_title' => 'Sales Ends',
                ], $config);
                
            case 'daily':
                return array_merge([
                    'selected_days' => [1, 2, 3, 4, 5], // Monday to Friday
                    'start_date' => null,
                    'end_date' => null,
                    'start_time' => '09:00',
                    'end_time' => '17:00',
                    'once_it_ends' => 'hide',
                    'custom_end_title' => 'Sales Ends',
                ], $config);
                
            default:
                return $config;
        }
    }

    /**
     * Get design configuration with defaults
     */
    public function getDesignConfigAttribute($value)
    {
        $config = json_decode($value, true) ?? [];
        
        return array_merge([
            'backgroundColor' => ['hue' => 0, 'saturation' => 0, 'brightness' => 0.9],
            'hexColor' => '#ffffff',
            'borderColor' => ['hue' => 0, 'saturation' => 0, 'brightness' => 0.8],
            'cardBorderRadius' => 12,
            'cardBorderSize' => 2,
            'cardBorderColor' => '#333333',
            'borderHexColor' => '#cccccc',
            'insideTop' => 10,
            'insideBottom' => 10,
            'outsideTop' => 0,
            'outsideBottom' => 0,
            'titleSize' => 28,
            'titleColor' => ['hue' => 0, 'saturation' => 0, 'brightness' => 0.13],
            'titleHexColor' => '#202223',
            'subheadingSize' => 16,
            'subheadingColor' => ['hue' => 0, 'saturation' => 0, 'brightness' => 0.13],
            'subheadingHexColor' => '#202223',
            'timerSize' => 40,
            'timerColor' => ['hue' => 0, 'saturation' => 0, 'brightness' => 0.13],
            'timerHexColor' => '#202223',
            'legendSize' => 14,
            'legendColor' => ['hue' => 0, 'saturation' => 0, 'brightness' => 0.13],
            'legendHexColor' => '#202223',
            'borderRadius' => 6,
            'borderWidth' => 1,
        ], $config);
    }

    /**
     * Get placement configuration with defaults
     */
    public function getPlacementConfigAttribute($value)
    {
        $config = json_decode($value, true) ?? [];
        
        return array_merge([
            'display_position' => 'before-title',
            'display_pages' => 'product-only',
        ], $config);
    }

    /**
     * Scope for published timers
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope for specific timer type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('timer_type', $type);
    }

    /**
     * Scope for shop
     */
    public function scopeForShop($query, $shopId)
    {
        return $query->where('shop_id', $shopId);
    }
}
