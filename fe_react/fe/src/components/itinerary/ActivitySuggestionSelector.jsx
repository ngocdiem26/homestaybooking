import { useState } from 'react';
import { HiOutlineClock } from 'react-icons/hi2';
import { fixMaybeText } from '../../utils/textEncoding';

function formatCost(activity) {
  const min = Number(activity.minPrice || activity.price || activity.estimatedCost || activity.estimatedCostMin || 0);
  const max = Number(activity.maxPrice || activity.estimatedCostMax || 0);
  if (!min && !max) return 'Chưa có giá tham khảo';
  const formatter = new Intl.NumberFormat('vi-VN');
  if (min && max && min !== max) return `${formatter.format(min)}đ - ${formatter.format(max)}đ`;
  return `${formatter.format(min || max)}đ`;
}

function activityImage(activity) {
  return activity.thumbnailUrl || activity.imageUrl || activity.activityImage || activity.coverImage || activity.photoUrl || '';
}

function formatActivityTime(value) {
  if (!value) return '';

  const text = String(value).trim();

  // LocalTime từ Spring Boot thường có dạng HH:mm:ss.
  const match = text.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return text;

  return `${String(match[1]).padStart(2, '0')}:${match[2]}`;
}

function formatActivityHours(activity) {
  const openingTime = formatActivityTime(
    activity.openingTime || activity.opening_time,
  );
  const closingTime = formatActivityTime(
    activity.closingTime || activity.closing_time,
  );

  if (openingTime && closingTime) {
    return `${openingTime} – ${closingTime}`;
  }

  if (openingTime) {
    return `Mở từ ${openingTime}`;
  }

  if (closingTime) {
    return `Đóng lúc ${closingTime}`;
  }

  return 'Chưa cập nhật giờ';
}

function formatDuration(activity) {
  const duration = Number(
    activity.recommendedDurationMinutes
      || activity.recommended_duration_minutes
      || 0,
  );

  if (!Number.isFinite(duration) || duration <= 0) {
    return '';
  }

  if (duration < 60) {
    return `~${duration} phút`;
  }

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (!minutes) {
    return `~${hours} giờ`;
  }

  return `~${hours} giờ ${minutes} phút`;
}

export default function ActivitySuggestionSelector({
  activities = [],
  selectedActivityIds = [],
  destinationLabel,
  loading = false,
  onToggle,
}) {
  const [expandedIds, setExpandedIds] = useState([]);
  const label = fixMaybeText(destinationLabel, 'khu vực bạn chọn');

  const toggleExpanded = (id) => {
    setExpandedIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  };

  return (
    <div className="rounded-2xl border border-[#EFE7DD] bg-[#FAF7F2] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-gray-500">Gợi ý cho <span className="text-[#2C3E2B]">{label}</span></p>
        {selectedActivityIds.length > 0 && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
            Đã chọn {selectedActivityIds.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-5 text-center text-sm font-bold text-amber-700">
          Đang tìm hoạt động phù hợp...
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#D8CABE] bg-white px-4 py-6 text-center">
          <p className="font-bold text-[#2C1E15]">Chưa có hoạt động gợi ý.</p>
          <p className="mt-1 text-xs font-semibold text-gray-500">Nhập điểm đến rồi bấm gợi ý, hoặc thêm địa điểm riêng bên dưới.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activities.map((activity) => {
            const id = activity.activityId || activity.id;
            const selected = selectedActivityIds.includes(id);
            const expanded = expandedIds.includes(id);
            const name = fixMaybeText(activity.activityName || activity.name, 'Hoạt động trải nghiệm');
            const city = fixMaybeText(activity.city || activity.province);
            const desc = fixMaybeText(activity.shortDescription || activity.description);
            const imageUrl = activityImage(activity);
            const hoursLabel = formatActivityHours(activity);
            const durationLabel = formatDuration(activity);
            const canToggleDescription = desc.length > 96;

            return (
              <article
                key={id}
                className={`overflow-hidden rounded-xl border bg-white transition hover:-translate-y-0.5 hover:shadow-md ${selected ? 'border-[#2C3E2B] ring-2 ring-emerald-100' : 'border-gray-200'}`}
              >
                <div className="relative aspect-[16/9] bg-[#EDE7DC]">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 via-[#F4F1EA] to-emerald-50 px-4 text-center text-sm font-black text-[#6E473B]">
                      {name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggle(id)}
                    className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border text-sm font-black shadow-sm transition ${selected ? 'border-[#2C3E2B] bg-[#2C3E2B] text-white' : 'border-white/80 bg-white text-gray-500 hover:text-[#2C3E2B]'}`}
                    aria-label={selected ? 'Bỏ chọn hoạt động' : 'Chọn hoạt động'}
                  >
                    {selected ? '✓' : '+'}
                  </button>
                </div>

                <div className="p-4">
                  <h4 className="line-clamp-2 font-bold leading-6 text-[#2C1E15]">{name}</h4>
                  {city && <p className="mt-1 text-xs font-black uppercase text-[#B46A44]">{city}</p>}

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ${
                        hoursLabel === 'Chưa cập nhật giờ'
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-sky-50 text-sky-700 ring-1 ring-sky-100'
                      }`}
                      title="Giờ hoạt động"
                    >
                      <HiOutlineClock className="h-4 w-4 shrink-0" />
                      {hoursLabel}
                    </span>

                    {durationLabel && (
                      <span
                        className="inline-flex items-center rounded-full bg-[#F4F1EA] px-2.5 py-1 text-[11px] font-black text-[#6E5B50]"
                        title="Thời lượng tham quan khuyến nghị"
                      >
                        {durationLabel}
                      </span>
                    )}
                  </div>

                  {desc && (
                    <div className="mt-3">
                      <p className={`${expanded ? '' : 'line-clamp-2'} text-sm font-semibold leading-6 text-gray-600`}>{desc}</p>
                      {canToggleDescription && (
                        <button
                          type="button"
                          onClick={() => toggleExpanded(id)}
                          className="mt-1 text-xs font-black text-[#7A5547] transition hover:text-[#6C483A]"
                        >
                          {expanded ? 'Thu lại' : 'Mở rộng'}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                    <p className="text-xs font-black text-[#6E473B]">{formatCost(activity)}</p>
                    <button
                      type="button"
                      onClick={() => onToggle(id)}
                      className={`rounded-lg px-3 py-2 text-xs font-black transition ${selected ? 'bg-emerald-50 text-emerald-700' : 'bg-[#F39A18] text-white hover:bg-[#D98208]'}`}
                    >
                      {selected ? 'Đã chọn' : 'Chọn'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}


