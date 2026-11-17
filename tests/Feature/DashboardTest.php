<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('customers are redirected from dashboard to catalog home', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard'))->assertRedirect(route('home'));
});

test('admins are redirected from dashboard to admin dashboard', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $this->get(route('dashboard'))->assertRedirect(route('admin.dashboard'));
});

test('owners are redirected from dashboard to owner dashboard', function () {
    $owner = User::factory()->owner()->create();
    $this->actingAs($owner);

    $this->get(route('dashboard'))->assertRedirect(route('owner.dashboard'));
});
