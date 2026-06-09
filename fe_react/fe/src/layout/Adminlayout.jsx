// import { useNavigate } from 'react-router-dom';
// import Logo from '../component/Logo'; // Đảm bảo đường dẫn import Logo chính xác

// export default function AdminLayout({ children }) {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị Cozygo?")) {
//       navigate('/login');
//     }
//   };

//   return (
//     <div className="bg-[#F4F1EA] min-h-screen flex flex-col justify-between text-[#23150d] font-sans antialiased text-left selection:bg-[#2C3E2B]/10">
      
//       {/* ==========================================
//           1. THANH HEADER ĐIỀU HƯỚNG TINH GỌN TRÊN CÙNG
//          ========================================== */}
//       <header className="bg-[#202c3c] text-white shadow-md sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
//           {/* Cụm Trái: Logo & Tiêu đề cố định */}
//           <div className="flex items-center space-x-3 shrink-0">
//             <Logo />
//             <div className="border-l border-white/20 pl-3 text-left">
//               <h1 className="font-serif font-bold text-lg tracking-wide leading-tight">Admin Dashboard</h1>
//               <p className="text-[10px] text-gray-400 font-mono">Hệ thống quản trị nội bộ Cozygo</p>
//             </div>
//           </div>

//           {/* Cụm Phải: Vai trò Admin hiển thị trực quan và Nút đăng xuất */}
//           <div className="flex items-center space-x-5 shrink-0 text-xs font-bold">
//             <div className="text-right hidden sm:block">
//               <p className="text-gray-200 text-sm">Xin chào, Admin ✨</p>
//               <p className="text-[10px] text-gray-400 font-mono text-right">Quyền hạn tối cao</p>
//             </div>
            
//             <button
//               onClick={handleLogout}
//               className="bg-[#6E473B] hover:bg-[#57362c] text-white px-4 py-2.5 rounded-xl shadow transition transform active:scale-95 cursor-pointer font-bold"
//             >
//               Đăng xuất
//             </button>
//           </div>

//         </div>
//       </header>

//       {/* ==========================================
//           2. VÙNG HIỂN THỊ NỘI DUNG CHÍNH (CHÍNH GIỮA)
//          ========================================== */}
//       <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto">
//           {children}
//         </div>
//       </main>

//       {/* ==========================================
//           3. PHẦN CHÂN TRANG: DÒNG BẢN QUYỀN NHỎ GỌN (FOOTER)
//          ========================================== */}
//       <footer className="bg-white border-t border-gray-200/60 py-4 text-center flex-shrink-0">
//         <div className="max-w-7xl mx-auto px-4 text-[11px] text-gray-400 font-medium italic flex flex-col sm:flex-row items-center justify-between gap-1">
//           <span>© 2026 Cozygo Admin — Hệ thống quản trị dữ liệu đám mây</span>
//           <span className="text-[#6E473B]">Bảo mật thông tin & Bản quyền thuộc về ban quản lý Cozygo</span>
//         </div>
//       </footer>

//     </div>
//   );
// }

// import { useNavigate } from 'react-router-dom';
// import Logo from '../component/Logo'; // Đảm bảo đường dẫn import Logo chính xác

// export default function AdminLayout({ children }) {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị Cozygo?")) {
//       navigate('/login');
//     }
//   };

//   return (
//     <div className="bg-[#F4F1EA] min-h-screen flex flex-col justify-between text-[#23150d] font-sans antialiased text-left selection:bg-[#2C3E2B]/10">
      
