import { Head, router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { FlashBanner } from '@/components/flash-banner';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import admin from '@/routes/admin';

type CategoryItem = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    cakes_count: number;
};

type Props = {
    categories: CategoryItem[];
};

export default function AdminCategoriesIndex({ categories }: Props) {
    const form = useForm({
        name: '',
        is_active: true,
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(admin.categories.store().url, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const toggleActive = (category: CategoryItem) => {
        router.patch(
            admin.categories.update({ category: category.id }).url,
            {
                name: category.name,
                is_active: !category.is_active,
            },
            { preserveScroll: true },
        );
    };

    const handleDelete = (category: CategoryItem) => {
        router.delete(admin.categories.destroy({ category: category.id }).url, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Kategori Kue — Admin TBloom Cake" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Kategori Kue
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Kelola pengelompokan kue pada katalog publik TBloom
                        Cake.
                    </p>
                </div>

                <FlashBanner />

                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                    <h2 className="text-base font-semibold">
                        Tambah Kategori Baru
                    </h2>
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="category_name">Nama Kategori</Label>
                            <Input
                                id="category_name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                placeholder="Contoh: Korean Bento Cake"
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <Button type="submit" disabled={form.processing}>
                            Simpan Kategori
                        </Button>
                    </div>
                </form>

                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="divide-y divide-border">
                        {categories.length === 0 ? (
                            <p className="p-6 text-center text-sm text-muted-foreground">
                                Belum ada kategori kue.
                            </p>
                        ) : (
                            categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-6"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                {category.name}
                                            </span>
                                            <Badge
                                                variant={
                                                    category.is_active
                                                        ? 'secondary'
                                                        : 'outline'
                                                }
                                            >
                                                {category.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </Badge>
                                        </div>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            Slug: {category.slug} •{' '}
                                            {category.cakes_count} produk kue
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                toggleActive(category)
                                            }
                                        >
                                            {category.is_active
                                                ? 'Nonaktifkan'
                                                : 'Aktifkan'}
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            disabled={category.cakes_count > 0}
                                            onClick={() =>
                                                handleDelete(category)
                                            }
                                            title={
                                                category.cakes_count > 0
                                                    ? 'Hapus atau pindahkan kue terlebih dahulu'
                                                    : 'Hapus kategori'
                                            }
                                        >
                                            <Trash2 className="size-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

AdminCategoriesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard() },
        { title: 'Kategori Kue', href: admin.categories.index() },
    ],
};
