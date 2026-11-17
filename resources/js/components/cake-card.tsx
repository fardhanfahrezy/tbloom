import { Link } from '@inertiajs/react';
import { CalendarClock } from 'lucide-react';
import { CakeImage } from '@/components/cake-image-placeholder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRupiah } from '@/lib/utils';
import cakesRoutes from '@/routes/cakes';

export type CakeCardItem = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    base_price: number;
    production_days: number;
    minimum_order_days: number;
    allow_image_upload: boolean;
    category: {
        id: number;
        name: string;
        slug: string;
    } | null;
};

export function CakeCard({ cake }: { cake: CakeCardItem }) {
    return (
        <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
            <Link
                href={cakesRoutes.show({ cake: cake.slug })}
                className="aspect-[4/3] w-full overflow-hidden border-b border-border"
            >
                <CakeImage name={cake.name} imageUrl={cake.image_url} />
            </Link>

            <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-2">
                    {cake.category && (
                        <Badge variant="secondary">{cake.category.name}</Badge>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <CalendarClock className="size-3.5" />
                        Min. H-{cake.minimum_order_days}
                    </span>
                </div>

                <h3 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                    <Link
                        href={cakesRoutes.show({ cake: cake.slug })}
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
                            {formatRupiah(cake.base_price)}
                        </span>
                    </div>

                    <Button asChild size="sm">
                        <Link href={cakesRoutes.show({ cake: cake.slug })}>
                            Detail Kue
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}
