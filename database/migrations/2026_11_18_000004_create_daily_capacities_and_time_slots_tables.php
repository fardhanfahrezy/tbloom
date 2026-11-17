<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_capacities', function (Blueprint $table) {
            $table->id();
            $table->date('production_date')->unique();
            $table->unsignedInteger('max_capacity');
            $table->unsignedInteger('used_capacity')->default(0);
            $table->boolean('is_closed')->default(false);
            $table->timestamps();
        });

        Schema::create('pickup_delivery_time_slots', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pickup_delivery_time_slots');
        Schema::dropIfExists('daily_capacities');
    }
};
