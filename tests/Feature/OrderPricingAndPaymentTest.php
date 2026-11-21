<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Cake;
use App\Models\DailyCapacity;
use App\Models\Filling;
use App\Models\Flavor;
use App\Models\Order;
use App\Models\PickupDeliveryTimeSlot;
use App\Models\Size;
use App\Models\StoreSetting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('cash plus delivery is rejected and delivery requires address', function () {
    $customer = User::factory()->create();
    $cake = Cake::factory()->create(['minimum_order_days' => 1]);
    $slot = PickupDeliveryTimeSlot::factory()->create(['label' => '10:00 - 12:00']);

    $this->actingAs($customer);

    $this->post(route('orders.store'), [
        'cake_id' => $cake->id,
        'required_date' => now('Asia/Jakarta')->addDays(2)->toDateString(),
        'recipient_name' => 'Rafi',
        'recipient_age' => 19,
        'cake_message' => 'Selamat Ulang Tahun',
        'fulfillment_method' => 'delivery',
        'delivery_address' => '',
        'delivery_time' => $slot->label,
        'payment_method' => 'cash',
    ])->assertSessionHasErrors(['delivery_address', 'payment_method']);
});

test('uploaded image is rejected when allow_image_upload is false', function () {
    Storage::fake('public');

    $customer = User::factory()->create();
    $cake = Cake::factory()->create(['minimum_order_days' => 1, 'allow_image_upload' => false]);
    $slot = PickupDeliveryTimeSlot::factory()->create(['label' => '10:00 - 12:00']);

    $this->actingAs($customer)->post(route('orders.store'), [
        'cake_id' => $cake->id,
        'required_date' => now('Asia/Jakarta')->addDays(2)->toDateString(),
        'recipient_name' => 'Dina',
        'recipient_age' => 24,
        'cake_message' => 'HBD Dina',
        'uploaded_image' => UploadedFile::fake()->image('ref.jpg'),
        'fulfillment_method' => 'pickup',
        'delivery_time' => $slot->label,
        'payment_method' => 'cash',
    ])->assertSessionHasErrors('uploaded_image');
});

test('backend calculates authoritative pricing with midtrans fee and creates snap token', function () {
    config([
        'services.midtrans.server_key' => 'SB-Mid-server-test-key',
        'services.midtrans.client_key' => 'SB-Mid-client-test-key',
        'services.midtrans.is_production' => false,
    ]);

    StoreSetting::setValue('midtrans_fee_type', 'fixed');
    StoreSetting::setValue('midtrans_fee_value', '4500');

    Http::fake([
        'https://app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
            'token' => 'snap-token-123',
            'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-123',
        ], 201),
    ]);

    $customer = User::factory()->create();
    $cake = Cake::factory()->create(['base_price' => 200000, 'minimum_order_days' => 1]);
    $size = Size::factory()->create();
    $flavor = Flavor::factory()->create();
    $filling = Filling::factory()->create();

    $cake->sizes()->attach($size->id, ['additional_price' => 50000]);
    $cake->flavors()->attach($flavor->id, ['additional_price' => 15000]);
    $cake->fillings()->attach($filling->id, ['additional_price' => 10000]);

    $slot = PickupDeliveryTimeSlot::factory()->create(['label' => '13:00 - 15:00']);

    $this->actingAs($customer)->post(route('orders.store'), [
        'cake_id' => $cake->id,
        'size_id' => $size->id,
        'flavor_id' => $flavor->id,
        'filling_id' => $filling->id,
        'required_date' => now('Asia/Jakarta')->addDays(2)->toDateString(),
        'recipient_name' => 'Raka',
        'recipient_age' => 27,
        'cake_message' => 'HBD Raka!',
        'fulfillment_method' => 'delivery',
        'delivery_address' => 'Jl. Melati No. 12, Jakarta',
        'delivery_time' => $slot->label,
        'payment_method' => 'midtrans',
        // Manipulated price fields must be ignored by backend:
        'total_price' => 1000,
        'base_price_snapshot' => 500,
    ])->assertRedirect();

    $order = Order::query()->with('payment')->firstOrFail();

    expect($order->base_price_snapshot)->toBe(200000)
        ->and($order->size_price_snapshot)->toBe(50000)
        ->and($order->flavor_price_snapshot)->toBe(15000)
        ->and($order->filling_price_snapshot)->toBe(10000)
        ->and($order->payment_fee)->toBe(4500)
        ->and($order->total_price)->toBe(279500)
        ->and($order->order_status)->toBe(OrderStatus::AwaitingPayment)
        ->and($order->payment->snap_token)->toBe('snap-token-123');
});

