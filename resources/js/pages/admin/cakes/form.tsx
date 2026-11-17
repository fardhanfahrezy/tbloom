import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import admin from '@/routes/admin';

type MasterOption = {
    id: number;
    name: string;
    is_active: boolean;
};

type SelectedOption = {
    id: number;
    additional_price: number;
};

type CakeData = {
    id: number;
    category_id: number;
    name: string;
    description: string;
    image_url: string | null;
    base_price: number;
    allow_image_upload: boolean;
    production_days: number;
    minimum_order_days: number;
    is_active: boolean;
    sizes: SelectedOption[];
    flavors: SelectedOption[];
    fillings: SelectedOption[];
};

type Props = {
    cake: CakeData | null;
    categories: MasterOption[];
    availableSizes: MasterOption[];
    availableFlavors: MasterOption[];
    availableFillings: MasterOption[];
};

function OptionPivotChecklist({
    title,
    available,
    selected,
    onChange,
}: {
    title: string;
    available: MasterOption[];
    selected: SelectedOption[];
    onChange: (next: SelectedOption[]) => void;
}) {
    const toggleOption = (id: number, checked: boolean) => {
        if (checked) {
            onChange([...selected, { id, additional_price: 0 }]);
        } else {
            onChange(selected.filter((item) => item.id !== id));
        }
    };

    const updatePrice = (id: number, price: number) => {
        onChange(
            selected.map((item) =>
                item.id === id
                    ? { ...item, additional_price: Math.max(0, price || 0) }
                    : item,
            ),
        );
    };

    return (
        <div className="space-y-3 rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold">{title}</h3>
            {available.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                    Belum ada data {title.toLowerCase()}. Tambahkan di menu Opsi
                    Kue.
                </p>
            ) : (
                <div className="space-y-2.5">
                    {available.map((option) => {
                        const current = selected.find(
                            (item) => item.id === option.id,
                        );
                        const isChecked = Boolean(current);

                        return (
                            <div
                                key={option.id}
                                className="flex flex-wrap items-center justify-between gap-3"
                            >
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                            toggleOption(
                                                option.id,
                                                Boolean(checked),
                                            )
                                        }
                                    />
                                    <span>{option.name}</span>
                                </label>

                                {isChecked && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs text-muted-foreground">
                                            +Rp
                                        </span>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={1000}
                                            value={
                                                current?.additional_price ?? 0
                                            }
                                            onChange={(e) =>
                                                updatePrice(
                                                    option.id,
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="h-8 w-28 text-right text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function AdminCakeForm({
    cake,
    categories,
    availableSizes,
    availableFlavors,
    availableFillings,
}: Props) {
    const isEditing = cake !== null;

    const form = useForm<{
        _method?: 'patch';
        category_id: string;
        name: string;
        description: string;
        image: File | null;
        base_price: number;
        allow_image_upload: boolean;
        production_days: number;
        minimum_order_days: number;
        is_active: boolean;
        sizes: SelectedOption[];
        flavors: SelectedOption[];
        fillings: SelectedOption[];
    }>({
        _method: isEditing ? 'patch' : undefined,
        category_id: cake
            ? String(cake.category_id)
            : String(categories[0]?.id ?? ''),
        name: cake?.name ?? '',
        description: cake?.description ?? '',
        image: null,
        base_price: cake?.base_price ?? 150000,
        allow_image_upload: cake?.allow_image_upload ?? false,
        production_days: cake?.production_days ?? 2,
        minimum_order_days: cake?.minimum_order_days ?? 2,
        is_active: cake?.is_active ?? true,
        sizes: cake?.sizes ?? [],
        flavors: cake?.flavors ?? [],
        fillings: cake?.fillings ?? [],
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const targetUrl = isEditing
            ? admin.cakes.update({ cake: cake.id }).url
            : admin.cakes.store().url;

        form.post(targetUrl, {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head
                title={
                    isEditing
                        ? `Ubah ${cake.name} — Admin TBloom Cake`
                        : 'Tambah Kue — Admin TBloom Cake'
                }
            />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {isEditing
                                ? `Ubah Kue: ${cake.name}`
                                : 'Tambah Kue'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Lengkapi informasi produk, foto, dan variasi opsi
                            beserta tambahan harganya.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={admin.cakes.index()}>Kembali</Link>
                    </Button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Kue</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                placeholder="Contoh: Vintage Heart Lambeth Cake"
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category_id">Kategori</Label>
                            <select
                                id="category_id"
                                value={form.data.category_id}
                                onChange={(e) =>
                                    form.setData('category_id', e.target.value)
                                }
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                            >
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.category_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="base_price">
                                Harga Dasar (Rupiah)
                            </Label>
                            <Input
                                id="base_price"
                                type="number"
                                min={0}
                                step={1000}
                                value={form.data.base_price}
                                onChange={(e) =>
                                    form.setData(
                                        'base_price',
                                        Number(e.target.value),
                                    )
                                }
                            />
                            <InputError message={form.errors.base_price} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="production_days">
                                    Estimasi Produksi (Hari)
                                </Label>
                                <Input
                                    id="production_days"
                                    type="number"
                                    min={1}
                                    value={form.data.production_days}
                                    onChange={(e) =>
                                        form.setData(
                                            'production_days',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.production_days}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minimum_order_days">
                                    Min. Order (H-n)
                                </Label>
                                <Input
                                    id="minimum_order_days"
                                    type="number"
                                    min={1}
                                    value={form.data.minimum_order_days}
                                    onChange={(e) =>
                                        form.setData(
                                            'minimum_order_days',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.minimum_order_days}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Deskripsi Kue</Label>
                            <textarea
                                id="description"
                                rows={3}
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData('description', e.target.value)
                                }
                                placeholder="Jelaskan karakter kue, dekorasi, dan kecocokan acara..."
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                            />
                            <InputError message={form.errors.description} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">
                                Foto Produk (Opsional)
                            </Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    form.setData(
                                        'image',
                                        e.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            <InputError message={form.errors.image} />
                            {cake?.image_url && (
                                <p className="text-xs text-muted-foreground">
                                    Foto saat ini tersimpan. Unggah foto baru
                                    jika ingin mengganti.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col justify-center gap-3 pt-2">
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={form.data.allow_image_upload}
                                    onCheckedChange={(checked) =>
                                        form.setData(
                                            'allow_image_upload',
                                            Boolean(checked),
                                        )
                                    }
                                />
                                <span>
                                    Izinkan pelanggan mengunggah foto referensi
                                </span>
                            </label>

                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={form.data.is_active}
                                    onCheckedChange={(checked) =>
                                        form.setData(
                                            'is_active',
                                            Boolean(checked),
                                        )
                                    }
                                />
                                <span>Tampilkan kue di katalog publik</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <OptionPivotChecklist
                            title="Ukuran (Sizes)"
                            available={availableSizes}
                            selected={form.data.sizes}
                            onChange={(next) => form.setData('sizes', next)}
                        />
                        <OptionPivotChecklist
                            title="Rasa (Flavors)"
                            available={availableFlavors}
                            selected={form.data.flavors}
                            onChange={(next) => form.setData('flavors', next)}
                        />
                        <OptionPivotChecklist
                            title="Isian (Fillings)"
                            available={availableFillings}
                            selected={form.data.fillings}
                            onChange={(next) => form.setData('fillings', next)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 border-t border-border pt-5">
                        <Button asChild variant="outline">
                            <Link href={admin.cakes.index()}>Batal</Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {isEditing ? 'Simpan Perubahan' : 'Simpan Kue'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

AdminCakeForm.layout = {
    breadcrumbs: [
        { title: 'Dashboard Admin', href: admin.dashboard() },
        { title: 'Katalog Kue', href: admin.cakes.index() },
        { title: 'Form Kue', href: admin.cakes.index() },
    ],
};
