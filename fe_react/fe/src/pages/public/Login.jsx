
// // cấu hình điều hướng 
// // localhost:5173/ => index.jsx
// // localhost:5173/login => Login.jsx
// const Login = () => {
//     return (
//         <h1>Đây là trang login</h1>
//     );
// };

// export default Login;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../component/Logo';
import AuthLeftPanel from '../../component/AuthLeftPanel';

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setToast({ show: true, message: "Chào mừng bạn trở lại! Hệ thống đang tải danh sách homestay nguyên căn lý tưởng..." });
    setTimeout(() => {
      setToast({ show: false, message: '' });
      // Ví dụ chuyển hướng về trang chủ sau khi đăng nhập thành công
      navigate('/');
    }, 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#F4F1EA]">
      <div className="w-full max-w-5xl wood-pattern-bg rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[660px] md:h-[660px] border border-[#6E473B]/10 transition-all duration-300">
        
        {/* Component cột ảnh trái */}
        <AuthLeftPanel />

        {/* Khung form Đăng nhập bên phải */}
        <div className="w-full md:w-[60%] bg-[#F9F8F6] p-5 sm:p-7 md:p-8 flex flex-col justify-between relative text-[#23150d] overflow-hidden">
          
          <div className="fade-in-active flex-grow flex flex-col justify-center">
            {/* Logo nằm sát bên trái */}
            <div className="flex items-center justify-start mb-6">
              <Logo />
            </div>

            <div className="mb-5 text-left">
              <h3 className="font-classic text-2xl font-bold text-[#2C1E15] mb-1">Chào mừng quay về nhà!</h3>
              <p className="text-xs text-gray-500">Đăng nhập để tiếp tục lên lịch cho những chuyến đi ấm áp.</p>
            </div>

            <form className="space-y-4 text-left" onSubmit={handleLogin}>
              {/* Email */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">Email của bạn</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <i className="fa-regular fa-envelope text-xs"></i>
                  </span>
                  <input 
                    type="email" 
                    required 
                    placeholder="nhaminh@gmail.com" 
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] focus:ring-1 focus:ring-[#2C3E2B] transition-all text-gray-800" 
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">Mật khẩu</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <i className="fa-solid fa-lock text-xs"></i>
                  </span>
                  <input 
                    type={showPass ? "text" : "password"} 
                    required 
                    placeholder="••••••••" 
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] focus:ring-1 focus:ring-[#2C3E2B] transition-all text-gray-800" 
                  />
                  <span 
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 cursor-pointer hover:text-gray-600"
                    onClick={() => setShowPass(!showPass)}
                  >
                    <i className={`fa-regular ${showPass ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                  </span>
                </div>
              </div>

              {/* Ghi nhớ & Quên mật khẩu */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <label className="flex items-center text-gray-500 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-[#2C3E2B] mr-2 accent-[#2C3E2B]" /> Ghi nhớ tôi
                </label>
                <a href="#" className="text-[#6E473B] hover:text-[#23150d] hover:underline font-semibold">Quên mật khẩu?</a>
              </div>

              {/* Nút hành động */}
              <button type="submit" className="w-full bg-[#2C3E2B] hover:bg-[#1a291b] text-[#F4F1EA] font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-200 text-xs mt-2 flex items-center justify-center space-x-2">
                <span>Trở Về Nhà Thôi</span>
                <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
            </form>

            {/* Mạng xã hội */}
            <div className="mt-5">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-[9px] uppercase text-gray-400 tracking-widest font-bold">Hoặc tiếp tục với</span>
                <div class="flex-grow border-t border-gray-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 py-2 rounded-xl transition-all text-[11px] font-semibold text-gray-700 shadow-sm">
                  <i className="fa-brands fa-google text-red-500"></i>
                  <span>Google</span>
                </button>
                <button className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 py-2 rounded-xl transition-all text-[11px] font-semibold text-gray-700 shadow-sm">
                  <i class="fa-brands fa-facebook text-blue-600"></i>
                  <span>Facebook</span>
                </button>
              </div>
            </div>

            {/* Link chuyển đổi trang sử dụng React Router Link */}
            <p className="text-center text-[11px] text-gray-400 mt-5">
              Chưa có tài khoản? <Link to="/register" className="text-[#6E473B] font-bold cursor-pointer hover:underline">Tạo tài khoản ngay</Link>
            </p>
          </div>

          {/* Toast Notification */}
          {toast.show && (
            <div className="absolute bottom-4 left-6 right-6 bg-[#2C3E2B] border-white/10 text-[#F4F1EA] p-4 rounded-xl shadow-2xl border flex items-center justify-between animate-bounce z-50">
              <div className="flex items-center space-x-3 text-xs sm:text-sm">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <i className="fa-solid fa-check text-green-400"></i>
                </span>
                <p className="font-medium text-[#F4F1EA] text-left">{toast.message}</p>
              </div>
            </div>
          )}

          {/* Slogan Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200/50 text-center flex items-center justify-between text-[11px] text-gray-400 font-medium italic flex-shrink-0">
            <span>© 2026 Cozygo</span>
            <span className="text-[#6E473B]">Chuyến đi ấm áp bên gia đình</span>
          </div>

        </div>
      </div>
    </div>
  );
}