test('midtrans webhook verifies signature settles payment updates owner revenue and releases capacity idempotently on expire', function () {
    $serverKey = 'SB-Mid-server-test-key';
    config([
        'services.midtrans.server_key' => $serverKey,
        'services.midtrans.client_key' => 'SB-Mid-client-test-key',
    ]);

    Http::fake([
        'https://app.sandbox.midtrans.com/snap/v1/transactions' => Http::response(['token' => 'tok-abc'], 201),
    ]);

    $owner = User::factory()->owner()->create();
    $customer = User::factory()->create();
    $cake = Cake::factory()->create(['base_price' => 180000, 'minimum_order_days' => 1]);
    $slot = PickupDeliveryTimeSlot::factory()->create(['label' => '10:00 - 12:00']);
    $targetDate = now('Asia/Jakarta')->addDays(2)->toDateString();

    $this->actingAs($customer)->post(route('orders.store'), [
        'cake_id' => $cake->id,
        'required_date' => $targetDate,
        'recipient_name' => 'Lia',
        'recipient_age' => 22,
        'cake_message' => 'HBD Lia!',
        'fulfillment_method' => 'pickup',
        'delivery_time' => $slot->label,
        'payment_method' => 'midtrans',
    ])->assertRedirect();

    $order = Order::query()->firstOrFail();

    // Invalid signature rejected
    $this->postJson(route('webhooks.midtrans'), [
        'order_id' => $order->order_number,
        'status_code' => '200',
        'gross_amount' => (string) $order->total_price,
        'signature_key' => 'invalid-sig',
        'transaction_status' => 'settlement',
    ])->assertForbidden();

    // Valid settlement signature
    $settlementSig = hash('sha512', $order->order_number.'200'.(string) $order->total_price.$serverKey);
    $this->postJson(route('webhooks.midtrans'), [
        'order_id' => $order->order_number,
        'status_code' => '200',
        'gross_amount' => (string) $order->total_price,
        'signature_key' => $settlementSig,
        'transaction_status' => 'settlement',
        'transaction_id' => 'mid-tx-001',
        'payment_type' => 'qris',
    ])->assertOk();

    expect($order->fresh()->payment_status)->toBe(PaymentStatus::Paid)
        ->and($order->fresh()->order_status)->toBe(OrderStatus::PaymentConfirmed);

    // Owner dashboard reflects real revenue (subtotal excluding fee = 180000)
    $this->actingAs($owner)
        ->get(route('owner.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('stats.totalRevenue', 180000));

    // Create second order and expire it via webhook twice (idempotent capacity release)
    $this->actingAs($customer)->post(route('orders.store'), [
        'cake_id' => $cake->id,
        'required_date' => $targetDate,
        'recipient_name' => 'Nadia',
        'recipient_age' => 25,
        'cake_message' => 'HBD Nadia!',
        'fulfillment_method' => 'pickup',
        'delivery_time' => $slot->label,
        'payment_method' => 'midtrans',
    ])->assertRedirect();

    $secondOrder = Order::query()->where('recipient_name', 'Nadia')->firstOrFail();
    expect(DailyCapacity::query()->whereDate('production_date', $targetDate)->value('used_capacity'))->toBe(2);

    $expireSig = hash('sha512', $secondOrder->order_number.'202'.(string) $secondOrder->total_price.$serverKey);
    $payload = [
        'order_id' => $secondOrder->order_number,
        'status_code' => '202',
        'gross_amount' => (string) $secondOrder->total_price,
        'signature_key' => $expireSig,
        'transaction_status' => 'expire',
    ];

    $this->postJson(route('webhooks.midtrans'), $payload)->assertOk();
    $this->postJson(route('webhooks.midtrans'), $payload)->assertOk();

    expect($secondOrder->fresh()->order_status)->toBe(OrderStatus::Rejected)
        ->and($secondOrder->fresh()->payment_status)->toBe(PaymentStatus::Expired)
        ->and(DailyCapacity::query()->whereDate('production_date', $targetDate)->value('used_capacity'))->toBe(1);
});

test('admin can update order status and rejecting order releases capacity', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();
    $cake = Cake::factory()->create(['minimum_order_days' => 1]);
    $slot = PickupDeliveryTimeSlot::factory()->create(['label' => '16:00 - 18:00']);
    $targetDate = now('Asia/Jakarta')->addDays(2)->toDateString();

    $this->actingAs($customer)->post(route('orders.store'), [
        'cake_id' => $cake->id,
        'required_date' => $targetDate,
        'recipient_name' => 'Tari',
        'recipient_age' => 30,
        'cake_message' => 'HBD Tari',
        'fulfillment_method' => 'pickup',
        'delivery_time' => $slot->label,
        'payment_method' => 'cash',
    ])->assertRedirect();

    $order = Order::query()->firstOrFail();
    expect(DailyCapacity::query()->whereDate('production_date', $targetDate)->value('used_capacity'))->toBe(1);

    $this->actingAs($admin)->patch(route('admin.orders.status', $order->order_number), [
        'order_status' => OrderStatus::Rejected->value,
        'notes' => 'Catatan khusus tidak dapat dipenuhi.',
    ])->assertRedirect();

    expect($order->fresh()->order_status)->toBe(OrderStatus::Rejected)
        ->and(DailyCapacity::query()->whereDate('production_date', $targetDate)->value('used_capacity'))->toBe(0);
});
