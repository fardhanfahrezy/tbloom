import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useEffect, useState } from 'react';
import WhatsAppVerificationController from '@/actions/App/Http/Controllers/Auth/WhatsAppVerificationController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';

type Props = {
    phone: string | null;
    status?: string;
};

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyWhatsApp({ phone, status }: Props) {
    const [code, setCode] = useState<string>('');
    const [cooldown, setCooldown] = useState<number>(0);
    const [editingPhone, setEditingPhone] = useState<boolean>(false);

    useEffect(() => {
        if (cooldown <= 0) {
            return;
        }

        const timer = window.setTimeout(() => {
            setCooldown((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [cooldown]);

    return (
        <>
            <Head title="Verifikasi WhatsApp" />

            <div className="space-y-6">
                <div className="rounded-xl border border-border bg-muted/60 px-4 py-3 text-center text-sm">
                    <span className="text-muted-foreground">
                        Kode OTP dikirim ke nomor WhatsApp:{' '}
                    </span>
                    <span className="font-semibold text-foreground">
                        {phone ?? '-'}
                    </span>
                </div>

                {status === 'otp-sent' && (
                    <div className="text-center text-sm font-medium text-green-700 dark:text-green-400">
                        Kode OTP baru telah dikirim ke WhatsApp Anda.
                    </div>
                )}

                <Form
                    {...WhatsAppVerificationController.confirm.form()}
                    resetOnError
                    className="space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex flex-col items-center space-y-3">
                                <InputOTP
                                    name="code"
                                    maxLength={OTP_LENGTH}
                                    value={code}
                                    onChange={setCode}
                                    disabled={processing}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    autoFocus
                                >
                                    <InputOTPGroup>
                                        {Array.from(
                                            { length: OTP_LENGTH },
                                            (_, index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                />
                                            ),
                                        )}
                                    </InputOTPGroup>
                                </InputOTP>
                                <InputError message={errors.code} />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    processing || code.length < OTP_LENGTH
                                }
                                data-test="verify-whatsapp-button"
                            >
                                {processing && <Spinner />}
                                Verifikasi Nomor WhatsApp
                            </Button>
                        </>
                    )}
                </Form>

                <div className="flex flex-col items-center gap-3 border-t border-border pt-4 text-sm">
                    <Form
                        {...WhatsAppVerificationController.send.form()}
                        onSuccess={() => setCooldown(RESEND_COOLDOWN_SECONDS)}
                    >
                        {({ processing }) => (
                            <Button
                                type="submit"
                                variant="secondary"
                                size="sm"
                                disabled={processing || cooldown > 0}
                                data-test="resend-otp-button"
                            >
                                {processing && <Spinner />}
                                {cooldown > 0
                                    ? `Kirim ulang OTP (${cooldown}d)`
                                    : 'Kirim ulang kode OTP'}
                            </Button>
                        )}
                    </Form>

                    <button
                        type="button"
                        onClick={() => setEditingPhone((prev) => !prev)}
                        className="cursor-pointer text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                    >
                        {editingPhone
                            ? 'Tutup ubah nomor'
                            : 'Salah ketik? Ubah nomor WhatsApp'}
                    </button>

                    {editingPhone && (
                        <Form
                            {...WhatsAppVerificationController.updatePhone.form()}
                            onSuccess={() => {
                                setEditingPhone(false);
                                setCooldown(RESEND_COOLDOWN_SECONDS);
                            }}
                            className="w-full space-y-3 rounded-xl border border-border bg-card p-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="update_phone">
                                            Nomor WhatsApp Baru
                                        </Label>
                                        <Input
                                            id="update_phone"
                                            name="phone"
                                            type="tel"
                                            required
                                            placeholder="0812xxxxxxxx"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="w-full"
                                        disabled={processing}
                                    >
                                        {processing && <Spinner />}
                                        Simpan & Kirim OTP Baru
                                    </Button>
                                </>
                            )}
                        </Form>
                    )}

                    <TextLink href={logout()} className="text-sm">
                        Keluar
                    </TextLink>
                </div>
            </div>
        </>
    );
}

VerifyWhatsApp.layout = {
    title: 'Verifikasi Nomor WhatsApp',
    description: 'Masukkan 6 digit kode OTP yang dikirim ke WhatsApp Anda',
};
