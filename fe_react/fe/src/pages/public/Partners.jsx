// import { useNavigate } from 'react-router-dom';
// import UserLayout from '../../layouts/UserLayout';

// export default function Partners() {
//   const navigate = useNavigate();

//   // Hàm xử lý điều hướng thẳng đến trang đăng ký với vai trò Chủ nhà mặc định
//   const handleGoToRegisterHost = () => {
//     navigate('/register', { 
//       state: { userType: 'host' } 
//     });
//   };

//   return (
//     <UserLayout>
//       <div className="bg-[#F4F1EA] min-h-screen text-[#23150d] animate-fade-in space-y-16 pb-24">
        
//         {/* ==========================================
//             1. HERO BANNER ĐẦU TRANG
//            ========================================== */}
//         <section className="bg-[#202c3c] text-white pt-20 pb-24 px-6 md:px-12 text-center relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50 z-0 pointer-events-none"></div>
          
//           <div className="relative z-10 max-w-3xl mx-auto space-y-3">
//             <span className="bg-[#6E473B] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-sm">
//               Cộng đồng chủ nhà Cozygo
//             </span>
//             <h1 className="font-classic text-3xl md:text-5xl font-serif font-bold tracking-tight">
//               Hợp Tác Phát Triển Cùng Cozygo
//             </h1>
//             <p className="text-xs md:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
//               Khai phóng tiềm năng cơ sở lưu trú của bạn. Kết nối trực tiếp với cộng đồng lữ khách đam mê trải nghiệm mộc mạc và thiên nhiên hoang sơ.
//             </p>
//           </div>
//         </section>

//         {/* ==========================================
//             2. KHỐI LÝ DO NÊN CHỌN COZYGO (ĐIỂM KHÁC BIỆT SO VỚI SÀN KHÁC)
//            ========================================== */}
//         <section className="max-w-6xl mx-auto px-6 text-left">
//           <div className="text-center md:text-left mb-10 space-y-1">
//             <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15]">
//               Tại sao nên chọn Cozygo mà không phải sàn khác?
//             </h2>
//             <p className="text-xs text-gray-400">
//               Chúng tôi tạo ra một hệ sinh thái ngách chuyên biệt, nơi giá trị không gian của bạn được trân trọng tối đa
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="bg-white p-6 rounded-2xl border border-[#6E473B]/10 shadow-sm space-y-3">
//               <div className="text-2xl bg-[#6E473B]/10 text-[#6E473B] w-10 h-10 rounded-xl flex items-center justify-center">🎯</div>
//               <h3 className="font-classic text-sm font-bold text-[#2C1E15]">Đúng tệp khách hàng mục tiêu</h3>
//               <p className="text-xs text-gray-500 leading-relaxed font-medium">
//                 Khác với các sàn OTA đại trà (như Agoda, Booking), tệp khách hàng của Cozygo là những người chủ động tìm kiếm gu nghỉ dưỡng mộc mạc, yêu thiên nhiên, và sẵn sàng chi trả cao cho các gói trải nghiệm bản địa đi kèm.
//               </p>
//             </div>

//             <div className="bg-white p-6 rounded-2xl border border-[#6E473B]/10 shadow-sm space-y-3">
//               <div className="text-2xl bg-[#2C3E2B]/10 text-[#2C3E2B] w-10 h-10 rounded-xl flex items-center justify-center">📉</div>
//               <h3 className="font-classic text-sm font-bold text-[#2C1E15]">Chiết khấu sàn cực thấp (Chỉ 8%)</h3>
//               <p className="text-xs text-gray-500 leading-relaxed font-medium">
//                 Nói tạm biệt với mức phí hoa hồng cắt cổ 15% - 20% từ các tập đoàn nước ngoài. Cozygo đồng hành bền vững cùng chủ nhà Việt với mức phí tối ưu chỉ 8%, giúp bạn tối đa hóa biên lợi nhuận thực tế.
//               </p>
//             </div>