//       {/* ==========================================================================
//           1. THANH HEADER ĐIỀU HƯỚNG TINH GỌN TRÊN CÙNG (ĐÃ FIX LỖI CO CO BÓP & LẤN DÒNG)
//           ========================================================================== */}
//       <header className="bg-[#202c3c] text-white shadow-lg sticky top-0 z-50 w-full">
//         {/* Lớp bọc giữ độ rộng nội dung nằm giữa nhưng nền tối vẫn tràn biên 100% */}
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
//           {/* Cụm Trái: Logo & Tiêu đề cố định */}
//           <div className="flex items-center space-x-3 shrink-0">
//             <Logo />
//             <div className="border-l border-white/20 pl-3 text-left">
//               <h1 className="font-serif font-bold text-lg md:text-xl tracking-wide leading-tight text-white">
//                 Admin Dashboard
//               </h1>
//               <p className="text-[10px] text-gray-400 font-mono">Hệ thống quản trị nội bộ Cozygo</p>
//             </div>
//           </div>

//           {/* Cụm Phải: Vai trò Admin hiển thị trực quan và Nút đăng xuất */}
//           <div className="flex items-center space-x-5 shrink-0 text-xs font-bold">
//             <div className="text-right hidden sm:block">
//               <p className="text-gray-200 text-sm">Xin chào, Admin ✨</p>
//               <p className="text-[10px] text-gray-400 font-mono text-right">Quyền hạn tối cao</p>
//             </div>
            
//             <button
//               onClick={handleLogout}
//               className="bg-[#6E473B] hover:bg-[#57362c] text-white px-5 py-2.5 rounded-xl shadow transition transform active:scale-95 cursor-pointer font-bold border border-white/5"
//             >
//               Đăng xuất
//             </button>
//           </div>

//         </div>
//       </header>

//       {/* ==========================================
//           2. VÙNG HIỂN THỊ NỘI DUNG CHÍNH (CHÍNH GIỮA)
//          ========================================== */}
//       <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 w-full z-10 relative">
//         <div className="max-w-7xl mx-auto">
//           {children}
//         </div>
//       </main>

//       {/* ==========================================
//           3. PHẦN CHÂN TRANG: DÒNG BẢN QUYỀN NHỎ GỌN (FOOTER)
//          ========================================== */}
//       <footer className="bg-white border-t border-gray-200 py-4 text-center flex-shrink-0 w-full z-10">
//         <div className="max-w-7xl mx-auto px-4 text-[11px] text-gray-400 font-medium italic flex flex-col sm:flex-row items-center justify-between gap-1">
//           <span>© 2026 Cozygo Admin — Hệ thống quản trị dữ liệu đám mây</span>
//           <span className="text-[#6E473B]">Bảo mật thông tin & Bản quyền thuộc về ban quản lý Cozygo</span>
//         </div>
//       </footer>

//     </div>
//   );
// }

// import { useNavigate } from 'react-router-dom';
// import Logo from '../component/Logo'; // Đảm bảo đường dẫn import Logo này chính xác trong dự án của bạn

// export default function AdminLayout({ children }) {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị Cozygo?")) {
//       navigate('/login');
//     }
//   };

//   return (
//     <div className="bg-[#F4F1EA] min-h-screen flex flex-col justify-between text-[#23150d] font-sans antialiased text-left selection:bg-[#2C3E2B]/10">
      
//       {/* ==========================================================================
//           1. THANH HEADER ĐIỀU HƯỚNG TINH GỌN (CHỈ CÓ LOGO, DASHBOARD & THÔNG TIN ADMIN)
//           ========================================================================== */}
//       <header className="bg-[#202c3c] text-white shadow-lg sticky top-0 z-50 w-full">
//         {/* Giữ nội dung nằm giữa max-w-7xl nhưng dải màu xanh dark-blue vẫn tràn biên 100% */}
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
//           {/* Cụm Trái: Logo Cozygo & Tiêu đề phân hệ */}
//           <div className="flex items-center space-x-3 shrink-0">
//             <Logo />
//             <div className="border-l border-white/20 pl-3 text-left">
//               <h1 className="font-serif font-bold text-lg md:text-xl tracking-wide leading-tight text-white">
//                 Admin Dashboard
//               </h1>
//               <p className="text-[10px] text-gray-400 font-mono">Hệ thống quản trị nội bộ Cozygo</p>
//             </div>
//           </div>

