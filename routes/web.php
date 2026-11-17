<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\CakeController;
use App\Http\Controllers\Admin\CakeOptionController;
use App\Http\Controllers\Admin\CapacityController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Auth\WhatsAppVerificationController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\Owner\AdminAccountController;
use App\Http\Controllers\Owner\OwnerDashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', [CatalogController::class, 'landing'])->name('home');
Route::get('/katalog', [CatalogController::class, 'index'])->name('catalog.index');
Route::get('/cakes/{cake:slug}', [CatalogController::class, 'show'])->name('cakes.show');

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

        return redirect()->route('home');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('dashboard', AdminDashboardController::class)->name('dashboard');

        Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::patch('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::get('cakes', [CakeController::class, 'index'])->name('cakes.index');
        Route::get('cakes/create', [CakeController::class, 'create'])->name('cakes.create');
        Route::post('cakes', [CakeController::class, 'store'])->name('cakes.store');
        Route::get('cakes/{cake}/edit', [CakeController::class, 'edit'])->name('cakes.edit');
        Route::patch('cakes/{cake}', [CakeController::class, 'update'])->name('cakes.update');
        Route::delete('cakes/{cake}', [CakeController::class, 'destroy'])->name('cakes.destroy');

        Route::get('options', [CakeOptionController::class, 'index'])->name('options.index');
        Route::post('options/{type}', [CakeOptionController::class, 'store'])
            ->whereIn('type', ['sizes', 'flavors', 'fillings'])
            ->name('options.store');
        Route::patch('options/{type}/{id}', [CakeOptionController::class, 'update'])
            ->whereIn('type', ['sizes', 'flavors', 'fillings'])
            ->name('options.update');
        Route::delete('options/{type}/{id}', [CakeOptionController::class, 'destroy'])
            ->whereIn('type', ['sizes', 'flavors', 'fillings'])
            ->name('options.destroy');

        Route::get('capacities', [CapacityController::class, 'index'])->name('capacities.index');
        Route::patch('capacities/default', [CapacityController::class, 'updateDefault'])->name('capacities.default');
        Route::post('capacities', [CapacityController::class, 'store'])->name('capacities.store');
        Route::post('time-slots', [CapacityController::class, 'storeSlot'])->name('time-slots.store');
        Route::patch('time-slots/{slot}', [CapacityController::class, 'updateSlot'])->name('time-slots.update');
        Route::delete('time-slots/{slot}', [CapacityController::class, 'destroySlot'])->name('time-slots.destroy');
    });

Route::middleware(['auth', 'verified', 'role:owner'])
    ->prefix('owner')
    ->name('owner.')
    ->group(function () {
        Route::get('dashboard', OwnerDashboardController::class)->name('dashboard');
        Route::get('admins', [AdminAccountController::class, 'index'])->name('admins.index');
        Route::post('admins', [AdminAccountController::class, 'store'])->name('admins.store');
        Route::patch('admins/{user}/toggle-active', [AdminAccountController::class, 'toggleActive'])->name('admins.toggle-active');
    });

require __DIR__.'/settings.php';
