<?php

use App\Models\Cake;
use App\Models\Category;
use App\Models\DailyCapacity;
use App\Models\PickupDeliveryTimeSlot;
use App\Models\Size;
use App\Models\User;
use Carbon\CarbonImmutable;

test('customer cannot order earlier than minimum_order_days in Asia/Jakarta', function () {
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-17 14:00:00', 'Asia/Jakarta'));

    $customer = User::factory()->create();
    $category = Category::factory()->create();
    $cake = Cake::factory()->create([
        'category_id' => $category->id,
        'minimum_order_days' => 2,
        'allow_image_upload' => false,
    ]);
    $size = Size::factory()->create();
    $cake->sizes()->attach($size->id, ['additional_price' => 25000]);
    $slot = PickupDeliveryTimeSlot::factory()->create(['label' => '10:00 - 12:00']);

    $this->actingAs($customer);

    // H+1 (18 Nov) wajib ditolak
    $this->post(route('orders.store'), [
        'cake_id' => $cake->id,
        'size_id' => $size->id,
        'required_date' => '2026-11-18',
        'recipient_name' => 'Alya',
        'recipient_age' => 21,
        'cake_message' => 'Happy Birthday Alya!',
        'fulfillment_method' => 'pickup',
        'delivery_time' => $slot->label,
        'payment_method' => 'cash',
    ])->assertSessionHasErrors('required_date');

    // H+2 (19 Nov) valid dan memotong kapasitas 1 unit
    $this->post(route('orders.store'), [
        'cake_id' => $cake->id,
        'size_id' => $size->id,
        'required_date' => '2026-11-19',
        'recipient_name' => 'Alya',
        'recipient_age' => 21,
        'cake_message' => 'Happy Birthday Alya!',
        'fulfillment_method' => 'pickup',
        'delivery_time' => $slot->label,
        'payment_method' => 'cash',
    ])->assertRedirect();

    $capacity = DailyCapacity::query()->whereDate('production_date', '2026-11-19')->firstOrFail();
    expect($capacity->used_capacity)->toBe(1);

    CarbonImmutable::setTestNow();
});

test('customer cannot order on full or closed date', function () {
    CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-11-17 10:00:00', 'Asia/Jakarta'));

    $customer = User::factory()->create();
    $cake = Cake::factory()->create(['minimum_order_days' => 1]);
    $slot = PickupDeliveryTimeSlot::factory()->create(['label' => '13:00 - 15:00']);

    DailyCapacity::factory()->create([
        'production_date' => '2026-11-19',
        'max_capacity' => 2,
        'used_capacity' => 2,
        'is_closed' => false,
    ]);

    DailyCapacity::factory()->create([
        'production_date' => '2026-11-20',
        'max_capacity' => 5,
        'used_capacity' => 0,
        'is_closed' => true,
    ]);

    $this->actingAs($customer);

    $this->post(route('orders.store'), [
        'cake_id' => $cake->id,
        'required_date' => '2026-11-19',
        'recipient_name' => 'Bima',
        'recipient_age' => 25,
        'cake_message' => 'HBD Bima',
        'fulfillment_method' => 'pickup',
        'delivery_time' => $slot->label,
        'payment_method' => 'cash',
    ])->assertSessionHasErrors('required_date');

    $this->post(route('orders.store'), [
        'cake_id' => $cake->id,
        'required_date' => '2026-11-20',
        'recipient_name' => 'Bima',
        'recipient_age' => 25,
        'cake_message' => 'HBD Bima',
        'fulfillment_method' => 'pickup',
        'delivery_time' => $slot->label,
        'payment_method' => 'cash',
    ])->assertSessionHasErrors('required_date');

    CarbonImmutable::setTestNow();
});

test('customers cannot view other customers orders and unverified phone is blocked', function () {
    $customerA = User::factory()->create();
    $customerB = User::factory()->create();
    $unverifiedWa = User::factory()->unverifiedPhone()->create();
    $cake = Cake::factory()->create(['minimum_order_days' => 1]);
    $slot = PickupDeliveryTimeSlot::factory()->create(['label' => '16:00 - 18:00']);

    $this->actingAs($unverifiedWa)
        ->get(route('cakes.order', $cake->slug))
        ->assertRedirect(route('whatsapp.verification.notice'));

    $this->actingAs($customerA)->post(route('orders.store'), [
        'cake_id' => $cake->id,
        'required_date' => now('Asia/Jakarta')->addDays(2)->toDateString(),
        'recipient_name' => 'Salsa',
        'recipient_age' => 20,
        'cake_message' => 'Happy Birthday!',
        'fulfillment_method' => 'pickup',
        'delivery_time' => $slot->label,
        'payment_method' => 'cash',
    ])->assertRedirect();

    $order = $customerA->orders()->firstOrFail();

    $this->actingAs($customerB)
        ->get(route('orders.show', $order))
        ->assertForbidden();
});
