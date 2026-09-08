import { useEffect, useMemo, useRef, useState } from 'react';
import {
  HiCalendarDays,
  HiChevronLeft,
  HiChevronRight,
  HiChevronDown,
  HiCheck,
} from 'react-icons/hi2';

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

function pad(value) {
  return String(value).padStart(2, '0');
}

function toInputDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseInputDate(value) {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
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
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
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

function PickerDropdown({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  width = 'w-[140px]',
}) {
  return (
    <div className={`relative ${width}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex h-11 w-full items-center justify-between rounded-2xl border border-[#D9C8B8] bg-white px-4 text-sm font-black text-[#2C1E15] shadow-sm transition hover:border-[#B8845F] hover:bg-[#FFFCF7] focus:outline-none focus:ring-2 focus:ring-[#B8845F]/20"
      >
        <span>{label}</span>
        <HiChevronDown
          className={`h-5 w-5 text-[#6E473B] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-[200] max-h-64 w-full overflow-y-auto rounded-2xl border border-[#E7DDD0] bg-white p-2 shadow-2xl shadow-[#2C1E15]/15">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                  selected
                    ? 'bg-[#2C3E2B] text-white'
                    : 'text-[#2C1E15] hover:bg-[#F8F6F0]'
                }`}
              >
                <span>{option.label}</span>
                {selected && <HiCheck className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CalendarDateField({
  label,
  value,
  onChange,
  min,
  max,
  align = 'left',
  helper = '',
}) {
  const wrapperRef = useRef(null);

  const selectedDate = parseInputDate(value);
  const minDate = startOfDay(min);
  const maxDate = startOfDay(max);

  const [isOpen, setIsOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const [viewDate, setViewDate] = useState(
    () => selectedDate || minDate || maxDate || new Date()
  );

  useEffect(() => {
    const nextSelectedDate = parseInputDate(value);
    if (!nextSelectedDate) return undefined;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setViewDate(
          new Date(
            nextSelectedDate.getFullYear(),
            nextSelectedDate.getMonth(),
            1
          )
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [value]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
        setIsMonthOpen(false);
        setIsYearOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const currentDay = startOfDay(toInputDate(new Date()));

  const monthOptions = useMemo(
    () =>
      MONTH_NAMES.map((name, index) => ({
        label: name,
        value: index,
      })),
    []
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const selectedYear = selectedDate?.getFullYear() || currentYear;
    const minYear = minDate?.getFullYear() ?? selectedYear - 20;
    const maxYear = maxDate?.getFullYear() ?? selectedYear + 20;

    const startYear = Math.min(minYear, selectedYear - 10, currentYear - 5);
    const endYear = Math.max(maxYear, selectedYear + 10, currentYear + 5);

    const options = [];
    for (let year = startYear; year <= endYear; year += 1) {
      options.push({ label: String(year), value: year });
    }
    return options;
  }, [minDate, maxDate, selectedDate]);

  const canPick = (date) => {
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  };

  const pickDate = (date) => {
    if (!canPick(date)) return;
    onChange?.(toInputDate(date));
    setIsOpen(false);
    setIsMonthOpen(false);
    setIsYearOpen(false);
  };

  const pickToday = () => {
    const date = startOfDay(toInputDate(new Date()));
    if (!date || !canPick(date)) return;
    onChange?.(toInputDate(date));
    setIsOpen(false);
    setIsMonthOpen(false);
    setIsYearOpen(false);
  };

  const changeMonth = (monthIndex) => {
    setViewDate((current) => new Date(current.getFullYear(), monthIndex, 1));
    setIsMonthOpen(false);
  };

  const changeYear = (year) => {
    setViewDate((current) => new Date(year, current.getMonth(), 1));
    setIsYearOpen(false);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative space-y-1 text-xs font-black uppercase tracking-wide text-gray-500"
    >
      <span>{label}</span>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 text-left text-sm font-bold normal-case tracking-normal text-gray-800 shadow-sm outline-none transition hover:border-[#D8B48A] hover:bg-[#FFFDF9] focus:border-[#7A5547] focus:ring-2 focus:ring-[#7A5547]/10"
      >
        <span className={value ? '' : 'text-gray-400'}>
          {formatDisplayDate(value) || 'Chọn ngày'}
        </span>
        <HiCalendarDays className="h-5 w-5 text-[#7A5547]" />
      </button>

      {helper && (
        <p className="normal-case tracking-normal text-[11px] font-semibold text-gray-400">
          {helper}
        </p>
      )}

      {isOpen && (
        <div
          className={`${
            align === 'right' ? 'right-0' : 'left-0'
          } absolute top-[calc(100%+0.5rem)] z-[120] w-[360px] overflow-visible rounded-[24px] border border-[#E7DDD0] bg-white shadow-2xl shadow-[#2C1E15]/18`}
        >
          <div className="rounded-t-[24px] bg-[#F8F6F0] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setViewDate((date) => addMonths(date, -1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2C3E2B] shadow-sm ring-1 ring-gray-100 transition hover:bg-[#2C3E2B] hover:text-white"
                aria-label="Tháng trước"
              >
                <HiChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2">
                <PickerDropdown
                  label={MONTH_NAMES[viewDate.getMonth()]}
                  value={viewDate.getMonth()}
                  options={monthOptions}
                  isOpen={isMonthOpen}
                  onToggle={() => {
                    setIsMonthOpen((prev) => !prev);
                    setIsYearOpen(false);
                  }}
                  onSelect={changeMonth}
                  width="w-[140px]"
                />

                <PickerDropdown
                  label={String(viewDate.getFullYear())}
                  value={viewDate.getFullYear()}
                  options={yearOptions}
                  isOpen={isYearOpen}
                  onToggle={() => {
                    setIsYearOpen((prev) => !prev);
                    setIsMonthOpen(false);
                  }}
                  onSelect={changeYear}
                  width="w-[130px]"
                />
              </div>

              <button
                type="button"
                onClick={() => setViewDate((date) => addMonths(date, 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#2C3E2B] shadow-sm ring-1 ring-gray-100 transition hover:bg-[#2C3E2B] hover:text-white"
                aria-label="Tháng sau"
              >
                <HiChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 text-center normal-case tracking-normal">
              <p className="text-sm font-black text-[#2C1E15]">
                {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
              </p>
              <p className="text-[11px] font-bold text-gray-400">Chọn nhanh tháng và năm</p>
            </div>
          </div>

          <div className="p-4 normal-case tracking-normal">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black uppercase text-gray-400">
              {WEEKDAYS.map((weekday) => (
                <span key={weekday} className="py-1">
                  {weekday}
                </span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1">
              {days.map(({ date, key, inMonth }) => {
                const disabled = !canPick(date);
                const selected = sameDay(date, selectedDate);
                const isToday = sameDay(date, currentDay);

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    onClick={() => pickDate(date)}
                    className={
                      'h-10 rounded-xl text-sm font-black transition ' +
                      (selected
                        ? 'bg-[#2C3E2B] text-white shadow-md shadow-[#2C3E2B]/25'
                        : disabled
                        ? 'cursor-not-allowed text-gray-300 opacity-55'
                        : !inMonth
                        ? 'text-gray-300'
                        : isToday
                        ? 'bg-[#FFF4E6] text-[#B66A3C] ring-1 ring-[#F2C99A] hover:bg-[#FFE8C6]'
                        : 'text-gray-700 hover:bg-[#F8F6F0] hover:text-[#2C3E2B]')
                    }
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex justify-between border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  onChange?.('');
                  setIsOpen(false);
                  setIsMonthOpen(false);
                  setIsYearOpen(false);
                }}
                className="rounded-full bg-[#F4F1EA] px-4 py-2 text-xs font-black text-gray-500 transition hover:bg-[#EEE8DD]"
              >
                Xóa
              </button>

              <button
                type="button"
                onClick={pickToday}
                className="rounded-full bg-[#2C3E2B] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#223322]"
              >
                Hôm nay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}