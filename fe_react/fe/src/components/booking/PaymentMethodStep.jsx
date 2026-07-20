import { HiBanknotes, HiCalendarDays, HiCheckCircle, HiCreditCard, HiUserGroup } from 'react-icons/hi2';

function money(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
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

export default function PaymentMethodStep({ quote, paymentMethod, onSelectPaymentMethod, onCreateBooking, isSubmitting }) {
  const methods = [
    { key: 'PAY_AT_PROPERTY', title: 'Thanh toán tại chỗ', desc: 'Đặt phòng trước và thanh toán khi nhận phòng tại homestay.', icon: HiBanknotes },
    { key: 'VNPAY', title: 'Thanh toán qua VNPAY', desc: 'Chuyển sang cổng VNPAY Sandbox để chọn ngân hàng, thẻ hoặc QR theo giao diện VNPAY.', icon: HiCreditCard },
  ];

  return (
    <div className="space-y-5">
      <QuoteSummary quote={quote} />

      <section>
        <h3 className="mb-3 text-sm font-black text-[#2C1E15]">Phương thức thanh toán</h3>
        <div className="space-y-3">
          {methods.map((method) => {
            const selected = paymentMethod === method.key;
            const Icon = method.icon;
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