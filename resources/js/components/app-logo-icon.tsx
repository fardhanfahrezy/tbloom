import type { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export default function AppLogoIcon({
    className,
    alt = 'TBloom Cake',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/favicon.PNG"
            alt={alt}
            className={cn(
                'object-contain dark:brightness-0 dark:invert',
                className,
            )}
            {...props}
        />
    );
}
