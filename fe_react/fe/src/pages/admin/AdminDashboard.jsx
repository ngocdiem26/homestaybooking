
// import { useNavigate } from 'react-router-dom';
// import Logo from '../../component/Logo';
// export default function AdminDashboard() {
//   const navigate = useNavigate();

//   // Dữ liệu giả lập cho phần thống kê đầu trang (Mô phỏng theo image_97a660.png)
//   const stats = [
//     { id: 1, label: "Khách hàng", count: "9", icon: "👥", bgColor: "bg-blue-50 text-blue-700" },
//     { id: 2, label: "Chủ nhà", count: "4", icon: "🏡", bgColor: "bg-amber-50 text-amber-700" },
//     { id: 3, label: "Homestay", count: "41", icon: "🌲", bgColor: "bg-green-50 text-green-700" },
//     { id: 4, label: "Doanh thu hệ thống", count: "14,521,000đ", icon: "💰", bgColor: "bg-emerald-50 text-emerald-700" },
//   ];

//   // Danh sách các khối chức năng quản lý cốt lõi (Bố cục 2 cột song song như hình mẫu)
//   const managementModules = [
//     {
//       title: "Quản lý Người dùng",
//       desc: "Xem danh sách, phân quyền tài khoản khách lữ hành và đối tác chủ nhà, khóa hoặc kích hoạt tài khoản vi phạm.",
//       icon: "🪪",
//       path: "/admin/users",
//       btnText: "Vào quản lý"
//     },
//     {
//       title: "Quản lý Homestay",
//       desc: "Kiểm duyệt các căn hộ gỗ, bungalow mới đăng ký, quản lý danh sách phòng đang hoạt động trên toàn hệ thống.",
//       icon: "🪵",
//       path: "/admin/homestays",
//       btnText: "Vào quản lý"
//     },
//     {
//       title: "Quản lý Đánh giá",
//       desc: "Theo dõi, kiểm tra phản hồi và số sao đánh giá của khách hàng nhằm đảm bảo tính khách quan của cộng đồng.",
//       icon: "💬",
//       path: "/admin/reviews",
//       btnText: "Xem đánh giá"
//     },
//     {
//       title: "Quản lý Khiếu nại",
//       desc: "Tiếp nhận và xử lý các tranh chấp, khiếu nại giữa khách hàng và chủ nhà liên quan đến đặt phòng hoặc hoàn tiền.",
//       icon: "⚖️",
//       path: "/admin/complaints",
//       btnText: "Xử lý khiếu nại"
//     },
//     {
//       title: "Quản lý Khuyến mãi",
//       desc: "Tạo mới, điều chỉnh thời hạn hoặc thiết lập các mã giảm giá, voucher kích cầu du lịch theo mùa cao điểm.",
//       icon: "🎟️",
//       path: "/admin/promotions",
//       btnText: "Quản lý mã"
//     },
//     {
//       title: "Quản lý Doanh thu",
//       desc: "Thống kê biểu đồ tài chính, tổng hợp hoa hồng chiết khấu sàn 8% và quản lý lịch sử đối soát định kỳ.",
//       icon: "📊",
//       path: "/admin/revenues",
//       btnText: "Xem doanh thu"
//     },
//     {
//       title: "Quản lý Đơn đặt phòng",
//       desc: "Tra cứu toàn bộ lịch sử booking, tình trạng nhận/trả phòng, quản lý các đơn yêu cầu hủy phòng cấp tốc.",
//       icon: "🧳",
//       path: "/admin/bookings",
//       btnText: "Vào quản lý đơn"
//     }
//   ];

//   return (
//     <div className="bg-[#F4F1EA] min-h-screen text-[#23150d] font-sans antialiased text-left selection:bg-[#2C3E2B]/10">
      
//       {/* ==========================================
//           1. THANH TOPBAR QUẢN TRỊ VIÊN
//          ========================================== */}
//       <header className="bg-[#202c3c] text-white px-6 py-4 shadow-md sticky top-0 z-50 flex justify-between items-center">
//         <div className="flex items-center space-x-3">
//           <Logo />
//           <h1 className="text-lg font-bold tracking-wide">Admin Dashboard</h1>
//         </div>
//         <div className="flex items-center space-x-4 text-xs font-semibold">
//           <div className="text-right hidden sm:block">
//             <p className="text-gray-200">Xin chào, Admin ✨</p>
//             <p className="text-[10px] text-gray-400 font-mono">Quyền hạn tối cao</p>
//           </div>
//           <button 
//             onClick={() => { if(window.confirm("Bạn muốn đăng xuất khỏi hệ thống Admin?")) navigate('/login'); }} 
//             className="bg-[#6E473B] hover:bg-[#57362c] px-4 py-2 rounded-xl transition shadow active:scale-95 text-white"
//           >
//             Đăng xuất
//           </button>
//         </div>
//       </header>

