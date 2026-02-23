import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center animate-fadeIn">
        
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful 🎉
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your transaction has been completed
          successfully.
        </p>

        {/* Payment Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Status</span>
            <span className="font-medium text-green-600">Successful</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Payment Method</span>
            <span className="font-medium text-gray-800">UPI / Card</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Transaction ID</span>
            <span className="font-medium text-gray-800">
              TXN-9F82K1
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button className="w-full rounded-xl bg-green-600 text-white py-3 font-medium hover:bg-green-700 transition">
            Go to Dashboard
          </button>
          <button className="w-full rounded-xl border border-gray-300 py-3 text-gray-700 font-medium hover:bg-gray-50 transition">
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}