//             <div className="bg-white p-6 rounded-2xl border border-[#6E473B]/10 shadow-sm space-y-3">
//               <div className="text-2xl bg-amber-500/10 text-amber-700 w-10 h-10 rounded-xl flex items-center justify-center">⚡</div>
//               <h3 className="font-classic text-sm font-bold text-[#2C1E15]">Hệ thống vận hành tự động</h3>
//               <p className="text-xs text-gray-500 leading-relaxed font-medium">
//                 Tích hợp lịch đồng bộ thời gian thực chống overbook, hệ thống tự động tạo mã tracking, gửi thông báo trạng thái đặt phòng qua email và đối soát doanh thu tự động chuẩn xác hàng tuần.
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* ==========================================
//             3. KHỐI QUYỀN LỢI CỦA ĐỐI TÁC CHỦ NHÀ
//            ========================================== */}
//         <section className="max-w-6xl mx-auto px-6 text-left">
//           <div className="text-center md:text-left mb-10 space-y-1">
//             <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15]">
//               Quyền lợi đặc quyền khi đồng hành
//             </h2>
//             <p className="text-xs text-gray-400">
//               Cozygo cam kết hỗ trợ toàn diện để cơ sở kinh doanh của bạn đạt tỷ lệ lấp phòng tối ưu
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm font-medium text-gray-600">
//             <div className="flex items-start gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
//               <span className="text-xl">📸</span>
//               <div>
//                 <h4 className="font-bold text-[#2C1E15] mb-1">Hỗ trợ truyền thông & Nhiếp ảnh</h4>
//                 <p className="text-xs text-gray-400 leading-relaxed">Đội ngũ media của Cozygo hỗ trợ chụp ảnh không gian, quay video ngắn trải nghiệm bản địa miễn phí để đẩy mạnh quảng bá trên đa nền tảng mạng xã hội.</p>
//               </div>
//             </div>

//             <div className="flex items-start gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
//               <span className="text-xl">🛠️</span>
//               <div>
//                 <h4 className="font-bold text-[#2C1E15] mb-1">Hệ thống quản lý thông minh (CMS)</h4>
//                 <p className="text-xs text-gray-400 leading-relaxed">Cung cấp tài khoản Extranet chuyên nghiệp độc quyền, giúp quản lý quỹ phòng, điều chỉnh bảng giá mùa cao điểm/thấp điểm linh hoạt chỉ trong 1 chạm.</p>
//               </div>
//             </div>

//             <div className="flex items-start gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
//               <span className="text-xl">🤝</span>
//               <div>
//                 <h4 className="font-bold text-[#2C1E15] mb-1">Đóng gói gói trải nghiệm độc quyền</h4>
//                 <p className="text-xs text-gray-400 leading-relaxed">Hỗ trợ thiết kế, lồng ghép các hoạt động đặc thù tại homestay của bạn (như tiệc nướng BBQ, lội suối, cấy lúa) thành combo hấp dẫn để gia tăng doanh thu trên mỗi lượt khách.</p>
//               </div>
//             </div>

//             <div className="flex items-start gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
//               <span className="text-xl">⚖️</span>
//               <div>
//                 <h4 className="font-bold text-[#2C1E15] mb-1">Bảo vệ quyền lợi chủ nhà tuyệt đối</h4>
//                 <p className="text-xs text-gray-400 leading-relaxed">Áp dụng chính sách đặt cọc nghiêm ngặt, quy trình xử lý đền bù hư tổn tài sản minh bạch và bộ quy tắc ứng xử bắt buộc đối với mọi lữ khách khi thuê phòng.</p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ==========================================
//             4. KHỐI ĐIỀU KHOẢN SỬ DỤNG TÀI KHOẢN ĐỐI TÁC
//            ========================================== */}
//         <section className="max-w-4xl mx-auto px-6 text-left">
//           <div className="space-y-4 bg-white p-6 md:p-8 rounded-2xl border border-[#6E473B]/5 shadow-sm">
//             <h2 className="font-classic text-xl md:text-2xl font-bold text-[#2C1E15] border-b border-gray-100 pb-3 flex items-center gap-2">
//               📜 Quy định điều khoản sử dụng tài khoản đối tác Cozygo
//             </h2>
//             <div className="text-xs md:text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
//               <p>
//                 Cá nhân có quyền truy cập vào hệ thống quản lý trực tuyến (**Cozygo Extranet**) phải tuân thủ nghiêm ngặt các quy định sau: không gửi tin nhắn rác tiếp thị sai mục đích đến khách hàng, không giả mạo danh tính, không chia sẻ hay bán lại thông tin đăng nhập, không tải lên mã độc gây suy yếu máy chủ dữ liệu.
//               </p>
//               <p>
//                 Mọi hành vi vi phạm ảnh hưởng đến uy tín hệ thống sẽ bị **đình chỉ quyền truy cập lập tức** và chấm dứt hợp đồng vĩnh viễn theo thỏa thuận ký kết chính thức.
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* ==========================================
//             5. KHỐI NÚT KÊU GỌI HÀNH ĐỘNG KHỔ LỚN
//            ========================================== */}
//         <section className="max-w-4xl mx-auto px-6 text-center">
//           <div className="bg-[#2C3E2B] text-white p-8 md:p-12 rounded-[32px] space-y-6 shadow-xl relative overflow-hidden flex flex-col items-center justify-center">
//             <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none"></div>
            
