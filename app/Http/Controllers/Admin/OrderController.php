<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\StoreSetting;
use App\Services\CapacityService;
use App\Services\OrderPricingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private CapacityService $capacityService,
        private OrderPricingService $pricingService,
    ) {}

    public function index(Request $request): Response
    {
        $selectedStatus = $request->string('status')->trim()->toString();

        $orders = Order::query()
            ->with(['user:id,name,phone', 'cake:id,name'])
            ->when($selectedStatus !== '', function ($query) use ($selectedStatus): void {
                $query->where('order_status', $selectedStatus);
            })
            ->latest('id')
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->user->name,
                'customer_phone' => $order->user->phone,
                'cake_name' => $order->cake->name,
                'required_date' => $order->required_date->format('d M Y'),
                'delivery_time' => $order->delivery_time,
                'fulfillment_method' => $order->fulfillment_method->value,
                'fulfillment_label' => $order->fulfillment_method->label(),
                'payment_method_label' => $order->payment_method->label(),
                'payment_status' => $order->payment_status->value,
                'payment_status_label' => $order->payment_status->label(),
                'order_status' => $order->order_status->value,
                'order_status_label' => $order->order_status->label($order->fulfillment_method->value),
                'total_price' => $order->total_price,
                'created_at' => $order->created_at?->timezone('Asia/Jakarta')->format('d M Y H:i') ?? '',
            ]);

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'selectedStatus' => $selectedStatus,
            'statusOptions' => OrderStatus::options(),
            'feeConfig' => $this->pricingService->feeConfig(),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'user:id,name,email,phone',
            'cake:id,name,slug,image',
            'size:id,name',
            'flavor:id,name',
            'filling:id,name',
            'payment',
            'statusHistories.changedBy:id,name',
        ]);

        return Inertia::render('admin/orders/show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'order_date' => $order->order_date->format('d M Y'),
                'required_date' => $order->required_date->format('d M Y'),
                'delivery_time' => $order->delivery_time,
                'fulfillment_method' => $order->fulfillment_method->value,
                'fulfillment_label' => $order->fulfillment_method->label(),
                'delivery_address' => $order->delivery_address,
                'recipient_name' => $order->recipient_name,
                'recipient_age' => $order->recipient_age,
                'cake_message' => $order->cake_message,
                'special_notes' => $order->special_notes,
                'uploaded_image_url' => $order->uploaded_image_url,
                'payment_method' => $order->payment_method->value,
                'payment_method_label' => $order->payment_method->label(),
                'payment_status' => $order->payment_status->value,
                'payment_status_label' => $order->payment_status->label(),
                'order_status' => $order->order_status->value,
                'order_status_label' => $order->order_status->label($order->fulfillment_method->value),
                'base_price_snapshot' => $order->base_price_snapshot,
                'size_price_snapshot' => $order->size_price_snapshot,
                'flavor_price_snapshot' => $order->flavor_price_snapshot,
                'filling_price_snapshot' => $order->filling_price_snapshot,
                'payment_fee' => $order->payment_fee,
                'total_price' => $order->total_price,
                'customer' => [
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                    'phone' => $order->user->phone,
                ],
                'cake_name' => $order->cake->name,
                'size_name' => $order->size?->name,
                'flavor_name' => $order->flavor?->name,
                'filling_name' => $order->filling?->name,
                'payment_type' => $order->payment?->payment_type,
                'histories' => $order->statusHistories->map(fn (OrderStatusHistory $history): array => [
                    'id' => $history->id,
                    'to_status_label' => OrderStatus::tryFrom($history->to_status)?->label($order->fulfillment_method->value) ?? $history->to_status,
                    'notes' => $history->notes,
                    'changed_by' => $history->changedBy->name ?? 'Sistem',
                    'created_at' => $history->created_at?->timezone('Asia/Jakarta')->format('d M Y H:i') ?? '',
                ])->values(),
            ],
            'statusOptions' => OrderStatus::options($order->fulfillment_method->value),
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'order_status' => ['required', Rule::enum(OrderStatus::class)],
            'mark_paid' => ['sometimes', 'boolean'],
            'notes' => ['nullable', 'string', 'max:500'],
        ], [
            'order_status.required' => 'Status pesanan wajib dipilih.',
        ]);

        $newStatus = OrderStatus::from($validated['order_status']);
        $markPaid = (bool) ($validated['mark_paid'] ?? false);

        DB::transaction(function () use ($request, $order, $newStatus, $markPaid, $validated): void {
            $previousStatus = $order->order_status;

            $order->order_status = $newStatus;

            if ($markPaid) {
                $order->payment_status = PaymentStatus::Paid;
                $order->payment?->update([
                    'status' => 'settlement',
                    'paid_at' => now(),
                ]);
            } elseif ($newStatus === OrderStatus::Rejected && $order->payment_status !== PaymentStatus::Paid) {
                $order->payment_status = PaymentStatus::Failed;
            }

            $order->save();

            OrderStatusHistory::query()->create([
                'order_id' => $order->id,
                'changed_by_user_id' => $request->user()->id,
                'from_status' => $previousStatus->value,
                'to_status' => $newStatus->value,
                'notes' => $validated['notes'] ?? ($markPaid ? 'Pembayaran dikonfirmasi & status diperbarui Admin.' : 'Status pesanan diperbarui oleh Admin.'),
            ]);
        });

        if ($newStatus === OrderStatus::Rejected) {
            $this->capacityService->releaseForOrder($order);
        }

        return back()->with('success', 'Status pesanan berhasil diperbarui.');
    }

    public function updatePaymentFee(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'midtrans_fee_type' => ['required', Rule::in(['fixed', 'percent'])],
            'midtrans_fee_value' => ['required', 'numeric', 'min:0', 'max:1000000'],
        ], [
            'midtrans_fee_value.required' => 'Nilai biaya layanan wajib diisi.',
        ]);

        if ($validated['midtrans_fee_type'] === 'percent' && (float) $validated['midtrans_fee_value'] > 100) {
            return back()->withErrors([
                'midtrans_fee_value' => 'Persentase biaya layanan maksimal 100%.',
            ]);
        }

        StoreSetting::setValue('midtrans_fee_type', $validated['midtrans_fee_type']);
        StoreSetting::setValue('midtrans_fee_value', (string) $validated['midtrans_fee_value']);

        return back()->with('success', 'Pengaturan biaya layanan Midtrans berhasil disimpan.');
    }
}
