import { useEffect, useMemo, useRef, useState } from 'react';
import { HiClock, HiXMark } from 'react-icons/hi2';
import PrettySelect from '../common/PrettySelect';
const itemTypeOptions = [
  { value: 'ACTIVITY', label: 'Hoạt động' },
  { value: 'CAFE', label: 'Cà phê' },
  { value: 'MEAL', label: 'Ăn uống' },
  { value: 'SHOPPING', label: 'Mua sắm' },
  { value: 'CHECKIN', label: 'Check-in' },
  { value: 'REST', label: 'Nghỉ ngơi' },
  { value: 'FREE_TIME', label: 'Thời gian tự do' },
];

const preferredTimeOptions = [
  { value: 'ANY', label: 'AI tự chọn buổi' },
  { value: 'MORNING', label: 'Buổi sáng' },
  { value: 'AFTERNOON', label: 'Buổi chiều' },
  { value: 'EVENING', label: 'Buổi tối' },
];

function emptyPlace(totalDays = 3) {
  return {
    title: '',
    itemType: 'ACTIVITY',
    dayNumber: '',
    startTime: '',
    endTime: '',
    preferredTimeOfDay: 'ANY',
    address: '',
    latitude: '',
    longitude: '',
    note: '',
    fixedTime: false,
    totalDays,
  };
}

const fieldClass = 'rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#7A5547] focus:ring-2 focus:ring-[#7A5547]/10';
const labelClass = 'space-y-1 text-xs font-black uppercase tracking-wide text-gray-500';
const hourOptions = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'));
const minuteOptions = Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0'));

function normalizeTime(value) {
  if (!value) return '';
  const [hour = '00', minute = '00'] = String(value).split(':');
  return `${hour.padStart(2, '0').slice(-2)}:${minute.padStart(2, '0').slice(0, 2)}`;
}

function splitTime(value) {
  const normalized = normalizeTime(value);
  if (!normalized) return { hour: '08', minute: '00' };
  const [hour, minute] = normalized.split(':');
  return { hour, minute };
}