//       {/* VÙNG NỘI DUNG CHÍNH TRUNG TÂM */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 space-y-10">
        
//         {/* TIÊU ĐỀ TRANG TỔNG QUAN */}
//         <div className="space-y-1">
//           <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2C1E15]">Bảng điều khiển quản trị</h2>
//           <p className="text-xs md:text-sm text-gray-400 font-medium">Quản lý nhanh hàng, homestay, đánh giá và theo dõi doanh thu tổng quan.</p>
//         </div>

//         {/* ==========================================
//             2. PHẦN ĐẦU: KHỐI THỐNG KÊ (STATS GRID)
//            ========================================== */}
//         <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//           {stats.map(stat => (
//             <div 
//               key={stat.id} 
//               className="bg-white p-5 rounded-2xl border border-[#6E473B]/10 shadow-sm flex items-center space-x-4 transition hover:shadow-md duration-300"
//             >
//               <span className={`text-2xl p-3 rounded-xl ${stat.bgColor} shadow-inner shrink-0`}>
//                 {stat.icon}
//               </span>
//               <div className="space-y-0.5 truncate">
//                 <p className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
//                 <h4 className="text-base md:text-xl font-black text-[#2C1E15] tracking-tight font-mono truncate">{stat.count}</h4>
//               </div>
//             </div>
//           ))}
//         </section>

//         {/* ==========================================
//             3. PHẦN DƯỚI: KHỐI CÁC CHỨC NĂNG QUẢN LÝ (GRID CARDS)
//            ========================================== */}
//         <section className="space-y-6">
//           <h3 className="font-serif text-lg font-bold text-[#2C1E15] border-l-4 border-[#6E473B] pl-2.5">
//             Danh mục quản trị hệ thống
//           </h3>
          
//           {/* Chia layout Grid 2 cột song song chuẩn xác như sơ đồ hình 49 */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {managementModules.map((module, i) => (
//               <div 
//                 key={i} 
//                 className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-[#6E473B]/20 transition-all duration-300 group"
//               >
//                 <div className="flex items-start space-x-4">
//                   <span className="text-2xl p-3 bg-[#F4F1EA] rounded-xl text-[#2C3E2B] shadow-inner group-hover:scale-105 transition shrink-0">
//                     {module.icon}
//                   </span>
//                   <div className="space-y-1">
//                     <h4 className="text-base font-extrabold text-[#2C1E15] group-hover:text-[#6E473B] transition">
//                       {module.title}
//                     </h4>
//                     <p className="text-xs text-gray-500 font-medium leading-relaxed">
//                       {module.desc}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Nút bấm chuyển hướng chi tiết vào chức năng con */}
//                 <div className="pt-2 flex justify-end">
//                   <button 
//                     onClick={() => navigate(module.path)}
//                     className="bg-[#6c483a] hover:bg-[#1f2d20] text-[#F4F1EA] text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1"
//                   >
//                     {module.btnText} <span>❯</span>
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//       </main>
//     </div>
//   );
// }

// import { useNavigate } from 'react-router-dom';
// import AdminLayout from '../../layout/AdminLayout'; // Import bộ khung Layout của Admin

// export default function AdminDashboard() {
//   const navigate = useNavigate();

//   // Dữ liệu giả lập cho phần thống kê đầu trang (Mô phỏng theo hình ảnh image_97a660.png)
//   const stats = [
//     { id: 1, label: "Khách hàng", count: "9", icon: "👥", bgColor: "bg-blue-50 text-blue-700" },
//     { id: 2, label: "Chủ nhà", count: "4", icon: "🏡", bgColor: "bg-amber-50 text-amber-700" },
//     { id: 3, label: "Homestay", count: "41", icon: "🌲", bgColor: "bg-green-50 text-green-700" },
//     { id: 4, label: "Doanh thu hệ thống", count: "14,521,000đ", icon: "💰", bgColor: "bg-emerald-50 text-emerald-700" },
//   ];

