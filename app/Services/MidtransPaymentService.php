<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransPaymentService
{
    public function isConfigured(): bool
    {
        return filled(config('services.midtrans.server_key')) && filled(config('services.midtrans.client_key'));
    }

    public function snapScriptUrl(): string
    {
        return (bool) config('services.midtrans.is_production', false)
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
    }

    public function snapApiUrl(): string
    {
        return (bool) config('services.midtrans.is_production', false)
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    public function createSnapTransaction(Order $order, Payment $payment): ?string
    {
        $serverKey = (string) config('services.midtrans.server_key', '');

        if ($serverKey === '') {
            return null;
        }

        $order->loadMissing(['user', 'cake']);

        $payload = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => $order->total_price,
            ],
            'item_details' => [
                [
                    'id' => 'CAKE-'.$order->cake_id,
                    'price' => $order->total_price - $order->payment_fee,
                    'quantity' => 1,
                    'name' => mb_substr($order->cake->name, 0, 50),
                ],
                ...($order->payment_fee > 0 ? [[
                    'id' => 'PAYMENT-FEE',
                    'price' => $order->payment_fee,
                    'quantity' => 1,
                    'name' => 'Biaya Layanan Midtrans',
                ]] : []),
            ],
            'customer_details' => [
                'first_name' => $order->user->name,
                'email' => $order->user->email,
                'phone' => $order->user->phone ?? '',
            ],
        ];

        try {
            $response = Http::withBasicAuth($serverKey, '')
                ->acceptJson()
                ->timeout(15)
                ->post($this->snapApiUrl(), $payload);

            if (! $response->successful()) {
                Log::warning('Midtrans Snap creation failed', [
                    'order_number' => $order->order_number,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            $token = $response->json('token');

            if (is_string($token) && $token !== '') {
                $payment->update([
                    'snap_token' => $token,
                    'raw_response' => $response->json(),
                ]);

                return $token;
            }
        } catch (\Throwable $exception) {
            Log::error('Midtrans Snap exception', [
                'order_number' => $order->order_number,
                'message' => $exception->getMessage(),
            ]);
        }

        return null;
    }

    public function verifySignature(
        string $orderId,
        string $statusCode,
        string $grossAmount,
        string $signatureKey,
    ): bool {
        $serverKey = (string) config('services.midtrans.server_key', '');

        if ($serverKey === '' || $signatureKey === '') {
            return false;
        }

        $expected = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

        return hash_equals($expected, $signatureKey);
    }
}
