<?php

namespace Database\Seeders;

use App\Models\Cake;
use App\Models\Category;
use App\Models\Filling;
use App\Models\Flavor;
use App\Models\PickupDeliveryTimeSlot;
use App\Models\Size;
use App\Models\StoreSetting;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        StoreSetting::query()->firstOrCreate(
            ['key' => 'default_daily_capacity'],
            ['value' => '5'],
        );

        StoreSetting::query()->firstOrCreate(
            ['key' => 'whatsapp_admin_number'],
            ['value' => (string) config('services.whatsapp.admin_number', '6281234567890')],
        );

        StoreSetting::query()->firstOrCreate(
            ['key' => 'midtrans_fee_type'],
            ['value' => 'fixed'],
        );

        StoreSetting::query()->firstOrCreate(
            ['key' => 'midtrans_fee_value'],
            ['value' => '4000'],
        );

        $categories = [
            ['name' => 'Korean Bento Cake', 'slug' => 'korean-bento-cake'],
            ['name' => 'Vintage Cake', 'slug' => 'vintage-cake'],
            ['name' => 'Floral & Botanical', 'slug' => 'floral-botanical'],
            ['name' => 'Signature Celebration', 'slug' => 'signature-celebration'],
        ];

        $categoryModels = [];
        foreach ($categories as $category) {
            $categoryModels[$category['slug']] = Category::query()->firstOrCreate(
                ['slug' => $category['slug']],
                ['name' => $category['name'], 'is_active' => true],
            );
        }

        $sizes = [
            'Mini 12cm' => 0,
            'Small 16cm' => 55000,
            'Medium 20cm' => 115000,
            'Large 24cm' => 185000,
        ];

        $sizeModels = [];
        foreach ($sizes as $name => $price) {
            $sizeModels[$name] = Size::query()->firstOrCreate(
                ['name' => $name],
                ['is_active' => true],
            );
        }

        $flavors = [
            'Vanilla Bean' => 0,
            'Belgian Chocolate' => 15000,
            'Red Velvet' => 20000,
            'Uji Matcha' => 25000,
        ];

        $flavorModels = [];
        foreach ($flavors as $name => $price) {
            $flavorModels[$name] = Flavor::query()->firstOrCreate(
                ['name' => $name],
                ['is_active' => true],
            );
        }

        $fillings = [
            'Vanilla Chantilly' => 0,
            'Strawberry Compote' => 15000,
            'Dark Chocolate Ganache' => 20000,
            'Cream Cheese Frosting' => 25000,
        ];

        $fillingModels = [];
        foreach ($fillings as $name => $price) {
            $fillingModels[$name] = Filling::query()->firstOrCreate(
                ['name' => $name],
                ['is_active' => true],
            );
        }

        $cakes = [
            [
                'category' => 'vintage-cake',
                'name' => 'Vintage Heart Lambeth Cake',
                'slug' => 'vintage-heart-lambeth-cake',
                'description' => 'Kue berbentuk hati dengan teknik piping Lambeth klasik yang lembut dan elegan, cocok untuk ulang tahun atau anniversary.',
                'base_price' => 195000,
                'allow_image_upload' => false,
                'production_days' => 2,
                'minimum_order_days' => 2,
            ],
            [
                'category' => 'korean-bento-cake',
                'name' => 'Minimalist Ribbon Bento',
                'slug' => 'minimalist-ribbon-bento',
                'description' => 'Bento cake ringkas berhias pita buttercream dan tulisan tangan personal untuk kejutan hangat.',
                'base_price' => 125000,
                'allow_image_upload' => true,
                'production_days' => 1,
                'minimum_order_days' => 2,
            ],
            [
                'category' => 'floral-botanical',
                'name' => 'Pressed Meadow Floral Cake',
                'slug' => 'pressed-meadow-floral-cake',
                'description' => 'Dekorasi bunga buttercream bernuansa earth-tone lembut yang cocok untuk perayaan intimate.',
                'base_price' => 245000,
                'allow_image_upload' => false,
                'production_days' => 2,
                'minimum_order_days' => 3,
            ],
            [
                'category' => 'signature-celebration',
                'name' => 'Espresso Tiramisu Celebration',
                'slug' => 'espresso-tiramisu-celebration',
                'description' => 'Lapisan sponge lembut berpadu krim mascarpone dan aroma espresso yang seimbang tanpa rasa terlalu manis.',
                'base_price' => 265000,
                'allow_image_upload' => true,
                'production_days' => 2,
                'minimum_order_days' => 3,
            ],
        ];

        foreach ($cakes as $cakeData) {
            $cake = Cake::query()->firstOrCreate(
                ['slug' => $cakeData['slug']],
                [
                    'category_id' => $categoryModels[$cakeData['category']]->id,
                    'name' => $cakeData['name'],
                    'description' => $cakeData['description'],
                    'base_price' => $cakeData['base_price'],
                    'allow_image_upload' => $cakeData['allow_image_upload'],
                    'production_days' => $cakeData['production_days'],
                    'minimum_order_days' => $cakeData['minimum_order_days'],
                    'is_active' => true,
                ],
            );

            $cake->sizes()->syncWithoutDetaching(
                collect($sizes)->mapWithKeys(fn (int $price, string $name): array => [
                    $sizeModels[$name]->id => ['additional_price' => $price],
                ])->all(),
            );

            $cake->flavors()->syncWithoutDetaching(
                collect($flavors)->mapWithKeys(fn (int $price, string $name): array => [
                    $flavorModels[$name]->id => ['additional_price' => $price],
                ])->all(),
            );

            $cake->fillings()->syncWithoutDetaching(
                collect($fillings)->mapWithKeys(fn (int $price, string $name): array => [
                    $fillingModels[$name]->id => ['additional_price' => $price],
                ])->all(),
            );
        }

        $timeSlots = [
            ['label' => '10:00 - 12:00', 'start_time' => '10:00:00', 'end_time' => '12:00:00'],
            ['label' => '13:00 - 15:00', 'start_time' => '13:00:00', 'end_time' => '15:00:00'],
            ['label' => '16:00 - 18:00', 'start_time' => '16:00:00', 'end_time' => '18:00:00'],
        ];

        foreach ($timeSlots as $slot) {
            PickupDeliveryTimeSlot::query()->firstOrCreate(
                ['label' => $slot['label']],
                [
                    'start_time' => $slot['start_time'],
                    'end_time' => $slot['end_time'],
                    'is_active' => true,
                ],
            );
        }
    }
}
