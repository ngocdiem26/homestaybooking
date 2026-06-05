import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../component/Logo';
import AuthLeftPanel from '../../component/AuthLeftPanel';

export default function Register() {
  const [accountType, setAccountType] = useState('guest');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    const roleText = accountType === 'host' ? "Chủ nhà" : "Khách hàng";
    setToast({ 
      show: true, 
      message: `Đăng ký tài khoản [${roleText}] thành công! Hãy chuẩn bị hành lý cho hành trình kết nối cùng Cozygo.` 
    });
    setTimeout(() => {
      setToast({ show: false, message: '' });
      navigate('/login');
    }, 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#F4F1EA]">
      <div className="w-full max-w-5xl wood-pattern-bg rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[660px] md:h-[660px] border border-[#6E473B]/10 transition-all duration-300">
        
        {/* Component cột ảnh trái */}
        <AuthLeftPanel />

        {/* Khung form Đăng ký bên phải */}
        <div className="w-full md:w-[60%] bg-[#F9F8F6] p-5 sm:p-7 md:p-8 flex flex-col justify-between relative text-[#23150d] overflow-hidden">
          
          <div className="fade-in-active flex-grow flex flex-col justify-start pt-0 h-full">
            
            {/* Header: Logo bên trái và tiêu đề bên phải */}
            <div className="flex items-center gap-4 border-b border-gray-200/50 pb-2 mb-3">
              <div className="flex-shrink-0">
                <Logo />
              </div>
              <div className="text-left flex-grow">
                <h3 className="font-classic text-xl sm:text-2xl font-bold text-[#2C1E15] leading-tight">Tạo tài khoản</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Chỉ vài bước để đặt hoặc thuê homestay</p>
              </div>
            </div>

            {/* Form 2 cột phân bổ đều đặn */}
            <form className="flex-grow flex flex-col justify-between mt-3 text-left" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                
                {/* Chọn loại tài khoản */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    <span className="text-red-500">*</span> Loại tài khoản <i className="fa-regular fa-circle-question text-gray-400 ml-0.5" title="Chọn loại tài khoản phù hợp"></i>
                  </label>
                  <div className="flex bg-gray-200/60 p-1 rounded-full text-xs w-fit border border-gray-300/40">
                    <button 
                      type="button" 
                      className={`px-4 py-1.5 rounded-full transition-all duration-300 font-semibold ${accountType === 'host' ? 'bg-[#2C3E2B] text-[#F4F1EA] shadow' : 'text-gray-500'}`}
                      onClick={() => setAccountType('host')}
                    >
                      Chủ nhà
                    </button>
                    <button 
                      type="button" 
                      className={`px-4 py-1.5 rounded-full transition-all duration-300 font-semibold ${accountType === 'guest' ? 'bg-[#2C3E2B] text-[#F4F1EA] shadow' : 'text-gray-500'}`}
                      onClick={() => setAccountType('guest')}
                    >
                      Khách
                    </button>
                  </div>
                </div>

                {/* Họ tên */}
                <div className="space-y-0.5">
                  <label className="block text-xs font-semibold text-gray-700"><span className="text-red-500">*</span> Họ tên</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <i className="fa-regular fa-user text-xs"></i>
                    </span>
                    <input type="text" required placeholder="Nguyễn Văn A" className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] transition-all text-gray-800" />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-0.5">
                  <label className="block text-xs font-semibold text-gray-700"><span className="text-red-500">*</span> Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <i className="fa-regular fa-envelope text-xs"></i>
                    </span>
                    <input type="email" required placeholder="example@gmail.com" className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] transition-all text-gray-800" />
                  </div>
                </div>

                {/* Mật khẩu */}
                <div className="space-y-0.5">
                  <label className="block text-xs font-semibold text-gray-700"><span className="text-red-500">*</span> Mật khẩu</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <i className="fa-solid fa-lock text-xs"></i>
                    </span>
                    <input 
                      type={showPass ? "text" : "password"} 
                      required 
                      placeholder="••••••••" 
                      className="w-full pl-9 pr-9 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] transition-all text-gray-800" 
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setShowPass(!showPass)}>
                      <i className={`fa-regular ${showPass ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                    </span>
                  </div>
                </div>

                {/* Nhập lại mật khẩu */}
                <div className="space-y-0.5">
                  <label className="block text-xs font-semibold text-gray-700"><span className="text-red-500">*</span> Nhập lại mật khẩu</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <i className="fa-solid fa-shield-halved text-xs"></i>
                    </span>
                    <input 
                      type={showConfirmPass ? "text" : "password"} 
                      required 
                      placeholder="••••••••" 
                      className="w-full pl-9 pr-9 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] transition-all text-gray-800" 
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                      <i className={`fa-regular ${showConfirmPass ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                    </span>
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="space-y-0.5">
                  <label className="block text-xs font-semibold text-gray-700"><span className="text-red-500">*</span> Số điện thoại</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <i className="fa-solid fa-phone text-xs"></i>
                    </span>
                    <input type="tel" required placeholder="0912345678" className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] transition-all text-gray-800" />
                  </div>
                </div>

                {/* Ngày sinh */}
                <div className="space-y-0.5">
                  <label className="block text-xs font-semibold text-gray-700">Ngày sinh</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <i className="fa-regular fa-calendar text-xs"></i>
                    </span>
                    <input type="date" className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] transition-all text-gray-500" />
                  </div>
                </div>

                {/* Giới tính - Chỉ có Nam & Nữ */}
                <div className="space-y-0.5">
                  <label className="block text-xs font-semibold text-gray-700">Giới tính</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <i className="fa-solid fa-venus-mars text-xs"></i>
                    </span>
                    <select className="w-full pl-9 pr-8 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] transition-all text-gray-800 appearance-none" defaultValue="">
                      <option value="" disabled>Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 text-[10px]">
                      <i className="fa-solid fa-chevron-down"></i>
                    </span>
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="space-y-0.5">
                  <label className="block text-xs font-semibold text-gray-700"><span className="text-red-500">*</span> Địa chỉ</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <i className="fa-solid fa-location-dot text-xs"></i>
                    </span>
                    <input type="text" required placeholder="Hà Nội" className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] transition-all text-gray-800" />
                  </div>
                </div>

              </div>

              {/* Nút Tạo tài khoản - Dịch xuống sát chân nhờ mt-auto */}
              <button type="submit" className="w-full bg-[#2C3E2B] hover:bg-[#1a291b] text-[#F4F1EA] font-semibold py-3 rounded-full shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-200 text-xs mt-auto">
                Tạo tài khoản
              </button>
            </form>

            <p className="text-center text-[11px] text-gray-400 mt-2.5 flex-shrink-0">
              Đã có tài khoản? <Link to="/login" className="text-[#6E473B] font-bold cursor-pointer hover:underline">Đăng nhập</Link>
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