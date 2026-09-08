import { useEffect, useMemo, useState } from 'react';
import {
  HiArrowPath,
  HiCheckCircle,
  HiChevronLeft,
  HiChevronRight,
  HiHomeModern,
  HiInformationCircle,
  HiLockClosed,
  HiWrenchScrewdriver,
  HiXMark,
} from 'react-icons/hi2';
import HostLayout from '../../layouts/HostLayout';
import ManagementBackButton from '../../components/common/ManagementBackButton';
import PrettySelect from '../../components/common/PrettySelect';
import CalendarDateField from '../../components/common/CalendarDateField';
import { getHostHomestays } from '../../services/hostHomestayService';
import { getHostAvailability, updateHostAvailability } from '../../services/hostAvailabilityService';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const STATUS_META = {
  AVAILABLE: {
    label: 'Còn trống',
    dot: 'bg-[#5E9257]',
    tile: 'border-[#D4E6CC] bg-[#E5EFDF] text-[#3D6B3F]',
    tag: 'bg-white/65 text-[#3D6B3F]',
    button: 'border-[#5E9257] bg-[#E5EFDF] text-[#3D6B3F]',
    icon: HiCheckCircle,
  },
  BOOKED: {
    label: 'Đã đặt',
    dot: 'bg-[#4A6FA3]',
    tile: 'border-[#D0DCEB] bg-[#E2E9F3] text-[#33507A]',
    tag: 'bg-white/65 text-[#33507A]',
    button: 'border-[#D0DCEB] bg-[#F6F8FB] text-[#33507A]',
    icon: HiHomeModern,
  },
  BLOCKED: {
    label: 'Tạm khóa',
    dot: 'bg-[#C15C3E]',
    tile: 'border-[#EBCBBC] bg-[#F4E3DD] text-[#9B4530]',
    tag: 'bg-white/70 text-[#9B4530]',
    button: 'border-[#C15C3E] bg-[#F4E3DD] text-[#9B4530]',
    icon: HiLockClosed,
  },
  MAINTENANCE: {
    label: 'Bảo trì',
    dot: 'bg-[#C7972F]',
    tile: 'border-[#EAD9AA] bg-[#F6EEDA] text-[#8A6420]',
    tag: 'bg-white/70 text-[#8A6420]',
    button: 'border-[#C7972F] bg-[#F6EEDA] text-[#8A6420]',
    icon: HiWrenchScrewdriver,
  },
};

const UPDATE_STATUS_OPTIONS = ['AVAILABLE', 'BLOCKED', 'MAINTENANCE'];
const LEGEND_STATUS_OPTIONS = ['AVAILABLE', 'BOOKED', 'BLOCKED', 'MAINTENANCE'];

function pad(value) {
  return String(value).padStart(2, '0');
}

function toInputDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(value, amount) {
  const base = value instanceof Date ? new Date(value) : parseDate(value);
  if (!base) return '';
  base.setDate(base.getDate() + amount);
  return toInputDate(base);
}

function startOfWeek(value) {
  const date = value instanceof Date ? new Date(value) : parseDate(value);
  if (!date) return toInputDate(new Date());
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return toInputDate(date);
}

function startOfMonth(value) {
  const date = value instanceof Date ? new Date(value) : parseDate(value);
  const safeDate = date || new Date();
  return toInputDate(new Date(safeDate.getFullYear(), safeDate.getMonth(), 1));
}

function endOfMonth(value) {
  const date = value instanceof Date ? new Date(value) : parseDate(value);
  const safeDate = date || new Date();
  return toInputDate(new Date(safeDate.getFullYear(), safeDate.getMonth() + 1, 0));
}

function addMonths(value, amount) {
  const date = value instanceof Date ? new Date(value) : parseDate(value);
  const safeDate = date || new Date();
  return new Date(safeDate.getFullYear(), safeDate.getMonth() + amount, 1);
}

function todayInput() {
  return toInputDate(new Date());
}

function compareDate(first, second) {
  return String(first || '').localeCompare(String(second || ''));
}

function isInRange(date, start, end) {
  if (!date || !start || !end) return false;
  const low = compareDate(start, end) <= 0 ? start : end;
  const high = compareDate(start, end) <= 0 ? end : start;
  return compareDate(date, low) >= 0 && compareDate(date, high) <= 0;
}

function normalizeRange(start, end) {
  if (!start) return { startDate: '', endDate: '' };
  if (!end) return { startDate: start, endDate: start };
  return compareDate(start, end) <= 0
    ? { startDate: start, endDate: end }
    : { startDate: end, endDate: start };
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return '--';
  return date.toLocaleDateString('vi-VN');
}

