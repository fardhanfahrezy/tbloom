import { Head, Link } from '@inertiajs/react';
import { CalendarClock, Plus } from 'lucide-react';
import { CakeImage } from '@/components/cake-image-placeholder';
import { PublicFooter, PublicHeader } from '@/components/public-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';
import catalog from '@/routes/catalog';
import ordersRoutes from '@/routes/orders';

type OrderRow = {
    id: number;
    order_number: string;
    required_date: string;
    delivery_time: string;
    fulfillment_method: string;
    fulfillment_label: string;
    payment_method: string;
    payment_method_label: string;
    payment_status: string;
    payment_status_label: string;
    order_status: string;
    order_status_label: string;
    total_price: number;
    cake: {
        name: string;
        slug: string;
        image_url: string | null;
    };
    created_at: string;
};

type Props = {
    orders: OrderRow[];
};

export default function OrdersIndex({ orders }: Props) {
    return (
        <>
            <Head title="Pesanan Saya — TBloom Cake" />

            <div className="min-h-screen bg-background text-foreground">
                <PublicHeader />

                <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Pesanan Saya
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Pantau status pembuatan dan pembayaran pesanan
                                kue TBloom Anda.
                            </p>
                        </div>

                        <Button asChild>
                            <Link href={catalog.index()}>
                                <Plus className="mr-1.5 size-4" />
                                Pesan Kue Baru
                            </Link>
                        </Button>
                    </div>

                    {orders.length === 0 ? (
                        <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
                            <p className="text-base font-semibold">
                                Anda belum memiliki pesanan kue.
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Jelajahi katalog TBloom Cake untuk memilih
                                desain kue custom favorit Anda.
                            </p>
                            <Button asChild className="mt-5">
                                <Link href={catalog.index()}>
                                    Lihat Katalog Kue
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border">
                                            <CakeImage
                                                name={order.cake.name}
                                                imageUrl={order.cake.image_url}
                                            />
                                        </div>
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
                                            <h2 className="text-base font-semibold">
                                                {order.cake.name}
                                            </h2>
                                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <CalendarClock className="size-3.5" />
                                                {order.required_date} •{' '}
                                                {order.delivery_time} •{' '}
                                                {order.fulfillment_label}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 border-t border-border pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                                        <span className="text-lg font-bold text-primary tabular-nums">
                                            {formatRupiah(order.total_price)}
                                        </span>
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Link
                                                href={ordersRoutes.show({
                                                    order: order.order_number,
                                                })}
                                            >
                                                Detail Pesanan
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                <PublicFooter whatsappUrl="https://wa.me/" />
            </div>
        </>
    );
}
