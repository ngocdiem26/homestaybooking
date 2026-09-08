import { useEffect, useMemo, useRef, useState } from 'react';
import ActivitySuggestionSelector from './ActivitySuggestionSelector';
import CustomPlaceInputList from './CustomPlaceInputList';
import PrettySelect from '../common/PrettySelect';
import { HiCalendarDays, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { VIETNAM_CITIES, resolveCityProvince } from '../../data/vietnamCities';

const interestOptions = [
  'Thiên nhiên',
  'Nghỉ dưỡng',
  'Ẩm thực',
  'Văn hóa',
  'Chụp ảnh',
  'Gia đình',
  'Biển',
  'Núi rừng',
  'Chợ đêm',
  'Cà phê',
];

const travelStyles = [
  { value: 'RELAXING', label: 'Nghỉ dưỡng' },
  { value: 'DISCOVERY', label: 'Khám phá' },
  { value: 'FAMILY', label: 'Gia đình' },
  { value: 'ROMANTIC', label: 'Lãng mạn' },
  { value: 'NATURE', label: 'Thiên nhiên' },
  { value: 'BUDGET', label: 'Tiết kiệm' },
];

const paceOptions = [
  { value: 'SLOW', label: 'Chậm rãi' },
  { value: 'MEDIUM', label: 'Vừa phải' },
  { value: 'FAST', label: 'Dày lịch' },
];

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const MONTH_NAMES = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

function toInputDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  /*
   * Không dùng date.toISOString().slice(0, 10) ở đây.
   * toISOString() chuyển thời gian sang UTC trước khi lấy ngày.
   * Với múi giờ Việt Nam (UTC+7), một Date ở 00:00 địa phương có thể
   * trở thành 17:00 của NGÀY HÔM TRƯỚC theo UTC, làm lịch bị lệch -1 ngày.
   *
   * Calendar cần "ngày địa phương", nên lấy trực tiếp year/month/day.
   */
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function today() {
  return toInputDate(new Date());
}

function parseInputDate(value) {
  if (!value) return null;
  const date = new Date(String(value).slice(0, 10) + 'T00:00:00');
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(value) {
  const date = parseInputDate(value);
  if (!date) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDisplayDate(value) {
  const date = parseInputDate(value);
  if (!date) return '';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function sameDay(first, second) {
  return Boolean(first && second)
    && first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + totalDays) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - startOffset + 1;
    const date = new Date(year, month, dayNumber);
    return {
      date,
      key: toInputDate(date),
      inMonth: date.getMonth() === month,
    };
  });
}

const defaultForm = () => ({
  city: '',
  province: '',
  startDate: today(),
  totalDays: 2,
  travelerCount: 2,
  travelStyle: 'RELAXING',
  pace: 'MEDIUM',
  note: '',
});

const defaultInterests = ['Nghỉ dưỡng'];
const MIN_CUSTOM_PLACE_GAP_MINUTES = 15;
function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function timeToMinutes(value) {
  if (!value) return null;
  const [hour, minute] = String(value).split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

function formatClock(minutes) {
  const safeMinutes = Math.max(0, minutes || 0);
  const hour = String(Math.floor(safeMinutes / 60)).padStart(2, '0');
  const minute = String(safeMinutes % 60).padStart(2, '0');
  return `${hour}:${minute}`;
}

function cleanCustomPlace(place) {
  const title =
    place.title?.trim() ||
    place.placeName?.trim();

  const hasExactTime = Boolean(
    place.startTime || place.endTime,
  );

  const startMinutes =
    timeToMinutes(place.startTime);

  const endMinutes =
    timeToMinutes(place.endTime);

  const durationMinutes =
    startMinutes !== null &&
    endMinutes !== null &&
    endMinutes > startMinutes
      ? endMinutes - startMinutes
      : null;

  return {
    title,
    name: title,
    itemType: place.itemType || 'ACTIVITY',
    dayNumber: toNumberOrNull(place.dayNumber),
    startTime: place.startTime || null,
    endTime: place.endTime || null,
    durationMinutes,
    preferredTimeOfDay:
      place.preferredTimeOfDay || 'ANY',
    address: place.address?.trim() || null,
    latitude: null,
    longitude: null,
    note: place.note?.trim() || null,
    fixedTime: Boolean(
      place.fixedTime || hasExactTime,
    ),
  };
}

function buildDestinationLabel(city, province) {
  if (city && province && city !== province) return `${city}, ${province}`;
  return city || province || '';
}

// function getPlaceWindow(place, index) {
//   const dayNumber = toNumberOrNull(place.dayNumber);
//   const start = timeToMinutes(place.startTime);
//   if (start === null) return null;
//   const end = timeToMinutes(place.endTime) ?? start + 60;
//   return {
//     index,
//     dayNumber,
//     start,
//     end,
//     title: place.title?.trim() || `Địa điểm #${index + 1}`,
//   };
// }

// function getConflictDayText(left, right) {
//   if (left.dayNumber && right.dayNumber) return `ngày ${left.dayNumber}`;
//   if (!left.dayNumber && !right.dayNumber) return 'ngày AI tự xếp';
//   return `ngày ${left.dayNumber || right.dayNumber} nếu AI xếp cùng ngày`;
// }

// function buildConflictMessages(places) {
//   const messages = {};
//   const windows = places.map(getPlaceWindow).filter(Boolean);

//   windows.forEach((window) => {
//     if (window.end <= window.start) {
//       messages[window.index] = [...(messages[window.index] || []), 'Giờ kết thúc phải sau giờ bắt đầu.'];
//     }
//   });


function addConflictMessage(messages, index, message) {
  const currentMessages = messages[index] || [];

  if (!currentMessages.includes(message)) {
    messages[index] = [...currentMessages, message];
  }
}

function getPlaceWindow(place, index, messages) {
  const dayNumber = toNumberOrNull(place.dayNumber);
  const start = timeToMinutes(place.startTime);
  const enteredEnd = timeToMinutes(place.endTime);

  const title =
    place.title?.trim() ||
    `Địa điểm #${index + 1}`;

  // Có giờ kết thúc nhưng chưa nhập giờ bắt đầu.
  if (start === null && enteredEnd !== null) {
    addConflictMessage(
      messages,
      index,
      'Vui lòng nhập giờ bắt đầu.',
    );

    return null;
  }

  // Không nhập giờ thì để AI tự sắp xếp.
  if (start === null) {
    return null;
  }

  // Đã nhập giờ cụ thể thì phải chọn ngày.
  if (!dayNumber) {
    addConflictMessage(
      messages,
      index,
      'Bạn đã nhập giờ cụ thể. Vui lòng chọn ngày để hệ thống kiểm tra lịch trình.',
    );
  }

  // Nếu chưa có giờ kết thúc, tạm tính thời lượng 60 phút.
  const end = enteredEnd ?? start + 60;

  if (end <= start) {
    addConflictMessage(
      messages,
      index,
      'Giờ kết thúc phải sau giờ bắt đầu.',
    );

    return null;
  }

  return {
    index,
    dayNumber,
    start,
    end,
    title,
  };
}

function buildConflictMessages(places) {
  const messages = {};

  const windows = places
    .map((place, index) =>
      getPlaceWindow(place, index, messages),
    )
    .filter(Boolean);

  for (
    let leftIndex = 0;
    leftIndex < windows.length;
    leftIndex += 1
  ) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < windows.length;
      rightIndex += 1
    ) {
      const left = windows[leftIndex];
      const right = windows[rightIndex];

      // Chỉ kiểm tra các hoạt động cùng ngày cụ thể.
      if (
        !left.dayNumber ||
        !right.dayNumber ||
        left.dayNumber !== right.dayNumber
      ) {
        continue;
      }

      const overlaps =
        left.start < right.end &&
        right.start < left.end;

      if (overlaps) {
        const conflictStart = Math.max(
          left.start,
          right.start,
        );

        const conflictEnd = Math.min(
          left.end,
          right.end,
        );

        const message =
          `"${left.title}" và "${right.title}" bị trùng giờ ` +
          `trong ngày ${left.dayNumber} ` +
          `(${formatClock(conflictStart)}–${formatClock(conflictEnd)}).`;

        addConflictMessage(
          messages,
          left.index,
          message,
        );

        addConflictMessage(
          messages,
          right.index,
          message,
        );

        continue;
      }

      // Xác định hoạt động nào diễn ra trước.
      const first =
        left.end <= right.start ? left : right;

      const second =
        first === left ? right : left;

      const gapMinutes =
        second.start - first.end;

      if (
        gapMinutes >= 0 &&
        gapMinutes < MIN_CUSTOM_PLACE_GAP_MINUTES
      ) {
        const message =
          `Cần ít nhất ${MIN_CUSTOM_PLACE_GAP_MINUTES} phút ` +
          `di chuyển/nghỉ giữa "${first.title}" và ` +
          `"${second.title}". Hiện tại chỉ có ` +
          `${gapMinutes} phút.`;

        addConflictMessage(
          messages,
          first.index,
          message,
        );

        addConflictMessage(
          messages,
          second.index,
          message,
        );
      }
    }
  }

  return messages;
}
function CalendarDateField({ label, value, onChange, min, align = 'left' }) {
  const wrapperRef = useRef(null);
  const selectedDate = parseInputDate(value);
  const minDate = startOfDay(min);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selectedDate || minDate || new Date());

  useEffect(() => {
    const nextSelectedDate = parseInputDate(value);
    if (!nextSelectedDate) return undefined;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setViewDate(new Date(nextSelectedDate.getFullYear(), nextSelectedDate.getMonth(), 1));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [value]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const currentDay = startOfDay(today());

  const canPick = (date, inMonth) => {
    if (!inMonth) return false;
    if (minDate && date < minDate) return false;
    return true;
  };

  const pickDate = (date, inMonth) => {
    if (!canPick(date, inMonth)) return;
    onChange(toInputDate(date));
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative space-y-1 text-xs font-black uppercase tracking-wide text-gray-500">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold normal-case tracking-normal text-gray-800 shadow-sm outline-none transition hover:border-[#D8B48A] hover:bg-[#FFFDF9] focus:border-[#7A5547] focus:ring-2 focus:ring-[#7A5547]/10"
      >
        <span className={value ? '' : 'text-gray-400'}>{formatDisplayDate(value) || 'Chọn ngày'}</span>
        <HiCalendarDays className="h-5 w-5 text-[#7A5547]" />
      </button>

      {isOpen && (
        <div className={(align === 'right' ? 'right-0' : 'left-0') + ' absolute top-[calc(100%+0.5rem)] z-50 w-[320px] overflow-hidden rounded-[24px] border border-[#E7DDD0] bg-white shadow-2xl shadow-[#2C1E15]/18'}>
          <div className="bg-[#F8F6F0] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => setViewDate((date) => addMonths(date, -1))} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2C3E2B] shadow-sm ring-1 ring-gray-100 transition hover:bg-[#2C3E2B] hover:text-white" aria-label="Tháng trước">
                <HiChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center normal-case tracking-normal">
                <p className="text-sm font-black text-[#2C1E15]">{MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}</p>
                <p className="text-[11px] font-bold text-gray-400">Chọn ngày bắt đầu</p>
              </div>
              <button type="button" onClick={() => setViewDate((date) => addMonths(date, 1))} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2C3E2B] shadow-sm ring-1 ring-gray-100 transition hover:bg-[#2C3E2B] hover:text-white" aria-label="Tháng sau">
                <HiChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-4 normal-case tracking-normal">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black uppercase text-gray-400">
              {WEEKDAYS.map((weekday) => <span key={weekday} className="py-1">{weekday}</span>)}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {days.map(({ date, key, inMonth }) => {
                const disabled = !canPick(date, inMonth);
                const selected = sameDay(date, selectedDate);
                const isToday = sameDay(date, currentDay);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    onClick={() => pickDate(date, inMonth)}
                    className={
                      'h-9 rounded-xl text-xs font-black transition ' +
                      (selected
                        ? 'bg-[#2C3E2B] text-white shadow-md shadow-[#2C3E2B]/25'
                        : disabled
                          ? 'cursor-not-allowed text-gray-300 opacity-55'
                          : isToday
                            ? 'bg-[#FFF4E6] text-[#B66A3C] ring-1 ring-[#F2C99A] hover:bg-[#FFE8C6]'
                            : 'text-gray-600 hover:bg-[#F8F6F0] hover:text-[#2C3E2B]')
                    }
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
              <button type="button" onClick={() => { onChange(today()); setIsOpen(false); }} className="rounded-full bg-[#2C3E2B] px-3 py-1.5 text-xs font-black text-white shadow-sm transition hover:bg-[#223322]">
                Hôm nay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function SectionTitle({ title, hint }) {
  return (
    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <h3 className="font-classic text-xl font-bold text-[#2C1E15]">{title}</h3>
      {hint && <p className="text-xs font-semibold text-gray-400">{hint}</p>}
    </div>
  );
}

const inputClass = 'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold normal-case tracking-normal text-gray-800 outline-none transition focus:border-[#7A5547] focus:ring-2 focus:ring-[#7A5547]/10';
const labelClass = 'space-y-1 text-xs font-black uppercase tracking-wide text-gray-500';

export default function AiItineraryForm({
  activities = [],
  selectedActivityIds = [],
  destinationLabel = '',
  loadingSuggest = false,
  loadingGenerate = false,
  onSuggest,
  onToggleActivity,
  onGenerate,
  resetVersion = 0,
}) {
  const [form, setForm] = useState(defaultForm);
  const [interests, setInterests] = useState(defaultInterests);
  const [customPlaces, setCustomPlaces] = useState([]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setForm(defaultForm());
      setInterests(defaultInterests);
      setCustomPlaces([]);
    });

    return () => {
      cancelled = true;
    };
  }, [resetVersion]);

  const resolvedDestination = useMemo(() => {
    const resolved = resolveCityProvince(form.city);
    return {
      city: resolved.city || form.city.trim(),
      province: form.province.trim() || resolved.province || '',
    };
  }, [form.city, form.province]);

  const placeConflicts = useMemo(() => buildConflictMessages(customPlaces), [customPlaces]);
  const hasPlaceConflicts = Object.keys(placeConflicts).length > 0;
  const effectiveDestinationLabel = buildDestinationLabel(resolvedDestination.city, resolvedDestination.province);
  const hasDestination = Boolean(resolvedDestination.city || resolvedDestination.province);
  const canSubmit = hasDestination && Number(form.totalDays) > 0 && Number(form.travelerCount) > 0 && !hasPlaceConflicts;

  const updateField = (field, value) => {
    setForm((current) => {
      if (field !== 'city') return { ...current, [field]: value };
      const resolved = resolveCityProvince(value);
      return {
        ...current,
        city: value,
        province: resolved.province || current.province,
      };
    });
  };

  const toggleInterest = (interest) => {
    setInterests((current) => (
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    ));
  };

  const buildSuggestParams = () => ({
    destination: resolvedDestination.city || resolvedDestination.province,
    city: resolvedDestination.city,
    province: resolvedDestination.province,
    interests,
    travelStyle: form.travelStyle,
    pace: form.pace,
    totalDays: Number(form.totalDays) || 1,
    travelerCount: Number(form.travelerCount) || 1,
  });

  const handleSuggest = () => {
    if (!hasDestination) return;
    onSuggest?.(buildSuggestParams());
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    const customPlacesPayload = customPlaces
      .map(cleanCustomPlace)
      .filter((place) => place.title);

    onGenerate?.({
      destinationKeyword: resolvedDestination.city || resolvedDestination.province || null,
      city: resolvedDestination.city || null,
      province: resolvedDestination.province || null,
      startDate: form.startDate || null,
      totalDays: Number(form.totalDays) || 1,
      travelerCount: Number(form.travelerCount) || 1,
      travelStyle: form.travelStyle,
      pace: form.pace,
      note: form.note?.trim() || null,
      interests,
      activityIds: selectedActivityIds,
      customPlaces: customPlacesPayload,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="divide-y divide-gray-100 px-5 lg:px-6">
        <section className="py-5">
          <SectionTitle title="Thông tin chuyến đi" hint="Nhập điểm đến, ngày đi và nhịp di chuyển" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className={labelClass}>
              Thành phố
              <input
                list="vietnam-city-options"
                value={form.city}
                onChange={(event) => updateField('city', event.target.value)}
                placeholder="Ví dụ: Đà Lạt"
                className={inputClass}
              />
              <datalist id="vietnam-city-options">
                {VIETNAM_CITIES.map((city) => <option key={city} value={city} />)}
              </datalist>
            </label>

            <label className={labelClass}>
              Tỉnh thành
              <input
                value={form.province}
                onChange={(event) => updateField('province', event.target.value)}
                placeholder="Ví dụ: Lâm Đồng"
                className={inputClass}
              />
            </label>

            <CalendarDateField
              label="Ngày bắt đầu"
              min={today()}
              value={form.startDate}
              onChange={(value) => updateField('startDate', value)}
              align="right"
            />

            <label className={labelClass}>
              Số ngày
              <input
                type="number"
                min="1"
                max="10"
                value={form.totalDays}
                onChange={(event) => updateField('totalDays', event.target.value)}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Số khách
              <input
                type="number"
                min="1"
                max="30"
                value={form.travelerCount}
                onChange={(event) => updateField('travelerCount', event.target.value)}
                className={inputClass}
              />
            </label>


            <label className={labelClass}>
              Phong cách
              <PrettySelect
                value={form.travelStyle}
                onChange={(value) => updateField('travelStyle', value)}
                options={travelStyles}
                className="w-full normal-case tracking-normal"
                minWidth="min-w-full"
                buttonClassName="h-14 rounded-2xl px-5 text-base font-bold text-[#1F2937]"
                menuClassName="w-full rounded-2xl"
              />
            </label>


            <label className={labelClass}>
              Nhịp độ
              <PrettySelect
                value={form.pace}
                onChange={(value) => updateField('pace', value)}
                options={paceOptions}
                className="w-full normal-case tracking-normal"
                minWidth="min-w-full"
                buttonClassName="h-14 rounded-2xl px-5 text-base font-bold text-[#1F2937]"
                menuClassName="w-full rounded-2xl"
              />
            </label>

            <label className={labelClass + ' md:col-span-2 xl:col-span-3'}>
              Ghi chú riêng
              <textarea
                value={form.note}
                onChange={(event) => updateField('note', event.target.value)}
                rows={3}
                placeholder="Ví dụ: đi cùng trẻ nhỏ, thích quán cà phê yên tĩnh, không muốn lịch quá dày..."
                className={inputClass + ' bg-[#FAF7F2]'}
              />
            </label>
          </div>
        </section>

        <section className="py-5">
          <SectionTitle title="Sở thích ưu tiên" hint="Chọn vài mục để AI hiểu gu của bạn" />
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-4 py-2 text-xs font-black transition ${selected ? 'bg-[#2C3E2B] text-white shadow-sm' : 'border border-gray-200 bg-white text-gray-600 hover:border-[#7A5547] hover:text-[#6C483A]'}`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </section>

        <section className="my-5 rounded-2xl bg-[#FAF7F2] p-4 ring-1 ring-[#EFE7DD]">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle title="Hoạt động gợi ý" hint="Chọn hoạt động muốn ưu tiên trong lịch" />
            <button
              type="button"
              onClick={handleSuggest}
              disabled={!hasDestination || loadingSuggest}
              className="w-full rounded-xl bg-[#F39A18] px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#D98208] disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
            >
              {loadingSuggest ? 'Đang gợi ý...' : 'Gợi ý hoạt động'}
            </button>
          </div>

          <ActivitySuggestionSelector
            activities={activities}
            selectedActivityIds={selectedActivityIds}
            destinationLabel={destinationLabel || effectiveDestinationLabel}
            loading={loadingSuggest}
            onToggle={onToggleActivity}
          />
        </section>

        <section className="my-5 rounded-2xl bg-[#FAF7F2] p-4 ring-1 ring-[#EFE7DD]">
          <SectionTitle title="Địa điểm riêng" hint="Hoạt động cùng ngày phải cách nhau ít nhất 15 phút" />
          <CustomPlaceInputList
            places={customPlaces}
            setPlaces={setCustomPlaces}
            totalDays={Number(form.totalDays) || 1}
            conflicts={placeConflicts}
          />
        </section>
      </div>

      <div className="border-t border-gray-100 bg-white px-5 py-4 lg:px-6">
        {hasPlaceConflicts && (
          <p className="mb-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            Có địa điểm riêng bị trùng hoặc sai thời gian. Vui lòng chỉnh lại trước khi tạo lịch trình.
          </p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-bold text-gray-500">Hoàn tất thông tin rồi bấm tạo lịch trình.</p>
          <button
            type="submit"
            disabled={!canSubmit || loadingGenerate}
            className="rounded-xl bg-[#7A5547] px-7 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#6C483A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingGenerate ? 'Đang tạo lịch trình...' : 'Tạo lịch trình bằng AI'}
          </button>
        </div>
      </div>
    </form>
  );
}










