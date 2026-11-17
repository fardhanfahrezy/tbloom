<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Filling;
use App\Models\Flavor;
use App\Models\Size;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CakeOptionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/options/index', [
            'sizes' => Size::query()->orderBy('name')->get(),
            'flavors' => Flavor::query()->orderBy('name')->get(),
            'fillings' => Filling::query()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request, string $type): RedirectResponse
    {
        $modelClass = $this->resolveModelClass($type);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'is_active' => ['sometimes', 'boolean'],
        ], [
            'name.required' => 'Nama opsi wajib diisi.',
        ]);

        $modelClass::query()->create([
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return back()->with('success', 'Opsi kue berhasil ditambahkan.');
    }

    public function update(Request $request, string $type, int $id): RedirectResponse
    {
        $model = $this->resolveModelClass($type)::query()->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'is_active' => ['required', 'boolean'],
        ], [
            'name.required' => 'Nama opsi wajib diisi.',
        ]);

        $model->update($validated);

        return back()->with('success', 'Opsi kue berhasil diperbarui.');
    }

    public function destroy(string $type, int $id): RedirectResponse
    {
        $model = $this->resolveModelClass($type)::query()->findOrFail($id);
        $model->delete();

        return back()->with('success', 'Opsi kue berhasil dihapus.');
    }

    /**
     * @return class-string<Model>
     */
    private function resolveModelClass(string $type): string
    {
        return match ($type) {
            'sizes' => Size::class,
            'flavors' => Flavor::class,
            'fillings' => Filling::class,
            default => abort(404),
        };
    }
}
