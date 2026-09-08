import { useEffect, useMemo, useRef, useState } from 'react';
import { HiCheck, HiChevronDown } from 'react-icons/hi2';

function normalizeOptions(options = []) {
  return options.map((option) => (
    typeof option === 'string' ? { value: option, label: option } : option
  ));
}

export default function PrettySelect({
  value,
  onChange,
  options = [],
  placeholder = 'Chọn',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  align = 'left',
  prefixLabel = '',
  minWidth = 'min-w-[150px]',
}) {
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);
  const selectedOption = normalizedOptions.find((option) => String(option.value) === String(value));

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((current) => !current)}
        className={`inline-flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 text-left text-xs font-black text-[#2C3E2B] shadow-sm outline-none transition hover:border-[#D8B48A] hover:bg-[#FFFDF9] focus:border-[#7A5547] focus:ring-2 focus:ring-[#7A5547]/10 disabled:cursor-not-allowed disabled:opacity-60 ${minWidth} ${buttonClassName}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {prefixLabel && <span className="shrink-0 text-gray-500">{prefixLabel}</span>}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </span>
        <HiChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition ${isOpen ? 'rotate-180 text-[#7A5547]' : ''}`} />
      </button>

      {isOpen && (
        <div className={`${align === 'right' ? 'right-0' : 'left-0'} absolute top-[calc(100%+0.5rem)] z-[100] w-max min-w-full overflow-hidden rounded-2xl border border-[#E7DDD0] bg-white p-1.5 shadow-2xl shadow-[#2C1E15]/15 ${menuClassName}`}>
          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            {normalizedOptions.map((option) => {
              const active = String(option.value) === String(value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange?.(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-black transition ${active ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-600 hover:bg-[#F8F6F0] hover:text-[#2C3E2B]'}`}
                >
                  <span className="whitespace-nowrap">{option.label}</span>
                  {active && <HiCheck className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
