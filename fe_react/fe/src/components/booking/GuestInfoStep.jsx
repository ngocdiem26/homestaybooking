import { HiCalendarDays, HiMapPin, HiMinus, HiPlus, HiUsers } from 'react-icons/hi2';

function formatDate(value) {
  if (!value) return 'Chưa chọn';
  return new Date(value + 'T00:00:00').toLocaleDateString('vi-VN');
}

export default function GuestInfoStep({ homestay, form, booking, maxGuests = 1, onChange, onBookingChange }) {
  const updateGuests = (value) => {
    const nextGuests = Math.min(maxGuests, Math.max(1, Number(value) || 1));
    onBookingChange('numberOfGuest', nextGuests);
  };

  return (
    <div className="space-y-5 pb-2">
      <section className="rounded-3xl border border-gray-100 bg-[#FAF8F3] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B6784F]">Thông tin lưu trú</p>
            <h3 className="mt-1 text-2xl font-black text-[#2C1E15]">{homestay.name}</h3>
            <p className="mt-2 flex gap-2 text-sm font-semibold text-gray-500">
              <HiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#6E473B]" />
              <span className="line-clamp-2">{homestay.address}</span>
            </p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#2C3E2B] shadow-sm">
            {booking.nights} đêm • {booking.numberOfGuest} khách
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <label className="rounded-2xl bg-white p-3 shadow-sm">
            <span className="flex items-center gap-2 text-xs font-black uppercase text-gray-400"><HiCalendarDays className="h-4 w-4 text-[#6E473B]" /> Nhận phòng</span>
            <input type="date" value={booking.checkInDate} onChange={(event) => onBookingChange('checkInDate', event.target.value)} className="mt-2 w-full bg-transparent text-sm font-black text-[#2C1E15] outline-none" />
            <p className="mt-1 text-[11px] font-semibold text-gray-400">{formatDate(booking.checkInDate)}</p>
          </label>

          <label className="rounded-2xl bg-white p-3 shadow-sm">
            <span className="flex items-center gap-2 text-xs font-black uppercase text-gray-400"><HiCalendarDays className="h-4 w-4 text-[#6E473B]" /> Trả phòng</span>
            <input type="date" value={booking.checkOutDate} onChange={(event) => onBookingChange('checkOutDate', event.target.value)} className="mt-2 w-full bg-transparent text-sm font-black text-[#2C1E15] outline-none" />
            <p className="mt-1 text-[11px] font-semibold text-gray-400">{formatDate(booking.checkOutDate)}</p>
          </label>

          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <span className="text-xs font-black uppercase text-gray-400">Số đêm</span>
            <p className="mt-3 text-lg font-black text-[#2C1E15]">{booking.nights} đêm</p>
          </div>

          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <span className="flex items-center gap-2 text-xs font-black uppercase text-gray-400"><HiUsers className="h-4 w-4 text-[#6E473B]" /> Số khách</span>
            <div className="mt-2 flex items-center justify-between rounded-xl bg-[#F4F1EA] p-1">
              <button type="button" onClick={() => updateGuests(booking.numberOfGuest - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#2C3E2B] shadow-sm"><HiMinus /></button>
              <input value={booking.numberOfGuest} onChange={(event) => updateGuests(event.target.value)} className="w-12 bg-transparent text-center text-sm font-black outline-none" inputMode="numeric" />
              <button type="button" onClick={() => updateGuests(booking.numberOfGuest + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#2C3E2B] shadow-sm"><HiPlus /></button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B6784F]">Thông tin khách hàng</p>
        <h3 className="mt-1 text-2xl font-black text-[#2C1E15]">Ai sẽ nhận phòng?</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-bold text-gray-500">Họ tên <input value={form.customerName} onChange={(e) => onChange('customerName', e.target.value)} className="h-12 w-full rounded-2xl border border-gray-200 px-4 font-semibold text-[#2C1E15] outline-none focus:border-[#2C3E2B]" placeholder="Nguyễn Văn A" /></label>
          <label className="space-y-1 text-sm font-bold text-gray-500">Email <input value={form.customerEmail} onChange={(e) => onChange('customerEmail', e.target.value)} className="h-12 w-full rounded-2xl border border-gray-200 px-4 font-semibold text-[#2C1E15] outline-none focus:border-[#2C3E2B]" placeholder="email@gmail.com" /></label>
          <label className="space-y-1 text-sm font-bold text-gray-500">Số điện thoại <input value={form.customerPhone} onChange={(e) => onChange('customerPhone', e.target.value)} className="h-12 w-full rounded-2xl border border-gray-200 px-4 font-semibold text-[#2C1E15] outline-none focus:border-[#2C3E2B]" placeholder="09xxxxxxxx" /></label>
          <label className="space-y-1 text-sm font-bold text-gray-500 md:col-span-2">Ghi chú cho host <textarea value={form.note} onChange={(e) => onChange('note', e.target.value)} rows={4} className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 font-semibold text-[#2C1E15] outline-none focus:border-[#2C3E2B]" placeholder="Ví dụ: Tôi muốn nhận phòng sớm hơn 30 phút..." /></label>
        </div>
      </section>
    </div>
  );
}