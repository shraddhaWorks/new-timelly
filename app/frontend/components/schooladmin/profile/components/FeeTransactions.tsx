import { Receipt } from "lucide-react";


type Props = {
  fee?: {
    totalFee: number;
    amountPaid: number;
    remainingFee: number;
  } | null;
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
  }>;
};

export const FeeTransactions = ({ fee = null, payments = [] }: Props) => {
  const totalPaid = fee?.amountPaid ?? 0;
  const total = fee ? fee.amountPaid + fee.remainingFee : 0;

  return (
    <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 rounded-2xl p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Receipt className="w-5 h-5 text-lime-400" /> Fee Details & Transactions
        </h3>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase">Fees Paid / Total</p>
          <p className="text-xl font-bold">
            ₹{totalPaid.toLocaleString("en-IN")} / <span className="text-gray-500">₹{total.toLocaleString("en-IN")}</span>
          </p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg -mx-1 sm:mx-0">
      <table className="w-full text-left min-w-[500px] sm:min-w-0">
        <thead>
          <tr className="text-[10px] text-gray-500 uppercase border-b border-white/5">
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Description</th>
            <th className="pb-3 font-medium">Method</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {payments.length > 0 ? (
            payments.map((p) => (
              <tr key={p.id} className="border-b border-white/5 last:border-0">
                <td className="py-4 text-gray-400">
                  {new Date(p.createdAt).toISOString().slice(0, 10)}
                </td>
                <td className="py-4 font-semibold text-gray-200">Tuition Fee</td>
                <td className="py-4 text-gray-400">{p.method || "Online"}</td>
                <td className="py-4">
                  <span className={`text-[10px] px-2 py-1 rounded ${p.status === "SUCCESS" ? "bg-lime-400/10 text-lime-400" : "bg-amber-400/10 text-amber-400"}`}>
                    {p.status === "SUCCESS" ? "Paid" : p.status}
                  </span>
                </td>
                <td className="py-4 text-right font-bold">₹{p.amount.toLocaleString("en-IN")}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-500">
                No transactions yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};