<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCountdownTimersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('countdown_timers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shop_id');
            $table->uuid('timer_id')->unique();

            // Common fields (always present)
            $table->string('timer_name');
            $table->string('title');
            $table->string('sub_heading');
            $table->json('timer_labels'); // {days: 'Days', hours: 'Hrs', minutes: 'Mins', seconds: 'Secs'}
            $table->enum('timer_type', ['fixed', 'generic', 'daily']);

            // Timer-specific configuration (JSON)
            $table->json('timer_config'); // Contains all timer-specific fields

            // Design settings (JSON)
            $table->json('design_config'); // Contains all design-related fields

            // Placement settings (JSON)
            $table->json('placement_config'); // Contains placement-related fields

            // Status
            $table->boolean('is_published')->default(false);

            // Timestamps
            $table->timestamps();

            // Foreign key
            $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');

            // Indexes
            $table->index(['shop_id', 'is_published']);
            $table->index('timer_type');
            $table->index('timer_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('countdown_timers');
    }
}
