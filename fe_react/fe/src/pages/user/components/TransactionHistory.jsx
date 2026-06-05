export default function TransactionHistory({ transactions }) {
  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Lịch sử giao dịch thanh toán</h2>
        <p className="text-xs text-gray-400 font-medium">Theo dõi hóa đơn tài chính và sao kê hoàn tiền đối soát từ hệ thống</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left border-collapse text-xs md:text-sm font-medium">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
              <th className="p-3">Mã giao dịch</th>
              <th className="p-3">Mã đơn đặt</th>
              <th className="p-3">Ngày thanh toán</th>
              <th className="p-3">Số tiền</th>
              <th className="p-3">Phương thức</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
            {transactions?.map(txn => (
              <tr key={txn.id} className="hover:bg-gray-50/50">
                <td className="p-3 font-mono">{txn.id}</td>
                <td className="p-3 font-mono text-gray-500">{txn.bookingId}</td>
                <td className="p-3">{txn.date}</td>
                <td className="p-3 text-[#2C3E2B] font-bold">{txn.amount}</td>
                <td className="p-3 text-gray-500">{txn.method}</td>
                <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${txn.status === 'Thành công' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{txn.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}