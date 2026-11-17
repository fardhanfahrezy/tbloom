<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sizes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('flavors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('fillings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('cake_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cake_id')->constrained('cakes')->cascadeOnDelete();
            $table->foreignId('size_id')->constrained('sizes')->cascadeOnDelete();
            $table->unsignedBigInteger('additional_price')->default(0);
            $table->timestamps();

            $table->unique(['cake_id', 'size_id']);
        });

        Schema::create('cake_flavors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cake_id')->constrained('cakes')->cascadeOnDelete();
            $table->foreignId('flavor_id')->constrained('flavors')->cascadeOnDelete();
            $table->unsignedBigInteger('additional_price')->default(0);
            $table->timestamps();

            $table->unique(['cake_id', 'flavor_id']);
        });

        Schema::create('cake_fillings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cake_id')->constrained('cakes')->cascadeOnDelete();
            $table->foreignId('filling_id')->constrained('fillings')->cascadeOnDelete();
            $table->unsignedBigInteger('additional_price')->default(0);
            $table->timestamps();

            $table->unique(['cake_id', 'filling_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cake_fillings');
        Schema::dropIfExists('cake_flavors');
        Schema::dropIfExists('cake_sizes');
        Schema::dropIfExists('fillings');
        Schema::dropIfExists('flavors');
        Schema::dropIfExists('sizes');
    }
};
