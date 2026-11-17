import { Link, usePage } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { dashboard, home, login, register } from '@/routes';
import catalog from '@/routes/catalog';

export function PublicHeader() {
    const { auth } = usePage().props;

    return (
        <header className="border-b border-border/80 bg-card/85 backdrop-blur-xs">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6">
                    <Link
                        href={home()}
                        className="flex items-center"
                        aria-label="Beranda TBloom Cake"
                    >
                        <AppLogoIcon className="h-10 w-auto sm:h-11" />
                    </Link>

                    <nav className="hidden items-center gap-4 text-sm font-medium sm:flex">
                        <Link
                            href={home()}
                            className="text-foreground/80 transition-colors hover:text-primary"
                        >
                            Beranda
                        </Link>
                        <Link
                            href={catalog.index()}
                            className="text-foreground/80 transition-colors hover:text-primary"
                        >
                            Katalog
                        </Link>
                    </nav>
                </div>

                <nav className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href={catalog.index()}
                        className="px-2 py-1 text-sm font-medium text-foreground/80 hover:text-primary sm:hidden"
                    >
                        Katalog
                    </Link>

                    {auth.user ? (
                        <Button asChild size="sm">
                            <Link href={dashboard()}>
                                {auth.user.role === 'customer'
                                    ? 'Beranda Akun'
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
    );
}

export function PublicFooter({ whatsappUrl }: { whatsappUrl: string }) {
    return (
        <footer className="mt-16 border-t border-border bg-card/70">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Sparkles className="size-4 text-primary" />
                    TBloom Cake — Serving sweetness, creating memories.
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
    );
}
