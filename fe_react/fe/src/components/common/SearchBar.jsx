import { HiOutlineRefresh, HiOutlineSearch } from 'react-icons/hi';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  onReset,
  resetLabel = 'Làm mới',
  className = '',
  inputClassName = '',
}) {
  return (
    <div className={`flex gap-2 flex-1 max-w-md ${className}`}>
      <div className="flex-1 flex items-center gap-2 h-9 px-3 rounded-xl border border-gray-200 bg-white focus-within:border-[#2C3E2B] transition">
        <HiOutlineSearch size={14} className="text-gray-400 shrink-0" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none text-xs font-medium placeholder-gray-400 ${inputClassName}`}
          style={{ color: '#2C1E15' }}
        />
      </div>

      {onReset && (
        <button
          onClick={onReset}
          className="h-9 px-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:text-[#6E473B] transition inline-flex items-center gap-1.5 bg-white"
          type="button"
        >
          <HiOutlineRefresh size={14} />
          {resetLabel}
        </button>
      )}
    </div>
  );
}
