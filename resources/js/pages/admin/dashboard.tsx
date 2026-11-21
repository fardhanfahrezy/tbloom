import { Head, Link } from '@inertiajs/react';
import { Cake, CalendarClock, ClipboardList, FolderTree } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import admin from '@/routes/admin';

type Props = {
    stats: {
        activeCakes: number;
        totalCakes: number;
        activeCategories: number;
        activeTimeSlots: number;
        pendingOrders: number;
        totalOrders: number;
        todayMaxCapacity: number;
        todayUsedCapacity: number;
        todayRemainingCapacity: number;
        todayIsClosed: boolean;
    };
};

export default function AdminDashboard({ stats }: Props) {
    return (
        <>
            <Head title="Dashboard Admin — TBloom Cake" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Dashboard Admin
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Ringkasan operasional katalog kue dan kapasitas
                            produksi hari ini.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={admin.cakes.create()}>Tambah Kue Baru</Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Kue Aktif</span>
                            <Cake className="size-4 text-primary" />
                        </div>
                        <p className="mt-3 text-3xl font-bold tabular-nums">
                            {stats.activeCakes}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Dari total {stats.totalCakes} produk katalog
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Kategori Aktif</span>
                            <FolderTree className="size-4 text-primary" />
                        </div>
                        <p className="mt-3 text-3xl font-bold tabular-nums">
                            {stats.activeCategories}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Kategori yang tampil di publik
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Sisa Kapasitas Hari Ini</span>
                            <CalendarClock className="size-4 text-primary" />
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <p className="text-3xl font-bold tabular-nums">
                                {stats.todayRemainingCapacity}
                            </p>
                            {stats.todayIsClosed && (
                                <Badge variant="destructive">Tutup</Badge>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Terpakai {stats.todayUsedCapacity} dari{' '}
                            {stats.todayMaxCapacity} kue
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Pesanan Perlu Diproses</span>
                            <ClipboardList className="size-4 text-primary" />
                        </div>
                        <p className="mt-3 text-3xl font-bold tabular-nums">
                            {stats.pendingOrders}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Dari total {stats.totalOrders} pesanan masuk
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">
                            Kelola Katalog &amp; Opsi
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Atur kategori, produk kue, foto, serta variasi
                            ukuran, rasa, dan isian beserta tambahan harganya.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button asChild variant="secondary" size="sm">
                                <Link href={admin.categories.index()}>
                                    Kategori Kue
                                </Link>
                            </Button>
                            <Button asChild variant="secondary" size="sm">
                                <Link href={admin.cakes.index()}>
                                    Katalog Kue
                                </Link>
                            </Button>
                            <Button asChild variant="secondary" size="sm">
                                <Link href={admin.options.index()}>
                                    Opsi Ukuran/Rasa/Isian
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold">
                            Pesanan, Kapasitas &amp; Slot Jam
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Proses pesanan masuk, tetapkan batas produksi harian
                            default, dan kelola slot jam penerimaan.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Button asChild variant="secondary" size="sm">
                                <Link href={admin.orders.index()}>
                                    Kelola Pesanan
                                </Link>
                            </Button>
                            <Button asChild variant="secondary" size="sm">
                                <Link href={admin.capacities.index()}>
                                    Atur Kapasitas &amp; Slot
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard Admin',
            href: admin.dashboard(),
        },
    ],
};
