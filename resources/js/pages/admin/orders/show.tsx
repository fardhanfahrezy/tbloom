import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { FlashBanner } from '@/components/flash-banner';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatRupiah } from '@/lib/utils';
import admin from '@/routes/admin';

type StatusOption = {
    value: string;
    label: string;
};

type HistoryRow = {
    id: number;
    to_status_label: string;
    notes: string | null;
    changed_by: string;
    created_at: string;
};

type Props = {
    order: {
        id: number;
        order_number: string;
        order_date: string;
        required_date: string;
        delivery_time: string;
        fulfillment_method: string;
        fulfillment_label: string;
        delivery_address: string | null;
        recipient_name: string;
        recipient_age: number;
        cake_message: string;
        special_notes: string | null;
        uploaded_image_url: string | null;
        payment_method: string;
        payment_method_label: string;
        payment_status: string;
        payment_status_label: string;
        order_status: string;
        order_status_label: string;
        base_price_snapshot: number;
        size_price_snapshot: number;
        flavor_price_snapshot: number;
        filling_price_snapshot: number;
        payment_fee: number;
        total_price: number;
        customer: {
            name: string;
            email: string;
            phone: string | null;
        };
        cake_name: string;
        size_name: string | null;
        flavor_name: string | null;
        filling_name: string | null;
        payment_type: string | null;
        histories: HistoryRow[];
    };
    statusOptions: StatusOption[];
};

