<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SaveCakeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'image', 'max:2048'],
            'base_price' => ['required', 'integer', 'min:0'],
            'allow_image_upload' => ['required', 'boolean'],
            'production_days' => ['required', 'integer', 'min:1', 'max:30'],
            'minimum_order_days' => ['required', 'integer', 'min:1', 'max:60'],
            'is_active' => ['required', 'boolean'],
            'sizes' => ['nullable', 'array'],
            'sizes.*.id' => ['required', 'integer', 'exists:sizes,id'],
            'sizes.*.additional_price' => ['required', 'integer', 'min:0'],
            'flavors' => ['nullable', 'array'],
            'flavors.*.id' => ['required', 'integer', 'exists:flavors,id'],
            'flavors.*.additional_price' => ['required', 'integer', 'min:0'],
            'fillings' => ['nullable', 'array'],
            'fillings.*.id' => ['required', 'integer', 'exists:fillings,id'],
            'fillings.*.additional_price' => ['required', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategori kue wajib dipilih.',
            'name.required' => 'Nama kue wajib diisi.',
            'base_price.required' => 'Harga dasar wajib diisi.',
            'base_price.min' => 'Harga dasar tidak boleh negatif.',
            'image.image' => 'File gambar harus berupa foto yang valid.',
            'image.max' => 'Ukuran foto maksimal 2 MB.',
            'production_days.min' => 'Estimasi hari pembuatan minimal 1 hari.',
            'minimum_order_days.min' => 'Minimum H-n pemesanan minimal 1 hari.',
        ];
    }
}
