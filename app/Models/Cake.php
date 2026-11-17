<?php

namespace App\Models;

use Database\Factories\CakeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $category_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string|null $image
 * @property int $base_price
 * @property bool $allow_image_upload
 * @property int $production_days
 * @property int $minimum_order_days
 * @property bool $is_active
 * @property-read string|null $image_url
 */
#[Fillable([
    'category_id',
    'name',
    'slug',
    'description',
    'image',
    'base_price',
    'allow_image_upload',
    'production_days',
    'minimum_order_days',
    'is_active',
])]
class Cake extends Model
{
    /** @use HasFactory<CakeFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'base_price' => 'integer',
            'allow_image_upload' => 'boolean',
            'production_days' => 'integer',
            'minimum_order_days' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return Attribute<string|null, never>
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::get(function (): ?string {
            if (! $this->image) {
                return null;
            }

            return Storage::disk('public')->url($this->image);
        });
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsToMany<Size, $this>
     */
    public function sizes(): BelongsToMany
    {
        return $this->belongsToMany(Size::class, 'cake_sizes')
            ->withPivot('additional_price')
            ->withTimestamps();
    }

    /**
     * @return BelongsToMany<Flavor, $this>
     */
    public function flavors(): BelongsToMany
    {
        return $this->belongsToMany(Flavor::class, 'cake_flavors')
            ->withPivot('additional_price')
            ->withTimestamps();
    }

    /**
     * @return BelongsToMany<Filling, $this>
     */
    public function fillings(): BelongsToMany
    {
        return $this->belongsToMany(Filling::class, 'cake_fillings')
            ->withPivot('additional_price')
            ->withTimestamps();
    }
}
