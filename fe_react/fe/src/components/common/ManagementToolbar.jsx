import { FaCalendarAlt, FaSearch, FaSlidersH, FaSyncAlt } from 'react-icons/fa';
import { DATE_FILTER_OPTIONS } from '../../utils/dateFilter';
import PrettySelect from './PrettySelect';

function normalizeOptions(options = []) {
  return options.map((option) => (
    typeof option === 'string' ? { value: option, label: option } : option
  ));
}

const controlShellClass = 'inline-flex h-11 items-center gap-2 rounded-2xl border border-gray-200/80 bg-white px-3 text-xs font-black text-gray-500 shadow-[0_8px_18px_rgba(44,30,21,0.08)] transition hover:-translate-y-0.5 hover:border-[#D8B48A] hover:shadow-[0_12px_24px_rgba(44,30,21,0.12)]';
const chromelessSelectButton = '!h-8 !border-0 !bg-transparent !px-1 !shadow-none hover:!bg-transparent focus:!ring-0';

export default function ManagementToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filters = [],
  dateFilter = 'all',
  onDateFilterChange,
  dateFrom = '',
  dateTo = '',
  onDateFromChange,
  onDateToChange,
  onRefresh,
  onReset,
  className = '',
}) {
  const handleRefresh = () => {
    if (onReset) {
      onReset();
      return;
    }
    onRefresh?.();
  };

  return (
    <section className={`rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {filters.length > 0 && (
            <span className="inline-flex h-11 items-center gap-2 rounded-2xl border border-gray-200/80 bg-white px-3 text-xs font-black text-gray-600 shadow-[0_8px_18px_rgba(44,30,21,0.08)]">
              <FaSlidersH className="h-3.5 w-3.5 text-[#6C483A]" /> Lọc
            </span>
          )}

          {filters.map((filter) => (
            <div key={filter.label} className={controlShellClass}>
              <span className="shrink-0 whitespace-nowrap text-gray-400">{filter.label}:</span>
              <PrettySelect
                value={filter.value}
                onChange={(nextValue) => filter.onChange?.(nextValue)}
                options={normalizeOptions(filter.options)}
                className="min-w-0"
                buttonClassName={chromelessSelectButton}
                menuClassName="min-w-[180px]"
                minWidth="min-w-[110px]"
              />
            </div>
          ))}

          {onDateFilterChange && (
            <div className={controlShellClass}>
              <FaCalendarAlt className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <PrettySelect
                value={dateFilter}
                onChange={onDateFilterChange}
                options={DATE_FILTER_OPTIONS}
                className="min-w-0"
                buttonClassName={chromelessSelectButton}
                menuClassName="min-w-[190px]"
                minWidth="min-w-[130px]"
                align="right"
              />
            </div>
          )}

          {dateFilter === 'custom' && (
            <>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => onDateFromChange?.(event.target.value)}
                className="h-11 rounded-2xl border border-gray-200/80 bg-white px-3 text-xs font-black text-gray-600 shadow-[0_8px_18px_rgba(44,30,21,0.08)] outline-none transition focus:border-[#6C483A] focus:ring-2 focus:ring-[#6C483A]/10"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(event) => onDateToChange?.(event.target.value)}
                className="h-11 rounded-2xl border border-gray-200/80 bg-white px-3 text-xs font-black text-gray-600 shadow-[0_8px_18px_rgba(44,30,21,0.08)] outline-none transition focus:border-[#6C483A] focus:ring-2 focus:ring-[#6C483A]/10"
              />
            </>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 md:flex-row xl:max-w-3xl xl:flex-1">
          {onSearchChange && (
            <div className="flex h-11 flex-1 items-center rounded-2xl border border-gray-200/80 bg-white px-4 shadow-[0_8px_18px_rgba(44,30,21,0.08)] transition focus-within:border-[#6C483A]/60 focus-within:ring-2 focus-within:ring-[#6C483A]/10">
              <FaSearch className="mr-2 h-4 w-4 text-gray-400" />
              <input
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm font-semibold text-gray-700 outline-none placeholder:text-gray-400"
              />
            </div>
          )}

          {(onRefresh || onReset) && (
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-gray-200/80 bg-white px-4 text-xs font-black text-gray-600 shadow-[0_8px_18px_rgba(44,30,21,0.08)] transition hover:-translate-y-0.5 hover:border-[#D8B48A] hover:text-[#6C483A] hover:shadow-[0_12px_24px_rgba(44,30,21,0.12)]"
            >
              <FaSyncAlt className="h-3.5 w-3.5" /> Làm mới
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
