<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStockCountdownsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('stock_countdowns', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id');
            $table->string('stock_id')->unique(); // Similar to timer_id
            $table->string('title');
            $table->boolean('is_published')->default(false);
            $table->integer('stock_limit');
            $table->text('message_template');
            $table->json('selected_variants');
            $table->boolean('show_progress_bar')->default(false);
            $table->json('bar_color'); // HSB color
            $table->string('bar_hex_color');

            // Progress bar settings
            $table->enum('progress_bar_style', ['rounded', 'flat'])->default('rounded');
            $table->enum('progress_bar_position', ['above', 'below'])->default('below');
            $table->integer('progress_bar_width')->default(100); // 5-100%
            $table->integer('progress_bar_height')->default(8); // 5-30px
            $table->json('progress_bar_background_color'); // HSB color
            $table->string('progress_bar_background_hex_color');

            // Design config (JSON)
            $table->json('design_config');

            // Placement config (JSON)
            $table->json('placement_config');

            $table->timestamps();

            // Foreign key
            $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');

            // Indexes
            $table->index(['shop_id', 'is_published']);
            $table->index('stock_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('stock_countdowns');
    }
}
