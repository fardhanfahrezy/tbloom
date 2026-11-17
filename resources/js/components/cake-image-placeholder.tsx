import { Cake } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
    name: string;
    imageUrl: string | null;
    className?: string;
};

export function CakeImage({ name, imageUrl, className }: Props) {
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className={cn('h-full w-full object-cover', className)}
                loading="lazy"
            />
        );
    }

    return (
        <div
            className={cn(
                'flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground',
                className,
            )}
        >
            <Cake className="size-10 opacity-75" strokeWidth={1.5} />
            <span className="px-4 text-center text-xs font-medium">
                Foto produk belum diunggah
            </span>
        </div>
    );
}
