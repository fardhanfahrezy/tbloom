import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Check,
    CheckCircle2,
    Lock,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CakeImage } from '@/components/cake-image-placeholder';
import InputError from '@/components/input-error';
import { PublicFooter, PublicHeader } from '@/components/public-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, formatRupiah } from '@/lib/utils';
import cakesRoutes from '@/routes/cakes';
import orders from '@/routes/orders';

type OptionItem = {
    id: number;
    name: string;
    additional_price: number;
};

type TimeSlotItem = {
    id: number;
    label: string;
};

type Props = {
    cake: {
        id: number;
        name: string;
        slug: string;
        image_url: string | null;
        base_price: number;
        allow_image_upload: boolean;
        production_days: number;
        minimum_order_days: number;
        sizes: OptionItem[];
        flavors: OptionItem[];
        fillings: OptionItem[];
    };
    initialSelection: {
        size_id: number | null;
        flavor_id: number | null;
        filling_id: number | null;
    };
    timeSlots: TimeSlotItem[];
    earliestDate: string;
    feeConfig: {
        type: string;
        value: number;
    };
    customer: {
        name: string;
        phone: string | null;
    };
};

type PreviewResponse = {
    pricing: {
        base_price: number;
        size_price: number;
        flavor_price: number;
        filling_price: number;
        subtotal: number;
        payment_fee: number;
        total_price: number;
    };
    date: {
        valid: boolean;
        available: boolean;
        remaining_capacity: number;
        message: string | null;
    };
    earliest_date: string;
};

function readXsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

const steps = [
    { id: 1, label: 'Detail Pesanan' },
    { id: 2, label: 'Pengambilan / Pengiriman' },
    { id: 3, label: 'Pembayaran & Konfirmasi' },
] as const;

