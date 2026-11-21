<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('cake_id')->constrained('cakes')->restrictOnDelete();
            $table->foreignId('size_id')->nullable()->constrained('sizes')->nullOnDelete();
            $table->foreignId('flavor_id')->nullable()->constrained('flavors')->nullOnDelete();
            $table->foreignId('filling_id')->nullable()->constrained('fillings')->nullOnDelete();
            $table->date('order_date');
            $table->date('required_date')->index();
            $table->string('recipient_name');
            $table->unsignedSmallInteger('recipient_age');
            $table->string('cake_message');
            $table->text('special_notes')->nullable();
            $table->string('uploaded_image')->nullable();
            $table->string('fulfillment_method', 20);
            $table->text('delivery_address')->nullable();
            $table->date('delivery_date');
            $table->string('delivery_time', 80);
            $table->string('payment_method', 20);
            $table->unsignedBigInteger('base_price_snapshot');
            $table->unsignedBigInteger('size_price_snapshot')->default(0);
            $table->unsignedBigInteger('flavor_price_snapshot')->default(0);
            $table->unsignedBigInteger('filling_price_snapshot')->default(0);
            $table->unsignedBigInteger('payment_fee')->default(0);
            $table->unsignedBigInteger('total_price');
            $table->string('payment_status', 30)->default('unpaid');
            $table->string('order_status', 40)->index();
            $table->timestamp('capacity_released_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('provider', 20);
            $table->string('midtrans_transaction_id')->nullable()->index();
            $table->string('snap_token')->nullable();
            $table->string('payment_type')->nullable();
            $table->unsignedBigInteger('gross_amount');
            $table->unsignedBigInteger('fee_amount')->default(0);
            $table->string('proof_image')->nullable();
            $table->string('status', 30);
            $table->json('raw_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('changed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('from_status', 40)->nullable();
            $table->string('to_status', 40);
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_histories');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('orders');
    }
};
