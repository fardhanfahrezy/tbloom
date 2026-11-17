<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register as customer with normalized whatsapp number', function () {
    Http::fake();
    config(['services.fonnte.token' => 'test-fonnte-token']);

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'phone' => '081234567890',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'owner',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user = User::query()->where('email', 'test@example.com')->firstOrFail();

    expect($user->role)->toBe(UserRole::Customer);
    expect($user->phone)->toBe('6281234567890');
    expect($user->phone_verified_at)->toBeNull();
    expect($user->is_active)->toBeTrue();

    Http::assertSentCount(1);
});

test('registration rejects invalid whatsapp number format', function () {
    $response = $this->from(route('register'))->post(route('register.store'), [
        'name' => 'Test User',
        'phone' => '12345',
        'email' => 'invalid-phone@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('phone');
    $this->assertGuest();
});
