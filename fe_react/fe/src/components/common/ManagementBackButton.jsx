import { Link, useNavigate } from 'react-router-dom';
import { HiChevronLeft } from 'react-icons/hi2';

export default function ManagementBackButton({ onClick, to, label = 'Về điều khiển', className = '' }) {
  const navigate = useNavigate();
  const baseClass = 'inline-flex !h-9 !min-h-9 min-w-[104px] items-center justify-center gap-0 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-2 !text-[11px] font-black !leading-none text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-50 hover:text-[#2C3E2B] hover:shadow-md';
  const content = (
    <>
      <HiChevronLeft className="h-[15px] w-[15px] shrink-0" />
      <span className="inline-flex items-center leading-none">{label}</span>
    </>
  );

  if (to && !onClick) {
    return <Link to={to} className={`${baseClass} ${className}`}>{content}</Link>;
  }

  return (
    <button
      type="button"
      onClick={onClick || (() => navigate(to || -1))}
      className={`${baseClass} ${className}`}
    >
      {content}
    </button>
  );
}
