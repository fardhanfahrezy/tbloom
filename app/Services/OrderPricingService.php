<?php

namespace App\Services;

use App\Enums\PaymentMethod;
use App\Models\Cake;
use App\Models\StoreSetting;

class OrderPricingService
{
    /**
     * @return array{type: string, value: float}
     */
    public function feeConfig(): array
    {
        $type = StoreSetting::getValue('midtrans_fee_type', 'fixed') === 'percent'
            ? 'percent'
            : 'fixed';
        $value = max(0.0, (float) StoreSetting::getValue('midtrans_fee_value', '4000'));

        return [
            'type' => $type,
            'value' => $value,
        ];
    }

    /**
     * @return array{
     *     base_price: int,
     *     size_price: int,
     *     flavor_price: int,
     *     filling_price: int,
     *     subtotal: int,
     *     payment_fee: int,
     *     total_price: int
     * }
     */
    public function calculate(
        Cake $cake,
        ?int $sizeId,
        ?int $flavorId,
        ?int $fillingId,
        PaymentMethod $paymentMethod,
    ): array {
        $sizePrice = $this->resolveOptionPrice($cake->sizes()->where('sizes.id', $sizeId)->first()?->pivot?->getAttribute('additional_price'));
        $flavorPrice = $this->resolveOptionPrice($cake->flavors()->where('flavors.id', $flavorId)->first()?->pivot?->getAttribute('additional_price'));
        $fillingPrice = $this->resolveOptionPrice($cake->fillings()->where('fillings.id', $fillingId)->first()?->pivot?->getAttribute('additional_price'));

        $basePrice = $cake->base_price;
        $subtotal = $basePrice + $sizePrice + $flavorPrice + $fillingPrice;
        $paymentFee = $paymentMethod === PaymentMethod::Midtrans
            ? $this->calculateMidtransFee($subtotal)
            : 0;

        return [
            'base_price' => $basePrice,
            'size_price' => $sizePrice,
            'flavor_price' => $flavorPrice,
            'filling_price' => $fillingPrice,
            'subtotal' => $subtotal,
            'payment_fee' => $paymentFee,
            'total_price' => $subtotal + $paymentFee,
        ];
    }

    public function calculateMidtransFee(int $subtotal): int
    {
        $config = $this->feeConfig();

        if ($config['type'] === 'percent') {
            return (int) ceil($subtotal * ($config['value'] / 100));
        }

        return (int) round($config['value']);
    }

    private function resolveOptionPrice(mixed $pivotPrice): int
    {
        if ($pivotPrice === null) {
            return 0;
        }

        return max(0, (int) $pivotPrice);
    }
}