//   // Danh sách các khối chức năng quản lý cốt lõi
//   const managementModules = [
//     {
//       title: "Quản lý Người dùng",
//       desc: "Xem danh sách, phân quyền tài khoản khách lữ hành và đối tác chủ nhà, khóa hoặc kích hoạt tài khoản vi phạm.",
//       icon: "🪪",
//       path: "/admin/users",
//       btnText: "Vào quản lý"
//     },
//     {
//       title: "Quản lý Homestay",
//       desc: "Kiểm duyệt các căn hộ gỗ, bungalow mới đăng ký, quản lý danh sách phòng đang hoạt động trên toàn hệ thống.",
//       icon: "🪵",
//       path: "/admin/homestays",
//       btnText: "Vào quản lý"
//     },
//     {
//       title: "Quản lý Đánh giá",
//       desc: "Theo dõi, kiểm tra phản hồi và số sao đánh giá của khách hàng nhằm đảm bảo tính khách quan của cộng đồng.",
//       icon: "💬",
//       path: "/admin/reviews",
//       btnText: "Xem đánh giá"
//     },
//     {
//       title: "Quản lý Khiếu nại",
//       desc: "Tiếp nhận và xử lý các tranh chấp, khiếu nại giữa khách hàng và chủ nhà liên quan đến đặt phòng hoặc hoàn tiền.",
//       icon: "⚖️",
//       path: "/admin/complaints",
//       btnText: "Xử lý khiếu nại"
//     },
//     {
//       title: "Quản lý Khuyến mãi",
//       desc: "Tạo mới, điều chỉnh thời hạn hoặc thiết lập các mã giảm giá, voucher kích cầu du lịch theo mùa cao điểm.",
//       icon: "🎟️",
//       path: "/admin/promotions",
//       btnText: "Quản lý mã"
//     },
//     {
//       title: "Quản lý Doanh thu",
//       desc: "Thống kê biểu đồ tài chính, tổng hợp hoa hồng chiết khấu sàn 8% và quản lý lịch sử đối soát định kỳ.",
//       icon: "📊",
//       path: "/admin/revenues",
//       btnText: "Xem doanh thu"
//     },
//     {
//       title: "Quản lý Đơn đặt phòng",
//       desc: "Tra cứu toàn bộ lịch sử booking, tình trạng nhận/trả phòng, quản lý các đơn yêu cầu hủy phòng cấp tốc.",
//       icon: "🧳",
//       path: "/admin/bookings",
//       btnText: "Vào quản lý đơn"
//     }
//   ];

//   return (
//     <AdminLayout>
//       <div className="space-y-10 animate-fade-in">
        
//         {/* TIÊU ĐỀ TRANG TỔNG QUAN NẰM GỌN TRONG CƠ CẤU LAYOUT MỚI */}
//         <div className="space-y-1">
//           <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2C1E15]">
//             Bảng điều khiển quản trị
//           </h2>
//           <p className="text-xs md:text-sm text-gray-400 font-medium">
//             Quản lý nhanh hàng, homestay, đánh giá và theo dõi doanh thu tổng quan hệ thống.
//           </p>
//         </div>

//         {/* ==========================================
//             1. PHẦN ĐẦU: KHỐI THỐNG KÊ (STATS GRID)
//            ========================================== */}
//         <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//           {stats.map(stat => (
//             <div 
//               key={stat.id} 
//               className="bg-white p-5 rounded-2xl border border-[#6E473B]/10 shadow-sm flex items-center space-x-4 transition hover:shadow-md duration-300"
//             >
//               <span className={`text-2xl p-3 rounded-xl ${stat.bgColor} shadow-inner shrink-0`}>
//                 {stat.icon}
//               </span>
//               <div className="space-y-0.5 truncate">
//                 <p className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
//                 <h4 className="text-base md:text-xl font-black text-[#2C1E15] tracking-tight font-mono truncate">{stat.count}</h4>
//               </div>
//             </div>
//           ))}
//         </section>

