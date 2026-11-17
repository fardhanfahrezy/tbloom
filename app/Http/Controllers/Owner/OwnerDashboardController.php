<?php

namespace App\Http\Controllers\Owner;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Cake;
use App\Models\DailyVisitStat;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class OwnerDashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = now('Asia/Jakarta')->toDateString();

        $totalCustomers = User::query()->where('role', UserRole::Customer)->count();
        $totalAdmins = User::query()->where('role', UserRole::Admin)->count();
        $activeAdmins = User::query()
            ->where('role', UserRole::Admin)
            ->where('is_active', true)
            ->count();

        $totalVisits = (int) DailyVisitStat::query()->sum('visits_count');
        $todayVisits = (int) (DailyVisitStat::query()
            ->whereDate('visit_date', $today)
            ->value('visits_count') ?? 0);

        $recentVisits = DailyVisitStat::query()
            ->whereDate('visit_date', '>=', now('Asia/Jakarta')->subDays(6)->toDateString())
            ->orderBy('visit_date')
            ->get()
            ->map(fn (DailyVisitStat $stat): array => [
                'date' => $stat->visit_date->format('d M'),
                'visits' => $stat->visits_count,
            ]);

        return Inertia::render('owner/dashboard', [
            'stats' => [
                'totalRevenue' => 0, // Diperbarui dari tabel orders pada Fase 3
                'totalCustomers' => $totalCustomers,
                'totalAdmins' => $totalAdmins,
                'activeAdmins' => $activeAdmins,
                'activeCakes' => Cake::query()->where('is_active', true)->count(),
                'totalVisits' => $totalVisits,
                'todayVisits' => $todayVisits,
            ],
            'recentVisits' => $recentVisits,
        ]);
    }
}
