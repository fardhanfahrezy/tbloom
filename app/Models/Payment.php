<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $order_id
 * @property string $provider
 * @property string|null $midtrans_transaction_id
 * @property string|null $snap_token
 * @property string|null $payment_type
 * @property int $gross_amount
 * @property int $fee_amount
 * @property string|null $proof_image
 * @property string $status
 * @property array<string, mixed>|null $raw_response
 * @property CarbonImmutable|null $paid_at
 */
#[Fillable([
    'order_id',
    'provider',
    'midtrans_transaction_id',
    'snap_token',
    'payment_type',
    'gross_amount',
    'fee_amount',
    'proof_image',
    'status',
    'raw_response',
    'paid_at',
])]
class Payment extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'gross_amount' => 'integer',
            'fee_amount' => 'integer',
            'raw_response' => 'array',
            'paid_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
