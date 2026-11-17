<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cake;
use App\Models\Category;
use App\Models\DailyCapacity;
use App\Models\PickupDeliveryTimeSlot;
use App\Models\StoreSetting;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = now('Asia/Jakarta')->toDateString();
        $defaultCapacity = (int) StoreSetting::getValue('default_daily_capacity', '5');
        $todayCapacity = DailyCapacity::query()->whereDate('production_date', $today)->first();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'activeCakes' => Cake::query()->where('is_active', true)->count(),
                'totalCakes' => Cake::query()->count(),
                'activeCategories' => Category::query()->where('is_active', true)->count(),
                'activeTimeSlots' => PickupDeliveryTimeSlot::query()->where('is_active', true)->count(),
                'todayMaxCapacity' => $todayCapacity->max_capacity ?? $defaultCapacity,
                'todayUsedCapacity' => $todayCapacity->used_capacity ?? 0,
                'todayRemainingCapacity' => $todayCapacity ? $todayCapacity->remainingCapacity() : $defaultCapacity,
                'todayIsClosed' => $todayCapacity->is_closed ?? false,
            ],
        ]);
    }
}
