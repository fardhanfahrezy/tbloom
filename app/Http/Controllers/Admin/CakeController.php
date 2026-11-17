<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveCakeRequest;
use App\Models\Cake;
use App\Models\Category;
use App\Models\Filling;
use App\Models\Flavor;
use App\Models\Size;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CakeController extends Controller
{
    public function index(): Response
    {
        $cakes = Cake::query()
            ->with('category:id,name')
            ->latest('id')
            ->get()
            ->map(fn (Cake $cake): array => [
                'id' => $cake->id,
                'name' => $cake->name,
                'slug' => $cake->slug,
                'image_url' => $cake->image_url,
                'base_price' => $cake->base_price,
                'production_days' => $cake->production_days,
                'minimum_order_days' => $cake->minimum_order_days,
                'allow_image_upload' => $cake->allow_image_upload,
                'is_active' => $cake->is_active,
                'category' => $cake->category ? [
                    'id' => $cake->category->id,
                    'name' => $cake->category->name,
                ] : null,
            ]);

        return Inertia::render('admin/cakes/index', [
            'cakes' => $cakes,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/cakes/form', [
            'cake' => null,
            ...$this->optionProps(),
        ]);
    }

    public function store(SaveCakeRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($request, $validated): void {
            $imagePath = $request->hasFile('image')
                ? $request->file('image')->store('cakes', 'public')
                : null;

            $cake = Cake::query()->create([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => $this->uniqueSlug($validated['name']),
                'description' => $validated['description'] ?? null,
                'image' => $imagePath,
                'base_price' => $validated['base_price'],
                'allow_image_upload' => $validated['allow_image_upload'],
                'production_days' => $validated['production_days'],
                'minimum_order_days' => $validated['minimum_order_days'],
                'is_active' => $validated['is_active'],
            ]);

            $this->syncOptions($cake, $validated);
        });

        return to_route('admin.cakes.index')->with('success', 'Kue berhasil ditambahkan ke katalog.');
    }

    public function edit(Cake $cake): Response
    {
        $cake->load(['sizes', 'flavors', 'fillings']);

        return Inertia::render('admin/cakes/form', [
            'cake' => [
                'id' => $cake->id,
                'category_id' => $cake->category_id,
                'name' => $cake->name,
                'description' => $cake->description ?? '',
                'image_url' => $cake->image_url,
                'base_price' => $cake->base_price,
                'allow_image_upload' => $cake->allow_image_upload,
                'production_days' => $cake->production_days,
                'minimum_order_days' => $cake->minimum_order_days,
                'is_active' => $cake->is_active,
                'sizes' => $cake->sizes->map(fn ($s): array => [
                    'id' => $s->id,
                    'additional_price' => (int) ($s->pivot?->getAttribute('additional_price') ?? 0),
                ])->values(),
                'flavors' => $cake->flavors->map(fn ($f): array => [
                    'id' => $f->id,
                    'additional_price' => (int) ($f->pivot?->getAttribute('additional_price') ?? 0),
                ])->values(),
                'fillings' => $cake->fillings->map(fn ($fl): array => [
                    'id' => $fl->id,
                    'additional_price' => (int) ($fl->pivot?->getAttribute('additional_price') ?? 0),
                ])->values(),
            ],
            ...$this->optionProps(),
        ]);
    }

    public function update(SaveCakeRequest $request, Cake $cake): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($request, $cake, $validated): void {
            $imagePath = $cake->image;

            if ($request->hasFile('image')) {
                if ($cake->image) {
                    Storage::disk('public')->delete($cake->image);
                }
                $imagePath = $request->file('image')->store('cakes', 'public');
            }

            $cake->update([
                'category_id' => $validated['category_id'],
                'name' => $validated['name'],
                'slug' => $this->uniqueSlug($validated['name'], $cake->id),
                'description' => $validated['description'] ?? null,
                'image' => $imagePath,
                'base_price' => $validated['base_price'],
                'allow_image_upload' => $validated['allow_image_upload'],
                'production_days' => $validated['production_days'],
                'minimum_order_days' => $validated['minimum_order_days'],
                'is_active' => $validated['is_active'],
            ]);

            $this->syncOptions($cake, $validated);
        });

        return to_route('admin.cakes.index')->with('success', 'Data kue berhasil diperbarui.');
    }

    public function destroy(Cake $cake): RedirectResponse
    {
        if ($cake->image) {
            Storage::disk('public')->delete($cake->image);
        }

        $cake->delete();

        return to_route('admin.cakes.index')->with('success', 'Kue berhasil dihapus dari katalog.');
    }

    /**
     * @return array<string, mixed>
     */
    private function optionProps(): array
    {
        return [
            'categories' => Category::query()->orderBy('name')->get(['id', 'name', 'is_active']),
            'availableSizes' => Size::query()->orderBy('name')->get(['id', 'name', 'is_active']),
            'availableFlavors' => Flavor::query()->orderBy('name')->get(['id', 'name', 'is_active']),
            'availableFillings' => Filling::query()->orderBy('name')->get(['id', 'name', 'is_active']),
        ];
    }

    /**
     * @param  array<string, mixed>  $validated
     */
    private function syncOptions(Cake $cake, array $validated): void
    {
        $cake->sizes()->sync($this->formatPivot($validated['sizes'] ?? []));
        $cake->flavors()->sync($this->formatPivot($validated['flavors'] ?? []));
        $cake->fillings()->sync($this->formatPivot($validated['fillings'] ?? []));
    }

    /**
     * @param  array<int, array{id: int, additional_price: int}>  $items
     * @return array<int, array{additional_price: int}>
     */
    private function formatPivot(array $items): array
    {
        return collect($items)
            ->mapWithKeys(fn (array $item): array => [
                (int) $item['id'] => ['additional_price' => (int) $item['additional_price']],
            ])
            ->all();
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 2;

        while (Cake::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
