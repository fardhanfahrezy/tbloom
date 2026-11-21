import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CakeImage } from '@/components/cake-image-placeholder';
import { FlashBanner } from '@/components/flash-banner';
import { PublicFooter, PublicHeader } from '@/components/public-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';
import ordersRoutes from '@/routes/orders';

declare global {
    interface Window {
        snap?: {
            pay: (
                token: string,
                callbacks?: {
                    onSuccess?: () => void;
                    onPending?: () => void;
                    onError?: () => void;
                    onClose?: () => void;
                },
            ) => void;
        };
    }
}

type HistoryItem = {
    id: number;
    to_status: string;
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
        cake: {
            name: string;
            slug: string;
            image_url: string | null;
        };
        size_name: string | null;
        flavor_name: string | null;
        filling_name: string | null;
        snap_token: string | null;
        histories: HistoryItem[];
    };
    midtrans: {
        clientKey: string | null;
        snapScriptUrl: string;
    };
};

export default function OrderShow({ order, midtrans }: Props) {
    const [snapReady, setSnapReady] = useState(false);

    useEffect(() => {
        if (!order.snap_token || !midtrans.clientKey) {
            return;
        }

        if (window.snap) {
            setSnapReady(true);

            return;
        }

        const script = document.createElement('script');
        script.src = midtrans.snapScriptUrl;
        script.setAttribute('data-client-key', midtrans.clientKey);
        script.async = true;
        script.onload = () => setSnapReady(true);
        document.body.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [order.snap_token, midtrans.clientKey, midtrans.snapScriptUrl]);

    const handlePayNow = () => {
        if (!order.snap_token || !window.snap) {
            return;
        }

        window.snap.pay(order.snap_token, {
            onSuccess: () => router.reload(),
            onPending: () => router.reload(),
        });
    };

    const showMidtransPayButton =
        order.payment_method === 'midtrans' &&
        order.payment_status !== 'paid' &&
        order.order_status !== 'rejected';

    return (
        <>
            <Head title={`Pesanan ${order.order_number} — TBloom Cake`} />

            <div className="min-h-screen bg-background text-foreground">
                <PublicHeader />

                <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Button asChild variant="outline" size="sm">
                            <Link href={ordersRoutes.index()}>
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali ke Pesanan Saya
                            </Link>
                        </Button>

                        <div className="flex flex-wrap items-center gap-2">
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
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Nomor Pesanan
                                        </p>
                                        <h1 className="text-xl font-bold">
                                            {order.order_number}
                                        </h1>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        Dipesan pada {order.order_date}
                                    </span>
                                </div>

                                <div className="mt-5 flex items-center gap-4">
                                    <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border">
                                        <CakeImage
                                            name={order.cake.name}
                                            imageUrl={order.cake.image_url}
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">
                                            {order.cake.name}
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            {[
                                                order.size_name,
                                                order.flavor_name,
                                                order.filling_name,
                                            ]
                                                .filter(Boolean)
                                                .join(' • ')}
                                        </p>
                                    </div>
                                </div>

                                <dl className="mt-6 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2">
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
                                    {order.special_notes && (
                                        <div className="sm:col-span-2">
                                            <dt className="text-xs text-muted-foreground">
                                                Catatan Khusus
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
                                            Foto Referensi Pelanggan
                                        </p>
                                        <img
                                            src={order.uploaded_image_url}
                                            alt="Foto referensi kue"
                                            className="max-h-56 rounded-lg border border-border object-contain"
                                        />
                                    </div>
                                )}
                            </section>

                            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
                                <h2 className="text-base font-semibold">
                                    Riwayat Status Pesanan
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
                                                {history.notes && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {history.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {history.created_at}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <aside className="h-fit space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="text-base font-semibold">
                                Rincian Pembayaran
                            </h2>

                            <p className="text-xs text-muted-foreground">
                                Metode:{' '}
                                <strong>{order.payment_method_label}</strong>
                            </p>

                            <div className="space-y-2 border-t border-border pt-4 text-sm">
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
                                {order.size_price_snapshot > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Tambahan Ukuran
                                        </span>
                                        <span className="tabular-nums">
                                            {formatRupiah(
                                                order.size_price_snapshot,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {order.flavor_price_snapshot > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Tambahan Rasa
                                        </span>
                                        <span className="tabular-nums">
                                            {formatRupiah(
                                                order.flavor_price_snapshot,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {order.filling_price_snapshot > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Tambahan Isian
                                        </span>
                                        <span className="tabular-nums">
                                            {formatRupiah(
                                                order.filling_price_snapshot,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {order.payment_fee > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Biaya Layanan Midtrans
                                        </span>
                                        <span className="tabular-nums">
                                            {formatRupiah(order.payment_fee)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-baseline justify-between border-t border-border pt-4">
                                <span className="font-semibold">Total</span>
                                <span className="text-xl font-bold text-primary tabular-nums">
                                    {formatRupiah(order.total_price)}
                                </span>
                            </div>

                            {showMidtransPayButton && (
                                <div className="space-y-2 pt-2">
                                    {order.snap_token ? (
                                        <Button
                                            type="button"
                                            size="lg"
                                            className="w-full"
                                            disabled={!snapReady}
                                            onClick={handlePayNow}
                                        >
                                            <CreditCard className="mr-2 size-4" />
                                            {snapReady
                                                ? 'Bayar Sekarang (Midtrans)'
                                                : 'Memuat Pembayaran...'}
                                        </Button>
                                    ) : (
                                        <p className="rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                                            Token Midtrans belum tersedia.
                                            Pastikan kunci Sandbox/Production
                                            Midtrans sudah dikonfigurasi di
                                            server.
                                        </p>
                                    )}
                                </div>
                            )}

                            {order.payment_method === 'cash' &&
                                order.payment_status !== 'paid' && (
                                    <p className="rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                                        Silakan lakukan pembayaran tunai (Cash)
                                        di toko saat mengambil pesanan pada{' '}
                                        <strong>{order.required_date}</strong>.
                                    </p>
                                )}
                        </aside>
                    </div>
                </main>

                <PublicFooter whatsappUrl="https://wa.me/" />
            </div>
        </>
    );
}
