import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarClock,
    Clock,
    ImagePlus,
    MessageCircle,
} from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { CakeImage } from '@/components/cake-image-placeholder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';
import { home } from '@/routes';

type CakeOptionItem = {
    id: number;
    name: string;
    additional_price: number;
};

type Props = {
    cake: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        image_url: string | null;
        base_price: number;
        allow_image_upload: boolean;
        production_days: number;
        minimum_order_days: number;
        category: {
            id: number;
            name: string;
            slug: string;
        } | null;
        sizes: CakeOptionItem[];
        flavors: CakeOptionItem[];
        fillings: CakeOptionItem[];
    };
    whatsappUrl: string;
};

export default function CakeShow({ cake, whatsappUrl }: Props) {
    const [selectedSizeId, setSelectedSizeId] = useState<number | null>(
        cake.sizes[0]?.id ?? null,
    );
    const [selectedFlavorId, setSelectedFlavorId] = useState<number | null>(
        cake.flavors[0]?.id ?? null,
    );
    const [selectedFillingId, setSelectedFillingId] = useState<number | null>(
        cake.fillings[0]?.id ?? null,
    );

    const selectedSize = cake.sizes.find((s) => s.id === selectedSizeId);
    const selectedFlavor = cake.flavors.find((f) => f.id === selectedFlavorId);
    const selectedFilling = cake.fillings.find(
        (fl) => fl.id === selectedFillingId,
    );

    const estimatedTotal =
        cake.base_price +
        (selectedSize?.additional_price ?? 0) +
        (selectedFlavor?.additional_price ?? 0) +
        (selectedFilling?.additional_price ?? 0);

    return (
        <>
            <Head title={`${cake.name} — TBloom Cake`} />

            <div className="min-h-screen bg-background text-foreground">
                <header className="border-b border-border/80 bg-card/85 backdrop-blur-xs">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link href={home()} className="flex items-center">
                            <AppLogoIcon className="h-10 w-auto" />
                        </Link>
                        <Button asChild variant="outline" size="sm">
                            <Link href={home()}>
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali ke Katalog
                            </Link>
                        </Button>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                    <div className="grid gap-8 lg:grid-cols-2">
                        <div className="space-y-4">
                            <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                                <CakeImage
                                    name={cake.name}
                                    imageUrl={cake.image_url}
                                />
                            </div>

                            <div className="grid gap-3 rounded-xl border border-border bg-card p-4 text-sm sm:grid-cols-2">
                                <div className="flex items-center gap-2.5">
                                    <Clock className="size-4 shrink-0 text-primary" />
                                    <span>
                                        Estimasi pembuatan:{' '}
                                        <strong>
                                            {cake.production_days} hari
                                        </strong>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <CalendarClock className="size-4 shrink-0 text-primary" />
                                    <span>
                                        Pesan minimal:{' '}
                                        <strong>
                                            H-{cake.minimum_order_days}
                                        </strong>
                                    </span>
                                </div>
                                {cake.allow_image_upload && (
                                    <div className="flex items-center gap-2.5 sm:col-span-2">
                                        <ImagePlus className="size-4 shrink-0 text-primary" />
                                        <span>
                                            Mendukung unggah foto referensi saat
                                            pemesanan.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
                            {cake.category && (
                                <Badge variant="secondary">
                                    {cake.category.name}
                                </Badge>
                            )}

                            <h1 className="mt-3 text-2xl leading-[1.2] font-bold tracking-[-0.02em] sm:text-3xl">
                                {cake.name}
                            </h1>

                            <p className="mt-2 text-2xl font-bold text-primary tabular-nums">
                                {formatRupiah(estimatedTotal)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Harga dasar {formatRupiah(cake.base_price)}{' '}
                                termasuk pilihan opsi yang dipilih di bawah.
                            </p>

                            {cake.description && (
                                <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
                                    {cake.description}
                                </p>
                            )}

                            <div className="mt-6 space-y-5 border-t border-border pt-6">
                                {cake.sizes.length > 0 && (
                                    <div className="space-y-2">
                                        <h2 className="text-sm font-semibold">
                                            Pilih Ukuran
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {cake.sizes.map((size) => (
                                                <Button
                                                    key={size.id}
                                                    type="button"
                                                    size="sm"
                                                    variant={
                                                        selectedSizeId ===
                                                        size.id
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    onClick={() =>
                                                        setSelectedSizeId(
                                                            size.id,
                                                        )
                                                    }
                                                >
                                                    {size.name}
                                                    {size.additional_price >
                                                        0 &&
                                                        ` (+${formatRupiah(size.additional_price)})`}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {cake.flavors.length > 0 && (
                                    <div className="space-y-2">
                                        <h2 className="text-sm font-semibold">
                                            Pilih Rasa Kue (Flavor)
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {cake.flavors.map((flavor) => (
                                                <Button
                                                    key={flavor.id}
                                                    type="button"
                                                    size="sm"
                                                    variant={
                                                        selectedFlavorId ===
                                                        flavor.id
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    onClick={() =>
                                                        setSelectedFlavorId(
                                                            flavor.id,
                                                        )
                                                    }
                                                >
                                                    {flavor.name}
                                                    {flavor.additional_price >
                                                        0 &&
                                                        ` (+${formatRupiah(flavor.additional_price)})`}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {cake.fillings.length > 0 && (
                                    <div className="space-y-2">
                                        <h2 className="text-sm font-semibold">
                                            Pilih Isian (Filling)
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {cake.fillings.map((filling) => (
                                                <Button
                                                    key={filling.id}
                                                    type="button"
                                                    size="sm"
                                                    variant={
                                                        selectedFillingId ===
                                                        filling.id
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    onClick={() =>
                                                        setSelectedFillingId(
                                                            filling.id,
                                                        )
                                                    }
                                                >
                                                    {filling.name}
                                                    {filling.additional_price >
                                                        0 &&
                                                        ` (+${formatRupiah(filling.additional_price)})`}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 space-y-3 border-t border-border pt-6">
                                <Button
                                    type="button"
                                    size="lg"
                                    className="w-full"
                                    disabled
                                >
                                    Pesan Kue Ini (Stepper Hadir di Fase 3)
                                </Button>
                                <Button
                                    asChild
                                    variant="secondary"
                                    size="lg"
                                    className="w-full"
                                >
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MessageCircle className="mr-2 size-4" />
                                        Konsultasi / Pesan Custom via WhatsApp
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
