import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarClock,
    MessageCircle,
    Search,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { CakeImage } from '@/components/cake-image-placeholder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRupiah } from '@/lib/utils';
import { dashboard, home, login, register } from '@/routes';
import cakesRoutes from '@/routes/cakes';

type CategoryItem = {
    id: number;
    name: string;
    slug: string;
};

type CakeItem = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    base_price: number;
    production_days: number;
    minimum_order_days: number;
    allow_image_upload: boolean;
    category: CategoryItem | null;
};

type Props = {
    categories: CategoryItem[];
    cakes: CakeItem[];
    filters: {
        category: string;
        search: string;
    };
    whatsappUrl: string;
};

export default function Welcome({
    categories,
    cakes,
    filters,
    whatsappUrl,
}: Props) {
    const { auth } = usePage().props;
    const [searchQuery, setSearchQuery] = useState(filters.search);

    const applyFilter = (categorySlug: string, searchValue: string) => {
        router.get(
            home(),
            {
                ...(categorySlug ? { category: categorySlug } : {}),
                ...(searchValue.trim() ? { search: searchValue.trim() } : {}),
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="TBloom Cake — Katalog Kue Custom" />

            <div className="min-h-screen bg-background text-foreground">
                <header className="border-b border-border/80 bg-card/85 backdrop-blur-xs">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <Link
                            href={home()}
                            className="flex items-center"
                            aria-label="Beranda TBloom Cake"
                        >
                            <AppLogoIcon className="h-10 w-auto sm:h-11" />
                        </Link>

                        <nav className="flex items-center gap-2 sm:gap-3">
                            {auth.user ? (
                                <Button asChild size="sm">
                                    <Link href={dashboard()}>
                                        {auth.user.role === 'customer'
                                            ? 'Akun Saya'
                                            : 'Dashboard'}
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={login()}>Masuk</Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href={register()}>Daftar</Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                    <section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-10">
                        <div className="max-w-3xl space-y-4">
                            <h1 className="text-3xl leading-[1.15] font-bold tracking-[-0.025em] text-foreground sm:text-4xl">
                                More than just dessert, it’s an experience ✨
                            </h1>
                            <div className="space-y-0.5 text-base font-medium text-primary italic sm:text-lg">
                                <p>Serving sweetness, creating memories.</p>
                                <p>Perfect for every special occasion 🤍</p>
                            </div>
                            <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">
                                Pilih desain kue dari katalog TBloom Cake,
                                sesuaikan ukuran, rasa, isian, dan tulisan di
                                atas kue. Punya konsep desain sendiri di luar
                                katalog? Konsultasikan langsung dengan tim kami
                                melalui WhatsApp.
                            </p>
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button asChild size="lg">
                                    <a href="#katalog">
                                        Lihat Katalog Kue
                                        <ArrowRight className="ml-2 size-4" />
                                    </a>
                                </Button>
                                <Button asChild variant="secondary" size="lg">
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MessageCircle className="mr-2 size-4" />
                                        Pesan Kue Custom via WhatsApp
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section id="katalog" className="mt-10 space-y-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">
                                    Katalog Kue TBloom
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Menampilkan {cakes.length} pilihan kue yang
                                    tersedia untuk dipesan.
                                </p>
                            </div>

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    applyFilter(filters.category, searchQuery);
                                }}
                                className="flex w-full gap-2 md:w-80"
                            >
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        value={searchQuery}
                                        onChange={(event) =>
                                            setSearchQuery(event.target.value)
                                        }
                                        placeholder="Cari nama kue..."
                                        className="bg-card pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="secondary">
                                    Cari
                                </Button>
                            </form>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                variant={
                                    filters.category === ''
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => applyFilter('', searchQuery)}
                            >
                                Semua Kategori
                            </Button>
                            {categories.map((category) => (
                                <Button
                                    key={category.id}
                                    type="button"
                                    size="sm"
                                    variant={
                                        filters.category === category.slug
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() =>
                                        applyFilter(category.slug, searchQuery)
                                    }
                                >
                                    {category.name}
                                </Button>
                            ))}
                        </div>

                        {cakes.length === 0 ? (
                            <div className="rounded-xl border border-border bg-card p-10 text-center">
                                <p className="text-base font-medium text-foreground">
                                    Belum ada kue yang sesuai dengan filter saat
                                    ini.
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Coba pilih kategori lain atau konsultasikan
                                    desain kue custom langsung via WhatsApp.
                                </p>
                                <div className="mt-5 flex flex-wrap justify-center gap-3">
                                    {(filters.category !== '' ||
                                        filters.search !== '') && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setSearchQuery('');
                                                applyFilter('', '');
                                            }}
                                        >
                                            Tampilkan Semua Kue
                                        </Button>
                                    )}
                                    <Button asChild>
                                        <a
                                            href={whatsappUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <MessageCircle className="mr-2 size-4" />
                                            Hubungi WhatsApp
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {cakes.map((cake) => (
                                    <article
                                        key={cake.id}
                                        className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        <Link
                                            href={cakesRoutes.show({
                                                cake: cake.slug,
                                            })}
                                            className="aspect-[4/3] w-full overflow-hidden border-b border-border"
                                        >
                                            <CakeImage
                                                name={cake.name}
                                                imageUrl={cake.image_url}
                                            />
                                        </Link>

                                        <div className="flex flex-1 flex-col p-6">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {cake.category && (
                                                    <Badge variant="secondary">
                                                        {cake.category.name}
                                                    </Badge>
                                                )}
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                                    <CalendarClock className="size-3.5" />
                                                    Min. H-
                                                    {cake.minimum_order_days}
                                                </span>
                                            </div>

                                            <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                                                <Link
                                                    href={cakesRoutes.show({
                                                        cake: cake.slug,
                                                    })}
                                                    className="hover:text-primary"
                                                >
                                                    {cake.name}
                                                </Link>
                                            </h3>

                                            {cake.description && (
                                                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                                                    {cake.description}
                                                </p>
                                            )}

                                            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                                                <div>
                                                    <span className="block text-xs text-muted-foreground">
                                                        Mulai dari
                                                    </span>
                                                    <span className="text-lg font-bold text-primary tabular-nums">
                                                        {formatRupiah(
                                                            cake.base_price,
                                                        )}
                                                    </span>
                                                </div>

                                                <Button asChild size="sm">
                                                    <Link
                                                        href={cakesRoutes.show({
                                                            cake: cake.slug,
                                                        })}
                                                    >
                                                        Detail Kue
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </main>

                <footer className="mt-16 border-t border-border bg-card/70">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
                        <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <Sparkles className="size-4 text-primary" />
                            TBloom Cake — Catalog-Based Custom Cake
                        </span>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline"
                        >
                            Butuh desain di luar katalog? Chat WhatsApp
                        </a>
                    </div>
                </footer>
            </div>
        </>
    );
}
