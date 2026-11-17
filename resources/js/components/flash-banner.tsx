import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function FlashBanner() {
    const { flash } = usePage().props;

    if (!flash?.success && !flash?.error) {
        return null;
    }

    if (flash.error) {
        return (
            <div
                role="alert"
                className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
            >
                <AlertCircle className="size-4 shrink-0" />
                <span>{flash.error}</span>
            </div>
        );
    }

    return (
        <div
            role="status"
            className="flex items-center gap-2.5 rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground"
        >
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
            <span>{flash.success}</span>
        </div>
    );
}
