
import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { clearAuthSession, getAuthSession } from '../services/authStorage';

export default function UserLayout({ children }) {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { token, user } = getAuthSession();
  const isAuthenticated = Boolean(token && user);
  const displayName = user?.fullName || user?.email || 'Tài khoản';
  const avatarLabel = displayName.trim().charAt(0).toUpperCase();

  const handleLogout = () => {
    clearAuthSession();
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  // Hàm tạo class động cho từng mục Menu dựa trên trạng thái trang hiện tại
  const navLinkStyle = ({ isActive }) => 
    `relative pb-1 text-sm font-bold uppercase tracking-widest transition-all duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:bg-[#6E473B] after:transition-all after:duration-300 ${
      isActive 
        ? 'text-white after:w-full' 
        : 'text-[#F4F1EA]/80 hover:text-white after:w-0 hover:after:w-full'
    }`;

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#23150d] selection:bg-[#6E473B]/20 flex flex-col">
      
      {/* ==========================================
          HEADER NÂNG CẤP HIỆU ỨNG NAVLINK ĐỘNG MƯỢT MÀ
         ========================================== */}
      <header className="bg-[#202c3c] px-6 md:px-12 py-4 flex items-center justify-between border-b border-white/5 shadow-xl sticky top-0 z-50">
        <div className="scale-110">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        {/* Hệ thống Navigation thông minh sử dụng NavLink */}
        <nav className="hidden lg:flex items-center space-x-8">
          <NavLink to="/" end className={navLinkStyle}>
            Trang chủ
          </NavLink>
          <NavLink to="/favorites" className={navLinkStyle}>
            Yêu thích
          </NavLink>
          <NavLink to="/activities" className={navLinkStyle}>
            Hoạt động
          </NavLink>
          <NavLink to="/about" className={navLinkStyle}>
            Về chúng tôi
          </NavLink>
          <NavLink to="/partners" className={navLinkStyle}>
            Hợp tác
          </NavLink>
        </nav>

        {isAuthenticated ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((currentValue) => !currentValue)}
              className="flex items-center gap-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 pl-1.5 pr-4 py-1.5 transition text-left"
            >
              <span className="w-9 h-9 rounded-full bg-[#6E473B] text-white flex items-center justify-center text-sm font-black uppercase shadow">
                {avatarLabel}
              </span>
              <span className="hidden sm:block max-w-[150px] truncate text-xs font-bold text-[#F4F1EA]">
                {displayName}
              </span>
              <i className={`fa-solid fa-chevron-down text-[10px] text-[#F4F1EA]/60 transition ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white text-[#23150d] border border-gray-200 shadow-2xl overflow-hidden z-50">
                <Link
                  to="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-[#F4F1EA] transition"
                >
                  <i className="fa-regular fa-user text-[#6E473B]"></i>
                  Tài khoản
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left text-red-600 hover:bg-red-50 transition"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
        <div className="flex items-center space-x-4 text-xs font-bold uppercase tracking-wider">
          <Link to="/login" className="text-[#F4F1EA]/80 hover:text-white transition px-3 py-2">Đăng nhập</Link>
          <Link to="/register" className="bg-[#6E473B] hover:bg-[#57362c] text-white px-5 py-2.5 rounded-xl shadow-md transition transform active:scale-95">Đăng ký</Link>
        </div>
        )}
      </header>

      {/* VÙNG NỘI DUNG ĐỘNG */}
      <main className="flex-grow">
        {children}
      </main>

      {/* FOOTER CHUYÊN NGHIỆP */}
      <footer className="bg-[#202c3c] text-[#F4F1EA]/80 pt-12 pb-8 px-6 md:px-12 border-t border-[#6E473B]/20 w-full mt-16 text-left">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 text-xs">
            {/* Cột 1: Chăm sóc khách hàng */}
            <div className="space-y-3.5">
              <h4 className="text-white font-bold uppercase tracking-widest text-[11px] border-l-2 border-[#6E473B] pl-2">Hỗ trợ khách hàng</h4>
              <ul className="space-y-2 text-gray-400 font-medium">
                <li><a href="#" className="hover:text-white hover:underline transition">Trung tâm trợ giúp 24/7</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition">Hướng dẫn đặt phòng an toàn</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition">Chính sách hoàn tiền & Hủy phòng</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition">Biện pháp an toàn</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition">Sơ đồ trang web</a></li>
              </ul>
            </div>

            {/* Cột 2: Khám phá điểm đến */}
            <div className="space-y-3.5">
              <h4 className="text-white font-bold uppercase tracking-widest text-[11px] border-l-2 border-[#6E473B] pl-2">Điểm đến nổi bật</h4>
              <ul className="space-y-2 text-gray-400 font-medium">
                <li><Link to="/" className="hover:text-white hover:underline transition">Homestay mộc mạc Đà Lạt</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline transition">Nhà vườn miền tây Cần Thơ</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline transition">Trải nghiệm săn mây Sapa</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline transition">Bungalow ven biển Phú Quốc</Link></li>
                <li><Link to="/" className="hover:text-white hover:underline transition">Biệt thự đồi thông Lạc Dương</Link></li>
              </ul>
            </div>

            {/* Cột 3: Dành cho đối tác cung cấp chỗ nghỉ */}
            <div className="space-y-3.5">
              <h4 className="text-white font-bold uppercase tracking-widest text-[11px] border-l-2 border-[#6E473B] pl-2">Hợp tác phát triển</h4>
              <ul className="space-y-2 text-gray-400 font-medium">
                <li><Link to="/partners" className="hover:text-white hover:underline transition">Đăng ký chỗ nghỉ của bạn</Link></li>
                <li><a href="#" className="hover:text-white hover:underline transition">Hệ thống đại lý Cozygo</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition">Chương trình tiếp thị liên kết</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition">Cộng đồng chủ Homestay</a></li>
                <li><a href="#" className="hover:text-white hover:underline transition">Cơ hội nghề nghiệp</a></li>
              </ul>
            </div>

            {/* Cột 4: Thông tin liên hệ & Văn phòng */}
            <div className="space-y-3.5">
              <h4 className="text-white font-bold uppercase tracking-widest text-[11px] border-l-2 border-[#6E473B] pl-2">Cozygo Homestay</h4>
              <ul className="space-y-2.5 text-gray-400 font-medium">
                <li className="flex items-start gap-2">
                  <span>📍</span>
                  <span>Văn phòng: Khu vực rừng thông bảo tồn, Lạc Dương, Đà Lạt, Lâm Đồng.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <span>Hotline: 1900 xxxx (08:00 - 22:00)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>Email: contact@cozygo.vn</span>
                </li>
              </ul>
            </div>
          </div>

          {/* KHỐI 2: CỔNG THANH TOÁN & BẢO MẬT */}
          <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-gray-500 font-bold text-[10px] tracking-widest uppercase">
              <span>Phương thức thanh toán bảo mật:</span>
              <div className="flex gap-2 text-base text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg">
                <span title="Visa Card">💳 Visa</span>
                <span title="Master Card">💳 Mastercard</span>
                <span title="Momo">📱 Momo</span>
                <span title="VNPAY">🏦 VNPAY</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#6E473B] hover:text-white flex items-center justify-center transition shadow-sm">🌐</a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#6E473B] hover:text-white flex items-center justify-center transition shadow-sm">📷</a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#6E473B] hover:text-white flex items-center justify-center transition shadow-sm">🎥</a>
            </div>
          </div>

          {/* KHỐI 3: BẢN QUYỀN */}
          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 font-medium">
            <span>© 2026 Cozygo Mộc Lâm Homestay. Toàn bộ quyền được bảo hộ.</span>
            <span className="text-[#6E473B] mt-2 sm:mt-0 italic">Nơi lưu giữ những bước chân ấm áp bên người thân yêu</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
