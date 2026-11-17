import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CakeSlice,
    CalendarCheck2,
    MessageCircle,
    Wallet,
} from 'lucide-react';
import { CakeCard } from '@/components/cake-card';
import type { CakeCardItem } from '@/components/cake-card';
import { PublicFooter, PublicHeader } from '@/components/public-layout';
import { Button } from '@/components/ui/button';
import catalog from '@/routes/catalog';

type Props = {
    featuredCakes: CakeCardItem[];
    whatsappUrl: string;
};

const orderSteps = [
    {
        icon: CakeSlice,
        title: 'Pilih Kue dari Katalog',
        description:
            'Tentukan model dasar kue, ukuran, rasa sponge, isian, serta tulisan personal sesuai momen Anda.',
    },
    {
        icon: CalendarCheck2,
        title: 'Atur Tanggal & Pengambilan',
        description:
            'Pilih tanggal sesuai estimasi minimum pemesanan dan slot jam pickup atau delivery yang tersedia.',
    },
    {
        icon: Wallet,
        title: 'Bayar dengan Mudah',
        description:
            'Selesaikan pembayaran langsung di toko (Cash khusus Pickup) atau secara online melalui Midtrans.',
    },
];

export default function Welcome({ featuredCakes, whatsappUrl }: Props) {
    return (
        <>
            <Head title="TBloom Cake — Catalog-Based Custom Cake" />

            <div className="min-h-screen bg-background text-foreground">
                <PublicHeader />

                <main className="mx-auto max-w-7xl space-y-14 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                    <section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-12">
                        <div className="max-w-3xl space-y-5">
                            <h1 className="text-3xl leading-[1.15] font-bold tracking-[-0.025em] text-foreground sm:text-5xl">
                                More than just dessert, it’s an experience ✨
                            </h1>
                            <div className="space-y-0.5 text-base font-medium text-primary italic sm:text-lg">
                                <p>Serving sweetness, creating memories.</p>
                                <p>Perfect for every special occasion 🤍</p>
                            </div>
                            <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">
                                TBloom Cake menghadirkan kue custom berbasis
                                katalog dengan rasa seimbang dan dekorasi
                                artisanal. Pilih desain favorit Anda dari
                                katalog, atau konsultasikan konsep desain khusus
                                langsung melalui WhatsApp.
                            </p>
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Button asChild size="lg">
                                    <Link href={catalog.index()}>
                                        Jelajahi Katalog Lengkap
                                        <ArrowRight className="ml-2 size-4" />
                                    </Link>
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

                    <section className="space-y-6">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">
                                    Pilihan Kue TBloom
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Beberapa desain terfavorit yang siap Anda
                                    personalisasi sesuai acara spesial.
                                </p>
                            </div>

                            <Button asChild variant="outline" size="sm">
                                <Link href={catalog.index()}>
                                    Lihat Semua di Katalog
                                    <ArrowRight className="ml-1.5 size-4" />
                                </Link>
                            </Button>
                        </div>

                        {featuredCakes.length === 0 ? (
                            <div className="rounded-xl border border-border bg-card p-10 text-center">
                                <p className="text-base font-medium">
                                    Katalog kue sedang disiapkan.
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Hubungi kami langsung via WhatsApp untuk
                                    memesan kue custom sesuai keinginan Anda.
                                </p>
                                <Button asChild className="mt-5">
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MessageCircle className="mr-2 size-4" />
                                        Chat WhatsApp TBloom
                                    </a>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {featuredCakes.map((cake) => (
                                    <CakeCard key={cake.id} cake={cake} />
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight">
                                Cara Memesan di TBloom Cake
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Proses pemesanan yang ringkas dan terjadwal agar
                                setiap kue selesai tepat waktu.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {orderSteps.map((step) => (
                                <div
                                    key={step.title}
                                    className="rounded-xl border border-border bg-card p-6 shadow-sm"
                                >
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
                                        <step.icon className="size-5" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold">
                                        {step.title}
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
                        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
                            <div className="space-y-1.5">
                                <h2 className="text-xl font-semibold">
                                    Punya Konsep Desain di Luar Katalog?
                                </h2>
                                <p className="max-w-[65ch] text-sm text-muted-foreground">
                                    Kirim referensi atau ceritakan tema acara
                                    Anda. Tim TBloom Cake siap membantu
                                    mewujudkan kue impian Anda melalui WhatsApp.
                                </p>
                            </div>
                            <Button asChild size="lg" className="shrink-0">
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MessageCircle className="mr-2 size-4" />
                                    Konsultasi WhatsApp
                                </a>
                            </Button>
                        </div>
                    </section>
                </main>

                <PublicFooter whatsappUrl={whatsappUrl} />
            </div>
        </>
    );
}
