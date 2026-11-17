import { Head, Link } from '@inertiajs/react';
import { Cake, DollarSign, Eye, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';
import owner from '@/routes/owner';

type VisitPoint = {
    date: string;
    visits: number;
};

type Props = {
    stats: {
        totalRevenue: number;
        totalCustomers: number;
        totalAdmins: number;
        activeAdmins: number;
        activeCakes: number;
        totalVisits: number;
        todayVisits: number;
    };
    recentVisits: VisitPoint[];
};

export default function OwnerDashboard({ stats, recentVisits }: Props) {
    return (
        <>
            <Head title="Dashboard Owner — TBloom Cake" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Dashboard Owner
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Ringkasan statistik bisnis TBloom Cake dan akses
                            pengelolaan akun Admin.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={owner.admins.index()}>Kelola Admin</Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Total Pendapatan</span>
                            <DollarSign className="size-4 text-primary" />
                        </div>
                        <p className="mt-3 text-2xl font-bold tabular-nums">
                            {formatRupiah(stats.totalRevenue)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Terhubung otomatis dengan transaksi Fase 3
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Pengunjung Website</span>
                            <Eye className="size-4 text-primary" />
                        </div>
                        <p className="mt-3 text-3xl font-bold tabular-nums">
                            {stats.totalVisits}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {stats.todayVisits} kunjungan hari ini
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Total Akun Customer</span>
                            <Users className="size-4 text-primary" />
                        </div>
                        <p className="mt-3 text-3xl font-bold tabular-nums">
                            {stats.totalCustomers}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {stats.activeAdmins}/{stats.totalAdmins} admin aktif
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Kue Aktif di Katalog</span>
                            <Cake className="size-4 text-primary" />
                        </div>
                        <p className="mt-3 text-3xl font-bold tabular-nums">
                            {stats.activeCakes}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Dikelola oleh tim Admin
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-semibold">
                        Tren Kunjungan 7 Hari Terakhir
                    </h2>
                    {recentVisits.length === 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                            Belum ada catatan kunjungan publik.
                        </p>
                    ) : (
                        <div className="mt-4 divide-y divide-border rounded-lg border border-border">
                            {recentVisits.map((point) => (
                                <div
                                    key={point.date}
                                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                                >
                                    <span className="font-medium">
                                        {point.date}
                                    </span>
                                    <span className="font-semibold tabular-nums">
                                        {point.visits} kunjungan
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

OwnerDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Owner',
            href: owner.dashboard(),
        },
    ],
};