//             <div className="relative z-10 max-w-xl mx-auto space-y-2">
//               <h3 className="font-classic text-xl md:text-2xl font-bold text-[#E7B10A]">
//                 Bắt đầu hành trình thịnh vượng cùng Cozygo ngay hôm nay
//               </h3>
//               <p className="text-xs text-gray-300 leading-relaxed">
//                 Hệ thống tự động đồng bộ vai trò Chủ Nhà để tối giản hóa các bước xác minh hồ sơ của bạn.
//               </p>
//             </div>

//             <button 
//               onClick={handleGoToRegisterHost}
//               className="relative z-10 bg-[#6E473B] hover:bg-[#57362c] text-white font-bold text-xs md:text-sm uppercase tracking-widest px-10 py-4 rounded-2xl shadow-xl transition transform active:scale-98 flex items-center gap-2"
//             >
//               🚀 Đăng ký kinh doanh với vai trò chủ nhà
//             </button>
//           </div>
//         </section>

//       </div>
//     </UserLayout>
//   );
// }
// import { useNavigate } from 'react-router-dom';
// import UserLayout from '../../layouts/UserLayout';

// // Import các icon chuẩn từ react-icons/fa6
// import {
//   FaBullseye,
//   FaArrowTrendDown,
//   FaBolt,
//   FaCamera,
//   FaScrewdriverWrench,
//   FaHandshake,
//   FaShieldHalved,
//   FaFileContract,
//   FaArrowRight,
//   FaCircleCheck,
//   FaWandMagicSparkles,
// } from 'react-icons/fa6';

// export default function Partners() {
//   const navigate = useNavigate();

//   // Hàm xử lý điều hướng thẳng đến trang đăng ký với vai trò Chủ nhà mặc định
//   const handleGoToRegisterHost = () => {
//     navigate('/register', { 
//       state: { userType: 'host' } 
//     });
//   };

//   return (
//     <UserLayout>
//       <div className="bg-[#FAF8F5] min-h-screen text-[#23150d] font-sans">
        
//         {/* ==========================================
//             1. HERO SECTION
//            ========================================== */}
//         <section className="relative bg-[#1A232E] text-white pt-24 pb-32 px-6 md:px-12 overflow-hidden">
//           {/* Nền hiệu ứng đốm sáng */}
//           <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#E7B10A_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
//           <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#6E473B]/30 rounded-full blur-3xl pointer-events-none"></div>
//           <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#2C3E2B]/40 rounded-full blur-3xl pointer-events-none"></div>

//           <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
//             <div className="inline-flex items-center gap-2 bg-[#6E473B]/30 border border-[#6E473B]/50 backdrop-blur-md px-4 py-1.5 rounded-full">
//               <FaWandMagicSparkles className="w-3.5 h-3.5 text-[#E7B10A]" />
//               <span className="text-xs uppercase font-semibold tracking-widest text-amber-200">
//                 Cộng đồng chủ nhà Cozygo
//               </span>
//             </div>

//             <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight leading-tight text-[#F4F1EA]">
//               Khai Phóng Tiềm Năng <br className="hidden md:block" />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-300">
//                 Homestay Mộc Mạc
//               </span> Cùng Cozygo
//             </h1>

//             <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
//               Kết nối không gian nghỉ dưỡng tự nhiên của bạn với hàng ngàn lữ khách tìm kiếm trải nghiệm bản địa đích thực. Tối ưu doanh thu với chi phí vận hành thấp nhất.
//             </p>

