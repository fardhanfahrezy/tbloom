import { Head, router } from '@inertiajs/react';
import { MessageCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { CakeCard } from '@/components/cake-card';
import type { CakeCardItem } from '@/components/cake-card';
import { PublicFooter, PublicHeader } from '@/components/public-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import catalog from '@/routes/catalog';

type CategoryItem = {
    id: number;
    name: string;
    slug: string;
};

type Props = {
    categories: CategoryItem[];
    cakes: CakeCardItem[];
    filters: {
        category: string;
        search: string;
    };
    whatsappUrl: string;
};

export default function KatalogIndex({
    categories,
    cakes,
    filters,
    whatsappUrl,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search);

    const applyFilter = (categorySlug: string, searchValue: string) => {
        router.get(
            catalog.index(),
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
            <Head title="Katalog Kue — TBloom Cake" />

            <div className="min-h-screen bg-background text-foreground">
                <PublicHeader />

                <main className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Katalog Kue TBloom
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
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
                                    className="pl-9"
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
                                filters.category === '' ? 'default' : 'outline'
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
                                <CakeCard key={cake.id} cake={cake} />
                            ))}
                        </div>
                    )}
                </main>

                <PublicFooter whatsappUrl={whatsappUrl} />
            </div>
        </>
    );
}
