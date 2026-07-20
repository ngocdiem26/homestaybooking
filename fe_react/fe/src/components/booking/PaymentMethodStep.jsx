import { HiBanknotes, HiCalendarDays, HiCheckCircle, HiClock, HiQrCode, HiUserGroup } from 'react-icons/hi2';

function money(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function formatSeconds(seconds) {
  const min = Math.floor(Math.max(0, seconds) / 60);
  const sec = Math.max(0, seconds) % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function dateText(value) {
  if (!value) return '--/--/----';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('vi-VN');
}

function QuoteSummary({ quote }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-[#FAF8F3] p-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-black text-[#2C1E15]">
        <span>{quote?.homestayName || 'Homestay'}</span>
        <span className="inline-flex items-center gap-1 text-gray-500"><HiCalendarDays className="h-4 w-4" /> {dateText(quote?.checkInDate)} - {dateText(quote?.checkOutDate)}</span>
        <span className="inline-flex items-center gap-1 text-gray-500"><HiUserGroup className="h-4 w-4" /> Khách: {quote?.numberOfGuest || 1}</span>
      </div>
      <div className="mt-4 max-w-sm space-y-2 text-sm font-semibold text-gray-500">
        <div className="flex justify-between"><span>Số đêm</span><b className="text-[#2C1E15]">{quote?.numberOfNights || 1}</b></div>
        <div className="flex justify-between"><span>Giá/đêm</span><b className="text-[#2C1E15]">{money(quote?.unitPrice)}</b></div>
        <div className="flex justify-between"><span>Tiền phòng</span><b className="text-[#2C1E15]">{money(quote?.roomTotal)}</b></div>
        <div className="flex justify-between"><span>Giảm</span><b className="text-emerald-600">- {money(quote?.discountAmount)}</b></div>
        <div className="flex justify-between"><span>Dịch vụ thêm</span><b className="text-[#2C1E15]">{money(quote?.serviceTotal)}</b></div>
        <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-black text-[#2C1E15]"><span>Tổng tiền</span><span>{money(quote?.finalAmount)}</span></div>
      </div>
    </section>
  );
}

export default function PaymentMethodStep({ quote, paymentMethod, pendingPayment, remainingSeconds, onSelectPaymentMethod, onCreateBooking, isSubmitting }) {
  if (pendingPayment) {
    return (
      <div className="space-y-5">
        <QuoteSummary quote={quote} />
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2C3E2B] text-white"><HiQrCode className="h-7 w-7" /></div>
            <h3 className="mt-3 text-xl font-black text-[#2C1E15]">Quét QR SePay</h3>
            <img src={pendingPayment.qrCodeUrl} alt="QR thanh toán SePay" className="mx-auto mt-4 h-60 w-60 rounded-2xl border border-gray-100 bg-white p-3 shadow" />
          </section>
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B6784F]">Chờ thanh toán</p>
            <h3 className="mt-1 text-3xl font-black text-[#6E473B]">{money(pendingPayment.amount)}</h3>
            <div className="mt-5 grid gap-3 text-sm font-semibold text-gray-500 md:grid-cols-2">
              <div className="rounded-2xl bg-[#F4F1EA] p-4"><span>Mã booking</span><b className="mt-1 block text-[#2C1E15]">{pendingPayment.bookingCode}</b></div>
              <div className="rounded-2xl bg-[#F4F1EA] p-4"><span>Nội dung chuyển khoản</span><b className="mt-1 block text-[#2C1E15]">{pendingPayment.transactionCode}</b></div>
              <div className="rounded-2xl bg-[#F4F1EA] p-4"><span>Ngân hàng</span><b className="mt-1 block text-[#2C1E15]">SePay / tài khoản cấu hình</b></div>
              <div className="rounded-2xl bg-amber-50 p-4 text-amber-700"><span className="flex items-center gap-2"><HiClock /> Còn lại</span><b className="mt-1 block text-xl">{formatSeconds(remainingSeconds)}</b></div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const methods = [
    { key: 'PAY_AT_PROPERTY', title: 'Thanh toán tại chỗ', desc: 'Đặt phòng trước và thanh toán khi nhận phòng tại homestay.' },
    { key: 'SEPAY', title: 'Thanh toán SePay', desc: 'Quét QR chuyển khoản, hệ thống tự kiểm tra trạng thái thanh toán.' },
  ];

  return (
    <div className="space-y-5">
      <QuoteSummary quote={quote} />

      <section>
        <h3 className="mb-3 text-sm font-black text-[#2C1E15]">Phương thức thanh toán</h3>
        <div className="space-y-3">
          {methods.map((method) => {
            const selected = paymentMethod === method.key;
            const Icon = method.key === 'SEPAY' ? HiQrCode : HiBanknotes;
            return (
              <button
                key={method.key}
                type="button"
                onClick={() => onSelectPaymentMethod(method.key)}
                className={(selected ? 'border-[#2C3E2B] bg-[#F7F4EC]' : 'border-gray-200 bg-white hover:border-[#2C3E2B]/40') + ' flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition'}
              >
                <span className="flex items-center gap-3">
                  <span className={(selected ? 'border-[#2C3E2B] bg-[#2C3E2B] text-white' : 'border-gray-300 bg-white text-gray-400') + ' flex h-6 w-6 items-center justify-center rounded-full border'}>
                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                  </span>
                  <Icon className="h-5 w-5 text-[#6E473B]" />
                  <span>
                    <span className="block text-sm font-black text-[#2C1E15]">{method.title}</span>
                    <span className="mt-0.5 block text-xs font-semibold text-gray-400">{method.desc}</span>
                  </span>
                </span>
                {selected && <HiCheckCircle className="h-5 w-5 text-[#2C3E2B]" />}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs font-semibold text-gray-400">Kiểm tra lại thông tin trước khi đặt phòng.</p>
        <button type="button" onClick={onCreateBooking} disabled={isSubmitting} className="h-11 rounded-2xl bg-[#2C3E2B] px-6 text-sm font-black text-white shadow-lg transition hover:bg-[#223322] disabled:opacity-60">
          {isSubmitting ? 'Đang xử lý...' : 'Đặt phòng'}
        </button>
      </div>
    </div>
  );
}