//             <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
//               <button 
//                 onClick={handleGoToRegisterHost}
//                 className="w-full sm:w-auto bg-[#6E473B] hover:bg-[#57362c] text-white font-semibold text-sm tracking-wide px-8 py-4 rounded-xl shadow-lg shadow-[#6E473B]/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
//               >
//                 <span>Trở thành Chủ Nhà ngay</span>
//                 <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
//               </button>
//             </div>

//             {/* Thống kê nhanh (Stats Counter) */}
//             <div className="pt-12 grid grid-cols-2 md:grid-cols-3 gap-6 border-t border-white/10 max-w-3xl mx-auto text-left md:text-center">
//               <div>
//                 <p className="text-2xl md:text-3xl font-bold text-[#E7B10A]">8%</p>
//                 <p className="text-xs text-gray-400 mt-1">Phí hoa hồng (Thấp nhất thị trường)</p>
//               </div>
//               <div>
//                 <p className="text-2xl md:text-3xl font-bold text-[#E7B10A]">1,200+</p>
//                 <p className="text-xs text-gray-400 mt-1">Đối tác Homestay đồng hành</p>
//               </div>
//               <div className="col-span-2 md:col-span-1">
//                 <p className="text-2xl md:text-3xl font-bold text-[#E7B10A]">95%</p>
//                 <p className="text-xs text-gray-400 mt-1">Tỷ lệ lấp phòng mùa cao điểm</p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ==========================================
//             2. BENTO GRID: ĐIỂM KHÁC BIỆT CỦA COZYGO
//            ========================================== */}
//         <section className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
//           <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#6E473B]/10 space-y-8">
//             <div className="text-center max-w-2xl mx-auto space-y-2">
//               <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2C1E15]">
//                 Tại sao các Host chọn Cozygo?
//               </h2>
//               <p className="text-xs md:text-sm text-gray-500">
//                 Chúng tôi không phải sàn OTA đại trà. Cozygo là hệ sinh thái ngách dành riêng cho mô hình nghỉ dưỡng mộc mạc và thiên nhiên.
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {/* Card 1 */}
//               <div className="bg-[#FAF8F5] p-7 rounded-2xl border border-[#6E473B]/10 hover:border-[#6E473B]/30 transition-all duration-300 flex flex-col justify-between group">
//                 <div className="space-y-4">
//                   <div className="w-12 h-12 rounded-xl bg-[#6E473B]/10 text-[#6E473B] flex items-center justify-center group-hover:bg-[#6E473B] group-hover:text-white transition-colors duration-300">
//                     <FaBullseye className="text-xl" />
//                   </div>
//                   <h3 className="font-bold text-base text-[#2C1E15]">Chuẩn tệp khách hàng</h3>
//                   <p className="text-xs text-gray-600 leading-relaxed">
//                     Khách hàng Cozygo là những người chủ động tìm gu nghỉ dưỡng hòa mình với thiên nhiên, trân trọng không gian và sẵn sàng chi trả cho các gói trải nghiệm bản địa.
//                   </p>
//                 </div>
//               </div>

//               {/* Card 2 - Highlight */}
//               <div className="bg-[#2C3E2B] text-white p-7 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden group">
//                 <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
//                 <div className="space-y-4 relative z-10">
//                   <div className="w-12 h-12 rounded-xl bg-white/10 text-[#E7B10A] flex items-center justify-center">
//                     <FaArrowTrendDown className="text-xl" />
//                   </div>
//                   <span className="inline-block text-[10px] bg-[#E7B10A] text-black font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
//                     Tối ưu chi phí
//                   </span>
//                   <h3 className="font-bold text-base text-white">Hoa hồng cố định 8%</h3>
//                   <p className="text-xs text-gray-200 leading-relaxed">
//                     Tạm biệt mức phí hoa hồng 15% - 20% từ các sàn quốc tế. Cozygo cam kết đồng hành bền vững cùng chủ nhà Việt với mức chiết khấu cực kỳ tối ưu.
//                   </p>
//                 </div>
//               </div>

