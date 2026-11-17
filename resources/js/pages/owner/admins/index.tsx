import { Head, router, useForm } from '@inertiajs/react';
import { FlashBanner } from '@/components/flash-banner';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import owner from '@/routes/owner';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
    created_at: string;
};

type Props = {
    admins: AdminUser[];
};

export default function OwnerAdminsIndex({ admins }: Props) {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(owner.admins.store().url, {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const toggleActive = (adminUser: AdminUser) => {
        router.patch(
            owner.admins.toggleActive({ user: adminUser.id }).url,
            {},
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Kelola Admin — Owner TBloom Cake" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Kelola Akun Admin
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Buat dan atur status aktif akun Admin operasional TBloom
                        Cake.
                    </p>
                </div>

                <FlashBanner />

                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                    <h2 className="text-lg font-semibold">Tambah Admin Baru</h2>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="admin_name">Nama Lengkap</Label>
                            <Input
                                id="admin_name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                placeholder="Nama Admin"
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="admin_email">Email</Label>
                            <Input
                                id="admin_email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                                placeholder="admin@tbloomcake.com"
                            />
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="admin_phone">Nomor WhatsApp</Label>
                            <Input
                                id="admin_phone"
                                type="tel"
                                value={form.data.phone}
                                onChange={(e) =>
                                    form.setData('phone', e.target.value)
                                }
                                placeholder="081234567890"
                            />
                            <InputError message={form.errors.phone} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="admin_password">Kata Sandi</Label>
                            <Input
                                id="admin_password"
                                type="password"
                                value={form.data.password}
                                onChange={(e) =>
                                    form.setData('password', e.target.value)
                                }
                            />
                            <InputError message={form.errors.password} />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="admin_password_confirmation">
                                Konfirmasi Kata Sandi
                            </Label>
                            <Input
                                id="admin_password_confirmation"
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(e) =>
                                    form.setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                        <Button type="submit" disabled={form.processing}>
                            Buat Akun Admin
                        </Button>
                    </div>
                </form>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-semibold">Daftar Akun Admin</h2>
                    <div className="mt-4 divide-y divide-border rounded-lg border border-border">
                        {admins.length === 0 ? (
                            <p className="p-4 text-sm text-muted-foreground">
                                Belum ada akun Admin yang terdaftar.
                            </p>
                        ) : (
                            admins.map((adminUser) => (
                                <div
                                    key={adminUser.id}
                                    className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 text-sm"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">
                                                {adminUser.name}
                                            </span>
                                            <Badge
                                                variant={
                                                    adminUser.is_active
                                                        ? 'secondary'
                                                        : 'destructive'
                                                }
                                            >
                                                {adminUser.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </Badge>
                                        </div>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {adminUser.email}
                                            {adminUser.phone
                                                ? ` • ${adminUser.phone}`
                                                : ''}
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => toggleActive(adminUser)}
                                    >
                                        {adminUser.is_active
                                            ? 'Nonaktifkan'
                                            : 'Aktifkan'}
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

OwnerAdminsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard Owner', href: owner.dashboard() },
        { title: 'Kelola Admin', href: owner.admins.index() },
    ],
};
