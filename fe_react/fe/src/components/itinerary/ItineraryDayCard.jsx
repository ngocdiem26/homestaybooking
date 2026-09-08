import ItineraryItemCard from './ItineraryItemCard';
import { fixMaybeText } from '../../utils/textEncoding';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fixMaybeText(value);
  return date.toLocaleDateString('vi-VN');
}

function minutesFromTime(value) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * 60 + Number(match[2]);
}

function sortItemsByTime(items) {
  return [...items].sort((left, right) => {
    const leftMinutes = minutesFromTime(left.startTime || left.start_time);
    const rightMinutes = minutesFromTime(right.startTime || right.start_time);
    if (leftMinutes !== rightMinutes) return leftMinutes - rightMinutes;
    return Number(left.displayOrder || left.display_order || 0) - Number(right.displayOrder || right.display_order || 0);
  });
}

export default function ItineraryDayCard({ day = {} }) {
  const dayNumber = day.dayNumber || day.day_number || 1;
  const title = fixMaybeText(day.dayTitle || day.title, `Lịch trình ngày ${dayNumber}`);
  const dateText = formatDate(day.date || day.startDate);
  const items = sortItemsByTime(Array.isArray(day.items) ? day.items : []);

  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-[#FDFCF9] px-6 py-5">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#B46A44]">Ngày {dayNumber}</p>
        <div className="mt-1 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <h3 className="font-classic text-2xl font-bold text-[#2C1E15]">{title}</h3>
          {dateText && <span className="text-sm font-bold text-gray-500">{dateText}</span>}
        </div>
      </div>

      <div className="space-y-5 p-5 md:p-6">
        {items.length > 0 ? (
          items.map((item, index) => (
            <ItineraryItemCard
              key={item.itemId || item.displayOrder || `${dayNumber}-${index}`}
              item={item}
              isLast={index === items.length - 1}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-[#F8F6F1] px-5 py-8 text-center text-sm font-bold text-gray-500">
            Ngày này chưa có hoạt động. Bạn có thể tạo lại lịch trình hoặc thêm địa điểm riêng.
          </div>
        )}
      </div>
    </section>
  );
}
