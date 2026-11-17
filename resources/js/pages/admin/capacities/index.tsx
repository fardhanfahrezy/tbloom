import { Head, router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { FlashBanner } from '@/components/flash-banner';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import admin from '@/routes/admin';

type CapacityRow = {
    id: number;
    production_date: string;
    max_capacity: number;
    used_capacity: number;
    remaining_capacity: number;
    is_closed: boolean;
};

type TimeSlotRow = {
    id: number;
    label: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
};

type Props = {
    defaultDailyCapacity: number;
    capacities: CapacityRow[];
    timeSlots: TimeSlotRow[];
};

export default function AdminCapacitiesIndex({
    defaultDailyCapacity,
    capacities,
    timeSlots,
}: Props) {
    const defaultForm = useForm({
        default_daily_capacity: defaultDailyCapacity,
    });

    const dateForm = useForm({
        production_date: '',
        max_capacity: defaultDailyCapacity,
        is_closed: false,
    });

    const slotForm = useForm({
        label: '',
        start_time: '10:00',
        end_time: '12:00',
    });

    const submitDefault = (event: React.FormEvent) => {
        event.preventDefault();
        defaultForm.patch(admin.capacities.default().url, {
            preserveScroll: true,
        });
    };

    const submitDateCapacity = (event: React.FormEvent) => {
        event.preventDefault();
        dateForm.post(admin.capacities.store().url, {
            preserveScroll: true,
            onSuccess: () => dateForm.reset('production_date'),
        });
    };

    const submitSlot = (event: React.FormEvent) => {
        event.preventDefault();
        slotForm.post(admin.timeSlots.store().url, {
            preserveScroll: true,
            onSuccess: () => slotForm.reset('label'),
        });
    };

    const toggleSlotActive = (slot: TimeSlotRow) => {
        router.patch(
            admin.timeSlots.update({ slot: slot.id }).url,
            { is_active: !slot.is_active },
            { preserveScroll: true },
        );
    };

    const deleteSlot = (slot: TimeSlotRow) => {
        router.delete(admin.timeSlots.destroy({ slot: slot.id }).url, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Kapasitas & Slot Jam — Admin TBloom Cake" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Kapasitas Produksi &amp; Slot Jam
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Atur kapasitas produksi harian default (total kue per
                        hari), penutupan tanggal tertentu, dan slot jam
                        pengambilan/pengiriman.
                    </p>
                </div>

                <FlashBanner />

                <div className="grid gap-6 lg:grid-cols-2">
                    <form
                        onSubmit={submitDefault}
                        className="rounded-xl border border-border bg-card p-6 shadow-sm"
                    >
                        <h2 className="text-lg font-semibold">
                            Kapasitas Harian Default
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Berlaku otomatis untuk tanggal yang belum memiliki
                            pengaturan khusus.
                        </p>

                        <div className="mt-4 flex items-end gap-3">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="default_daily_capacity">
                                    Maksimum Kue per Hari
                                </Label>
                                <Input
                                    id="default_daily_capacity"
                                    type="number"
                                    min={1}
                                    value={
                                        defaultForm.data.default_daily_capacity
                                    }
                                    onChange={(e) =>
                                        defaultForm.setData(
                                            'default_daily_capacity',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                                <InputError
                                    message={
                                        defaultForm.errors
                                            .default_daily_capacity
                                    }
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={defaultForm.processing}
                            >
                                Simpan Default
                            </Button>
                        </div>
                    </form>

                    <form
                        onSubmit={submitDateCapacity}
                        className="rounded-xl border border-border bg-card p-6 shadow-sm"
                    >
                        <h2 className="text-lg font-semibold">
                            Override Kapasitas per Tanggal
                        </h2>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="production_date">
                                    Tanggal Produksi
                                </Label>
                                <Input
                                    id="production_date"
                                    type="date"
                                    value={dateForm.data.production_date}
                                    onChange={(e) =>
                                        dateForm.setData(
                                            'production_date',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={dateForm.errors.production_date}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_capacity">
                                    Maksimum Kue
                                </Label>
                                <Input
                                    id="max_capacity"
                                    type="number"
                                    min={0}
                                    value={dateForm.data.max_capacity}
                                    onChange={(e) =>
                                        dateForm.setData(
                                            'max_capacity',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                                <InputError
                                    message={dateForm.errors.max_capacity}
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={dateForm.data.is_closed}
                                    onCheckedChange={(checked) =>
                                        dateForm.setData(
                                            'is_closed',
                                            Boolean(checked),
                                        )
                                    }
                                />
                                <span>Tutup pemesanan di tanggal ini</span>
                            </label>

                            <Button
                                type="submit"
                                disabled={dateForm.processing}
                            >
                                Simpan Tanggal
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-semibold">
                        Daftar Override Kapasitas Mendatang
                    </h2>
                    <div className="mt-4 divide-y divide-border rounded-lg border border-border">
                        {capacities.length === 0 ? (
                            <p className="p-4 text-sm text-muted-foreground">
                                Belum ada override tanggal khusus. Semua tanggal
                                memakai kapasitas default (
                                {defaultDailyCapacity} kue/hari).
                            </p>
                        ) : (
                            capacities.map((row) => (
                                <div
                                    key={row.id}
                                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold tabular-nums">
                                            {row.production_date}
                                        </span>
                                        {row.is_closed ? (
                                            <Badge variant="destructive">
                                                Tutup
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                Sisa {row.remaining_capacity}{' '}
                                                kue
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-muted-foreground tabular-nums">
                                        Terpakai {row.used_capacity} /{' '}
                                        {row.max_capacity} kue
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-semibold">
                        Slot Jam Pengambilan &amp; Pengiriman
                    </h2>

                    <form
                        onSubmit={submitSlot}
                        className="mt-4 grid gap-3 sm:grid-cols-4 sm:items-end"
                    >
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="slot_label">Label Slot</Label>
                            <Input
                                id="slot_label"
                                value={slotForm.data.label}
                                onChange={(e) =>
                                    slotForm.setData('label', e.target.value)
                                }
                                placeholder="Contoh: 10:00 - 12:00"
                            />
                            <InputError message={slotForm.errors.label} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="start_time">Mulai</Label>
                            <Input
                                id="start_time"
                                type="time"
                                value={slotForm.data.start_time}
                                onChange={(e) =>
                                    slotForm.setData(
                                        'start_time',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError message={slotForm.errors.start_time} />
                        </div>

                        <div className="flex items-end gap-2">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="end_time">Selesai</Label>
                                <Input
                                    id="end_time"
                                    type="time"
                                    value={slotForm.data.end_time}
                                    onChange={(e) =>
                                        slotForm.setData(
                                            'end_time',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={slotForm.errors.end_time}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={slotForm.processing}
                            >
                                Tambah
                            </Button>
                        </div>
                    </form>

                    <div className="mt-4 divide-y divide-border rounded-lg border border-border">
                        {timeSlots.length === 0 ? (
                            <p className="p-4 text-sm text-muted-foreground">
                                Belum ada slot jam penerimaan.
                            </p>
                        ) : (
                            timeSlots.map((slot) => (
                                <div
                                    key={slot.id}
                                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="font-medium">
                                            {slot.label}
                                        </span>
                                        <Badge
                                            variant={
                                                slot.is_active
                                                    ? 'secondary'
                                                    : 'outline'
                                            }
                                        >
                                            {slot.is_active
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                toggleSlotActive(slot)
                                            }
                                        >
                                            {slot.is_active
                                                ? 'Nonaktifkan'
                                                : 'Aktifkan'}
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => deleteSlot(slot)}
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

AdminCapacitiesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard() },
        { title: 'Kapasitas & Slot', href: admin.capacities.index() },
    ],
};