export default function OrderCreate({
    cake,
    initialSelection,
    timeSlots,
    earliestDate,
    feeConfig,
    customer,
}: Props) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [stepError, setStepError] = useState<string | null>(null);

    const form = useForm<{
        cake_id: number;
        size_id: number | null;
        flavor_id: number | null;
        filling_id: number | null;
        required_date: string;
        recipient_name: string;
        recipient_age: string;
        cake_message: string;
        special_notes: string;
        uploaded_image: File | null;
        fulfillment_method: 'pickup' | 'delivery';
        delivery_address: string;
        delivery_time: string;
        payment_method: 'cash' | 'midtrans';
    }>({
        cake_id: cake.id,
        size_id: initialSelection.size_id,
        flavor_id: initialSelection.flavor_id,
        filling_id: initialSelection.filling_id,
        required_date: earliestDate,
        recipient_name: '',
        recipient_age: '',
        cake_message: '',
        special_notes: '',
        uploaded_image: null,
        fulfillment_method: 'pickup',
        delivery_address: '',
        delivery_time: timeSlots[0]?.label ?? '',
        payment_method: 'cash',
    });

    const [preview, setPreview] = useState<PreviewResponse | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        setLoadingPreview(true);

        fetch(orders.preview().url, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-XSRF-TOKEN': readXsrfToken(),
            },
            body: JSON.stringify({
                cake_id: cake.id,
                required_date: form.data.required_date,
                size_id: form.data.size_id,
                flavor_id: form.data.flavor_id,
                filling_id: form.data.filling_id,
                fulfillment_method: form.data.fulfillment_method,
                payment_method: form.data.payment_method,
            }),
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data: PreviewResponse | null) => {
                if (data) {
                    setPreview(data);
                }
            })
            .catch(() => {
                // Aborted on unmount or next state change.
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoadingPreview(false);
                }
            });

        return () => controller.abort();
    }, [
        cake.id,
        form.data.required_date,
        form.data.size_id,
        form.data.flavor_id,
        form.data.filling_id,
        form.data.fulfillment_method,
        form.data.payment_method,
    ]);

    const selectedSize = cake.sizes.find((s) => s.id === form.data.size_id);
    const selectedFlavor = cake.flavors.find(
        (f) => f.id === form.data.flavor_id,
    );
    const selectedFilling = cake.fillings.find(
        (fl) => fl.id === form.data.filling_id,
    );

    const fallbackSubtotal =
        cake.base_price +
        (selectedSize?.additional_price ?? 0) +
        (selectedFlavor?.additional_price ?? 0) +
        (selectedFilling?.additional_price ?? 0);

    const pricing = preview?.pricing ?? {
        base_price: cake.base_price,
        size_price: selectedSize?.additional_price ?? 0,
        flavor_price: selectedFlavor?.additional_price ?? 0,
        filling_price: selectedFilling?.additional_price ?? 0,
        subtotal: fallbackSubtotal,
        payment_fee: 0,
        total_price: fallbackSubtotal,
    };

    const handleNextFromStep1 = () => {
        setStepError(null);

        if (!form.data.required_date) {
            setStepError('Pilih tanggal kue dibutuhkan terlebih dahulu.');

            return;
        }

        if (preview && !preview.date.available) {
            setStepError(
                preview.date.message ??
                    'Tanggal yang dipilih belum memenuhi syarat atau kapasitas penuh.',
            );

            return;
        }

        if (!form.data.recipient_name.trim()) {
            setStepError('Nama penerima wajib diisi.');

            return;
        }

        if (!form.data.recipient_age || Number(form.data.recipient_age) < 1) {
            setStepError('Umur penerima wajib diisi dengan benar.');

            return;
        }

        if (!form.data.cake_message.trim()) {
            setStepError('Tulisan di atas kue wajib diisi.');

            return;
        }

        setStep(2);
    };

    const handleNextFromStep2 = () => {
        setStepError(null);

        if (
            form.data.fulfillment_method === 'delivery' &&
            !form.data.delivery_address.trim()
        ) {
            setStepError(
                'Alamat pengiriman wajib diisi untuk metode Delivery.',
            );

            return;
        }

        if (!form.data.delivery_time) {
            setStepError('Pilih slot jam penerimaan terlebih dahulu.');

            return;
        }

        setStep(3);
    };

    const handleFulfillmentChange = (method: 'pickup' | 'delivery') => {
        form.setData((prev) => ({
            ...prev,
            fulfillment_method: method,
            payment_method:
                method === 'delivery' && prev.payment_method === 'cash'
                    ? 'midtrans'
                    : prev.payment_method,
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setStepError(null);

        form.post(orders.store().url, {
            forceFormData: true,
            onError: () => {
                setStepError(
                    'Periksa kembali detail pesanan Anda sebelum mengirim.',
                );
            },
        });
    };

    return (
        <>
            <Head title={`Pesan ${cake.name} — TBloom Cake`} />

            <div className="min-h-screen bg-background text-foreground">
                <PublicHeader />

                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href={cakesRoutes.show({ cake: cake.slug })}>
                                <ArrowLeft className="mr-1.5 size-4" />
                                Kembali ke Detail Kue
                            </Link>
                        </Button>

                        <span className="text-xs font-medium text-muted-foreground">
                            Pemesan: <strong>{customer.name}</strong> (
                            {customer.phone ?? 'WhatsApp Terverifikasi'})
                        </span>
                    </div>

                    <nav
                        aria-label="Tahapan pemesanan"
                        className="mb-8 grid gap-3 sm:grid-cols-3"
                    >
                        {steps.map((item) => {
                            const active = step === item.id;
                            const done = step > item.id;

                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl border p-4 transition-colors',
                                        active
                                            ? 'border-primary bg-card shadow-sm'
                                            : done
                                              ? 'border-border bg-secondary/70'
                                              : 'border-border/70 bg-card/60 opacity-75',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                                            active || done
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted text-muted-foreground',
                                        )}
                                    >
                                        {done ? (
                                            <Check className="size-4" />
                                        ) : (
                                            item.id
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">
                                            Tahap {item.id}
                                        </p>
                                        <p className="truncate text-sm font-semibold">
                                            {item.label}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </nav>

                    <div className="grid gap-8 lg:grid-cols-3">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8 lg:col-span-2"
                        >
                            {stepError && (
                                <div
                                    role="alert"
                                    className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                                >
                                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                                    <span>{stepError}</span>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h1 className="text-xl font-bold">
                                            Tahap 1: Detail Pesanan
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                            Tentukan tanggal dibutuhkan (min. H-
                                            {cake.minimum_order_days} WIB) dan
                                            personalisasi kue Anda.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="required_date">
                                            Tanggal Kue Dibutuhkan
                                        </Label>
                                        <Input
                                            id="required_date"
                                            type="date"
                                            min={earliestDate}
                                            value={form.data.required_date}
                                            onChange={(e) =>
                                                form.setData(
                                                    'required_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={form.errors.required_date}
                                        />
                                        {preview?.date.message && (
                                            <p
                                                className={cn(
                                                    'flex items-center gap-1.5 text-xs font-medium',
                                                    preview.date.available
                                                        ? 'text-primary'
                                                        : 'text-destructive',
                                                )}
                                            >
                                                {preview.date.available ? (
                                                    <CheckCircle2 className="size-3.5" />
                                                ) : (
                                                    <AlertCircle className="size-3.5" />
                                                )}
                                                <span>
                                                    {loadingPreview
                                                        ? 'Memeriksa ketersediaan...'
                                                        : preview.date.message}
                                                </span>
                                            </p>
                                        )}
                                    </div>

                                    {cake.sizes.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Ukuran Kue</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {cake.sizes.map((size) => (
                                                    <Button
                                                        key={size.id}
                                                        type="button"
                                                        size="sm"
                                                        variant={
                                                            form.data
                                                                .size_id ===
                                                            size.id
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        onClick={() =>
                                                            form.setData(
                                                                'size_id',
                                                                size.id,
                                                            )
                                                        }
                                                    >
                                                        {size.name}
                                                        {size.additional_price >
                                                            0 &&
                                                            ` (+${formatRupiah(size.additional_price)})`}
                                                    </Button>
                                                ))}
                                            </div>
                                            <InputError
                                                message={form.errors.size_id}
                                            />
                                        </div>
                                    )}

                                    {cake.flavors.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Rasa Kue (Flavor)</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {cake.flavors.map((flavor) => (
                                                    <Button
                                                        key={flavor.id}
                                                        type="button"
                                                        size="sm"
                                                        variant={
                                                            form.data
                                                                .flavor_id ===
                                                            flavor.id
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        onClick={() =>
                                                            form.setData(
                                                                'flavor_id',
                                                                flavor.id,
                                                            )
                                                        }
                                                    >
                                                        {flavor.name}
                                                        {flavor.additional_price >
                                                            0 &&
                                                            ` (+${formatRupiah(flavor.additional_price)})`}
                                                    </Button>
                                                ))}
                                            </div>
                                            <InputError
                                                message={form.errors.flavor_id}
                                            />
                                        </div>
                                    )}

                                    {cake.fillings.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Isian (Filling)</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {cake.fillings.map(
                                                    (filling) => (
                                                        <Button
                                                            key={filling.id}
                                                            type="button"
                                                            size="sm"
                                                            variant={
                                                                form.data
                                                                    .filling_id ===
                                                                filling.id
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                            onClick={() =>
                                                                form.setData(
                                                                    'filling_id',
                                                                    filling.id,
                                                                )
                                                            }
                                                        >
                                                            {filling.name}
                                                            {filling.additional_price >
                                                                0 &&
                                                                ` (+${formatRupiah(filling.additional_price)})`}
                                                        </Button>
                                                    ),
                                                )}
                                            </div>
                                            <InputError
                                                message={form.errors.filling_id}
                                            />
                                        </div>
                                    )}

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="recipient_name">
                                                Nama Penerima
                                            </Label>
                                            <Input
                                                id="recipient_name"
                                                value={form.data.recipient_name}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'recipient_name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: Nadira Putri"
                                            />
                                            <InputError
                                                message={
                                                    form.errors.recipient_name
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="recipient_age">
                                                Umur Penerima (Tahun)
                                            </Label>
                                            <Input
                                                id="recipient_age"
                                                type="number"
                                                min={1}
                                                max={150}
                                                value={form.data.recipient_age}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'recipient_age',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Contoh: 23"
                                            />
                                            <InputError
                                                message={
                                                    form.errors.recipient_age
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cake_message">
                                            Tulisan di Atas Kue
                                        </Label>
                                        <Input
                                            id="cake_message"
                                            value={form.data.cake_message}
                                            onChange={(e) =>
                                                form.setData(
                                                    'cake_message',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Contoh: Happy 23rd Birthday Nadira!"
                                        />
                                        <InputError
                                            message={form.errors.cake_message}
                                        />
                                    </div>

                                    {cake.allow_image_upload && (
                                        <div className="space-y-2">
                                            <Label htmlFor="uploaded_image">
                                                Upload Foto Referensi (Opsional)
                                            </Label>
                                            <Input
                                                id="uploaded_image"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) =>
                                                    form.setData(
                                                        'uploaded_image',
                                                        e.target.files?.[0] ??
                                                            null,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors.uploaded_image
                                                }
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="special_notes">
                                            Catatan Khusus (Opsional)
                                        </Label>
                                        <textarea
                                            id="special_notes"
                                            rows={3}
                                            value={form.data.special_notes}
                                            onChange={(e) =>
                                                form.setData(
                                                    'special_notes',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Tuliskan permintaan warna pita/tulisan, lilin, atau catatan lain (persetujuan di tangan penjual)."
                                            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                                        />
                                        <InputError
                                            message={form.errors.special_notes}
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button
                                            type="button"
                                            size="lg"
                                            onClick={handleNextFromStep1}
                                        >
                                            Selanjutnya
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h1 className="text-xl font-bold">
                                            Tahap 2: Pengambilan / Pengiriman
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                            Pilih cara penerimaan kue dan slot
                                            jam pada tanggal{' '}
                                            <strong>
                                                {form.data.required_date}
                                            </strong>
                                            .
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleFulfillmentChange(
                                                    'pickup',
                                                )
                                            }
                                            className={cn(
                                                'rounded-xl border p-4 text-left transition-colors',
                                                form.data.fulfillment_method ===
                                                    'pickup'
                                                    ? 'border-primary bg-secondary'
                                                    : 'border-border hover:bg-muted/50',
                                            )}
                                        >
                                            <p className="font-semibold">
                                                Pickup (Ambil di Toko)
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Ambil langsung sesuai slot jam.
                                                Mendukung Cash maupun Midtrans.
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleFulfillmentChange(
                                                    'delivery',
                                                )
                                            }
                                            className={cn(
                                                'rounded-xl border p-4 text-left transition-colors',
                                                form.data.fulfillment_method ===
                                                    'delivery'
                                                    ? 'border-primary bg-secondary'
                                                    : 'border-border hover:bg-muted/50',
                                            )}
                                        >
                                            <p className="font-semibold">
                                                Delivery (Pengiriman)
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Dikirim ke alamat tujuan. Hanya
                                                mendukung pembayaran Midtrans.
                                            </p>
                                        </button>
                                    </div>

                                    {form.data.fulfillment_method ===
                                        'delivery' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="delivery_address">
                                                Alamat Pengiriman Lengkap
                                            </Label>
                                            <textarea
                                                id="delivery_address"
                                                rows={3}
                                                value={
                                                    form.data.delivery_address
                                                }
                                                onChange={(e) =>
                                                    form.setData(
                                                        'delivery_address',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Jalan, nomor rumah, patokan, kecamatan..."
                                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                                            />
                                            <InputError
                                                message={
                                                    form.errors.delivery_address
                                                }
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Slot Jam Penerimaan</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {timeSlots.map((slot) => (
                                                <Button
                                                    key={slot.id}
                                                    type="button"
                                                    size="sm"
                                                    variant={
                                                        form.data
                                                            .delivery_time ===
                                                        slot.label
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    onClick={() =>
                                                        form.setData(
                                                            'delivery_time',
                                                            slot.label,
                                                        )
                                                    }
                                                >
                                                    {slot.label}
                                                </Button>
                                            ))}
                                        </div>
                                        <InputError
                                            message={form.errors.delivery_time}
                                        />
                                    </div>

                                    <div className="flex justify-between pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="lg"
                                            onClick={() => {
                                                setStepError(null);
                                                setStep(1);
                                            }}
                                        >
                                            Kembali
                                        </Button>
                                        <Button
                                            type="button"
                                            size="lg"
                                            onClick={handleNextFromStep2}
                                        >
                                            Selanjutnya
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h1 className="text-xl font-bold">
                                            Tahap 3: Pembayaran &amp; Konfirmasi
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                            Pilih metode pembayaran dan periksa
                                            kembali seluruh detail pesanan Anda.
                                        </p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            disabled={
                                                form.data.fulfillment_method ===
                                                'delivery'
                                            }
                                            onClick={() =>
                                                form.setData(
                                                    'payment_method',
                                                    'cash',
                                                )
                                            }
                                            className={cn(
                                                'rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                                                form.data.payment_method ===
                                                    'cash'
                                                    ? 'border-primary bg-secondary'
                                                    : 'border-border hover:bg-muted/50',
                                            )}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-semibold">
                                                    Cash (Tunai di Toko)
                                                </p>
                                                {form.data
                                                    .fulfillment_method ===
                                                    'delivery' && (
                                                    <Lock className="size-4 text-muted-foreground" />
                                                )}
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {form.data
                                                    .fulfillment_method ===
                                                'delivery'
                                                    ? 'Tidak tersedia untuk metode Delivery (No COD).'
                                                    : 'Bayar langsung di toko saat Pickup tanpa biaya layanan.'}
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                form.setData(
                                                    'payment_method',
                                                    'midtrans',
                                                )
                                            }
                                            className={cn(
                                                'rounded-xl border p-4 text-left transition-colors',
                                                form.data.payment_method ===
                                                    'midtrans'
                                                    ? 'border-primary bg-secondary'
                                                    : 'border-border hover:bg-muted/50',
                                            )}
                                        >
                                            <p className="font-semibold">
                                                Payment Gateway (Midtrans)
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                QRIS, Virtual Account, atau
                                                e-Wallet. Biaya layanan
                                                {feeConfig.type === 'percent'
                                                    ? ` ${feeConfig.value}%`
                                                    : ` ${formatRupiah(feeConfig.value)}`}{' '}
                                                ditanggung Customer.
                                            </p>
                                        </button>
                                    </div>
                                    <InputError
                                        message={form.errors.payment_method}
                                    />

                                    <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4 text-sm">
                                        <h2 className="font-semibold">
                                            Ringkasan Detail Pesanan
                                        </h2>
                                        <dl className="grid gap-2 sm:grid-cols-2">
                                            <div>
                                                <dt className="text-xs text-muted-foreground">
                                                    Penerima
                                                </dt>
                                                <dd className="font-medium">
                                                    {form.data.recipient_name} (
                                                    {form.data.recipient_age}{' '}
                                                    tahun)
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-muted-foreground">
                                                    Tulisan di Kue
                                                </dt>
                                                <dd className="font-medium">
                                                    &ldquo;
                                                    {form.data.cake_message}
                                                    &rdquo;
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-muted-foreground">
                                                    Tanggal &amp; Jam
                                                </dt>
                                                <dd className="font-medium">
                                                    {form.data.required_date} •{' '}
                                                    {form.data.delivery_time}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-muted-foreground">
                                                    Metode Penerimaan
                                                </dt>
                                                <dd className="font-medium">
                                                    {form.data
                                                        .fulfillment_method ===
                                                    'delivery'
                                                        ? `Delivery (${form.data.delivery_address})`
                                                        : 'Pickup di Toko'}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div className="flex justify-between pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="lg"
                                            onClick={() => {
                                                setStepError(null);
                                                setStep(2);
                                            }}
                                        >
                                            Kembali
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={form.processing}
                                        >
                                            {form.processing
                                                ? 'Memproses Pesanan...'
                                                : 'Konfirmasi Pesanan'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>

                        <aside className="h-fit space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-6">
                            <div className="flex items-center gap-4">
                                <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-border">
                                    <CakeImage
                                        name={cake.name}
                                        imageUrl={cake.image_url}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="truncate font-semibold">
                                        {cake.name}
                                    </h2>
                                    <Badge variant="secondary" className="mt-1">
                                        Min. H-{cake.minimum_order_days}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-border pt-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Harga Dasar
                                    </span>
                                    <span className="font-medium tabular-nums">
                                        {formatRupiah(pricing.base_price)}
                                    </span>
                                </div>
                                {selectedSize && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Ukuran ({selectedSize.name})
                                        </span>
                                        <span className="font-medium tabular-nums">
                                            {formatRupiah(pricing.size_price)}
                                        </span>
                                    </div>
                                )}
                                {selectedFlavor && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Rasa ({selectedFlavor.name})
                                        </span>
                                        <span className="font-medium tabular-nums">
                                            {formatRupiah(pricing.flavor_price)}
                                        </span>
                                    </div>
                                )}
                                {selectedFilling && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Isian ({selectedFilling.name})
                                        </span>
                                        <span className="font-medium tabular-nums">
                                            {formatRupiah(
                                                pricing.filling_price,
                                            )}
                                        </span>
                                    </div>
                                )}
                                {form.data.payment_method === 'midtrans' && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                            Biaya Layanan Midtrans
                                        </span>
                                        <span className="font-medium tabular-nums">
                                            {formatRupiah(pricing.payment_fee)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-baseline justify-between border-t border-border pt-4">
                                <span className="font-semibold">
                                    Total Pembayaran
                                </span>
                                <span className="text-xl font-bold text-primary tabular-nums">
                                    {formatRupiah(pricing.total_price)}
                                </span>
                            </div>
                        </aside>
                    </div>
                </main>

                <PublicFooter whatsappUrl="https://wa.me/" />
            </div>
        </>
    );
}