export default function AdminOrderShow({ order, statusOptions }: Props) {
    const form = useForm({
        order_status: order.order_status,
        mark_paid: order.payment_status === 'paid',
        notes: '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        form.patch(admin.orders.status({ order: order.order_number }).url, {
            preserveScroll: true,
            onSuccess: () => form.reset('notes'),
        });
    };

    return (
        <>
            <Head title={`Detail Pesanan ${order.order_number} — Admin`} />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="sm">
                            <Link href={admin.orders.index()}>
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold">
                                {order.order_number}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Masuk pada {order.order_date}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                            {order.order_status_label}
                        </Badge>
                        <Badge variant="outline">
                            {order.payment_status_label}
                        </Badge>
                    </div>
                </div>

                <FlashBanner />

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="text-base font-semibold">
                                Data Pelanggan &amp; Personalisasi Kue
                            </h2>
                            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="text-xs text-muted-foreground">
                                        Pemesan
                                    </dt>
                                    <dd className="font-medium">
                                        {order.customer.name}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">
                                        Kontak WhatsApp / Email
                                    </dt>
                                    <dd className="font-medium">
                                        {order.customer.phone ?? '-'} •{' '}
                                        {order.customer.email}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">
                                        Produk Kue
                                    </dt>
                                    <dd className="font-medium">
                                        {order.cake_name}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">
                                        Opsi Pilihan
                                    </dt>
                                    <dd className="font-medium">
                                        {[
                                            order.size_name,
                                            order.flavor_name,
                                            order.filling_name,
                                        ]
                                            .filter(Boolean)
                                            .join(' • ') || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">
                                        Penerima
                                    </dt>
                                    <dd className="font-medium">
                                        {order.recipient_name} (
                                        {order.recipient_age} tahun)
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">
                                        Tulisan di Kue
                                    </dt>
                                    <dd className="font-medium">
                                        &ldquo;{order.cake_message}&rdquo;
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">
                                        Tanggal &amp; Jam Dibutuhkan
                                    </dt>
                                    <dd className="font-medium">
                                        {order.required_date} •{' '}
                                        {order.delivery_time}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">
                                        Metode Penerimaan
                                    </dt>
                                    <dd className="font-medium">
                                        {order.fulfillment_label}
                                    </dd>
                                </div>
                                {order.delivery_address && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-xs text-muted-foreground">
                                            Alamat Pengiriman
                                        </dt>
                                        <dd className="font-medium">
                                            {order.delivery_address}
                                        </dd>
                                    </div>
                                )}
                                {order.special_notes && (
                                    <div className="sm:col-span-2">
                                        <dt className="text-xs text-muted-foreground">
                                            Catatan Khusus Pelanggan
                                        </dt>
                                        <dd className="font-medium">
                                            {order.special_notes}
                                        </dd>
                                    </div>
                                )}
                            </dl>

                            {order.uploaded_image_url && (
                                <div className="mt-5 border-t border-border pt-5">
                                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                                        Foto Referensi dari Pelanggan
                                    </p>
                                    <img
                                        src={order.uploaded_image_url}
                                        alt="Foto referensi pelanggan"
                                        className="max-h-64 rounded-lg border border-border object-contain"
                                    />
                                </div>
                            )}
                        </section>

                        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="text-base font-semibold">
                                Riwayat Perubahan Status
                            </h2>
                            <div className="mt-4 divide-y divide-border rounded-lg border border-border">
                                {order.histories.map((history) => (
                                    <div
                                        key={history.id}
                                        className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 text-sm"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                {history.to_status_label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {history.changed_by}
                                                {history.notes
                                                    ? ` — ${history.notes}`
                                                    : ''}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {history.created_at}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm"
                        >
                            <h2 className="text-base font-semibold">
                                Perbarui Status Pesanan
                            </h2>

                            <div className="space-y-2">
                                <Label htmlFor="order_status">
                                    Status Pesanan
                                </Label>
                                <select
                                    id="order_status"
                                    value={form.data.order_status}
                                    onChange={(e) =>
                                        form.setData(
                                            'order_status',
                                            e.target.value,
                                        )
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                                >
                                    {statusOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={form.errors.order_status}
                                />
                                {form.data.order_status === 'rejected' && (
                                    <p className="text-xs text-destructive">
                                        Menandai ditolak akan mengembalikan 1
                                        kapasitas produksi harian pada{' '}
                                        {order.required_date}.
                                    </p>
                                )}
                            </div>

                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={form.data.mark_paid}
                                    onCheckedChange={(checked) =>
                                        form.setData(
                                            'mark_paid',
                                            Boolean(checked),
                                        )
                                    }
                                />
                                <span>Tandai Pembayaran Lunas</span>
                            </label>

                            <div className="space-y-2">
                                <Label htmlFor="notes">
                                    Catatan Riwayat (Opsional)
                                </Label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    value={form.data.notes}
                                    onChange={(e) =>
                                        form.setData('notes', e.target.value)
                                    }
                                    placeholder="Catatan internal atau keterangan untuk pelanggan..."
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                                />
                                <InputError message={form.errors.notes} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={form.processing}
                            >
                                Simpan Status
                            </Button>
                        </form>

                        <section className="space-y-3 rounded-xl border border-border bg-card p-6 text-sm shadow-sm">
                            <h2 className="text-base font-semibold">
                                Rincian Harga Snapshot
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {order.payment_method_label}
                                {order.payment_type
                                    ? ` (${order.payment_type})`
                                    : ''}
                            </p>
                            <div className="space-y-1.5 border-t border-border pt-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Harga Dasar
                                    </span>
                                    <span className="tabular-nums">
                                        {formatRupiah(
                                            order.base_price_snapshot,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Tambahan Opsi
                                    </span>
                                    <span className="tabular-nums">
                                        {formatRupiah(
                                            order.size_price_snapshot +
                                                order.flavor_price_snapshot +
                                                order.filling_price_snapshot,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Fee Midtrans
                                    </span>
                                    <span className="tabular-nums">
                                        {formatRupiah(order.payment_fee)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between border-t border-border pt-3 font-bold">
                                <span>Total</span>
                                <span className="text-primary tabular-nums">
                                    {formatRupiah(order.total_price)}
                                </span>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminOrderShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard() },
        { title: 'Kelola Pesanan', href: admin.orders.index() },
        { title: 'Detail Pesanan', href: admin.orders.index() },
    ],
};