//               {/* Card 3 */}
//               <div className="bg-[#FAF8F5] p-7 rounded-2xl border border-[#6E473B]/10 hover:border-[#6E473B]/30 transition-all duration-300 flex flex-col justify-between group">
//                 <div className="space-y-4">
//                   <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
//                     <FaBolt className="text-xl" />
//                   </div>
//                   <h3 className="font-bold text-base text-[#2C1E15]">Vận hành tự động hóa</h3>
//                   <p className="text-xs text-gray-600 leading-relaxed">
//                     Đồng bộ lịch thời gian thực tránh overbook, tự động gửi xác nhận đặt phòng, mã tracking và đối soát doanh thu minh bạch hàng tuần.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ==========================================
//             3. QUYỀN LỢI ĐẶC QUYỀN
//            ========================================== */}
//         <section className="max-w-6xl mx-auto px-6 py-20 space-y-12">
//           <div className="text-center max-w-2xl mx-auto space-y-2">
//             <h2 className="font-serif text-3xl font-bold text-[#2C1E15]">
//               Đặc quyền dành riêng cho Host
//             </h2>
//             <p className="text-xs md:text-sm text-gray-500">
//               Cozygo cung cấp đầy đủ công cụ và sự hỗ trợ để nâng tầm thương hiệu Homestay của bạn
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-5 hover:shadow-md transition-shadow">
//               <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#6E473B]/10 text-[#6E473B] flex items-center justify-center">
//                 <FaCamera className="text-xl" />
//               </div>
//               <div className="space-y-2">
//                 <h3 className="font-bold text-base text-[#2C1E15]">Hỗ trợ Truyền thông & Nhiếp ảnh</h3>
//                 <p className="text-xs text-gray-500 leading-relaxed">
//                   Đội ngũ Media hỗ trợ chụp ảnh không gian, quay video trải nghiệm miễn phí để chạy chiến dịch quảng bá đa kênh (TikTok, Facebook, Instagram).
//                 </p>
//               </div>
//             </div>

//             <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-5 hover:shadow-md transition-shadow">
//               <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#2C3E2B]/10 text-[#2C3E2B] flex items-center justify-center">
//                 <FaScrewdriverWrench className="text-xl" />
//               </div>
//               <div className="space-y-2">
//                 <h3 className="font-bold text-base text-[#2C1E15]">Hệ thống quản lý thông minh (Extranet)</h3>
//                 <p className="text-xs text-gray-500 leading-relaxed">
//                   Giao diện quản lý độc quyền giúp cập nhật bảng giá linh hoạt theo mùa, điều chỉnh quỹ phòng và theo dõi báo cáo doanh thu trực quan.
//                 </p>
//               </div>
//             </div>

//             <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-5 hover:shadow-md transition-shadow">
//               <div className="shrink-0 w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
//                 <FaHandshake className="text-xl" />
//               </div>
//               <div className="space-y-2">
//                 <h3 className="font-bold text-base text-[#2C1E15]">Đóng gói Gói trải nghiệm (Tour combo)</h3>
//                 <p className="text-xs text-gray-500 leading-relaxed">
//                   Hỗ trợ thiết kế các hoạt động đặc thù tại homestay (tiệc nướng BBQ, hái chè, cắm trại, chèo SUP) thành gói dịch vụ gia tăng lợi nhuận.
//                 </p>
//               </div>
//             </div>

//             <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-5 hover:shadow-md transition-shadow">
//               <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center">
//                 <FaShieldHalved className="text-xl" />
//               </div>
//               <div className="space-y-2">
//                 <h3 className="font-bold text-base text-[#2C1E15]">Bảo vệ quyền lợi Chủ nhà tuyệt đối</h3>
//                 <p className="text-xs text-gray-500 leading-relaxed">
//                   Chính sách đặt cọc nghiêm ngặt, quy trình xử lý đền bù đứt gãy/hư hại tài sản rõ ràng cùng bộ quy tắc ứng xử bắt buộc dành cho khách thuê.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ==========================================
//             4. ĐIỀU KHOẢN VÀ QUY ĐỊNH
//            ========================================== */}
//         <section className="max-w-4xl mx-auto px-6 pb-16">
//           <div className="bg-[#FAF8F5] p-6 md:p-8 rounded-3xl border border-[#6E473B]/15 space-y-4">
//             <div className="flex items-center gap-3 border-b border-[#6E473B]/10 pb-4">
//               <FaFileContract className="text-lg text-[#6E473B]" />
//               <h2 className="font-serif text-lg font-bold text-[#2C1E15]">
//                 Quy định & Điều khoản sử dụng hệ thống
//               </h2>
//             </div>
            
