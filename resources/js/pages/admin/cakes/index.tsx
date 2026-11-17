import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { CakeImage } from '@/components/cake-image-placeholder';
import { FlashBanner } from '@/components/flash-banner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';
import admin from '@/routes/admin';

type CakeRow = {
    id: number;
    name: string;
    slug: string;
    image_url: string | null;
    base_price: number;
    production_days: number;
    minimum_order_days: number;
    allow_image_upload: boolean;
    is_active: boolean;
    category: { id: number; name: string } | null;
};

type Props = {
    cakes: CakeRow[];
};

export default function AdminCakesIndex({ cakes }: Props) {
    const handleDelete = (cake: CakeRow) => {
        router.delete(admin.cakes.destroy({ cake: cake.id }).url, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Katalog Kue — Admin TBloom Cake" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Katalog Kue
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola produk kue, foto, harga dasar, estimasi
                            produksi, dan opsi personalisasi.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={admin.cakes.create()}>
                            <Plus className="mr-1.5 size-4" />
                            Tambah Kue
                        </Link>
                    </Button>
                </div>

                <FlashBanner />

                {cakes.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card p-10 text-center">
                        <p className="text-base font-medium">
                            Belum ada produk kue di katalog.
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Mulai tambahkan produk kue pertama Anda agar tampil
                            di halaman depan.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href={admin.cakes.create()}>
                                Tambah Kue Pertama
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {cakes.map((cake) => (
                            <div
                                key={cake.id}
                                className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                            >
                                <div className="aspect-[4/3] w-full overflow-hidden border-b border-border">
                                    <CakeImage
                                        name={cake.name}
                                        imageUrl={cake.image_url}
                                    />
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {cake.category && (
                                            <Badge variant="secondary">
                                                {cake.category.name}
                                            </Badge>
                                        )}
                                        <Badge
                                            variant={
                                                cake.is_active
                                                    ? 'outline'
                                                    : 'destructive'
                                            }
                                        >
                                            {cake.is_active
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </Badge>
                                    </div>

                                    <h2 className="mt-2.5 text-lg font-semibold">
                                        {cake.name}
                                    </h2>
                                    <p className="mt-1 text-base font-bold text-primary">
                                        {formatRupiah(cake.base_price)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Produksi {cake.production_days} hari •
                                        Min. H-{cake.minimum_order_days}
                                        {cake.allow_image_upload
                                            ? ' • Upload foto aktif'
                                            : ''}
                                    </p>

                                    <div className="mt-auto flex items-center gap-2 pt-4">
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <Link
                                                href={admin.cakes.edit({
                                                    cake: cake.id,
                                                })}
                                            >
                                                <Pencil className="mr-1.5 size-3.5" />
                                                Ubah
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(cake)}
                                            aria-label={`Hapus ${cake.name}`}
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

AdminCakesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard() },
        { title: 'Katalog Kue', href: admin.cakes.index() },
    ],
};
