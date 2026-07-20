import { HiCalendarDays, HiInformationCircle, HiTicket, HiTrash, HiUserGroup } from 'react-icons/hi2';

function money(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function dateText(value) {
  if (!value) return '--/--/----';
  const date = new Date(value + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('vi-VN');
}

function getPromoCode(promo) {
  return promo?.promotionCode || promo?.code || '';
}

function getPromoName(promo) {
  return promo?.promotionName || promo?.name || 'Mã khuyến mãi';
}

function getPromoUnavailableReason(promo) {
  return promo?.unavailableReason || promo?.reason || promo?.message || '';
}

function isPromoUnavailable(promo) {
  const status = String(promo?.status || '').toUpperCase();
  return promo?.eligible === false
    || promo?.usable === false
    || promo?.available === false
    || promo?.disabled === true
    || ['INACTIVE', 'EXPIRED', 'DISABLED', 'USED_UP'].includes(status);
}

function BookingStickySummary({ homestay, quote, booking, guestInfo }) {
  return (
    <section className="sticky top-0 z-20 rounded-3xl border border-[#E9E2D5] bg-white/95 p-4 shadow-lg shadow-[#2C1E15]/5 backdrop-blur">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B6784F]">Thông tin xác nhận</p>
          <h3 className="mt-1 truncate text-xl font-black text-[#2C1E15]">{homestay.name}</h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-gray-500">
            <span className="inline-flex items-center gap-1"><HiCalendarDays className="h-4 w-4 text-[#6E473B]" /> {dateText(booking.checkInDate)} - {dateText(booking.checkOutDate)}</span>
            <span className="inline-flex items-center gap-1"><HiUserGroup className="h-4 w-4 text-[#6E473B]" /> {booking.numberOfGuest} khách</span>
            <span>{booking.nights} đêm</span>
            <span>Khách: {guestInfo.customerName || 'Chưa nhập'}</span>
          </div>
        </div>
        <div className="space-y-1 text-sm font-semibold text-gray-500">
          <div className="flex justify-between"><span>Tiền phòng</span><b className="text-[#2C1E15]">{money(quote?.roomTotal)}</b></div>
          <div className="flex justify-between"><span>Dịch vụ</span><b className="text-[#2C1E15]">{money(quote?.serviceTotal)}</b></div>
          <div className="flex justify-between"><span>Giảm giá</span><b className="text-emerald-600">- {money(quote?.discountAmount)}</b></div>
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-black text-[#2C1E15]"><span>Tổng tiền</span><span>{money(quote?.finalAmount)}</span></div>
        </div>
      </div>
    </section>
  );
}

export default function BookingConfirmStep({ homestay, quote, booking, guestInfo, selectedServices, promotionCode, acceptedPolicy, onToggleService, onChangeServiceQty, onPromotionChange, onApplyPromotion, onAcceptPolicy, onPromotionNotice }) {
  const availableServices = (homestay.serviceItems || []).filter((service) => String(service.status || '').toUpperCase() === 'APPROVED');
  const selectedPromotionCode = typeof promotionCode === 'string' ? promotionCode : '';
  const appliedPromotionCode = quote?.appliedPromotionCode || '';
  const promotions = quote?.availablePromotions || [];

  const selectPromotion = (promo) => {
    const code = getPromoCode(promo);
    const selected = selectedPromotionCode === code || appliedPromotionCode === code;
    if (selected) {
      onPromotionChange('');
      onPromotionNotice?.('');
      onApplyPromotion('', { clear: true });
      return;
    }

    onPromotionChange(code);
    if (isPromoUnavailable(promo)) {
      onPromotionNotice?.(getPromoUnavailableReason(promo) || 'Mã khuyến mãi này hiện không đủ điều kiện áp dụng cho đơn đặt phòng.');
      return;
    }
    onApplyPromotion(code);
  };

  return (
    <div className="space-y-5 pb-2">
      <BookingStickySummary homestay={homestay} quote={quote} booking={booking} guestInfo={guestInfo} />

      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B6784F]">Dịch vụ đi kèm</p>
        <h3 className="mt-1 text-2xl font-black text-[#2C1E15]">Chọn thêm nếu cần</h3>
        <div className="mt-4 max-h-[320px] space-y-3 overflow-y-auto pr-1">
          {availableServices.length === 0 && <p className="text-sm font-semibold text-gray-400">Homestay chưa có dịch vụ thêm.</p>}
          {availableServices.map((service) => {
            const id = service.homestayServiceId;
            const selected = selectedServices.find((item) => item.homestayServiceId === id);
            return (
              <div key={id} className={(selected ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white') + ' rounded-2xl border p-4 transition'}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={Boolean(selected)} onChange={() => onToggleService(service)} className="mt-1 h-5 w-5 accent-[#2C3E2B]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-black text-[#2C1E15]">{service.serviceName || service.name}</p>
                      <p className="text-sm font-bold text-[#6E473B]">{money(service.price)} / lần</p>
                    </div>
                    {service.description && <p className="mt-1 text-xs font-semibold text-gray-400">{service.description}</p>}
                  </div>
                </label>
                {selected && (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-white p-2">
                    <span className="text-xs font-bold text-gray-400">Số lượng</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => onChangeServiceQty(id, selected.quantity - 1)} className="h-8 w-8 rounded-lg bg-gray-100 font-black">-</button>
                      <span className="w-8 text-center font-black">{selected.quantity}</span>
                      <button type="button" onClick={() => onChangeServiceQty(id, selected.quantity + 1)} className="h-8 w-8 rounded-lg bg-gray-100 font-black">+</button>
                      <button type="button" onClick={() => onToggleService(service)} className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500"><HiTrash /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B6784F]">Mã khuyến mãi</p>
            <h3 className="mt-1 text-xl font-black text-[#2C1E15]">Chọn mã hoặc nhập mã riêng</h3>
          </div>
          {appliedPromotionCode && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Đã áp dụng {appliedPromotionCode}</span>}
        </div>

        <div className="mt-4 space-y-2">
          {promotions.length === 0 && <p className="rounded-2xl bg-[#F7F4EC] px-4 py-3 text-sm font-bold text-gray-500">Hiện chưa có mã khuyến mãi phù hợp. Bạn vẫn có thể nhập mã thủ công nếu có.</p>}
          {promotions.map((promo) => {
            const code = getPromoCode(promo);
            const disabled = isPromoUnavailable(promo);
            const selected = selectedPromotionCode === code || appliedPromotionCode === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => selectPromotion(promo)}
                className={(selected ? 'border-[#2C3E2B] bg-[#F7F4EC]' : 'border-gray-200 bg-white hover:border-[#2C3E2B]/40') + (disabled ? ' opacity-70' : '') + ' flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition'}
              >
                <span className={(selected ? 'border-[#2C3E2B] bg-[#2C3E2B]' : 'border-gray-300 bg-white') + ' flex h-5 w-5 shrink-0 items-center justify-center rounded-full border'}>
                  {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                <HiTicket className="h-5 w-5 text-[#6E473B]" />
                <span className="min-w-0 flex-1">
                  <span className="mr-2 rounded-full bg-[#F4F1EA] px-2 py-1 text-xs font-black text-[#6E473B]">{code}</span>
                  <span className="text-sm font-bold text-[#2C1E15]">{getPromoName(promo)}</span>
                  {disabled && <span className="mt-1 block text-xs font-bold text-red-500">{getPromoUnavailableReason(promo) || 'Không đủ điều kiện áp dụng'}</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_auto] md:items-center">
          <input value={selectedPromotionCode} onChange={(event) => onPromotionChange(event.target.value.toUpperCase())} className="h-12 rounded-2xl border border-gray-200 px-4 text-sm font-black uppercase outline-none focus:border-[#2C3E2B]" placeholder="Nhập mã giảm giá" />
          <button type="button" onClick={() => onApplyPromotion(selectedPromotionCode)} className="h-12 rounded-2xl bg-[#2C3E2B] px-5 text-sm font-black text-white shadow">Áp dụng</button>
          {quote?.discountAmount > 0 && <span className="text-sm font-black text-emerald-700">Giảm {money(quote.discountAmount)}</span>}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <HiInformationCircle className="mt-1 h-5 w-5 shrink-0 text-[#B6784F]" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B6784F]">Chính sách đặt phòng</p>
            <h3 className="mt-1 text-xl font-black text-[#2C1E15]">Xác nhận trước khi thanh toán</h3>
            <ul className="mt-3 space-y-2 text-sm font-semibold text-gray-500">
              <li>- Kiểm tra đúng ngày nhận phòng, trả phòng và số khách trước khi đặt.</li>
              <li>- Chủ homestay sẽ xác nhận đơn sau khi bạn gửi yêu cầu đặt phòng.</li>
              <li>- Nếu chọn thanh toán tại chỗ, bạn thanh toán khi nhận phòng theo quy định của homestay.</li>
            </ul>
          </div>
        </div>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-[#2C3E2B]">
          <input type="checkbox" checked={acceptedPolicy} onChange={(event) => onAcceptPolicy(event.target.checked)} className="mt-1 h-5 w-5 accent-[#2C3E2B]" />
          <span>Tôi đã đọc và đồng ý với chính sách đặt phòng, giờ nhận/trả phòng và nội quy của homestay.</span>
        </label>
      </section>
    </div>
  );
}
