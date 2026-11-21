import { Head, Link, router, useForm } from '@inertiajs/react';
import { CalendarClock, Eye } from 'lucide-react';
import { FlashBanner } from '@/components/flash-banner';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRupiah } from '@/lib/utils';
import admin from '@/routes/admin';

type OrderRow = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string | null;
    cake_name: string;
    required_date: string;
    delivery_time: string;
    fulfillment_method: string;
    fulfillment_label: string;
    payment_method_label: string;
    payment_status: string;
    payment_status_label: string;
    order_status: string;
    order_status_label: string;
    total_price: number;
    created_at: string;
};

type StatusOption = {
    value: string;
    label: string;
};

type Props = {
    orders: OrderRow[];
    selectedStatus: string;
    statusOptions: StatusOption[];
    feeConfig: {
        type: string;
        value: number;
    };
};

export default function AdminOrdersIndex({
    orders,
    selectedStatus,
    statusOptions,
    feeConfig,
}: Props) {
    const feeForm = useForm({
        midtrans_fee_type: feeConfig.type,
        midtrans_fee_value: feeConfig.value,
    });

    const filterByStatus = (status: string) => {
        router.get(admin.orders.index(), status ? { status } : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const savePaymentFee = (event: React.FormEvent) => {
        event.preventDefault();
        feeForm.patch(admin.orders.paymentFee().url, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Kelola Pesanan — Admin TBloom Cake" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Kelola Pesanan
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pantau pesanan pelanggan, periksa foto referensi serta
                        catatan khusus, dan perbarui status produksi.
                    </p>
                </div>

                <FlashBanner />

                <form
                    onSubmit={savePaymentFee}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                    <h2 className="text-base font-semibold">
                        Pengaturan Biaya Layanan Midtrans
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Biaya layanan ini otomatis ditambahkan pada total
                        pembayaran Customer saat memilih Midtrans di Tahap 3.
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3 sm:items-end">
                        <div className="space-y-2">
                            <Label htmlFor="midtrans_fee_type">
                                Tipe Biaya
                            </Label>
                            <select
                                id="midtrans_fee_type"
                                value={feeForm.data.midtrans_fee_type}
                                onChange={(e) =>
                                    feeForm.setData(
                                        'midtrans_fee_type',
                                        e.target.value,
                                    )
                                }
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                            >
                                <option value="fixed">
                                    Nominal Tetap (Rp)
                                </option>
                                <option value="percent">Persentase (%)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="midtrans_fee_value">
                                {feeForm.data.midtrans_fee_type === 'percent'
                                    ? 'Persentase (%)'
                                    : 'Nominal Biaya (Rupiah)'}
                            </Label>
                            <Input
                                id="midtrans_fee_value"
                                type="number"
                                min={0}
                                step={
                                    feeForm.data.midtrans_fee_type === 'percent'
                                        ? '0.5'
                                        : '500'
                                }
                                value={feeForm.data.midtrans_fee_value}
                                onChange={(e) =>
                                    feeForm.setData(
                                        'midtrans_fee_value',
                                        Number(e.target.value),
                                    )
                                }
                            />
                            <InputError
                                message={feeForm.errors.midtrans_fee_value}
                            />
                        </div>

                        <Button type="submit" disabled={feeForm.processing}>
                            Simpan Biaya Layanan
                        </Button>
                    </div>
                </form>

                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant={selectedStatus === '' ? 'default' : 'outline'}
                        onClick={() => filterByStatus('')}
                    >
                        Semua Status
                    </Button>
                    {statusOptions.map((option) => (
                        <Button
                            key={option.value}
                            type="button"
                            size="sm"
                            variant={
                                selectedStatus === option.value
                                    ? 'default'
                                    : 'outline'
                            }
                            onClick={() => filterByStatus(option.value)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="divide-y divide-border">
                        {orders.length === 0 ? (
                            <p className="p-8 text-center text-sm text-muted-foreground">
                                Belum ada pesanan pada filter status ini.
                            </p>
                        ) : (
                            orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-6"
                                >
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-semibold text-muted-foreground">
                                                {order.order_number}
                                            </span>
                                            <Badge variant="secondary">
                                                {order.order_status_label}
                                            </Badge>
                                            <Badge variant="outline">
                                                {order.payment_status_label}
                                            </Badge>
                                        </div>
                                        <p className="font-semibold">
                                            {order.cake_name} —{' '}
                                            {order.customer_name}
                                        </p>
                                        <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                                            <CalendarClock className="size-3.5" />
                                            Dibutuhkan {order.required_date} •{' '}
                                            {order.delivery_time} •{' '}
                                            {order.fulfillment_label}
                                            {order.customer_phone
                                                ? ` • WA: ${order.customer_phone}`
                                                : ''}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-base font-bold text-primary tabular-nums">
                                            {formatRupiah(order.total_price)}
                                        </span>
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Link
                                                href={admin.orders.show({
                                                    order: order.order_number,
                                                })}
                                            >
                                                <Eye className="mr-1.5 size-3.5" />
                                                Detail
                                            </Link>
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

AdminOrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard() },
        { title: 'Kelola Pesanan', href: admin.orders.index() },
    ],
};
