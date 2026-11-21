<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case AwaitingPayment = 'awaiting_payment';
    case PaymentConfirmed = 'payment_confirmed';
    case Accepted = 'accepted';
    case Processing = 'processing';
    case CompletedProduction = 'completed_production';
    case ReadyOrShipping = 'ready_or_shipping';
    case Completed = 'completed';
    case Rejected = 'rejected';

    public function label(?string $fulfillmentMethod = null): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::AwaitingPayment => 'Menunggu pembayaran',
            self::PaymentConfirmed => 'Pembayaran dikonfirmasi',
            self::Accepted => 'Pesanan diterima',
            self::Processing => 'Sedang diproses',
            self::CompletedProduction => 'Selesai dibuat',
            self::ReadyOrShipping => $fulfillmentMethod === FulfillmentMethod::Delivery->value
                ? 'Dalam pengiriman'
                : 'Siap diambil',
            self::Completed => 'Selesai',
            self::Rejected => 'Ditolak / Gagal',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(?string $fulfillmentMethod = null): array
    {
        return array_map(
            fn (self $status): array => [
                'value' => $status->value,
                'label' => $status->label($fulfillmentMethod),
            ],
            self::cases(),
        );
    }
}
