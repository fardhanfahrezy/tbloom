<?php

namespace App\Http\Requests;

use App\Enums\FulfillmentMethod;
use App\Enums\PaymentMethod;
use App\Models\Cake;
use App\Models\PickupDeliveryTimeSlot;
use App\Services\CapacityService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isCustomer() ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'cake_id' => ['required', 'integer', 'exists:cakes,id'],
            'size_id' => ['nullable', 'integer', 'exists:sizes,id'],
            'flavor_id' => ['nullable', 'integer', 'exists:flavors,id'],
            'filling_id' => ['nullable', 'integer', 'exists:fillings,id'],
            'required_date' => ['required', 'date_format:Y-m-d'],
            'recipient_name' => ['required', 'string', 'max:120'],
            'recipient_age' => ['required', 'integer', 'min:1', 'max:150'],
            'cake_message' => ['required', 'string', 'max:150'],
            'special_notes' => ['nullable', 'string', 'max:1000'],
            'uploaded_image' => ['nullable', 'image', 'max:2048'],
            'fulfillment_method' => ['required', Rule::enum(FulfillmentMethod::class)],
            'delivery_address' => ['nullable', 'string', 'max:500'],
            'delivery_time' => [
                'required',
                'string',
                Rule::exists(PickupDeliveryTimeSlot::class, 'label')->where('is_active', true),
            ],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('cake_id')) {
                    return;
                }

                /** @var Cake|null $cake */
                $cake = Cake::query()
                    ->with('category')
                    ->find($this->integer('cake_id'));

                if ($cake === null || ! $cake->is_active || ! ($cake->category->is_active ?? false)) {
                    $validator->errors()->add('cake_id', 'Produk kue tidak tersedia untuk dipesan.');

                    return;
                }

                $this->validateOptions($validator, $cake);
                $this->validateRequiredDate($validator, $cake);
                $this->validateImageUpload($validator, $cake);
                $this->validateFulfillmentAndPayment($validator);
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'cake_id.required' => 'Produk kue wajib dipilih.',
            'required_date.required' => 'Tanggal dibutuhkan wajib diisi.',
            'required_date.date_format' => 'Format tanggal tidak valid (YYYY-MM-DD).',
            'recipient_name.required' => 'Nama penerima wajib diisi.',
            'recipient_age.required' => 'Umur penerima wajib diisi.',
            'recipient_age.min' => 'Umur penerima minimal 1 tahun.',
            'cake_message.required' => 'Tulisan di atas kue wajib diisi.',
            'uploaded_image.image' => 'File foto harus berupa gambar yang valid.',
            'uploaded_image.max' => 'Ukuran foto referensi maksimal 2 MB.',
            'fulfillment_method.required' => 'Metode penerimaan wajib dipilih.',
            'delivery_time.required' => 'Slot jam penerimaan wajib dipilih.',
            'delivery_time.exists' => 'Slot jam penerimaan yang dipilih tidak tersedia.',
            'payment_method.required' => 'Metode pembayaran wajib dipilih.',
        ];
    }

    private function validateOptions(Validator $validator, Cake $cake): void
    {
        if ($cake->sizes()->where('sizes.is_active', true)->exists()) {
            $sizeId = $this->integer('size_id');
            if ($sizeId === 0 || ! $cake->sizes()->where('sizes.id', $sizeId)->where('sizes.is_active', true)->exists()) {
                $validator->errors()->add('size_id', 'Ukuran kue yang dipilih tidak valid untuk produk ini.');
            }
        }

        if ($cake->flavors()->where('flavors.is_active', true)->exists()) {
            $flavorId = $this->integer('flavor_id');
            if ($flavorId === 0 || ! $cake->flavors()->where('flavors.id', $flavorId)->where('flavors.is_active', true)->exists()) {
                $validator->errors()->add('flavor_id', 'Rasa kue yang dipilih tidak valid untuk produk ini.');
            }
        }

        if ($cake->fillings()->where('fillings.is_active', true)->exists()) {
            $fillingId = $this->integer('filling_id');
            if ($fillingId === 0 || ! $cake->fillings()->where('fillings.id', $fillingId)->where('fillings.is_active', true)->exists()) {
                $validator->errors()->add('filling_id', 'Isian kue yang dipilih tidak valid untuk produk ini.');
            }
        }
    }

    private function validateRequiredDate(Validator $validator, Cake $cake): void
    {
        if ($validator->errors()->has('required_date')) {
            return;
        }

        $capacityService = app(CapacityService::class);
        $requiredDate = $capacityService->parseDate($this->string('required_date')->toString());

        if (! $capacityService->isDateEligibleForCake($cake, $requiredDate)) {
            $earliest = $capacityService->earliestValidDate($cake)->format('d M Y');
            $validator->errors()->add(
                'required_date',
                "Pemesanan kue ini minimal H-{$cake->minimum_order_days}. Tanggal tercepat yang tersedia adalah {$earliest}.",
            );
        }
    }

    private function validateImageUpload(Validator $validator, Cake $cake): void
    {
        if ($this->hasFile('uploaded_image') && ! $cake->allow_image_upload) {
            $validator->errors()->add(
                'uploaded_image',
                'Produk kue ini tidak mengizinkan upload foto referensi.',
            );
        }
    }

    private function validateFulfillmentAndPayment(Validator $validator): void
    {
        $fulfillment = $this->string('fulfillment_method')->toString();
        $payment = $this->string('payment_method')->toString();

        if ($fulfillment === FulfillmentMethod::Delivery->value && blank($this->input('delivery_address'))) {
            $validator->errors()->add('delivery_address', 'Alamat pengiriman wajib diisi untuk metode Delivery.');
        }

        if ($fulfillment === FulfillmentMethod::Delivery->value && $payment === PaymentMethod::Cash->value) {
            $validator->errors()->add(
                'payment_method',
                'Pembayaran Cash tidak tersedia untuk metode Delivery (tidak melayani COD). Pilih Midtrans atau ubah ke Pickup.',
            );
        }
    }
}