//         {/* ==========================================
//             2. PHẦN DƯỚI: KHỐI CÁC CHỨC NĂNG QUẢN LÝ (GRID CARDS)
//            ========================================== */}
//         <section className="space-y-6">
//           <h3 className="font-serif text-lg font-bold text-[#2C1E15] border-l-4 border-[#6E473B] pl-2.5">
//             Danh mục quản trị hệ thống
//           </h3>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {managementModules.map((module, i) => (
//               <div 
//                 key={i} 
//                 className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-[#6E473B]/20 transition-all duration-300 group"
//               >
//                 <div className="flex items-start space-x-4">
//                   <span className="text-2xl p-3 bg-[#F4F1EA] rounded-xl text-[#2C3E2B] shadow-inner group-hover:scale-105 transition shrink-0">
//                     {module.icon}
//                   </span>
//                   <div className="space-y-1">
//                     <h4 className="text-base font-extrabold text-[#2C1E15] group-hover:text-[#6E473B] transition">
//                       {module.title}
//                     </h4>
//                     <p className="text-xs text-gray-500 font-medium leading-relaxed">
//                       {module.desc}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Nút bấm chuyển hướng chi tiết vào chức năng con */}
//                 <div className="pt-2 flex justify-end">
//                   <button 
//                     onClick={() => navigate(module.path)}
//                     className="bg-[#6c483a] hover:bg-[#1f2d20] text-[#F4F1EA] text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1"
//                   >
//                     {module.btnText} <span>❯</span>
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//       </div>
//     </AdminLayout>
//   );
// }
// import { useNavigate } from 'react-router-dom';
// import AdminLayout from '../../layout/AdminLayout'; // Import bộ khung Layout tinh gọn vừa bóc tách

// export default function AdminDashboard() {
//   const navigate = useNavigate();

//   // Dữ liệu giả lập cho phần thống kê đầu trang
//   const stats = [
//     { id: 1, label: "Khách hàng", count: "9", icon: "👥", bgColor: "bg-blue-50 text-blue-700" },
//     { id: 2, label: "Chủ nhà", count: "4", icon: "🏡", bgColor: "bg-amber-50 text-amber-700" },
//     { id: 3, label: "Homestay", count: "41", icon: "🌲", bgColor: "bg-green-50 text-green-700" },
//     { id: 4, label: "Doanh thu hệ thống", count: "14,521,000đ", icon: "💰", bgColor: "bg-emerald-50 text-emerald-700" },
//   ];

//   // Danh sách các khối chức năng quản lý cốt lõi
//   const managementModules = [
//     {
//       title: "Quản lý Người dùng",
//       desc: "Xem danh sách, phân quyền tài khoản khách lữ hành và đối tác chủ nhà, khóa hoặc kích hoạt tài khoản vi phạm.",
//       icon: "🪪",
//       path: "/admin/users",
//       btnText: "Vào quản lý"
//     },
//     {
//       title: "Quản lý Homestay",
//       desc: "Kiểm duyệt các căn hộ gỗ, bungalow mới đăng ký, quản lý danh sách phòng đang hoạt động trên toàn hệ thống.",
//       icon: "🪵",
//       path: "/admin/homestays",
//       btnText: "Vào quản lý"
//     },
//     {
//       title: "Quản lý Đánh giá",
//       desc: "Theo dõi, kiểm tra phản hồi và số sao đánh giá của khách hàng nhằm đảm bảo tính khách quan của cộng đồng.",
//       icon: "💬",
//       path: "/admin/reviews",
//       btnText: "Xem đánh giá"
//     },
//     {
//       title: "Quản lý Khiếu nại",
//       desc: "Tiếp nhận và xử lý các tranh chấp, khiếu nại giữa khách hàng và chủ nhà liên quan đến đặt phòng hoặc hoàn tiền.",
//       icon: "⚖️",
//       path: "/admin/complaints",
//       btnText: "Xử lý khiếu nại"
//     },
//     {
//       title: "Quản lý Khuyến mãi",
//       desc: "Tạo mới, điều chỉnh thời hạn hoặc thiết lập các mã giảm giá, voucher kích cầu du lịch theo mùa cao điểm.",
//       icon: "🎟️",
//       path: "/admin/promotions",
//       btnText: "Quản lý mã"
//     },
//     {
//       title: "Quản lý Doanh thu",
//       desc: "Thống kê biểu đồ tài chính, tổng hợp hoa hồng chiết khấu sàn 8% và quản lý lịch sử đối soát định kỳ.",
//       icon: "📊",
//       path: "/admin/revenues",
//       btnText: "Xem doanh thu"
//     },
//     {
//       title: "Quản lý Đơn đặt phòng",
//       desc: "Tra cứu toàn bộ lịch sử booking, tình trạng nhận/trả phòng, quản lý các đơn yêu cầu hủy phòng cấp tốc.",
//       icon: "🧳",
//       path: "/admin/bookings",
//       btnText: "Vào quản lý đơn"
//     }
//   ];

