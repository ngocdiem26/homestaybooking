import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { HiGlobeAlt, HiOutlineCamera, HiOutlineMail } from 'react-icons/hi';
import Logo from '../components/common/Logo';
import { useAuth } from '../hooks/useAuth';
import { useCustomerTierData } from '../hooks/useCustomerTierData';

export default function UserLayout({ children }) {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { isAuthenticated, logout, user } = useAuth();
  const cachedTier = user?.customerTier || (user?.currentTierCode || user?.tierCode ? {
    currentTierCode: user.currentTierCode || user.tierCode,
    currentTierName: user.currentTierName || user.tierName,
  } : null);
  const tierCacheKey = user?.userId || user?.id || user?.email || 'guest';
  const { tier, isLoading: isTierLoading } = useCustomerTierData(isAuthenticated, { cacheKey: tierCacheKey, initialTier: cachedTier });
  const displayName = user?.fullName || user?.email || 'Tài khoản';
  const avatarLabel = displayName.trim().charAt(0).toUpperCase();
  const avatarUrl = user?.avatar || user?.avatarUrl || user?.imageUrl || user?.profileImage || '';
  const tierLabels = { BRONZE: 'Đồng', SILVER: 'Bạc', GOLD: 'Vàng', DIAMOND: 'Kim cương' };
  const tierCode = String(tier?.currentTierCode || tier?.tierCode || '').toUpperCase();
  const tierName = tierLabels[tierCode] || tier?.currentTierName || tier?.tierName || '';

  useEffect(() => {
    if (!isUserMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!userMenuRef.current?.contains(event.target)) setIsUserMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const navLinkStyle = ({ isActive }) =>
    `relative pb-1 text-sm font-bold uppercase tracking-widest transition-all duration-300 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-[#6E473B] after:transition-all after:duration-300 after:content-[''] ${
      isActive
        ? 'text-white after:w-full'
        : 'text-[#F4F1EA]/80 after:w-0 hover:text-white hover:after:w-full'
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F1EA] text-[#23150d] selection:bg-[#6E473B]/20">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#202c3c] px-6 py-4 shadow-xl md:px-12">
        <div className="scale-110">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <nav className="hidden items-center space-x-8 lg:flex">
          <NavLink to="/" end className={navLinkStyle}>Trang chủ</NavLink>
          <NavLink to="/favorites" className={navLinkStyle}>Yêu thích</NavLink>
          <NavLink to="/activities" className={navLinkStyle}>Hoạt động</NavLink>
          <NavLink to="/about" className={navLinkStyle}>Về chúng tôi</NavLink>
          <NavLink to="/partners" className={navLinkStyle}>Hợp tác</NavLink>
        </nav>

        {isAuthenticated ? (
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((currentValue) => !currentValue)}
              className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 py-2 pl-2 pr-4 text-left shadow-sm transition hover:bg-white/10"
            >
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#6E473B] text-sm font-black uppercase text-white shadow ring-1 ring-white/15">
                {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : avatarLabel}
              </span>
              <span className="hidden max-w-[180px] flex-col leading-tight sm:flex">
                <span className="truncate text-sm font-black text-[#F4F1EA]">{displayName}</span>
                <span className={'mt-0.5 truncate text-[11px] font-bold text-[#F0B77A] ' + (!tierName && isTierLoading ? 'opacity-0' : '')}>
                  {tierName ? `Hạng ${tierName}` : 'Hạng thành viên'}
                </span>
              </span>
              <i className={`fa-solid fa-chevron-down text-[10px] text-[#F4F1EA]/60 transition ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 z-50 mt-3 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white text-[#23150d] shadow-2xl">
                <Link
                  to="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold transition hover:bg-[#F4F1EA]"
                >
                  <i className="fa-regular fa-user text-[#6E473B]" />
                  Tài khoản
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                >
                  <i className="fa-solid fa-right-from-bracket" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-wider">
            <Link to="/login" className="px-3 py-2 text-[#F4F1EA]/80 transition hover:text-white">Đăng nhập</Link>
            <Link to="/register" className="rounded-xl bg-[#6E473B] px-5 py-2.5 text-white shadow-md transition hover:bg-[#57362c] active:scale-95">Đăng ký</Link>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="mt-16 w-full border-t border-[#6E473B]/20 bg-[#202c3c] px-6 pb-8 pt-12 text-left text-[#F4F1EA]/80 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 pb-12 text-xs md:grid-cols-4">
            <div className="space-y-3.5">
              <h4 className="border-l-2 border-[#6E473B] pl-2 text-[11px] font-bold uppercase tracking-widest text-white">Hỗ trợ khách hàng</h4>
              <ul className="space-y-2 font-medium text-gray-400">
                <li><a href="#" className="transition hover:text-white hover:underline">Trung tâm hỗ trợ 24/7</a></li>
                <li><a href="#" className="transition hover:text-white hover:underline">Hướng dẫn đặt phòng an toàn</a></li>
                <li><a href="#" className="transition hover:text-white hover:underline">Chính sách hoàn tiền và hủy phòng</a></li>
                <li><a href="#" className="transition hover:text-white hover:underline">Biện pháp an toàn</a></li>
                <li><a href="#" className="transition hover:text-white hover:underline">Sơ đồ trang web</a></li>
              </ul>
            </div>

            <div className="space-y-3.5">
              <h4 className="border-l-2 border-[#6E473B] pl-2 text-[11px] font-bold uppercase tracking-widest text-white">Điểm đến nổi bật</h4>
              <ul className="space-y-2 font-medium text-gray-400">
                <li><Link to="/" className="transition hover:text-white hover:underline">Homestay mộc mạc Đà Lạt</Link></li>
                <li><Link to="/" className="transition hover:text-white hover:underline">Nhà văn hóa miền Tây Cần Thơ</Link></li>
                <li><Link to="/" className="transition hover:text-white hover:underline">Trải nghiệm sân máy Sapa</Link></li>
                <li><Link to="/" className="transition hover:text-white hover:underline">Bungalow ven biển Phú Quốc</Link></li>
                <li><Link to="/" className="transition hover:text-white hover:underline">Biệt thự đồi thông Lạc Dương</Link></li>
              </ul>
            </div>

            <div className="space-y-3.5">
              <h4 className="border-l-2 border-[#6E473B] pl-2 text-[11px] font-bold uppercase tracking-widest text-white">Hợp tác phát triển</h4>
              <ul className="space-y-2 font-medium text-gray-400">
                <li><Link to="/partners" className="transition hover:text-white hover:underline">Đăng ký hợp tác của bạn</Link></li>
                <li><a href="#" className="transition hover:text-white hover:underline">Hệ thống đại lý Cozygo</a></li>
                <li><a href="#" className="transition hover:text-white hover:underline">Chương trình tiếp thị liên kết</a></li>
                <li><a href="#" className="transition hover:text-white hover:underline">Cộng đồng chủ Homestay</a></li>
                <li><a href="#" className="transition hover:text-white hover:underline">Cơ hội nghề nghiệp</a></li>
              </ul>
            </div>

            <div className="space-y-3.5">
              <h4 className="border-l-2 border-[#6E473B] pl-2 text-[11px] font-bold uppercase tracking-widest text-white">Cozygo Homestay</h4>
              <ul className="space-y-2.5 font-medium text-gray-400">
                <li className="flex items-start gap-2"><span>??</span><span>Văn phòng: Khu vực rộng rãi bảo tồn, Lạc Dương, Đà Lạt, Lâm Đồng.</span></li>
                <li className="flex items-center gap-2"><span>☎</span><span>Hotline: 1900 8686 (08:00 - 22:00)</span></li>
                <li className="flex items-center gap-2"><span>✉</span><span>Email: contact@cozygo.vn</span></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 py-6 sm:flex-row">
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span>Phương thức thanh toán bảo mật:</span>
              <div className="flex gap-2 rounded-lg bg-white/5 px-2.5 py-1 text-base text-gray-400">
                <span title="Visa Card">Visa</span>
                <span title="Master Card">Mastercard</span>
                <span title="Momo">Momo</span>
                <span title="VNPAY">VNPAY</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <a href="#" aria-label="Website" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 shadow-sm transition hover:bg-[#6E473B] hover:text-white"><HiGlobeAlt /></a>
              <a href="#" aria-label="Hình ảnh" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 shadow-sm transition hover:bg-[#6E473B] hover:text-white"><HiOutlineCamera /></a>
              <a href="#" aria-label="Email" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 shadow-sm transition hover:bg-[#6E473B] hover:text-white"><HiOutlineMail /></a>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between border-t border-white/5 pt-6 text-[11px] font-medium text-gray-500 sm:flex-row">
            <span>@ 2026 Cozygo Homestay. Tất cả quyền được bảo vệ.</span>
            <span className="mt-2 text-[#6E473B] sm:mt-0">Nơi lưu giữ những bước chân yêu thương</span>
          </div>
        </div>
      </footer>
    </div>
  );
}



