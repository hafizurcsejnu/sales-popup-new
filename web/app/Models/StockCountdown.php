<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockCountdown extends Model
{
    use HasFactory;
    protected $table = 'stock_countdowns';

    protected $fillable = [
        'shop_id',
        'stock_id',
        'title',
        'is_published',
        'stock_limit',
        'message_template',
        'selected_variants',
        'show_progress_bar',
        'bar_color',
        'bar_hex_color',
        'progress_bar_style',
        'progress_bar_position',
        'progress_bar_width',
        'progress_bar_height',
        'progress_bar_background_color',
        'progress_bar_background_hex_color',
        'design_config',
        'placement_config',
    ];

    protected $casts = [
        'selected_variants' => 'array',
        'bar_color' => 'array',
        'progress_bar_background_color' => 'array',
        'design_config' => 'array',
        'placement_config' => 'array',
        'is_published' => 'boolean',
        'show_progress_bar' => 'boolean',
        'stock_limit' => 'integer',
        'progress_bar_width' => 'integer',
        'progress_bar_height' => 'integer',
    ];

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
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
            'messageSize' => 16,
            'messageColor' => ['hue' => 0, 'saturation' => 0, 'brightness' => 0.13],
            'messageHexColor' => '#202223',
        ], $config);
    }

    /**
     * Get placement configuration with defaults
     */
    public function getPlacementConfigAttribute($value)
    {
        $config = json_decode($value, true) ?? [];
        
        return array_merge([
            'display_position' => 'after-price-before-quantity',
            'display_pages' => 'product-only',
        ], $config);
    }

    /**
     * Scope for published inventory countdowns
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope for shop
     */
    public function scopeForShop($query, $shopId)
    {
        return $query->where('shop_id', $shopId);
    }

}
