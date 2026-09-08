import { useEffect, useMemo, useRef, useState } from 'react';
import { HiCalendarDays, HiChevronLeft, HiChevronRight, HiXMark } from 'react-icons/hi2';

const FILTERS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'TWO_WEEKS', label: '2 tuần' },
  { key: 'ONE_MONTH', label: '1 tháng' },
  { key: 'CUSTOM', label: 'Tùy chỉnh' },
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

function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function parseTransactionDateValue(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const raw = String(value).trim();
  const isoDate = new Date(raw);
  if (!Number.isNaN(isoDate.getTime())) return isoDate;

  const viDateMatch = raw.match(/^(?:(\d{1,2}):(\d{2})(?::(\d{2}))?\s+)?(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!viDateMatch) return null;

  const hour = Number(viDateMatch[1] || viDateMatch[7] || 0);
  const minute = Number(viDateMatch[2] || viDateMatch[8] || 0);
  const second = Number(viDateMatch[3] || viDateMatch[9] || 0);
  const day = Number(viDateMatch[4]);
  const month = Number(viDateMatch[5]);
  const year = Number(viDateMatch[6]);
  const parsed = new Date(year, month - 1, day, hour, minute, second);

  return parsed.getFullYear() === year
    && parsed.getMonth() === month - 1
    && parsed.getDate() === day
    ? parsed
    : null;
}

function formatDateTime(value) {
  if (!value) return '--';
  const date = parseTransactionDateValue(value);
  if (!date) return String(value);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
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

function endOfDay(value) {
  const date = parseInputDate(value);
  if (!date) return null;
  date.setHours(23, 59, 59, 999);
  return date;
}

function getTransactionDate(transaction) {
  const raw = transaction?.occurredAt || transaction?.date || transaction?.createdAt || transaction?.updatedAt;
  return parseTransactionDateValue(raw);
}

function methodLabel(method) {
  const normalized = String(method || '').toUpperCase();
  if (normalized === 'VNPAY') return 'VNPay';
  if (normalized === 'PAY_AT_PROPERTY') return 'Thanh toán tại chỗ';
  return method || '--';
}

function typeLabel(type) {
  const normalized = String(type || '').toUpperCase();
  if (normalized === 'REFUND') return 'Hoàn tiền';
  return 'Thanh toán';
}

function statusLabel(status, type) {
  const normalized = String(status || '').toUpperCase();
  const normalizedType = String(type || '').toUpperCase();
  if (normalizedType === 'REFUND' && ['SUCCESS', 'REFUNDED'].includes(normalized)) return 'Đã hoàn tiền';
  if (normalized === 'PAID' || normalized === 'SUCCESS') return 'Thành công';
  if (normalized === 'PENDING') return 'Đang xử lý';
  if (normalized === 'FAILED') return 'Thất bại';
  return status || 'Đang xử lý';
}

function amountText(transaction) {
  const direction = String(transaction.direction || '').toUpperCase();
  const sign = direction === 'CREDIT' ? '+' : '-';
  return sign + formatMoney(transaction.amount);
}

function amountClass(transaction) {
  return String(transaction.direction || '').toUpperCase() === 'CREDIT'
    ? 'text-emerald-700'
    : 'text-red-600';
}

function statusClass(transaction) {
  const type = String(transaction.transactionType || '').toUpperCase();
  if (type === 'REFUND') return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-green-100 text-green-700 border-green-200';
}

function getRangeByMode(mode, customFrom, customTo) {
  const today = new Date();
  const to = endOfDay(toInputDate(today));
  if (mode === 'TWO_WEEKS') {
    const from = new Date(today);
    from.setDate(from.getDate() - 13);
    return { from: startOfDay(toInputDate(from)), to };
  }
  if (mode === 'ONE_MONTH') {
    const from = new Date(today);
    from.setMonth(from.getMonth() - 1);
    return { from: startOfDay(toInputDate(from)), to };
  }
  if (mode === 'CUSTOM') {
    return { from: startOfDay(customFrom), to: endOfDay(customTo) };
  }
  return { from: null, to: null };
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

function CalendarDateField({ label, value, onChange, min, max, align = 'left' }) {
  const wrapperRef = useRef(null);
  const selectedDate = parseInputDate(value);
  const minDate = startOfDay(min);
  const maxDate = startOfDay(max);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => selectedDate || maxDate || new Date());

  useEffect(() => {
    if (selectedDate) setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
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
  const today = startOfDay(toInputDate(new Date()));

  const canPick = (date, inMonth) => {
    if (!inMonth) return false;
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  };

  const pickDate = (date, inMonth) => {
    if (!canPick(date, inMonth)) return;
    onChange(toInputDate(date));
    setIsOpen(false);
  };

  return (
    <label ref={wrapperRef} className="relative block space-y-1">
      <span className="text-[11px] font-black uppercase text-gray-500">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 text-left text-sm font-black text-[#2C1E15] shadow-sm outline-none transition hover:border-[#D8B48A] focus:border-[#2C3E2B] focus:ring-4 focus:ring-[#2C3E2B]/10"
      >
        <span className={value ? '' : 'text-gray-400'}>{formatDisplayDate(value) || 'Chọn ngày'}</span>
        <HiCalendarDays className="h-5 w-5 text-[#6E473B]" />
      </button>

      {isOpen && (
        <div className={(align === 'right' ? 'right-0' : 'left-0') + ' absolute top-[calc(100%+0.5rem)] z-40 w-[320px] overflow-hidden rounded-[24px] border border-[#E7DDD0] bg-white shadow-2xl shadow-[#2C1E15]/18'}>
          <div className="bg-[#F8F6F0] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => setViewDate((date) => addMonths(date, -1))} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2C3E2B] shadow-sm ring-1 ring-gray-100 transition hover:bg-[#2C3E2B] hover:text-white" aria-label="Tháng trước">
                <HiChevronLeft className="h-5 w-5" />
              </button>
              <div className="text-center">
                <p className="text-sm font-black text-[#2C1E15]">{MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}</p>
                <p className="text-[11px] font-bold text-gray-400">Chọn ngày giao dịch</p>
              </div>
              <button type="button" onClick={() => setViewDate((date) => addMonths(date, 1))} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2C3E2B] shadow-sm ring-1 ring-gray-100 transition hover:bg-[#2C3E2B] hover:text-white" aria-label="Tháng sau">
                <HiChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-black uppercase text-gray-400">
              {WEEKDAYS.map((weekday) => <span key={weekday} className="py-1">{weekday}</span>)}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {days.map(({ date, key, inMonth }) => {
                const disabled = !canPick(date, inMonth);
                const selected = sameDay(date, selectedDate);
                const isToday = sameDay(date, today);
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

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
              <button type="button" onClick={() => { onChange(''); setIsOpen(false); }} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-gray-500 transition hover:bg-gray-100 hover:text-red-600">
                <HiXMark className="h-4 w-4" /> Xóa
              </button>
              <button type="button" onClick={() => { onChange(toInputDate(new Date())); setIsOpen(false); }} className="rounded-full bg-[#2C3E2B] px-3 py-1.5 text-xs font-black text-white shadow-sm transition hover:bg-[#223322]">
                Hôm nay
              </button>
            </div>
          </div>
        </div>
      )}
    </label>
  );
}

export default function TransactionHistory({ transactions = [], isLoading = false, errorMessage = '' }) {
  const today = toInputDate(new Date());
  const [filterMode, setFilterMode] = useState('ALL');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const filteredTransactions = useMemo(() => {
    const range = getRangeByMode(filterMode, customFrom, customTo);
    return transactions.filter((transaction) => {
      const date = getTransactionDate(transaction);
      if (!date) return filterMode === 'ALL';
      if (range.from && date < range.from) return false;
      if (range.to && date > range.to) return false;
      return true;
    });
  }, [transactions, filterMode, customFrom, customTo]);

  const hasCustomRangeError = filterMode === 'CUSTOM' && customFrom && customTo && customFrom > customTo;

  const updateCustomFrom = (value) => {
    setCustomFrom(value);
    if (customTo && value && customTo < value) setCustomTo('');
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Lịch sử giao dịch thanh toán</h2>
        <p className="text-xs text-gray-400 font-medium">Thanh toán hiển thị dấu -, hoàn tiền hiển thị dấu + theo dữ liệu thật từ hệ thống.</p>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setFilterMode(filter.key)}
                className={(filterMode === filter.key ? 'bg-[#2C3E2B] text-white shadow-md shadow-[#2C3E2B]/20' : 'bg-[#F8F6F0] text-gray-600 hover:bg-white hover:text-[#2C3E2B]') + ' rounded-xl px-4 py-2 text-xs font-black transition'}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-gray-400">Hiển thị {filteredTransactions.length}/{transactions.length} giao dịch</p>
        </div>

        {filterMode === 'CUSTOM' && (
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
            <CalendarDateField label="Từ ngày" value={customFrom} max={today} onChange={updateCustomFrom} />
            <CalendarDateField label="Đến ngày" value={customTo} min={customFrom || undefined} max={today} onChange={setCustomTo} align="right" />
            <button type="button" onClick={() => { setCustomFrom(''); setCustomTo(''); }} className="h-12 rounded-2xl bg-gray-100 px-4 text-xs font-black text-gray-600 transition hover:bg-gray-200 hover:text-[#2C3E2B]">Xóa ngày</button>
          </div>
        )}
        {hasCustomRangeError && <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600">Khoảng ngày chưa hợp lệ.</p>}
      </section>

      {errorMessage && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
          {errorMessage}
        </div>
      )}

      <div className="h-[560px] overflow-x-auto overflow-y-scroll rounded-xl border border-gray-200 bg-white pr-2 custom-scrollbar">
        <table className="w-full text-left border-collapse text-xs md:text-sm font-medium">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
              <th className="p-3">Mã giao dịch</th>
              <th className="p-3">Mã đơn đặt</th>
              <th className="p-3">Ngày giao dịch</th>
              <th className="p-3">Loại</th>
              <th className="p-3">Số tiền</th>
              <th className="p-3">Phương thức</th>
              <th className="p-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-400 italic">Đang tải lịch sử giao dịch...</td>
              </tr>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((txn) => (
                <tr key={txn.transactionId || txn.id} className="hover:bg-gray-50/50">
                  <td className="p-3 font-mono">{txn.transactionId || txn.id}</td>
                  <td className="p-3 font-mono text-gray-500">{txn.bookingCode || txn.bookingId}</td>
                  <td className="p-3">{formatDateTime(txn.occurredAt || txn.date)}</td>
                  <td className="p-3 text-gray-500">{typeLabel(txn.transactionType)}</td>
                  <td className={'p-3 font-bold ' + amountClass(txn)}>{txn.amountLabel || amountText(txn)}</td>
                  <td className="p-3 text-gray-500">{methodLabel(txn.paymentMethod || txn.method)}</td>
                  <td className="p-3">
                    <span className={'px-2 py-0.5 rounded-full text-[10px] font-bold border ' + statusClass(txn)}>
                      {statusLabel(txn.status, txn.transactionType)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-400 italic">Không có giao dịch trong khoảng thời gian đã chọn.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



