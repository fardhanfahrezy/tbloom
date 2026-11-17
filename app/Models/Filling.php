<?php

namespace App\Models;

use Database\Factories\FillingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property string $name
 * @property bool $is_active
 */
#[Fillable(['name', 'is_active'])]
class Filling extends Model
{
    /** @use HasFactory<FillingFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsToMany<Cake, $this>
     */
    public function cakes(): BelongsToMany
    {
        return $this->belongsToMany(Cake::class, 'cake_fillings')
            ->withPivot('additional_price')
            ->withTimestamps();
    }
}
