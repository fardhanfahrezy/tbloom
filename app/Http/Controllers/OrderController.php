<?php

namespace App\Http\Controllers;

use App\Enums\FulfillmentMethod;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Cake;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use App\Models\PickupDeliveryTimeSlot;
use App\Services\CapacityService;
use App\Services\MidtransPaymentService;
use App\Services\OrderPricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private CapacityService $capacityService,
        private OrderPricingService $pricingService,
        private MidtransPaymentService $midtransService,
    ) {}

    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->with(['cake:id,name,slug,image', 'size:id,name', 'flavor:id,name', 'filling:id,name'])
            ->where('user_id', $request->user()->id)
            ->latest('id')
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'required_date' => $order->required_date->format('d M Y'),
                'delivery_time' => $order->delivery_time,
                'fulfillment_method' => $order->fulfillment_method->value,
                'fulfillment_label' => $order->fulfillment_method->label(),
                'payment_method' => $order->payment_method->value,
                'payment_method_label' => $order->payment_method->label(),
                'payment_status' => $order->payment_status->value,
                'payment_status_label' => $order->payment_status->label(),
                'order_status' => $order->order_status->value,
                'order_status_label' => $order->order_status->label($order->fulfillment_method->value),
                'total_price' => $order->total_price,
                'cake' => [
                    'name' => $order->cake->name,
                    'slug' => $order->cake->slug,
                    'image_url' => $order->cake->image_url,
                ],
                'created_at' => $order->created_at?->timezone('Asia/Jakarta')->format('d M Y H:i') ?? '',
            ]);

        return Inertia::render('orders/index', [
            'orders' => $orders,
        ]);
    }

    public function create(Request $request, Cake $cake): Response
    {
        $cake->load([
            'category:id,name,slug,is_active',
            'sizes' => fn ($query) => $query->where('is_active', true)->orderBy('name'),
            'flavors' => fn ($query) => $query->where('is_active', true)->orderBy('name'),
            'fillings' => fn ($query) => $query->where('is_active', true)->orderBy('name'),
        ]);

        abort_unless($cake->is_active && ($cake->category->is_active ?? false), 404);

        $earliestDate = $this->capacityService->earliestValidDate($cake);
        $timeSlots = PickupDeliveryTimeSlot::query()
            ->where('is_active', true)
            ->orderBy('start_time')
            ->get(['id', 'label']);

        return Inertia::render('orders/create', [
            'cake' => [
                'id' => $cake->id,
                'name' => $cake->name,
                'slug' => $cake->slug,
                'image_url' => $cake->image_url,
                'base_price' => $cake->base_price,
                'allow_image_upload' => $cake->allow_image_upload,
                'production_days' => $cake->production_days,
                'minimum_order_days' => $cake->minimum_order_days,
                'sizes' => $cake->sizes->map(fn ($s): array => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'additional_price' => (int) ($s->pivot?->getAttribute('additional_price') ?? 0),
                ])->values(),
                'flavors' => $cake->flavors->map(fn ($f): array => [
                    'id' => $f->id,
                    'name' => $f->name,
                    'additional_price' => (int) ($f->pivot?->getAttribute('additional_price') ?? 0),
                ])->values(),
                'fillings' => $cake->fillings->map(fn ($fl): array => [
                    'id' => $fl->id,
                    'name' => $fl->name,
                    'additional_price' => (int) ($fl->pivot?->getAttribute('additional_price') ?? 0),
                ])->values(),
            ],
            'initialSelection' => [
                'size_id' => $request->integer('size_id') ?: ($cake->sizes->first()->id ?? null),
                'flavor_id' => $request->integer('flavor_id') ?: ($cake->flavors->first()->id ?? null),
                'filling_id' => $request->integer('filling_id') ?: ($cake->fillings->first()->id ?? null),
            ],
            'timeSlots' => $timeSlots,
            'earliestDate' => $earliestDate->format('Y-m-d'),
            'feeConfig' => $this->pricingService->feeConfig(),
            'customer' => [
                'name' => $request->user()->name,
                'phone' => $request->user()->phone,
            ],
        ]);
    }

    public function preview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cake_id' => ['required', 'integer', 'exists:cakes,id'],
            'required_date' => ['nullable', 'date_format:Y-m-d'],
            'size_id' => ['nullable', 'integer'],
            'flavor_id' => ['nullable', 'integer'],
            'filling_id' => ['nullable', 'integer'],
            'fulfillment_method' => ['nullable', Rule::enum(FulfillmentMethod::class)],
            'payment_method' => ['nullable', Rule::enum(PaymentMethod::class)],
        ]);

        /** @var Cake $cake */
        $cake = Cake::query()->findOrFail($validated['cake_id']);
        $paymentMethod = PaymentMethod::tryFrom((string) ($validated['payment_method'] ?? PaymentMethod::Cash->value))
            ?? PaymentMethod::Cash;

        $pricing = $this->pricingService->calculate(
            $cake,
            isset($validated['size_id']) ? (int) $validated['size_id'] : null,
            isset($validated['flavor_id']) ? (int) $validated['flavor_id'] : null,
            isset($validated['filling_id']) ? (int) $validated['filling_id'] : null,
            $paymentMethod,
        );

        $earliest = $this->capacityService->earliestValidDate($cake);
        $dateResult = [
            'valid' => false,
            'available' => false,
            'remaining_capacity' => 0,
            'message' => null,
        ];

        if (! empty($validated['required_date'])) {
            $parsedDate = $this->capacityService->parseDate($validated['required_date']);
            $eligible = $this->capacityService->isDateEligibleForCake($cake, $parsedDate);
            $availability = $this->capacityService->checkAvailability($parsedDate);

            if (! $eligible) {
                $dateResult['message'] = "Pemesanan kue ini minimal H-{$cake->minimum_order_days} (paling cepat {$earliest->format('d M Y')}).";
            } elseif ($availability['is_closed']) {
                $dateResult['valid'] = true;
                $dateResult['message'] = 'Pemesanan pada tanggal tersebut sedang ditutup oleh toko.';
            } elseif (! $availability['is_available']) {
                $dateResult['valid'] = true;
                $dateResult['message'] = 'Kapasitas produksi pada tanggal tersebut sudah penuh.';
            } else {
                $dateResult = [
                    'valid' => true,
                    'available' => true,
                    'remaining_capacity' => $availability['remaining_capacity'],
                    'message' => "Tersedia ({$availability['remaining_capacity']} slot kue tersisa).",
                ];
            }
        }

        return response()->json([
            'pricing' => $pricing,
            'date' => $dateResult,
            'earliest_date' => $earliest->format('Y-m-d'),
        ]);
    }

    public function store(StoreOrderRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        /** @var Cake $cake */
        $cake = Cake::query()->findOrFail($validated['cake_id']);
        $requiredDate = $this->capacityService->parseDate($validated['required_date']);
        $paymentMethod = PaymentMethod::from($validated['payment_method']);
        $fulfillmentMethod = FulfillmentMethod::from($validated['fulfillment_method']);

        $uploadedImagePath = $request->hasFile('uploaded_image') && $cake->allow_image_upload
            ? $request->file('uploaded_image')->store('orders', 'public')
            : null;

        /** @var array{order: Order, payment: Payment} $created */
        $created = DB::transaction(function () use (
            $request,
            $validated,
            $cake,
            $requiredDate,
            $paymentMethod,
            $fulfillmentMethod,
            $uploadedImagePath,
        ): array {
            $this->capacityService->reserve($requiredDate);

            $pricing = $this->pricingService->calculate(
                $cake,
                isset($validated['size_id']) ? (int) $validated['size_id'] : null,
                isset($validated['flavor_id']) ? (int) $validated['flavor_id'] : null,
                isset($validated['filling_id']) ? (int) $validated['filling_id'] : null,
                $paymentMethod,
            );

            $initialOrderStatus = $paymentMethod === PaymentMethod::Midtrans
                ? OrderStatus::AwaitingPayment
                : OrderStatus::Pending;

            $initialPaymentStatus = $paymentMethod === PaymentMethod::Midtrans
                ? PaymentStatus::Pending
                : PaymentStatus::Unpaid;

            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'user_id' => $request->user()->id,
                'cake_id' => $cake->id,
                'size_id' => $validated['size_id'] ?? null,
                'flavor_id' => $validated['flavor_id'] ?? null,
                'filling_id' => $validated['filling_id'] ?? null,
                'order_date' => $this->capacityService->today()->toDateString(),
                'required_date' => $requiredDate->toDateString(),
                'recipient_name' => $validated['recipient_name'],
                'recipient_age' => (int) $validated['recipient_age'],
                'cake_message' => $validated['cake_message'],
                'special_notes' => $validated['special_notes'] ?? null,
                'uploaded_image' => $uploadedImagePath,
                'fulfillment_method' => $fulfillmentMethod->value,
                'delivery_address' => $fulfillmentMethod === FulfillmentMethod::Delivery
                    ? ($validated['delivery_address'] ?? null)
                    : null,
                'delivery_date' => $requiredDate->toDateString(),
                'delivery_time' => $validated['delivery_time'],
                'payment_method' => $paymentMethod->value,
                'base_price_snapshot' => $pricing['base_price'],
                'size_price_snapshot' => $pricing['size_price'],
                'flavor_price_snapshot' => $pricing['flavor_price'],
                'filling_price_snapshot' => $pricing['filling_price'],
                'payment_fee' => $pricing['payment_fee'],
                'total_price' => $pricing['total_price'],
                'payment_status' => $initialPaymentStatus->value,
                'order_status' => $initialOrderStatus->value,
            ]);

            $payment = Payment::query()->create([
                'order_id' => $order->id,
                'provider' => $paymentMethod->value,
                'gross_amount' => $pricing['total_price'],
                'fee_amount' => $pricing['payment_fee'],
                'status' => 'pending',
            ]);

            OrderStatusHistory::query()->create([
                'order_id' => $order->id,
                'changed_by_user_id' => $request->user()->id,
                'from_status' => null,
                'to_status' => $initialOrderStatus->value,
                'notes' => 'Pesanan dibuat oleh pelanggan.',
            ]);

            return [
                'order' => $order,
                'payment' => $payment,
            ];
        });

        if ($paymentMethod === PaymentMethod::Midtrans) {
            $this->midtransService->createSnapTransaction($created['order'], $created['payment']);
        }

        return to_route('orders.show', $created['order'])
            ->with('success', 'Pesanan berhasil dibuat! Silakan periksa detail pesanan dan pembayaran Anda.');
    }

    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $order->load([
            'cake:id,name,slug,image',
            'size:id,name',
            'flavor:id,name',
            'filling:id,name',
            'payment',
            'statusHistories.changedBy:id,name',
        ]);

        return Inertia::render('orders/show', [
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
                'cake' => [
                    'name' => $order->cake->name,
                    'slug' => $order->cake->slug,
                    'image_url' => $order->cake->image_url,
                ],
                'size_name' => $order->size?->name,
                'flavor_name' => $order->flavor?->name,
                'filling_name' => $order->filling?->name,
                'snap_token' => $order->payment?->snap_token,
                'histories' => $order->statusHistories->map(fn (OrderStatusHistory $history): array => [
                    'id' => $history->id,
                    'to_status' => $history->to_status,
                    'to_status_label' => OrderStatus::tryFrom($history->to_status)?->label($order->fulfillment_method->value) ?? $history->to_status,
                    'notes' => $history->notes,
                    'changed_by' => $history->changedBy->name ?? 'Sistem',
                    'created_at' => $history->created_at?->timezone('Asia/Jakarta')->format('d M Y H:i') ?? '',
                ])->values(),
            ],
            'midtrans' => [
                'clientKey' => config('services.midtrans.client_key'),
                'snapScriptUrl' => $this->midtransService->snapScriptUrl(),
            ],
        ]);
    }

    private function generateOrderNumber(): string
    {
        return 'TBL-'.$this->capacityService->today()->format('Ymd').'-'.Str::upper(Str::random(6));
    }
}
