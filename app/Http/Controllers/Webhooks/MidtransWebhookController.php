<?php

namespace App\Http\Controllers\Webhooks;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Services\CapacityService;
use App\Services\MidtransPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MidtransWebhookController extends Controller
{
    public function __construct(
        private MidtransPaymentService $midtransService,
        private CapacityService $capacityService,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $orderId = (string) $request->input('order_id', '');
        $statusCode = (string) $request->input('status_code', '');
        $grossAmount = (string) $request->input('gross_amount', '');
        $signatureKey = (string) $request->input('signature_key', '');
        $transactionStatus = (string) $request->input('transaction_status', '');
        $fraudStatus = (string) $request->input('fraud_status', 'accept');
        $transactionId = $request->input('transaction_id');
        $paymentType = $request->input('payment_type');

        if (! $this->midtransService->verifySignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            return response()->json(['message' => 'Signature tidak valid.'], 403);
        }

        /** @var Order|null $order */
        $order = Order::query()->with('payment')->where('order_number', $orderId)->first();

        if ($order === null) {
            return response()->json(['message' => 'Pesanan tidak ditemukan.'], 404);
        }

        $shouldReleaseCapacity = false;

        DB::transaction(function () use (
            $order,
            $transactionStatus,
            $fraudStatus,
            $transactionId,
            $paymentType,
            $request,
            &$shouldReleaseCapacity,
        ): void {
            $previousOrderStatus = $order->order_status;

            [$paymentRecordStatus, $paymentStatus, $orderStatus, $notes] = match (true) {
                $transactionStatus === 'capture' && $fraudStatus === 'accept',
                $transactionStatus === 'settlement' => [
                    'settlement',
                    PaymentStatus::Paid,
                    OrderStatus::PaymentConfirmed,
                    'Pembayaran Midtrans berhasil dikonfirmasi.',
                ],
                $transactionStatus === 'pending' => [
                    'pending',
                    PaymentStatus::Pending,
                    OrderStatus::AwaitingPayment,
                    'Menunggu penyelesaian pembayaran di Midtrans.',
                ],
                $transactionStatus === 'expire' => [
                    'expire',
                    PaymentStatus::Expired,
                    OrderStatus::Rejected,
                    'Pembayaran Midtrans kedaluwarsa; kapasitas dikembalikan.',
                ],
                in_array($transactionStatus, ['cancel', 'deny'], true) => [
                    $transactionStatus,
                    PaymentStatus::Failed,
                    OrderStatus::Rejected,
                    "Pembayaran Midtrans ({$transactionStatus}); kapasitas dikembalikan.",
                ],
                default => [
                    $transactionStatus ?: 'pending',
                    $order->payment_status,
                    $order->order_status,
                    'Notifikasi status Midtrans diterima.',
                ],
            };

            if ($order->payment !== null) {
                $order->payment->update([
                    'midtrans_transaction_id' => is_string($transactionId) ? $transactionId : $order->payment->midtrans_transaction_id,
                    'payment_type' => is_string($paymentType) ? $paymentType : $order->payment->payment_type,
                    'status' => $paymentRecordStatus,
                    'raw_response' => $request->all(),
                    'paid_at' => $paymentStatus === PaymentStatus::Paid ? now() : $order->payment->paid_at,
                ]);
            }

            $order->update([
                'payment_status' => $paymentStatus->value,
                'order_status' => $orderStatus->value,
            ]);

            if ($previousOrderStatus !== $orderStatus) {
                OrderStatusHistory::query()->create([
                    'order_id' => $order->id,
                    'changed_by_user_id' => null,
                    'from_status' => $previousOrderStatus->value,
                    'to_status' => $orderStatus->value,
                    'notes' => $notes,
                ]);
            }

            if ($orderStatus === OrderStatus::Rejected) {
                $shouldReleaseCapacity = true;
            }
        });

        if ($shouldReleaseCapacity) {
            $this->capacityService->releaseForOrder($order);
        }

        return response()->json(['message' => 'OK']);
    }
}