//             <div className="text-xs text-gray-600 leading-relaxed space-y-3 font-medium">
//               <div className="flex items-start gap-2">
//                 <FaCircleCheck className="text-sm text-[#2C3E2B] shrink-0 mt-0.5" />
//                 <p>
//                   Chủ nhà khi truy cập hệ thống <strong className="text-black">Cozygo Extranet</strong> cam kết không phát tán tin nhắn rác, không đăng tải thông tin sai sự thật hoặc chia sẻ tài khoản vận hành cho bên thứ ba.
//                 </p>
//               </div>
//               <div className="flex items-start gap-2">
//                 <FaCircleCheck className="text-sm text-[#2C3E2B] shrink-0 mt-0.5" />
//                 <p>
//                   Các hành vi vi phạm ảnh hưởng nghiêm trọng đến trải nghiệm người dùng hoặc uy tín hệ thống sẽ bị tạm khóa tài khoản và xử lý theo hợp đồng thỏa thuận.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ==========================================
//             5. CALL TO ACTION
//            ========================================== */}
//         <section className="max-w-5xl mx-auto px-6 pb-24">
//           <div className="relative bg-gradient-to-br from-[#2C3E2B] to-[#1e2b1e] text-white rounded-[36px] p-10 md:p-16 text-center shadow-2xl overflow-hidden space-y-6">
//             <div className="absolute top-0 right-0 w-80 h-80 bg-[#E7B10A]/10 rounded-full blur-3xl pointer-events-none"></div>
            
//             <div className="relative z-10 max-w-2xl mx-auto space-y-3">
//               <h3 className="font-serif text-2xl md:text-4xl font-bold text-[#F4F1EA]">
//                 Sẵn sàng nâng tầm kinh doanh Homestay của bạn?
//               </h3>
//               <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-light">
//                 Đăng ký ngay hôm nay để nhận gói hỗ trợ chụp ảnh trải nghiệm miễn phí và được ưu tiên xuất hiện trên trang chủ Cozygo.
//               </p>
//             </div>

//             <div className="relative z-10 pt-2">
//               <button 
//                 onClick={handleGoToRegisterHost}
//                 className="bg-[#6E473B] hover:bg-[#57362c] text-white font-semibold text-xs md:text-sm uppercase tracking-wider px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
//               >
//                 <span>Đăng ký làm Chủ Nhà ngay</span>
//                 <FaArrowRight className="text-sm" />
//               </button>
//             </div>
//           </div>
//         </section>

//       </div>
//     </UserLayout>
//   );
// }
import { useNavigate } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';

// Import các icon chuẩn từ react-icons/fa6
import {
  FaBullseye,
  FaArrowTrendDown,
  FaBolt,
  FaCamera,
  FaScrewdriverWrench,
  FaHandshake,
  FaShieldHalved,
  FaFileContract,
  FaArrowRight,
  FaCircleCheck,
  FaWandMagicSparkles,
} from 'react-icons/fa6';

