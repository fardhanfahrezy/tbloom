<?php

use App\Models\User;
use App\Models\WhatsappOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

test('customer with unverified whatsapp is redirected to verify-whatsapp from dashboard', function () {
    $customer = User::factory()->unverifiedPhone()->create();

    $this->actingAs($customer)
        ->get(route('dashboard'))
        ->assertRedirect(route('whatsapp.verification.notice'));
});

test('customer can verify whatsapp with valid otp code', function () {
    $customer = User::factory()->unverifiedPhone()->create([
        'phone' => '628111222333',
    ]);

    WhatsappOtp::create([
        'user_id' => $customer->id,
        'phone' => '628111222333',
        'code_hash' => Hash::make('123456'),
        'expires_at' => now()->addMinutes(10),
        'attempts' => 0,
    ]);

    $response = $this->actingAs($customer)
        ->post(route('whatsapp.verification.confirm'), [
            'code' => '123456',
        ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    expect($customer->fresh()->phone_verified_at)->not->toBeNull();
});

test('invalid otp increments attempts and fails validation', function () {
    $customer = User::factory()->unverifiedPhone()->create([
        'phone' => '628111222444',
    ]);

    $otp = WhatsappOtp::create([
        'user_id' => $customer->id,
        'phone' => '628111222444',
        'code_hash' => Hash::make('654321'),
        'expires_at' => now()->addMinutes(10),
        'attempts' => 0,
    ]);

    $this->actingAs($customer)
        ->from(route('whatsapp.verification.notice'))
        ->post(route('whatsapp.verification.confirm'), [
            'code' => '000000',
        ])
        ->assertSessionHasErrors('code');

    expect($otp->fresh()->attempts)->toBe(1);
    expect($customer->fresh()->phone_verified_at)->toBeNull();
});

test('customer can update whatsapp number and resend otp via fonnte', function () {
    Http::fake();
    config(['services.fonnte.token' => 'test-fonnte-token']);

    $customer = User::factory()->unverifiedPhone()->create([
        'phone' => '628111222555',
    ]);

    $response = $this->actingAs($customer)
        ->from(route('whatsapp.verification.notice'))
        ->patch(route('whatsapp.verification.phone'), [
            'phone' => '08111222666',
        ]);

    $response->assertRedirect(route('whatsapp.verification.notice'));
    expect($customer->fresh()->phone)->toBe('628111222666');
    Http::assertSentCount(1);
});