//           {/* Cụm Phải: Vai trò Tài khoản quản trị & Nút Đăng xuất */}
//           <div className="flex items-center space-x-5 shrink-0 text-xs font-bold">
//             <div className="text-right hidden sm:block">
//               <p className="text-gray-200 text-sm">Xin chào, Admin ✨</p>
//               <p className="text-[10px] text-gray-400 font-mono text-right">Quyền hạn tối cao</p>
//             </div>
            
//             <button
//               onClick={handleLogout}
//               className="bg-[#6E473B] hover:bg-[#57362c] text-white px-5 py-2.5 rounded-xl shadow transition transform active:scale-95 cursor-pointer font-bold border border-white/5"
//             >
//               Đăng xuất
//             </button>
//           </div>

//         </div>
//       </header>

//       {/* ==========================================
//           2. VÙNG HIỂN THỊ NỘI DUNG ĐỘNG (MAIN CONTENT)
//          ========================================== */}
//       <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 w-full z-10 relative">
//         <div className="max-w-7xl mx-auto">
//           {children}
//         </div>
//       </main>

//       {/* ==========================================
//           3. PHẦN CHÂN TRANG: DÒNG BẢN QUYỀN NHỎ GỌN (FOOTER ADMIN)
//          ========================================== */}
//       <footer className="bg-white border-t border-gray-200 py-4 text-center flex-shrink-0 w-full z-10">
//         <div className="max-w-7xl mx-auto px-4 text-[11px] text-gray-400 font-medium italic flex flex-col sm:flex-row items-center justify-between gap-1">
//           <span>© 2026 Cozygo Admin — Nền tảng quản trị cơ sở dữ liệu đám mây</span>
//           <span className="text-[#6E473B]">Bảo mật thông tin & Bản quyền thuộc về ban quản lý Cozygo</span>
//         </div>
//       </footer>

//     </div>
//   );
// }

import { useNavigate } from 'react-router-dom';
import Logo from '../component/Logo'; // Kiểm tra đường dẫn Logo chuẩn của bạn

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị Cozygo?")) {
      navigate('/login');
    }
  };

  return (
    <div className="bg-[#F4F1EA] min-h-screen flex flex-col justify-between text-[#23150d] font-sans antialiased text-left selection:bg-[#2C3E2B]/10">
      
      {/* HEADER QUẢN TRỊ VIÊN TINH GỌN */}
      <header className="bg-[#202c3c] text-white shadow-md sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center space-x-3 shrink-0">
            <Logo />
            <div className="border-l border-white/20 pl-3 text-left">
              <h1 className="font-serif font-bold text-lg md:text-xl tracking-wide leading-tight text-white">
                Admin Dashboard
              </h1>
              <p className="text-[10px] text-gray-400 font-mono">Hệ thống quản trị nội bộ Cozygo</p>
            </div>
          </div>

          <div className="flex items-center space-x-5 shrink-0 text-xs font-bold">
            <div className="text-right hidden sm:block">
              <p className="text-gray-200 text-sm">Xin chào, Admin ✨</p>
              <p className="text-[10px] text-gray-400 font-mono text-right">Quyền hạn tối cao</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-[#6E473B] hover:bg-[#57362c] text-white px-5 py-2.5 rounded-xl shadow transition transform active:scale-95 cursor-pointer font-bold border border-white/5"
            >
              Đăng xuất
            </button>
          </div>

        </div>
      </header>

      {/* VÙNG NỘI DUNG RUỘT CỦA CÁC TRANG ADMIN */}
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 w-full z-10 relative">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* FOOTER BẢN QUYỀN DÒNG NHỎ */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center flex-shrink-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-4 text-[11px] text-gray-400 font-medium italic flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>© 2026 Cozygo Admin — Hệ thống quản trị dữ liệu đám mây</span>
          <span className="text-[#6E473B]">Bảo mật thông tin & Bản quyền thuộc về ban quản lý Cozygo</span>
        </div>
      </footer>

    </div>
  );
}