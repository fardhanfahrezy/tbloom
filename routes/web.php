<?php

use App\Http\Controllers\Auth\WhatsAppVerificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('verify-whatsapp', [WhatsAppVerificationController::class, 'notice'])
        ->name('whatsapp.verification.notice');
    Route::post('verify-whatsapp/send', [WhatsAppVerificationController::class, 'send'])
        ->middleware('throttle:3,1')
        ->name('whatsapp.verification.send');
    Route::post('verify-whatsapp/confirm', [WhatsAppVerificationController::class, 'confirm'])
        ->middleware('throttle:5,1')
        ->name('whatsapp.verification.confirm');
    Route::patch('verify-whatsapp/phone', [WhatsAppVerificationController::class, 'updatePhone'])
        ->middleware('throttle:3,1')
        ->name('whatsapp.verification.phone');
});

Route::middleware(['auth', 'verified', 'phone.verified'])->group(function () {
    Route::get('dashboard', function (Request $request) {
        $user = $request->user();

        if ($user->isOwner()) {
            return redirect()->route('owner.dashboard');
        }

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::inertia('admin/dashboard', 'dashboard')->name('admin.dashboard');
});

Route::middleware(['auth', 'verified', 'role:owner'])->group(function () {
    Route::inertia('owner/dashboard', 'dashboard')->name('owner.dashboard');
});

require __DIR__.'/settings.php';