//   return (
//     <AdminLayout>
//       <div className="space-y-10 animate-fade-in">
        
//         {/* TIÊU ĐỀ TRANG TỔNG QUAN NẰM GỌN TRONG CƠ CẤU LAYOUT MỚI */}
//         <div className="space-y-1">
//           <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2C1E15]">
//             Bảng điều khiển quản trị
//           </h2>
//           <p className="text-xs md:text-sm text-gray-400 font-medium">
//             Quản lý nhanh hàng, homestay, đánh giá và theo dõi doanh thu tổng quan hệ thống.
//           </p>
//         </div>

//         {/* ==========================================
//             1. PHẦN ĐẦU: KHỐI THỐNG KÊ (STATS GRID)
//            ========================================== */}
//         <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//           {stats.map(stat => (
//             <div 
//               key={stat.id} 
//               className="bg-white p-5 rounded-2xl border border-[#6E473B]/10 shadow-sm flex items-center space-x-4 transition hover:shadow-md duration-300"
//             >
//               <span className={`text-2xl p-3 rounded-xl ${stat.bgColor} shadow-inner shrink-0`}>
//                 {stat.icon}
//               </span>
//               <div className="space-y-0.5 truncate">
//                 <p className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
//                 <h4 className="text-base md:text-xl font-black text-[#2C1E15] tracking-tight font-mono truncate">{stat.count}</h4>
//               </div>
//             </div>
//           ))}
//         </section>

