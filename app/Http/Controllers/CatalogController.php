<?php

namespace App\Http\Controllers;

use App\Models\Cake;
use App\Models\Category;
use App\Models\DailyVisitStat;
use App\Support\WhatsAppUrl;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function landing(): Response
    {
        DailyVisitStat::recordVisit();

        $featuredCakes = Cake::query()
            ->with('category:id,name,slug')
            ->where('is_active', true)
            ->whereHas('category', fn ($query) => $query->where('is_active', true))
            ->latest('id')
            ->limit(4)
            ->get()
            ->map(fn (Cake $cake): array => $this->formatCakeCard($cake));

        return Inertia::render('welcome', [
            'featuredCakes' => $featuredCakes,
            'whatsappUrl' => WhatsAppUrl::customCakeUrl(),
        ]);
    }

    public function index(Request $request): Response
    {
        DailyVisitStat::recordVisit();

        $selectedCategory = $request->string('category')->trim()->toString();
        $search = $request->string('search')->trim()->toString();

        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        $cakes = Cake::query()
            ->with('category:id,name,slug')
            ->where('is_active', true)
            ->whereHas('category', fn ($query) => $query->where('is_active', true))
            ->when($selectedCategory !== '', function ($query) use ($selectedCategory): void {
                $query->whereHas('category', fn ($q) => $q->where('slug', $selectedCategory));
            })
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($q) use ($search): void {
                    $q->where('name', 'ilike', "%{$search}%")
                        ->orWhere('description', 'ilike', "%{$search}%");
                });
            })
            ->latest('id')
            ->get()
            ->map(fn (Cake $cake): array => $this->formatCakeCard($cake));

        return Inertia::render('katalog/index', [
            'categories' => $categories,
            'cakes' => $cakes,
            'filters' => [
                'category' => $selectedCategory,
                'search' => $search,
            ],
            'whatsappUrl' => WhatsAppUrl::customCakeUrl(),
        ]);
    }

    public function show(Cake $cake): Response
    {
        $cake->load([
            'category:id,name,slug,is_active',
            'sizes' => fn ($query) => $query->where('is_active', true)->orderBy('name'),
            'flavors' => fn ($query) => $query->where('is_active', true)->orderBy('name'),
            'fillings' => fn ($query) => $query->where('is_active', true)->orderBy('name'),
        ]);

        abort_unless($cake->is_active && ($cake->category->is_active ?? false), 404);

        return Inertia::render('cakes/show', [
            'cake' => [
                'id' => $cake->id,
                'name' => $cake->name,
                'slug' => $cake->slug,
                'description' => $cake->description,
                'image_url' => $cake->image_url,
                'base_price' => $cake->base_price,
                'allow_image_upload' => $cake->allow_image_upload,
                'production_days' => $cake->production_days,
                'minimum_order_days' => $cake->minimum_order_days,
                'category' => [
                    'id' => $cake->category->id,
                    'name' => $cake->category->name,
                    'slug' => $cake->category->slug,
                ],
                'sizes' => $cake->sizes->map(fn ($size): array => [
                    'id' => $size->id,
                    'name' => $size->name,
                    'additional_price' => (int) ($size->pivot?->getAttribute('additional_price') ?? 0),
                ])->values(),
                'flavors' => $cake->flavors->map(fn ($flavor): array => [
                    'id' => $flavor->id,
                    'name' => $flavor->name,
                    'additional_price' => (int) ($flavor->pivot?->getAttribute('additional_price') ?? 0),
                ])->values(),
                'fillings' => $cake->fillings->map(fn ($filling): array => [
                    'id' => $filling->id,
                    'name' => $filling->name,
                    'additional_price' => (int) ($filling->pivot?->getAttribute('additional_price') ?? 0),
                ])->values(),
            ],
            'whatsappUrl' => WhatsAppUrl::customCakeUrl($cake->name),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatCakeCard(Cake $cake): array
    {
        return [
            'id' => $cake->id,
            'name' => $cake->name,
            'slug' => $cake->slug,
            'description' => $cake->description,
            'image_url' => $cake->image_url,
            'base_price' => $cake->base_price,
            'production_days' => $cake->production_days,
            'minimum_order_days' => $cake->minimum_order_days,
            'allow_image_upload' => $cake->allow_image_upload,
            'category' => $cake->category ? [
                'id' => $cake->category->id,
                'name' => $cake->category->name,
                'slug' => $cake->category->slug,
            ] : null,
        ];
    }
}