function formatMonth(value) {
  const date = parseDate(value) || new Date();
  return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

function getDayLabel(value) {
  const date = parseDate(value);
  if (!date) return '';
  return WEEKDAYS[(date.getDay() + 6) % 7];
}

function buildMonthCells(fromDate) {
  const viewDate = parseDate(fromDate) || new Date();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const day = index - startOffset + 1;
    const date = new Date(year, month, day);
    return {
      key: toInputDate(date),
      date: toInputDate(date),
      inMonth: date.getMonth() === month,
      dayNumber: date.getDate(),
      weekday: WEEKDAYS[(date.getDay() + 6) % 7],
    };
  });
}

function buildWeekCells(fromDate) {
  const start = startOfWeek(fromDate);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    return {
      key: date,
      date,
      inMonth: true,
      dayNumber: parseDate(date)?.getDate() || '',
      weekday: getDayLabel(date),
    };
  });
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const tone = toast.type === 'error'
    ? 'border-red-200 bg-red-50 text-red-600'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return (
    <div className={`fixed right-6 top-24 z-[10000] flex w-[min(430px,calc(100vw-2rem))] items-start gap-3 rounded-2xl border px-5 py-4 text-sm font-black shadow-2xl shadow-[#2C1E15]/20 ${tone}`}>
      <HiInformationCircle className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="leading-6">{toast.message}</p>
      <button type="button" onClick={onClose} className="ml-auto rounded-full p-1 hover:bg-white/70">
        <HiXMark className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function HostAvailability() {
  const [homestays, setHomestays] = useState([]);
  const [selectedHomeId, setSelectedHomeId] = useState('');
  const [fromDate, setFromDate] = useState(startOfMonth(todayInput()));
  const [toDate, setToDate] = useState(endOfMonth(todayInput()));
  const [viewMode, setViewMode] = useState('MONTH');
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const selectedRange = normalizeRange(rangeStart, rangeEnd);

  const homestayOptions = useMemo(
    () => homestays.map((item) => ({
      value: item.homeId,
      label: `${item.name} · ${item.city || item.province || 'Chưa rõ khu vực'}`,
    })),
    [homestays]
  );

  const selectedHomestay = useMemo(
    () => homestays.find((item) => String(item.homeId) === String(selectedHomeId)),
    [homestays, selectedHomeId]
  );

  const dayMap = useMemo(() => {
    const result = new Map();
    (calendar?.days || []).forEach((day) => result.set(String(day.date).slice(0, 10), day));
    return result;
  }, [calendar]);

  const calendarCells = useMemo(
    () => (viewMode === 'MONTH' ? buildMonthCells(fromDate) : buildWeekCells(fromDate)),
    [fromDate, viewMode]
  );

  const rangeHasBookedDay = useMemo(() => {
    if (!calendar?.days?.length || !selectedRange.startDate) return false;
    return calendar.days.some((day) => Boolean(day.booked) && isInRange(String(day.date).slice(0, 10), selectedRange.startDate, selectedRange.endDate));
  }, [calendar, selectedRange.startDate, selectedRange.endDate]);

  const showToast = (message, type = 'success') => setToast({ id: Date.now(), message, type });

  const loadCalendar = async ({ silent = false } = {}) => {
    if (!selectedHomeId) return;
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await getHostAvailability({ homeId: selectedHomeId, fromDate, toDate });
      setCalendar(data);
    } catch (err) {
      setError(err.message || 'Không tải được lịch trống.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    async function loadHomestays() {
      setLoading(true);
      setError('');
      try {
        const data = await getHostHomestays();
        if (!mounted) return;
        setHomestays(data);
        if (data.length > 0) setSelectedHomeId((current) => current || data[0].homeId);
      } catch (err) {
        if (mounted) setError(err.message || 'Không tải được danh sách homestay.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadHomestays();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!selectedHomeId) return;
      setLoading(true);
      setError('');
      try {
        const data = await getHostAvailability({ homeId: selectedHomeId, fromDate, toDate });
        if (mounted) setCalendar(data);
      } catch (err) {
        if (mounted) setError(err.message || 'Không tải được lịch trống.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [selectedHomeId, fromDate, toDate]);

  const refresh = async () => {
    await loadCalendar();
    showToast('Đã làm mới lịch homestay.');
  };

  const setThisWeek = () => {
    const start = startOfWeek(todayInput());
    setViewMode('WEEK');
    setFromDate(start);
    setToDate(addDays(start, 6));
    setRangeStart('');
    setRangeEnd('');
  };

  const changeViewMode = (mode) => {
    setViewMode(mode);
    const base = parseDate(fromDate) || new Date();
    if (mode === 'MONTH') {
      setFromDate(startOfMonth(base));
      setToDate(endOfMonth(base));
    } else {
      const start = startOfWeek(base);
      setFromDate(start);
      setToDate(addDays(start, 6));
    }
    setRangeStart('');
    setRangeEnd('');
  };

  const changeMonth = (amount) => {
    const next = addMonths(fromDate, amount);
    if (viewMode === 'MONTH') {
      setFromDate(startOfMonth(next));
      setToDate(endOfMonth(next));
    } else {
      const start = startOfWeek(next);
      setFromDate(start);
      setToDate(addDays(start, 6));
    }
    setRangeStart('');
    setRangeEnd('');
  };

  const selectDay = (day) => {
    const date = String(day.date).slice(0, 10);
    if (!date || day.outside) return;
    if (day.booked || day.status === 'BOOKED') {
      showToast(`Ngày ${formatDate(date)} đã có khách đặt, không thể chỉnh trạng thái.`, 'error');
      return;
    }
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd('');
      return;
    }
    setRangeEnd(date);
  };

  const applyStatus = async () => {
    if (!selectedHomeId || !selectedRange.startDate) {
      showToast('Vui lòng chọn ngày cần cập nhật.', 'error');
      return;
    }
    if (rangeHasBookedDay) {
      showToast('Khoảng ngày đang chọn có ngày đã đặt. Vui lòng chọn lại trước khi cập nhật.', 'error');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data = await updateHostAvailability({
        homeId: Number(selectedHomeId),
        startDate: selectedRange.startDate,
        endDate: selectedRange.endDate,
        status,
      });
      setCalendar(data);
      setRangeStart('');
      setRangeEnd('');
      showToast('Cập nhật lịch trống thành công.');
    } catch (err) {
      const message = err.message || 'Cập nhật lịch thất bại.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateFromDate = (value) => {
    if (!value) return;
    setFromDate(value);
    if (compareDate(value, toDate) > 0) setToDate(value);
    setRangeStart('');
    setRangeEnd('');
  };

  const updateToDate = (value) => {
    if (!value) return;
    setToDate(value);
    if (compareDate(fromDate, value) > 0) setFromDate(value);
    setRangeStart('');
    setRangeEnd('');
  };

  return (
    <HostLayout currentTab="availability">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="mx-auto max-w-[1500px] space-y-5 px-3 pb-12 pt-3 sm:px-5 lg:px-8">
        <div className="-mt-1">
          <ManagementBackButton to="/host" />
        </div>

        <section className="rounded-[22px] border border-[#E8E1D2] bg-white p-6 shadow-[0_10px_28px_-22px_rgba(44,31,20,0.5)] md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.32em] text-[#B66A3C]">
                <span className="h-px w-7 bg-[#C1673A]" />
                Cozygo Calendar
              </p>
              <h1 className="mt-3 font-serif text-4xl font-black leading-tight text-[#2C1E15]">
                Quản lý lịch trống
              </h1>
              <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#6B6357]">
                Cập nhật ngày còn trống, tạm khóa hoặc bảo trì cho từng homestay. Những ngày đã có khách đặt sẽ được khóa thao tác để tránh trùng lịch.
              </p>
            </div>

            <button
              type="button"
              onClick={refresh}
              disabled={loading || !selectedHomeId}
              className="inline-flex h-12 items-center justify-center gap-3 rounded-2xl bg-[#C1673A] px-6 text-sm font-black text-white shadow-xl shadow-[#C1673A]/25 transition hover:-translate-y-0.5 hover:bg-[#A44F2A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <HiArrowPath className={loading ? 'h-5 w-5 animate-spin' : 'h-5 w-5'} />
              Làm mới
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black text-red-600">
            {error}
          </div>
        )}

        <section className="rounded-[22px] border border-[#E8E1D2] bg-white p-5 shadow-[0_10px_30px_-22px_rgba(44,31,20,0.45)]">
          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr_0.9fr_auto_auto] xl:items-end">
            <div className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9A9182]">Homestay</p>
              <PrettySelect
                value={selectedHomeId}
                onChange={(value) => {
                  setSelectedHomeId(value);
                  setRangeStart('');
                  setRangeEnd('');
                }}
                options={homestayOptions}
                placeholder="Chọn homestay"
                className="w-full"
                buttonClassName="h-14 rounded-2xl bg-[#FDFBF6] px-4 text-sm"
                menuClassName="w-full"
                minWidth=""
              />
            </div>

            <CalendarDateField label="Từ ngày" value={fromDate} onChange={updateFromDate} />
            <CalendarDateField label="Đến ngày" value={toDate} onChange={updateToDate} align="right" />

            <button
              type="button"
              onClick={setThisWeek}
              className="h-14 rounded-2xl bg-[#2C3E2B] px-6 text-sm font-black text-white shadow-lg shadow-[#2C3E2B]/20 transition hover:-translate-y-0.5 hover:bg-[#223322]"
            >
              Tuần này
            </button>

            <div className="flex h-14 overflow-hidden rounded-2xl border border-[#E8E1D2] bg-[#FDFBF6] p-1">
              <button
                type="button"
                onClick={() => changeViewMode('MONTH')}
                className={`rounded-xl px-5 text-sm font-black transition ${viewMode === 'MONTH' ? 'bg-[#1B2333] text-white shadow-sm' : 'text-[#6B6357] hover:bg-white'}`}
              >
                Tháng
              </button>
              <button
                type="button"
                onClick={() => changeViewMode('WEEK')}
                className={`rounded-xl px-5 text-sm font-black transition ${viewMode === 'WEEK' ? 'bg-[#1B2333] text-white shadow-sm' : 'text-[#6B6357] hover:bg-white'}`}
              >
                Tuần
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="rounded-[22px] border border-[#E8E1D2] bg-white p-6 shadow-[0_12px_34px_-24px_rgba(44,31,20,0.45)] xl:sticky xl:top-28">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#B66A3C]">Cập nhật trạng thái</p>
            <h2 className="mt-3 font-serif text-3xl font-black leading-tight text-[#2C1E15]">
              {selectedHomestay?.name || 'Chọn homestay'}
            </h2>

            <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-[#E4D9C8] bg-[#F8F3EA] px-4 py-4">
              <span className="text-sm font-black text-[#7E7568]">Khoảng ngày</span>
              <span className={`text-sm font-black ${selectedRange.startDate ? 'text-[#2C3E2B]' : 'text-[#B4AB9E]'}`}>
                {selectedRange.startDate ? `${formatDate(selectedRange.startDate)} - ${formatDate(selectedRange.endDate)}` : 'Chưa chọn'}
              </span>
            </div>

            {rangeHasBookedDay && (
              <p className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-black leading-5 text-red-600">
                Khoảng ngày đang chọn có ngày đã đặt. Hãy chọn lại để tránh ảnh hưởng booking của khách.
              </p>
            )}

            <div className="mt-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9A9182]">Trạng thái mới</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {UPDATE_STATUS_OPTIONS.map((key) => {
                  const meta = STATUS_META[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStatus(key)}
                      className={`flex h-14 items-center gap-3 rounded-2xl border px-4 text-sm font-black transition hover:-translate-y-0.5 hover:shadow-md ${
                        status === key ? meta.button : 'border-[#E8E1D2] bg-[#FDFBF6] text-[#6B6357]'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled
                  className={`flex h-14 cursor-not-allowed items-center gap-3 rounded-2xl border px-4 text-sm font-black opacity-70 ${STATUS_META.BOOKED.button}`}
                  title="Trạng thái Đã đặt được hệ thống tự khóa theo booking của khách."
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${STATUS_META.BOOKED.dot}`} />
                  Đã đặt
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={applyStatus}
              disabled={saving || !selectedRange.startDate || rangeHasBookedDay}
              className="mt-7 h-14 w-full rounded-2xl bg-[#2C3E2B] text-base font-black text-white shadow-xl shadow-[#2C3E2B]/20 transition hover:-translate-y-0.5 hover:bg-[#223322] disabled:cursor-not-allowed disabled:bg-[#CCC5B8] disabled:shadow-none"
            >
              {saving ? 'Đang cập nhật...' : 'Cập nhật lịch'}
            </button>

            <p className="mt-4 text-center text-xs font-semibold leading-5 text-[#A79F8F]">
              Chọn một hoặc nhiều ngày trên lịch bên phải, chọn trạng thái rồi bấm cập nhật.
            </p>
          </aside>

          <section className="rounded-[22px] border border-[#E8E1D2] bg-white p-6 shadow-[0_12px_34px_-24px_rgba(44,31,20,0.45)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#B66A3C]">Lịch homestay</p>
                <h2 className="mt-2 font-serif text-3xl font-black leading-tight text-[#2C1E15]">
                  {calendar?.homeName || selectedHomestay?.name || 'Chưa chọn homestay'}
                </h2>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#E8E1D2] bg-[#F8F3EA] p-2">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8E1D2] bg-white text-[#2C3E2B] transition hover:bg-[#2C3E2B] hover:text-white"
                  aria-label="Kỳ trước"
                >
                  <HiChevronLeft className="h-5 w-5" />
                </button>
                <span className="min-w-[130px] text-center text-base font-black text-[#2C1E15]">{formatMonth(fromDate)}</span>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8E1D2] bg-white text-[#2C3E2B] transition hover:bg-[#2C3E2B] hover:text-white"
                  aria-label="Kỳ sau"
                >
                  <HiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-4">
              {LEGEND_STATUS_OPTIONS.map((key) => {
                const meta = STATUS_META[key];
                return (
                  <span key={key} className="inline-flex items-center gap-2 text-sm font-bold text-[#6B6357]">
                    <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                );
              })}
            </div>

            {loading && (
              <div className="mt-6 rounded-2xl border border-dashed border-[#E8E1D2] bg-[#FDFBF6] p-10 text-center text-sm font-black text-[#A79F8F]">
                Đang tải lịch...
              </div>
            )}

            {!loading && !calendar?.days?.length && (
              <div className="mt-6 rounded-2xl border border-dashed border-[#E8E1D2] bg-[#FDFBF6] p-10 text-center text-sm font-black text-[#A79F8F]">
                Chưa có dữ liệu lịch để hiển thị.
              </div>
            )}

            {!loading && calendar?.days?.length > 0 && (
              <>
                <div className="mt-6 grid grid-cols-7 gap-3">
                  {WEEKDAYS.map((weekday) => (
                    <div key={weekday} className="text-center text-xs font-black uppercase tracking-[0.12em] text-[#A79F8F]">
                      {weekday}
                    </div>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-7 gap-3">
                  {calendarCells.map((cell) => {
                    const apiDay = dayMap.get(cell.date);
                    const day = apiDay || {
                      date: cell.date,
                      status: 'AVAILABLE',
                      booked: false,
                      outside: !cell.inMonth,
                    };
                    const statusKey = day.status || 'AVAILABLE';
                    const meta = STATUS_META[statusKey] || STATUS_META.AVAILABLE;
                    const isSelected = isInRange(cell.date, selectedRange.startDate, selectedRange.endDate);
                    const isToday = cell.date === todayInput();
                    const isOutside = !cell.inMonth || !apiDay;
                    const canClick = !isOutside;

                    return (
                      <button
                        key={cell.key}
                        type="button"
                        onClick={() => canClick && selectDay(day)}
                        disabled={!canClick}
                        className={`group relative min-h-[118px] rounded-2xl border p-3 text-left transition ${
                          isOutside
                            ? 'cursor-default border-transparent bg-[#F2F4EF] opacity-45'
                            : `${meta.tile} hover:-translate-y-1 hover:shadow-lg hover:shadow-[#2C1E15]/10`
                        } ${isSelected ? 'ring-2 ring-[#2C3E2B] ring-offset-2' : ''} ${isToday ? 'border-[#C1673A] shadow-[inset_0_0_0_2px_rgba(193,103,58,0.14)]' : ''}`}
                      >
                        <span className="block text-[11px] font-black uppercase tracking-wide opacity-70">
                          {cell.weekday}
                          {isToday && <span className="ml-1 text-[#C1673A]">· hôm nay</span>}
                        </span>
                        <span className="mt-1 block font-serif text-3xl font-black leading-none text-[#2C1E15]">
                          {cell.dayNumber}
                        </span>

                        {!isOutside && (
                          <span className={`absolute bottom-3 left-3 right-3 rounded-xl px-2 py-1.5 text-center text-xs font-black ${meta.tag}`}>
                            {meta.label}
                          </span>
                        )}

                        {day.booked && (
                          <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-30 hidden w-64 -translate-x-1/2 rounded-2xl border border-[#E8E1D2] bg-white p-4 text-left shadow-2xl shadow-[#2C1E15]/20 group-hover:block">
                            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#B66A3C]">Đã có người đặt</span>
                            <span className="mt-2 block text-sm font-black text-[#2C1E15]">{day.bookingCode || 'Chưa có mã booking'}</span>
                            <span className="mt-1 block text-sm font-bold text-[#6B6357]">{day.customerName || 'Khách hàng'}</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </section>
      </div>
    </HostLayout>
  );
}
