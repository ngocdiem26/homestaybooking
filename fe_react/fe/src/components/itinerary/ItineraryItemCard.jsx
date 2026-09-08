import { fixMaybeText } from '../../utils/textEncoding';

function timeRange(item) {
  const startValue = item.startTime || item.start_time;
  const endValue = item.endTime || item.end_time;
  const start = startValue ? String(startValue).slice(0, 5) : '';
  const end = endValue ? String(endValue).slice(0, 5) : '';
  if (start && end) return `${start} - ${end}`;
  return start || end || 'Linh hoạt';
}

function formatMoney(value) {
  const number = Number(value || 0);
  if (!number) return null;
  return `${new Intl.NumberFormat('vi-VN').format(number)}đ`;
}

const typeLabels = {
  ACTIVITY: 'Hoạt động',
  CAFE: 'Cà phê',
  MEAL: 'Ăn uống',
  SHOPPING: 'Mua sắm',
  CHECKIN: 'Check-in',
  REST: 'Nghỉ ngơi',
  FREE_TIME: 'Thời gian tự do',
  TRANSPORT: 'Di chuyển',
  HOMESTAY: 'Lưu trú',
  USER_CUSTOM: 'Địa điểm riêng',
  AI_SUGGESTED: 'AI gợi ý',
};

export default function ItineraryItemCard({ item = {}, isLast = false }) {
  const title = fixMaybeText(item.title, 'Hoạt động trong lịch trình');
  const location = fixMaybeText(item.locationName || item.address, 'Địa điểm linh hoạt');
  const address = fixMaybeText(item.address);
  const note = fixMaybeText(item.note);
  const transportNote = fixMaybeText(item.transportNote);
  const type = typeLabels[item.itemType] || typeLabels[item.sourceType] || fixMaybeText(item.itemType, 'Gợi ý');
  const money = formatMoney(item.estimatedCost);

  return (
    <div className="relative grid grid-cols-[42px_minmax(0,1fr)] gap-4">
      <div className="relative flex justify-center">
        <span className="mt-2 grid h-9 w-9 place-items-center rounded-full border-4 border-white bg-[#2C3E2B] text-xs font-black text-white shadow">
          {String(timeRange(item)).slice(0, 2)}
        </span>
        {!isLast && <span className="absolute top-12 h-[calc(100%-18px)] w-px bg-[#D8D2C7]" />}
      </div>

      <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#2C3E2B] px-3 py-1 text-xs font-black text-white">
                {timeRange(item)}
              </span>
              <span className="rounded-full bg-[#F4F1EA] px-3 py-1 text-xs font-bold text-[#6E473B]">
                {type}
              </span>
            </div>
            <h4 className="font-classic text-xl font-bold leading-snug text-[#2C1E15]">{title}</h4>
            <p className="mt-1 text-sm font-semibold text-gray-700">{location}</p>
            {address && address !== location && (
              <p className="mt-1 text-xs font-semibold text-gray-500">{address}</p>
            )}
          </div>
          {money && (
            <span className="shrink-0 rounded-xl bg-amber-50 px-3 py-2 text-sm font-black text-amber-700">
              {money}
            </span>
          )}
        </div>

        {(transportNote || note) && (
          <div className="mt-3 rounded-xl bg-[#F8F6F1] px-4 py-3 text-sm font-medium leading-relaxed text-gray-700">
            {transportNote && <p><b>Di chuyển:</b> {transportNote}</p>}
            {note && <p className={transportNote ? 'mt-1' : ''}>{note}</p>}
          </div>
        )}
      </article>
    </div>
  );
}

