<?php

namespace App\Models;

use App\Enums\FulfillmentMethod;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $order_number
 * @property int $user_id
 * @property int $cake_id
 * @property int|null $size_id
 * @property int|null $flavor_id
 * @property int|null $filling_id
 * @property CarbonImmutable $order_date
 * @property CarbonImmutable $required_date
 * @property string $recipient_name
 * @property int $recipient_age
 * @property string $cake_message
 * @property string|null $special_notes
 * @property string|null $uploaded_image
 * @property FulfillmentMethod $fulfillment_method
 * @property string|null $delivery_address
 * @property CarbonImmutable $delivery_date
 * @property string $delivery_time
 * @property PaymentMethod $payment_method
 * @property int $base_price_snapshot
 * @property int $size_price_snapshot
 * @property int $flavor_price_snapshot
 * @property int $filling_price_snapshot
 * @property int $payment_fee
 * @property int $total_price
 * @property PaymentStatus $payment_status
 * @property OrderStatus $order_status
 * @property CarbonImmutable|null $capacity_released_at
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read string|null $uploaded_image_url
 */
#[Fillable([
    'order_number',
    'user_id',
    'cake_id',
    'size_id',
    'flavor_id',
    'filling_id',
    'order_date',
    'required_date',
    'recipient_name',
    'recipient_age',
    'cake_message',
    'special_notes',
    'uploaded_image',
    'fulfillment_method',
    'delivery_address',
    'delivery_date',
    'delivery_time',
    'payment_method',
    'base_price_snapshot',
    'size_price_snapshot',
    'flavor_price_snapshot',
    'filling_price_snapshot',
    'payment_fee',
    'total_price',
    'payment_status',
    'order_status',
])]
class Order extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'order_date' => 'date',
            'required_date' => 'date',
            'delivery_date' => 'date',
            'recipient_age' => 'integer',
            'fulfillment_method' => FulfillmentMethod::class,
            'payment_method' => PaymentMethod::class,
            'payment_status' => PaymentStatus::class,
            'order_status' => OrderStatus::class,
            'base_price_snapshot' => 'integer',
            'size_price_snapshot' => 'integer',
            'flavor_price_snapshot' => 'integer',
            'filling_price_snapshot' => 'integer',
            'payment_fee' => 'integer',
            'total_price' => 'integer',
            'capacity_released_at' => 'datetime',
        ];
    }

    /**
     * @return Attribute<string|null, never>
     */
    protected function uploadedImageUrl(): Attribute
    {
        return Attribute::get(function (): ?string {
            if (! $this->uploaded_image) {
                return null;
            }

            return Storage::disk('public')->url($this->uploaded_image);
        });
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Cake, $this>
     */
    public function cake(): BelongsTo
    {
        return $this->belongsTo(Cake::class);
    }

    /**
     * @return BelongsTo<Size, $this>
     */
    public function size(): BelongsTo
    {
        return $this->belongsTo(Size::class);
    }

    /**
     * @return BelongsTo<Flavor, $this>
     */
    public function flavor(): BelongsTo
    {
        return $this->belongsTo(Flavor::class);
    }

    /**
     * @return BelongsTo<Filling, $this>
     */
    public function filling(): BelongsTo
    {
        return $this->belongsTo(Filling::class);
    }

    /**
     * @return HasOne<Payment, $this>
     */
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    /**
     * @return HasMany<Payment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * @return HasMany<OrderStatusHistory, $this>
     */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderByDesc('id');
    }
}