export function TimeSelect({ label, value, onChange }) {
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const normalized = normalizeTime(value);
  const selected = useMemo(() => splitTime(value), [value]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const updateTime = (nextHour, nextMinute) => onChange(`${nextHour}:${nextMinute}`);

  return (
    <label ref={wrapperRef} className={labelClass}>
      {label}
      <div className="relative normal-case tracking-normal">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className={`flex h-[58px] w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-base font-bold shadow-sm transition ${
            isOpen
              ? 'border-[#7A5547] text-[#1F2937] ring-2 ring-[#7A5547]/10'
              : 'border-gray-200 text-[#1F2937] hover:border-[#D8CABE]'
          }`}
        >
          <span className={normalized ? 'text-[#1F2937]' : 'text-gray-400'}>{normalized || '--:--'}</span>
          <span className="flex items-center gap-2">
            {normalized && (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  onChange('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    onChange('');
                  }
                }}
                className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-[#6C483A]"
                aria-label={`Xóa ${label.toLowerCase()}`}
              >
                <HiXMark className="h-4 w-4" />
              </span>
            )}
            <HiClock className="h-5 w-5 text-[#6C483A]" />
          </span>
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-[#E7DDD0] bg-white shadow-2xl shadow-[#2C1E15]/15">
            <div className="grid grid-cols-2 gap-3 p-3">
              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-gray-400">Giờ</p>
                <div className="max-h-48 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
                  {hourOptions.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => updateTime(hour, selected.minute)}
                      className={`flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-black transition ${
                        selected.hour === hour
                          ? 'bg-[#2C3E2B] text-white shadow-md shadow-[#2C3E2B]/20'
                          : 'text-gray-600 hover:bg-[#F6F1EA] hover:text-[#6C483A]'
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-black uppercase tracking-wide text-gray-400">Phút</p>
                <div className="max-h-48 space-y-1 overflow-y-auto pr-1 custom-scrollbar">
                  {minuteOptions.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => updateTime(selected.hour, minute)}
                      className={`flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-black transition ${
                        selected.minute === minute
                          ? 'bg-[#F39A18] text-white shadow-md shadow-[#F39A18]/20'
                          : 'text-gray-600 hover:bg-[#FFF4DF] hover:text-[#A85F09]'
                      }`}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#F0E7DD] bg-[#FBF8F3] px-3 py-2">
              <button type="button" onClick={() => onChange('')} className="rounded-lg px-3 py-2 text-xs font-black text-[#8B5E4D] transition hover:bg-white">
                Xóa giờ
              </button>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg bg-[#6C483A] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#7A5547]">
                Xong
              </button>
            </div>
          </div>
        )}
      </div>
    </label>
  );
}

export default function CustomPlaceInputList({ places = [], setPlaces, totalDays = 3, conflicts = {} }) {
  const updatePlace = (index, field, value) => {
    setPlaces((current) => current.map((place, placeIndex) => {
      if (placeIndex !== index) return place;
      const next = { ...place, [field]: value };
      if ((field === 'startTime' || field === 'endTime') && value) next.fixedTime = true;
      return next;
    }));
  };

  const addPlace = () => setPlaces((current) => [...current, emptyPlace(totalDays)]);
  const removePlace = (index) => setPlaces((current) => current.filter((_, placeIndex) => placeIndex !== index));

  return (
    <div className="space-y-4">
      {places.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#D8CABE] bg-white px-4 py-6 text-center text-sm font-bold text-gray-500">
          Chưa có địa điểm riêng. Bạn có thể thêm quán ăn, quán cà phê, điểm check-in hoặc khoảng nghỉ muốn đi trong lịch.
        </div>
      ) : places.map((place, index) => {
        const placeConflicts = conflicts[index] || [];
        return (
          <article key={index} className={`rounded-xl border bg-white p-4 ${placeConflicts.length ? 'border-red-200 ring-2 ring-red-50' : 'border-gray-200'}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className="font-bold text-[#6E473B]">Địa điểm #{index + 1}</h4>
              <button
                type="button"
                onClick={() => removePlace(index)}
                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
              >
                Xóa
              </button>
            </div>

            {placeConflicts.length > 0 && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {placeConflicts.map((message) => <p key={message}>{message}</p>)}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={place.title}
                onChange={(event) => updatePlace(index, 'title', event.target.value)}
                placeholder="Tên hoạt động / địa điểm"
                className={fieldClass}
              />
              <PrettySelect
                value={place.itemType}
                onChange={(value) => updatePlace(index, 'itemType', value)}
                options={itemTypeOptions}
                className="w-full normal-case tracking-normal"
                minWidth="min-w-full"
                buttonClassName="h-[58px] rounded-xl px-4 text-base font-bold text-[#1F2937]"
                menuClassName="w-full rounded-2xl"
              />
              <PrettySelect
                value={place.dayNumber}
                onChange={(value) => updatePlace(index, 'dayNumber', value)}
                options={[
                  { value: '', label: 'Để AI tự xếp ngày' },
                  ...Array.from({ length: Number(totalDays) || 1 }, (_, dayIndex) => ({ value: dayIndex + 1, label: `Ngày ${dayIndex + 1}` })),
                ]}
                className="w-full normal-case tracking-normal"
                minWidth="min-w-full"
                buttonClassName="h-[58px] rounded-xl px-4 text-base font-bold text-[#1F2937]"
                menuClassName="w-full rounded-2xl"
              />
              <PrettySelect
                value={place.preferredTimeOfDay}
                onChange={(value) => updatePlace(index, 'preferredTimeOfDay', value)}
                options={preferredTimeOptions}
                className="w-full normal-case tracking-normal"
                minWidth="min-w-full"
                buttonClassName="h-[58px] rounded-xl px-4 text-base font-bold text-[#1F2937]"
                menuClassName="w-full rounded-2xl"
              />
              <TimeSelect
                label="Giờ bắt đầu"
                value={place.startTime}
                onChange={(nextValue) => updatePlace(index, 'startTime', nextValue)}
              />
              <TimeSelect
                label="Giờ kết thúc"
                value={place.endTime}
                onChange={(nextValue) => updatePlace(index, 'endTime', nextValue)}
              />
              <input
                value={place.address}
                onChange={(event) => updatePlace(index, 'address', event.target.value)}
                placeholder="Địa chỉ / khu vực"
                className={fieldClass + ' md:col-span-2'}
              />
              <textarea
                value={place.note}
                onChange={(event) => updatePlace(index, 'note', event.target.value)}
                rows={3}
                placeholder="Ghi chú riêng"
                className={fieldClass + ' md:col-span-2'}
              />
              <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 md:col-span-2">
                <input
                  type="checkbox"
                  checked={Boolean(place.fixedTime)}
                  onChange={(event) => updatePlace(index, 'fixedTime', event.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 accent-[#2C3E2B]"
                />
                Giữ đúng ngày/giờ này khi tạo lịch trình
              </label>
            </div>
          </article>
        );
      })}

      <div className="flex justify-end border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={addPlace}
          className="rounded-xl bg-[#F39A18] px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-[#D98208]"
        >
          + Thêm địa điểm
        </button>
      </div>
    </div>
  );
}