//         {/* ==========================================
//             2. PHẦN DƯỚI: KHỐI CÁC CHỨC NĂNG QUẢN LÝ (GRID CARDS)
//            ========================================== */}
//         <section className="space-y-6">
//           <h3 className="font-serif text-lg font-bold text-[#2C1E15] border-l-4 border-[#6E473B] pl-2.5">
//             Danh mục quản trị hệ thống
//           </h3>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {managementModules.map((module, i) => (
//               <div 
//                 key={i} 
//                 className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-[#6E473B]/20 transition-all duration-300 group"
//               >
//                 <div className="flex items-start space-x-4">
//                   <span className="text-2xl p-3 bg-[#F4F1EA] rounded-xl text-[#2C3E2B] shadow-inner group-hover:scale-105 transition shrink-0">
//                     {module.icon}
//                   </span>
//                   <div className="space-y-1">
//                     <h4 className="text-base font-extrabold text-[#2C1E15] group-hover:text-[#6E473B] transition">
//                       {module.title}
//                     </h4>
//                     <p className="text-xs text-gray-500 font-medium leading-relaxed">
//                       {module.desc}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Nút bấm chuyển hướng chi tiết vào chức năng con */}
//                 <div className="pt-2 flex justify-end">
//                   <button 
//                     onClick={() => navigate(module.path)}
//                     className="bg-[#6c483a] hover:bg-[#1f2d20] text-[#F4F1EA] text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1"
//                   >
//                     {module.btnText} <span>❯</span>
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//       </div>
//     </AdminLayout>
//   );
// }
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layout/AdminLayout'; // Đường dẫn tìm đến file AdminLayout bạn vừa lưu

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Dữ liệu thống kê đầu trang
  const stats = [
    { id: 1, label: "Khách hàng", count: "9", icon: "👥", bgColor: "bg-blue-50 text-blue-700" },
    { id: 2, label: "Chủ nhà", count: "4", icon: "🏡", bgColor: "bg-amber-50 text-amber-700" },
    { id: 3, label: "Homestay", count: "41", icon: "🌲", bgColor: "bg-green-50 text-green-700" },
    { id: 4, label: "Doanh thu hệ thống", count: "14,521,000đ", icon: "💰", bgColor: "bg-emerald-50 text-emerald-700" },
  ];

  // Danh sách các khối chức năng quản lý cốt lõi
  const managementModules = [
    { title: "Quản lý Người dùng", desc: "Xem danh sách, phân quyền tài khoản khách lữ hành và đối tác chủ nhà, khóa hoặc kích hoạt tài khoản vi phạm.", icon: "🪪", path: "/admin/users", btnText: "Vào quản lý" },
    { title: "Quản lý Homestay", desc: "Kiểm duyệt các căn hộ gỗ, bungalow mới đăng ký, quản lý danh sách phòng đang hoạt động trên toàn hệ thống.", icon: "🪵", path: "/admin/homestays", btnText: "Vào quản lý" },
    { title: "Quản lý Đánh giá", desc: "Theo dõi, kiểm tra phản hồi và số sao đánh giá của khách hàng nhằm đảm bảo tính khách quan của cộng đồng.", icon: "💬", path: "/admin/reviews", btnText: "Xem đánh giá" },
    { title: "Quản lý Khiếu nại", desc: "Tiếp nhận và xử lý các tranh chấp, khiếu nại giữa khách hàng và chủ nhà liên quan đến đặt phòng hoặc hoàn tiền.", icon: "⚖️", path: "/admin/complaints", btnText: "Xử lý khiếu nại" },
    { title: "Quản lý Khuyến mãi", desc: "Tạo mới, điều chỉnh thời hạn hoặc thiết lập các mã giảm giá, voucher kích cầu du lịch theo mùa cao điểm.", icon: "🎟️", path: "/admin/promotions", btnText: "Quản lý mã" },
    { title: "Quản lý Doanh thu", desc: "Thống kê biểu đồ tài chính, tổng hợp hoa hồng chiết khấu sàn 8% và quản lý lịch sử đối soát định kỳ.", icon: "📊", path: "/admin/revenue", btnText: "Xem doanh thu" },
    { title: "Quản lý Đơn đặt phòng", desc: "Tra cứu toàn bộ lịch sử booking, tình trạng nhận/trả phòng, quản lý các đơn yêu cầu hủy phòng cấp tốc.", icon: "🧳", path: "/admin/bookings", btnText: "Vào quản lý đơn" }
  ];

  return (
    <AdminLayout>
      {/* ĐÃ XÓA SẠCH HEADER CŨ NÊN KHÔNG BAO GIỜ BỊ XUNG ĐỘT GIAO DIỆN NỮA */}
      <div className="space-y-10 animate-fade-in text-left">
        
        {/* TIÊU ĐỀ TRANG TỔNG QUAN */}
        <div className="space-y-1">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2C1E15]">Bảng điều khiển quản trị</h2>
          <p className="text-xs md:text-sm text-gray-400 font-medium">Quản lý nhanh hàng, homestay, đánh giá và theo dõi doanh thu tổng quan.</p>
        </div>

        {/* ==========================================
            1. PHẦN ĐẦU: KHỐI THỐNG KÊ (STATS GRID)
           ========================================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map(stat => (
            <div 
              key={stat.id} 
              className="bg-white p-5 rounded-2xl border border-[#6E473B]/10 shadow-sm flex items-center space-x-4 transition hover:shadow-md duration-300"
            >
              <span className={`text-2xl p-3 rounded-xl ${stat.bgColor} shadow-inner shrink-0`}>
                {stat.icon}
              </span>
              <div className="space-y-0.5 truncate">
                <p className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h4 className="text-base md:text-xl font-black text-[#2C1E15] tracking-tight font-mono truncate">{stat.count}</h4>
              </div>
            </div>
          ))}
        </section>

        {/* ==========================================
            2. PHẦN DƯỚI: KHỐI CÁC CHỨC NĂNG QUẢN LÝ (GRID CARDS)
           ========================================== */}
        <section className="space-y-6">
          <h3 className="font-serif text-lg font-bold text-[#2C1E15] border-l-4 border-[#6E473B] pl-2.5">
            Danh mục quản trị hệ thống
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {managementModules.map((module, i) => (
              <div 
                key={i} 
                className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-[#6E473B]/20 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <span className="text-2xl p-3 bg-[#F4F1EA] rounded-xl text-[#2C3E2B] shadow-inner group-hover:scale-105 transition shrink-0">
                    {module.icon}
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-[#2C1E15] group-hover:text-[#6E473B] transition">
                      {module.title}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      {module.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => navigate(module.path)}
                    className="bg-[#2C3E2B] hover:bg-[#1f2d20] text-[#F4F1EA] text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    {module.btnText} <span>❯</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </AdminLayout>
  );
}