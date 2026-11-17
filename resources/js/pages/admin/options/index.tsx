import { Head, router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { FlashBanner } from '@/components/flash-banner';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import admin from '@/routes/admin';

type OptionItem = {
    id: number;
    name: string;
    is_active: boolean;
};

type OptionType = 'sizes' | 'flavors' | 'fillings';

type Props = {
    sizes: OptionItem[];
    flavors: OptionItem[];
    fillings: OptionItem[];
};

function OptionSection({
    title,
    type,
    placeholder,
    items,
}: {
    title: string;
    type: OptionType;
    placeholder: string;
    items: OptionItem[];
}) {
    const form = useForm({
        name: '',
    });

    const handleAdd = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(admin.options.store({ type }).url, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const toggleActive = (item: OptionItem) => {
        router.patch(
            admin.options.update({ type, id: item.id }).url,
            {
                name: item.name,
                is_active: !item.is_active,
            },
            { preserveScroll: true },
        );
    };

    const handleDelete = (item: OptionItem) => {
        router.delete(admin.options.destroy({ type, id: item.id }).url, {
            preserveScroll: true,
        });
    };

    return (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{title}</h2>

            <form onSubmit={handleAdd} className="mt-4 flex gap-2">
                <div className="flex-1">
                    <Input
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        placeholder={placeholder}
                    />
                    <InputError message={form.errors.name} />
                </div>
                <Button type="submit" disabled={form.processing}>
                    Tambah
                </Button>
            </form>

            <div className="mt-4 divide-y divide-border rounded-lg border border-border">
                {items.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">
                        Belum ada data {title.toLowerCase()}.
                    </p>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 px-4 py-3"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    {item.name}
                                </span>
                                <Badge
                                    variant={
                                        item.is_active ? 'secondary' : 'outline'
                                    }
                                >
                                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleActive(item)}
                                >
                                    {item.is_active
                                        ? 'Nonaktifkan'
                                        : 'Aktifkan'}
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDelete(item)}
                                >
                                    <Trash2 className="size-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

export default function AdminOptionsIndex({ sizes, flavors, fillings }: Props) {
    return (
        <>
            <Head title="Opsi Kue — Admin TBloom Cake" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Master Opsi Kue
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola daftar Ukuran, Rasa (Flavor), dan Isian (Filling)
                        yang dapat dipasang ke masing-masing produk kue.
                    </p>
                </div>

                <FlashBanner />

                <div className="grid gap-6 lg:grid-cols-3">
                    <OptionSection
                        title="Ukuran (Sizes)"
                        type="sizes"
                        placeholder="Contoh: Medium 20cm"
                        items={sizes}
                    />
                    <OptionSection
                        title="Rasa (Flavors)"
                        type="flavors"
                        placeholder="Contoh: Red Velvet"
                        items={flavors}
                    />
                    <OptionSection
                        title="Isian (Fillings)"
                        type="fillings"
                        placeholder="Contoh: Strawberry Compote"
                        items={fillings}
                    />
                </div>
            </div>
        </>
    );
}

AdminOptionsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard() },
        { title: 'Opsi Kue', href: admin.options.index() },
    ],
};