export default function Partners() {
  const navigate = useNavigate();

  // Hàm xử lý điều hướng thẳng đến trang đăng ký với vai trò Chủ nhà mặc định
  const handleGoToRegisterHost = () => {
    navigate('/register', { 
      state: { userType: 'host' } 
    });
  };

  return (
    <UserLayout>
      <div className="bg-[#FAF8F5] min-h-screen text-[#23150d] font-sans">
        
        {/* ==========================================
            1. HERO SECTION (NỀN GRADIENT MƯỢT MÀ, KHÔNG VỆT NHÒE)
           ========================================== */}
        <section className="relative bg-gradient-to-br from-[#1A232E] via-[#232D3B] to-[#121820] text-white pt-24 pb-32 px-6 md:px-12 overflow-hidden">
          {/* Nền hiệu ứng đốm grid nhẹ */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#E7B10A_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#6E473B]/30 border border-[#6E473B]/50 backdrop-blur-md px-4 py-1.5 rounded-full">
              <FaWandMagicSparkles className="w-3.5 h-3.5 text-[#E7B10A]" />
              <span className="text-xs uppercase font-semibold tracking-widest text-amber-200">
                Cộng đồng chủ nhà Cozygo
              </span>
            </div>

            <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight leading-tight text-[#F4F1EA]">
              Khai Phóng Tiềm Năng <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-300">
                Homestay Mộc Mạc
              </span> Cùng Cozygo
            </h1>

            <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
              Kết nối không gian nghỉ dưỡng tự nhiên của bạn với hàng ngàn lữ khách tìm kiếm trải nghiệm bản địa đích thực. Tối ưu doanh thu với chi phí vận hành thấp nhất.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleGoToRegisterHost}
                className="w-full sm:w-auto bg-[#6E473B] hover:bg-[#57362c] text-white font-semibold text-sm tracking-wide px-8 py-4 rounded-xl shadow-lg shadow-[#6E473B]/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
              >
                <span>Trở thành Chủ Nhà ngay</span>
                <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Thống kê nhanh (Stats Counter) */}
            <div className="pt-12 grid grid-cols-2 md:grid-cols-3 gap-6 border-t border-white/10 max-w-3xl mx-auto text-left md:text-center">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-[#E7B10A]">8%</p>
                <p className="text-xs text-gray-400 mt-1">Phí hoa hồng (Thấp nhất thị trường)</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-[#E7B10A]">1,200+</p>
                <p className="text-xs text-gray-400 mt-1">Đối tác Homestay đồng hành</p>
              </div>
              <div className="col-span-2 md:col-span-1">
                <p className="text-2xl md:text-3xl font-bold text-[#E7B10A]">95%</p>
                <p className="text-xs text-gray-400 mt-1">Tỷ lệ lấp phòng mùa cao điểm</p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            2. BENTO GRID: ĐIỂM KHÁC BIỆT CỦA COZYGO
           ========================================== */}
        <section className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#6E473B]/10 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2C1E15]">
                Tại sao các Host chọn Cozygo?
              </h2>
              <p className="text-xs md:text-sm text-gray-500">
                Chúng tôi không phải sàn OTA đại trà. Cozygo là hệ sinh thái ngách dành riêng cho mô hình nghỉ dưỡng mộc mạc và thiên nhiên.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-[#FAF8F5] p-7 rounded-2xl border border-[#6E473B]/10 hover:border-[#6E473B]/30 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#6E473B]/10 text-[#6E473B] flex items-center justify-center group-hover:bg-[#6E473B] group-hover:text-white transition-colors duration-300">
                    <FaBullseye className="text-xl" />
                  </div>
                  <h3 className="font-bold text-base text-[#2C1E15]">Chuẩn tệp khách hàng</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Khách hàng Cozygo là những người chủ động tìm gu nghỉ dưỡng hòa mình với thiên nhiên, trân trọng không gian và sẵn sàng chi trả cho các gói trải nghiệm bản địa.
                  </p>
                </div>
              </div>

              {/* Card 2 - Highlight */}
              <div className="bg-[#2C3E2B] text-white p-7 rounded-2xl shadow-lg flex flex-col justify-between relative overflow-hidden group">
                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/10 text-[#E7B10A] flex items-center justify-center">
                    <FaArrowTrendDown className="text-xl" />
                  </div>
                  <span className="inline-block text-[10px] bg-[#E7B10A] text-black font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Tối ưu chi phí
                  </span>
                  <h3 className="font-bold text-base text-white">Hoa hồng cố định 8%</h3>
                  <p className="text-xs text-gray-200 leading-relaxed">
                    Tạm biệt mức phí hoa hồng 15% - 20% từ các sàn quốc tế. Cozygo cam kết đồng hành bền vững cùng chủ nhà Việt với mức chiết khấu cực kỳ tối ưu.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#FAF8F5] p-7 rounded-2xl border border-[#6E473B]/10 hover:border-[#6E473B]/30 transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                    <FaBolt className="text-xl" />
                  </div>
                  <h3 className="font-bold text-base text-[#2C1E15]">Vận hành tự động hóa</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Đồng bộ lịch thời gian thực tránh overbook, tự động gửi xác nhận đặt phòng, mã tracking và đối soát doanh thu minh bạch hàng tuần.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            3. QUYỀN LỢI ĐẶC QUYỀN
           ========================================== */}
        <section className="max-w-6xl mx-auto px-6 py-20 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-serif text-3xl font-bold text-[#2C1E15]">
              Đặc quyền dành riêng cho Host
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              Cozygo cung cấp đầy đủ công cụ và sự hỗ trợ để nâng tầm thương hiệu Homestay của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-5 hover:shadow-md transition-shadow">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#6E473B]/10 text-[#6E473B] flex items-center justify-center">
                <FaCamera className="text-xl" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-[#2C1E15]">Hỗ trợ Truyền thông & Nhiếp ảnh</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Đội ngũ Media hỗ trợ chụp ảnh không gian, quay video trải nghiệm miễn phí để chạy chiến dịch quảng bá đa kênh (TikTok, Facebook, Instagram).
                </p>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-5 hover:shadow-md transition-shadow">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-[#2C3E2B]/10 text-[#2C3E2B] flex items-center justify-center">
                <FaScrewdriverWrench className="text-xl" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-[#2C1E15]">Hệ thống quản lý thông minh (Extranet)</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Giao diện quản lý độc quyền giúp cập nhật bảng giá linh hoạt theo mùa, điều chỉnh quỹ phòng và theo dõi báo cáo doanh thu trực quan.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-5 hover:shadow-md transition-shadow">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <FaHandshake className="text-xl" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-[#2C1E15]">Đóng gói Gói trải nghiệm (Tour combo)</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Hỗ trợ thiết kế các hoạt động đặc thù tại homestay (tiệc nướng BBQ, hái chè, cắm trại, chèo SUP) thành gói dịch vụ gia tăng lợi nhuận.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex gap-5 hover:shadow-md transition-shadow">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-700 flex items-center justify-center">
                <FaShieldHalved className="text-xl" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-[#2C1E15]">Bảo vệ quyền lợi Chủ nhà tuyệt đối</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Chính sách đặt cọc nghiêm ngặt, quy trình xử lý đền bù đứt gãy/hư hại tài sản rõ ràng cùng bộ quy tắc ứng xử bắt buộc dành cho khách thuê.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            4. ĐIỀU KHOẢN VÀ QUY ĐỊNH
           ========================================== */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="bg-[#FAF8F5] p-6 md:p-8 rounded-3xl border border-[#6E473B]/15 space-y-4">
            <div className="flex items-center gap-3 border-b border-[#6E473B]/10 pb-4">
              <FaFileContract className="text-lg text-[#6E473B]" />
              <h2 className="font-serif text-lg font-bold text-[#2C1E15]">
                Quy định & Điều khoản sử dụng hệ thống
              </h2>
            </div>
            
            <div className="text-xs text-gray-600 leading-relaxed space-y-3 font-medium">
              <div className="flex items-start gap-2">
                <FaCircleCheck className="text-sm text-[#2C3E2B] shrink-0 mt-0.5" />
                <p>
                  Chủ nhà khi truy cập hệ thống <strong className="text-black">Cozygo Extranet</strong> cam kết không phát tán tin nhắn rác, không đăng tải thông tin sai sự thật hoặc chia sẻ tài khoản vận hành cho bên thứ ba.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <FaCircleCheck className="text-sm text-[#2C3E2B] shrink-0 mt-0.5" />
                <p>
                  Các hành vi vi phạm ảnh hưởng nghiêm trọng đến trải nghiệm người dùng hoặc uy tín hệ thống sẽ bị tạm khóa tài khoản và xử lý theo hợp đồng thỏa thuận.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            5. CALL TO ACTION (NỀN GRADIENT SANG TRỌNG)
           ========================================== */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="relative bg-gradient-to-br from-[#2C3E2B] via-[#233223] to-[#172217] text-white rounded-[36px] p-10 md:p-16 text-center shadow-2xl overflow-hidden space-y-6">
            <div className="relative z-10 max-w-2xl mx-auto space-y-3">
              <h3 className="font-serif text-2xl md:text-4xl font-bold text-[#F4F1EA]">
                Sẵn sàng nâng tầm kinh doanh Homestay của bạn?
              </h3>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-light">
                Đăng ký ngay hôm nay để nhận gói hỗ trợ chụp ảnh trải nghiệm miễn phí và được ưu tiên xuất hiện trên trang chủ Cozygo.
              </p>
            </div>

            <div className="relative z-10 pt-2">
              <button 
                onClick={handleGoToRegisterHost}
                className="bg-[#6E473B] hover:bg-[#57362c] text-white font-semibold text-xs md:text-sm uppercase tracking-wider px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
              >
                <span>Đăng ký làm Chủ Nhà ngay</span>
                <FaArrowRight className="text-sm" />
              </button>
            </div>
          </div>
        </section>

      </div>
    </UserLayout>
  );
}