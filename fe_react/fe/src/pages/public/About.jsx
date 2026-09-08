import { useNavigate } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';

export default function About() {
  const navigate = useNavigate();

  return (
    <UserLayout>
      <div className="bg-[#F4F1EA] min-h-screen text-[#23150d] animate-fade-in">
        
        {/* ==========================================
            1. KHỐI TIÊU ĐỀ TRANG (HERO SECTION)
           ========================================== */}
        <section className="bg-[#202c3c] text-white pt-20 pb-24 px-6 md:px-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50 z-0 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-3">
            <span className="bg-[#6E473B] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-sm">
              Câu chuyện thương hiệu
            </span>
            <h1 className="font-classic text-3xl md:text-5xl font-serif font-bold tracking-tight">
              Về Cozygo – Homestay
            </h1>
            <p className="text-xs md:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
              Hành trình định nghĩa lại những chuyến đi trốn, nơi mỗi điểm dừng chân đều ôm ấp bước chân người lữ hành bằng hơi ấm bản địa.
            </p>
          </div>
        </section>

        {/* ==========================================
            2. KHỐI CÂU CHUYỆN SÁNG LẬP & TẦM NHÌN (STORY)
           ========================================== */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#6E473B] uppercase tracking-wider block">Chúng tôi là ai?</span>
              <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15] leading-tight">
                Khởi nguồn từ mong muốn tìm lại sự bình yên trong tâm hồn
              </h2>
            </div>
            
            <div className="text-xs md:text-sm text-gray-600 space-y-4 leading-relaxed font-medium">
              <p>
                Cozygo được thành lập vào năm 2026, bắt đầu từ tình yêu nguyên bản với những ngôi nhà gỗ nép mình bên sườn đồi sương phủ ở Đà Lạt, những căn nhà bên bến sông lộng gió miền Tây hay những mái tranh mộc mạc vùng cao Tây Bắc.
              </p>
              <p>
                Chúng tôi nhận ra rằng, giữa nhịp sống đô thị hối hả và áp lực, du khách ngày nay không chỉ đơn thuần tìm kiếm một chiếc giường để ngủ qua đêm. Họ tìm kiếm một **Chốn về ấm cúng giữa lòng thiên nhiên** — nơi họ có thể thực sự ngắt kết nối với thế giới công nghệ để kết nối lại với chính mình và những người thân yêu.
              </p>
              <p>
                Chính vì vậy, Cozygo ra đời không chỉ với tư cách là một nền tảng đặt phòng, mà là cầu nối mang những trải nghiệm văn hóa bản địa mộc mạc, chân thực nhất đến gần hơn với bước chân người lữ hành.
              </p>
            </div>
          </div>

          {/* Hình ảnh minh họa không gian mộc mạc */}
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=400" alt="Chốn về thiên nhiên 1" className="w-full h-64 object-cover rounded-3xl border border-[#6E473B]/10 shadow-sm" />
              <img src="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=400" alt="Chốn về thiên nhiên 2" className="w-full h-44 object-cover rounded-3xl border border-[#6E473B]/10 shadow-sm" />
            </div>
            <div className="space-y-4 pt-8">
              <img src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=400" alt="Chốn về thiên nhiên 3" className="w-full h-44 object-cover rounded-3xl border border-[#6E473B]/10 shadow-sm" />
              <img src="https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=400" alt="Chốn về thiên nhiên 4" className="w-full h-64 object-cover rounded-3xl border border-[#6E473B]/10 shadow-sm" />
            </div>
          </div>
        </section>

        {/* ==========================================
            3. KHỐI GIÁ TRỊ CỐT LÕI (CORE VALUES)
           ========================================== */}
        <section className="bg-white py-20 border-y border-[#6E473B]/10 text-left">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
              <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15]">Giá Trị Chúng Tôi Theo Đuổi</h2>
              <p className="text-xs text-gray-400">Những nguyên tắc cốt lõi giúp Cozygo xây dựng lòng tin bền vững trong lòng khách hàng</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "🪵", title: "Kiến trúc mộc bản", desc: "100% các không gian lưu trú trong hệ thống Cozygo đều sở hữu ngôn ngữ thiết kế mộc mạc, ưu tiên vật liệu gỗ thông thủ công đem lại sự ấm cúng kỳ diệu." },
                { icon: "🌾", title: "Trải nghiệm chân thực", desc: "Chúng tôi kết hợp sâu sắc việc lưu trú cùng các hoạt động văn hóa bản địa: tát mương bắt cá đồng, cấy lúa nước hay dệt thổ cẩm cùng đồng bào vùng cao." },
                { icon: "✨", title: "Kính mờ xuyên thấu", desc: "Triết lý thiết kế giao diện Glassmorphism hiện đại phản chiếu qua dịch vụ: rõ ràng, minh bạch thông tin giá cả, luôn đặt sự hài lòng của khách lên hàng đầu." }
              ].map((value, i) => (
                <div key={i} className="bg-[#F4F1EA]/40 p-6 rounded-2xl border border-[#6E473B]/5 space-y-3 hover:shadow-md transition duration-300">
                  <span className="text-3xl block p-2 bg-white rounded-xl w-fit shadow-sm">{value.icon}</span>
                  <h3 className="font-classic text-sm font-bold text-[#2C1E15]">{value.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================
            4. KHỐI CON SỐ THỐNG KÊ ẤN TƯỢNG (STATS)
           ========================================== */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 text-center">
          <div className="bg-[#2C3E2B] rounded-[32px] p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[#7d9f81]/5 backdrop-blur-[2px] pointer-events-none"></div>
            {[
              { number: "750+", label: "Homestay Nguyên Căn" },
              { number: "25K+", label: "Lượt Đặt Phòng Thành Công" },
              { number: "98%", label: "Khách Hàng Hài Lòng" },
              { number: "15+", label: "Vùng Trải Nghiệm Bản Địa" }
            ].map((stat, i) => (
              <div key={i} className="relative z-10 space-y-1">
                <div className="text-2xl md:text-4xl font-black text-[#E7B10A] tracking-tight font-mono">{stat.number}</div>
                <div className="text-[10px] md:text-xs font-bold text-gray-300 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
            5. KHỐI KÊU GỌI HÀNH ĐỘNG (CTA)
           ========================================== */}
        <section className="max-w-4xl mx-auto px-6 pb-20 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15]">Sẵn sàng cho một hành trình tìm về?</h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Hãy để Cozygo đồng hành cùng bạn trên từng cung đường, lưu giữ những bước chân ấm áp bên cạnh những người thân yêu nhất.
            </p>
          </div>
          <div className="flex justify-center gap-4 text-xs font-bold uppercase tracking-wider">
            <button 
              onClick={() => navigate('/')} 
              className="bg-[#6E473B] hover:bg-[#57362c] text-white px-8 py-3.5 rounded-xl shadow-md transition active:scale-95"
            >
              Đặt chỗ ở ngay 🏠
            </button>
            <button 
              onClick={() => navigate('/activities')} 
              className="bg-[#2C3E2B] hover:bg-[#1f2d20] text-white px-8 py-3.5 rounded-xl shadow-md transition active:scale-95"
            >
              Xem hoạt động trải nghiệm 🌲
            </button>
          </div>
        </section>

      </div>
    </UserLayout>
  );
}
// import { useNavigate } from 'react-router-dom';
// import UserLayout from '../../layouts/UserLayout';

// // Import icon chuẩn từ react-icons/fa6
// import { 
//   FaWandMagicSparkles, 
//   FaTree, 
//   FaCompass, 
//   FaHeart, 
//   FaHouseUser, 
//   FaCalendarCheck, 
//   FaFaceSmile, 
//   FaMapLocationDot,
//   FaArrowRight
// } from 'react-icons/fa6';

// export default function About() {
//   const navigate = useNavigate();

//   return (
//     <UserLayout>
//       <div className="bg-[#FAF8F5] min-h-screen text-[#23150d] font-sans">
        
//         {/* ==========================================
//             1. HERO SECTION (TẠO CẢM CẢM XÚC BAN ĐẦU)
//            ========================================== */}
//         <section className="relative bg-gradient-to-br from-[#1A232E] via-[#232D3B] to-[#121820] text-white pt-24 pb-32 px-6 md:px-12 overflow-hidden text-center">
//           {/* Họa tiết lưới mờ nhẹ */}
//           <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#E7B10A_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

//           <div className="relative z-10 max-w-4xl mx-auto space-y-6">
//             <div className="inline-flex items-center gap-2 bg-[#6E473B]/30 border border-[#6E473B]/50 backdrop-blur-md px-4 py-1.5 rounded-full">
//               <FaWandMagicSparkles className="w-3.5 h-3.5 text-[#E7B10A]" />
//               <span className="text-xs uppercase font-semibold tracking-widest text-amber-200">
//                 Câu chuyện thương hiệu
//               </span>
//             </div>

//             <h1 className="font-serif text-4xl md:text-6xl font-bold tracking-tight leading-tight text-[#F4F1EA]">
//               Nơi Mỗi Chuyến Đi <br className="hidden md:block" />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-300">
//                 Là Một Lần Trở Về
//               </span>
//             </h1>

//             <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
//               Cozygo ra đời từ khát khao kết nối những tâm hồn yêu thiên nhiên với những chốn dừng chân mộc mạc, nơi hơi ấm bản địa ôm ấp từng bước chân lữ hành.
//             </p>
//           </div>
//         </section>

//         {/* ==========================================
//             2. CÂU CHUYỆN THƯƠNG HIỆU & KHUNG ẢNH NGHỆ THUẬT
//            ========================================== */}
//         <section className="max-w-7xl mx-auto px-6 md:px-12 -mt-16 relative z-20 pb-20">
//           <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#6E473B]/10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
//             {/* Nội dung câu chuyện */}
//             <div className="lg:col-span-6 space-y-6 text-left">
//               <div className="space-y-2">
//                 <span className="text-xs font-bold text-[#6E473B] uppercase tracking-wider block">
//                   Khởi nguồn Cozygo
//                 </span>
//                 <h2 className="font-serif text-2xl md:text-4xl font-bold text-[#2C1E15] leading-tight">
//                   Tìm lại bình yên giữa nhịp sống hối hả
//                 </h2>
//               </div>
              
//               <div className="text-xs md:text-sm text-gray-600 space-y-4 leading-relaxed font-normal">
//                 <p>
//                   Được thành lập vào năm 2026, Cozygo bắt đầu từ tình yêu nguyên bản với những căn nhà gỗ nép mình bên sườn đồi sương phủ ở Đà Lạt, những mái nhà bên bến sông lộng gió miền Tây hay những nếp nhà sàn mộc mạc vùng cao Tây Bắc.
//                 </p>
//                 <p>
//                   Chúng tôi tin rằng du khách không chỉ tìm kiếm một chiếc giường ngủ qua đêm. Họ tìm kiếm một **chốn dừng chân chữa lành** — nơi họ có thể thực sự ngắt kết nối với áp lực đô thị để kết nối lại với chính mình và những người thân yêu.
//                 </p>
//                 <p>
//                   Cozygo không chỉ là nền tảng đặt phòng, mà là cầu nối mang những trải nghiệm văn hóa bản địa chân thực nhất đến gần hơn với mỗi chuyến đi của bạn.
//                 </p>
//               </div>
//             </div>

//             {/* Gallery ảnh phong cách Bento/Collage */}
//             <div className="lg:col-span-6 grid grid-cols-2 gap-4">
//               <div className="space-y-4">
//                 <img 
//                   src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=500" 
//                   alt="Cozy Homestay 1" 
//                   className="w-full h-60 object-cover rounded-2xl shadow-md transform hover:scale-[1.02] transition-transform duration-300" 
//                 />
//                 <img 
//                   src="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=500" 
//                   alt="Cozy Homestay 2" 
//                   className="w-full h-40 object-cover rounded-2xl shadow-md transform hover:scale-[1.02] transition-transform duration-300" 
//                 />
//               </div>
//               <div className="space-y-4 pt-6">
//                 <img 
//                   src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=500" 
//                   alt="Cozy Homestay 3" 
//                   className="w-full h-40 object-cover rounded-2xl shadow-md transform hover:scale-[1.02] transition-transform duration-300" 
//                 />
//                 <img 
//                   src="https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=500" 
//                   alt="Cozy Homestay 4" 
//                   className="w-full h-60 object-cover rounded-2xl shadow-md transform hover:scale-[1.02] transition-transform duration-300" 
//                 />
//               </div>
//             </div>

//           </div>
//         </section>

//         {/* ==========================================
//             3. KHỐI GIÁ TRỊ CỐT LÕI (CORE VALUES)
//            ========================================== */}
//         <section className="max-w-6xl mx-auto px-6 pb-20 space-y-12">
//           <div className="text-center max-w-2xl mx-auto space-y-2">
//             <h2 className="font-serif text-3xl font-bold text-[#2C1E15]">Triết Lý Hướng Tới</h2>
//             <p className="text-xs md:text-sm text-gray-500">
//               Những giá trị bền vững giúp Cozygo xây dựng niềm tin trong lòng mỗi hành khách
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4 text-left">
//               <div className="w-12 h-12 rounded-2xl bg-[#6E473B]/10 text-[#6E473B] flex items-center justify-center">
//                 <FaTree className="text-xl" />
//               </div>
//               <h3 className="font-bold text-base text-[#2C1E15]">Kiến trúc mộc mạc</h3>
//               <p className="text-xs text-gray-500 leading-relaxed">
//                 100% không gian lưu trú được tuyển chọn kỹ lưỡng, ưu tiên vật liệu thiên nhiên mộc bản, mang lại cảm giác ấm cúng như chính căn nhà của bạn.
//               </p>
//             </div>

//             <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4 text-left">
//               <div className="w-12 h-12 rounded-2xl bg-[#2C3E2B]/10 text-[#2C3E2B] flex items-center justify-center">
//                 <FaCompass className="text-xl" />
//               </div>
//               <h3 className="font-bold text-base text-[#2C1E15]">Trải nghiệm bản địa</h3>
//               <p className="text-xs text-gray-500 leading-relaxed">
//                 Gắn liền việc nghỉ dưỡng với hoạt động trải nghiệm địa phương: thưởng trà sáng, cắm trại bên suối, chèo SUP hay dệt thổ cẩm cùng người dân bản địa.
//               </p>
//             </div>

//             <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4 text-left">
//               <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
//                 <FaHeart className="text-xl" />
//               </div>
//               <h3 className="font-bold text-base text-[#2C1E15]">Sự tận tâm minh bạch</h3>
//               <p className="text-xs text-gray-500 leading-relaxed">
//                 Thông tin minh bạch, quy trình đặt phòng chuẩn xác, hỗ trợ khách hàng 24/7 với phương châm đặt sự hài lòng của lữ khách lên hàng đầu.
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* ==========================================
//             4. THỐNG KÊ ẤN TƯỢNG (STATS COUNTER)
//            ========================================== */}
//         <section className="max-w-6xl mx-auto px-6 pb-20">
//           <div className="bg-[#2C3E2B] rounded-[36px] p-8 md:p-14 text-white shadow-xl relative overflow-hidden">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
//               <div className="space-y-2">
//                 <div className="w-10 h-10 mx-auto rounded-full bg-white/10 flex items-center justify-center text-[#E7B10A] mb-2">
//                   <FaHouseUser className="text-lg" />
//                 </div>
//                 <div className="text-3xl md:text-4xl font-bold text-[#E7B10A]">750+</div>
//                 <div className="text-[11px] font-medium text-gray-300 uppercase tracking-widest">Homestay độc đáo</div>
//               </div>

//               <div className="space-y-2">
//                 <div className="w-10 h-10 mx-auto rounded-full bg-white/10 flex items-center justify-center text-[#E7B10A] mb-2">
//                   <FaCalendarCheck className="text-lg" />
//                 </div>
//                 <div className="text-3xl md:text-4xl font-bold text-[#E7B10A]">25K+</div>
//                 <div className="text-[11px] font-medium text-gray-300 uppercase tracking-widest">Lượt đặt thành công</div>
//               </div>

//               <div className="space-y-2">
//                 <div className="w-10 h-10 mx-auto rounded-full bg-white/10 flex items-center justify-center text-[#E7B10A] mb-2">
//                   <FaFaceSmile className="text-lg" />
//                 </div>
//                 <div className="text-3xl md:text-4xl font-bold text-[#E7B10A]">98%</div>
//                 <div className="text-[11px] font-medium text-gray-300 uppercase tracking-widest">Khách hàng hài lòng</div>
//               </div>

//               <div className="space-y-2">
//                 <div className="w-10 h-10 mx-auto rounded-full bg-white/10 flex items-center justify-center text-[#E7B10A] mb-2">
//                   <FaMapLocationDot className="text-lg" />
//                 </div>
//                 <div className="text-3xl md:text-4xl font-bold text-[#E7B10A]">15+</div>
//                 <div className="text-[11px] font-medium text-gray-300 uppercase tracking-widest">Vùng điểm đến bản địa</div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ==========================================
//             5. CALL TO ACTION (BANNER BẮT ĐẦU HÀNH TRÌNH)
//            ========================================== */}
//         <section className="max-w-5xl mx-auto px-6 pb-24">
//           <div className="bg-gradient-to-br from-[#2C3E2B] via-[#233223] to-[#172217] text-white rounded-[36px] p-10 md:p-16 text-center shadow-2xl space-y-6">
//             <div className="max-w-2xl mx-auto space-y-3">
//               <h3 className="font-serif text-2xl md:text-4xl font-bold text-[#F4F1EA]">
//                 Sẵn sàng cho chuyến đi chữa lành?
//               </h3>
//               <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-light">
//                 Hãy để Cozygo đồng hành cùng bạn trên từng cung đường, lưu giữ những bước chân ấm áp bên cạnh những người thân yêu.
//               </p>
//             </div>

//             <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4 text-xs font-semibold uppercase tracking-wider">
//               <button 
//                 onClick={() => navigate('/')} 
//                 className="bg-[#6E473B] hover:bg-[#57362c] text-white px-8 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2"
//               >
//                 <span>Khám phá chốn ở</span>
//                 <FaArrowRight className="text-sm" />
//               </button>
//               <button 
//                 onClick={() => navigate('/activities')} 
//                 className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl backdrop-blur-md transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2"
//               >
//                 <span>Xem trải nghiệm bản địa</span>
//               </button>
//             </div>
//           </div>
//         </section>

//       </div>
//     </UserLayout>
//   );
// }
////////////////////////
// import { useNavigate } from 'react-router-dom';
// import UserLayout from '../../layouts/UserLayout';

// // Import icon chuẩn từ react-icons/fa6
// import { 
//   FaWandMagicSparkles, 
//   FaTree, 
//   FaCompass, 
//   FaHeart, 
//   FaHouseUser, 
//   FaCalendarCheck, 
//   FaFaceSmile, 
//   FaMapLocationDot,
//   FaArrowRight
// } from 'react-icons/fa6';

// export default function About() {
//   const navigate = useNavigate();

//   return (
//     <UserLayout>
//       <div className="bg-[#FAF8F5] min-h-screen text-[#23150d] font-sans">
        
//         {/* ==========================================
//             1. HERO SECTION (BANNER ĐÃ THU NHỎ 1/2)
//            ========================================== */}
//         <section className="relative bg-gradient-to-br from-[#1A232E] via-[#232D3B] to-[#121820] text-white pt-12 pb-16 px-6 md:px-12 overflow-hidden text-center">
//           {/* Họa tiết lưới mờ nhẹ */}
//           <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#E7B10A_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

//           <div className="relative z-10 max-w-3xl mx-auto space-y-3">
//             <div className="inline-flex items-center gap-1.5 bg-[#6E473B]/30 border border-[#6E473B]/50 backdrop-blur-md px-3 py-1 rounded-full">
//               <FaWandMagicSparkles className="w-3 h-3 text-[#E7B10A]" />
//               <span className="text-[10px] uppercase font-semibold tracking-widest text-amber-200">
//                 Câu chuyện thương hiệu
//               </span>
//             </div>

//             <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight leading-snug text-[#F4F1EA]">
//               Nơi Mỗi Chuyến Đi <br className="hidden md:block" />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-300">
//                 Là Một Lần Trở Về
//               </span>
//             </h1>

//             <p className="text-xs md:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed font-light">
//               Cozygo ra đời từ khát khao kết nối những tâm hồn yêu thiên nhiên với những chốn dừng chân mộc mạc, nơi hơi ấm bản địa ôm ấp từng bước chân lữ hành.
//             </p>
//           </div>
//         </section>

//         {/* ==========================================
//             2. CÂU CHUYỆN THƯƠNG HIỆU & KHUNG ẢNH NGHỆ THUẬT
//            ========================================== */}
//         <section className="max-w-7xl mx-auto px-6 md:px-12 -mt-6 relative z-20 pb-20">
//           <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-[#6E473B]/10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
//             {/* Nội dung câu chuyện */}
//             <div className="lg:col-span-6 space-y-6 text-left">
//               <div className="space-y-2">
//                 <span className="text-xs font-bold text-[#6E473B] uppercase tracking-wider block">
//                   Khởi nguồn Cozygo
//                 </span>
//                 <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2C1E15] leading-tight">
//                   Tìm lại bình yên giữa nhịp sống hối hả
//                 </h2>
//               </div>
              
//               <div className="text-xs md:text-sm text-gray-600 space-y-4 leading-relaxed font-normal">
//                 <p>
//                   Được thành lập vào năm 2026, Cozygo bắt đầu từ tình yêu nguyên bản với những căn nhà gỗ nép mình bên sườn đồi sương phủ ở Đà Lạt, những mái nhà bên bến sông lộng gió miền Tây hay những nếp nhà sàn mộc mạc vùng cao Tây Bắc.
//                 </p>
//                 <p>
//                   Chúng tôi tin rằng du khách không chỉ tìm kiếm một chiếc giường ngủ qua đêm. Họ tìm kiếm một **chốn dừng chân chữa lành** — nơi họ có thể thực sự ngắt kết nối với áp lực đô thị để kết nối lại với chính mình và những người thân yêu.
//                 </p>
//                 <p>
//                   Cozygo không chỉ là nền tảng đặt phòng, mà là cầu nối mang những trải nghiệm văn hóa bản địa chân thực nhất đến gần hơn với mỗi chuyến đi của bạn.
//                 </p>
//               </div>
//             </div>

//             {/* Gallery ảnh phong cách Bento/Collage */}
//             <div className="lg:col-span-6 grid grid-cols-2 gap-4">
//               <div className="space-y-4">
//                 <img 
//                   src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=500" 
//                   alt="Cozy Homestay 1" 
//                   className="w-full h-60 object-cover rounded-2xl shadow-md transform hover:scale-[1.02] transition-transform duration-300" 
//                 />
//                 <img 
//                   src="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=500" 
//                   alt="Cozy Homestay 2" 
//                   className="w-full h-40 object-cover rounded-2xl shadow-md transform hover:scale-[1.02] transition-transform duration-300" 
//                 />
//               </div>
//               <div className="space-y-4 pt-6">
//                 <img 
//                   src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=500" 
//                   alt="Cozy Homestay 3" 
//                   className="w-full h-40 object-cover rounded-2xl shadow-md transform hover:scale-[1.02] transition-transform duration-300" 
//                 />
//                 <img 
//                   src="https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=500" 
//                   alt="Cozy Homestay 4" 
//                   className="w-full h-60 object-cover rounded-2xl shadow-md transform hover:scale-[1.02] transition-transform duration-300" 
//                 />
//               </div>
//             </div>

//           </div>
//         </section>

//         {/* ==========================================
//             3. KHỐI GIÁ TRỊ CỐT LÕI (CORE VALUES)
//            ========================================== */}
//         <section className="max-w-6xl mx-auto px-6 pb-20 space-y-12">
//           <div className="text-center max-w-2xl mx-auto space-y-2">
//             <h2 className="font-serif text-3xl font-bold text-[#2C1E15]">Triết Lý Hướng Tới</h2>
//             <p className="text-xs md:text-sm text-gray-500">
//               Những giá trị bền vững giúp Cozygo xây dựng niềm tin trong lòng mỗi hành khách
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4 text-left">
//               <div className="w-12 h-12 rounded-2xl bg-[#6E473B]/10 text-[#6E473B] flex items-center justify-center">
//                 <FaTree className="text-xl" />
//               </div>
//               <h3 className="font-bold text-base text-[#2C1E15]">Kiến trúc mộc mạc</h3>
//               <p className="text-xs text-gray-500 leading-relaxed">
//                 100% không gian lưu trú được tuyển chọn kỹ lưỡng, ưu tiên vật liệu thiên nhiên mộc bản, mang lại cảm giác ấm cúng như chính căn nhà của bạn.
//               </p>
//             </div>

//             <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4 text-left">
//               <div className="w-12 h-12 rounded-2xl bg-[#2C3E2B]/10 text-[#2C3E2B] flex items-center justify-center">
//                 <FaCompass className="text-xl" />
//               </div>
//               <h3 className="font-bold text-base text-[#2C1E15]">Trải nghiệm bản địa</h3>
//               <p className="text-xs text-gray-500 leading-relaxed">
//                 Gắn liền việc nghỉ dưỡng với hoạt động trải nghiệm địa phương: thưởng trà sáng, cắm trại bên suối, chèo SUP hay dệt thổ cẩm cùng người dân bản địa.
//               </p>
//             </div>

//             <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-4 text-left">
//               <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
//                 <FaHeart className="text-xl" />
//               </div>
//               <h3 className="font-bold text-base text-[#2C1E15]">Sự tận tâm minh bạch</h3>
//               <p className="text-xs text-gray-500 leading-relaxed">
//                 Thông tin minh bạch, quy trình đặt phòng chuẩn xác, hỗ trợ khách hàng 24/7 với phương châm đặt sự hài lòng của lữ khách lên hàng đầu.
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* ==========================================
//             4. THỐNG KÊ ẤN TƯỢNG (STATS COUNTER)
//            ========================================== */}
//         <section className="max-w-6xl mx-auto px-6 pb-20">
//           <div className="bg-[#2C3E2B] rounded-[36px] p-8 md:p-14 text-white shadow-xl relative overflow-hidden">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
//               <div className="space-y-2">
//                 <div className="w-10 h-10 mx-auto rounded-full bg-white/10 flex items-center justify-center text-[#E7B10A] mb-2">
//                   <FaHouseUser className="text-lg" />
//                 </div>
//                 <div className="text-3xl md:text-4xl font-bold text-[#E7B10A]">750+</div>
//                 <div className="text-[11px] font-medium text-gray-300 uppercase tracking-widest">Homestay độc đáo</div>
//               </div>

//               <div className="space-y-2">
//                 <div className="w-10 h-10 mx-auto rounded-full bg-white/10 flex items-center justify-center text-[#E7B10A] mb-2">
//                   <FaCalendarCheck className="text-lg" />
//                 </div>
//                 <div className="text-3xl md:text-4xl font-bold text-[#E7B10A]">25K+</div>
//                 <div className="text-[11px] font-medium text-gray-300 uppercase tracking-widest">Lượt đặt thành công</div>
//               </div>

//               <div className="space-y-2">
//                 <div className="w-10 h-10 mx-auto rounded-full bg-white/10 flex items-center justify-center text-[#E7B10A] mb-2">
//                   <FaFaceSmile className="text-lg" />
//                 </div>
//                 <div className="text-3xl md:text-4xl font-bold text-[#E7B10A]">98%</div>
//                 <div className="text-[11px] font-medium text-gray-300 uppercase tracking-widest">Khách hàng hài lòng</div>
//               </div>

//               <div className="space-y-2">
//                 <div className="w-10 h-10 mx-auto rounded-full bg-white/10 flex items-center justify-center text-[#E7B10A] mb-2">
//                   <FaMapLocationDot className="text-lg" />
//                 </div>
//                 <div className="text-3xl md:text-4xl font-bold text-[#E7B10A]">15+</div>
//                 <div className="text-[11px] font-medium text-gray-300 uppercase tracking-widest">Vùng điểm đến bản địa</div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ==========================================
//             5. CALL TO ACTION (BANNER BẮT ĐẦU HÀNH TRÌNH)
//            ========================================== */}
//         <section className="max-w-5xl mx-auto px-6 pb-24">
//           <div className="bg-gradient-to-br from-[#2C3E2B] via-[#233223] to-[#172217] text-white rounded-[36px] p-10 md:p-16 text-center shadow-2xl space-y-6">
//             <div className="max-w-2xl mx-auto space-y-3">
//               <h3 className="font-serif text-2xl md:text-4xl font-bold text-[#F4F1EA]">
//                 Sẵn sàng cho chuyến đi chữa lành?
//               </h3>
//               <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-light">
//                 Hãy để Cozygo đồng hành cùng bạn trên từng cung đường, lưu giữ những bước chân ấm áp bên cạnh những người thân yêu.
//               </p>
//             </div>

//             <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4 text-xs font-semibold uppercase tracking-wider">
//               <button 
//                 onClick={() => navigate('/')} 
//                 className="bg-[#6E473B] hover:bg-[#57362c] text-white px-8 py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2"
//               >
//                 <span>Khám phá chốn ở</span>
//                 <FaArrowRight className="text-sm" />
//               </button>
//               <button 
//                 onClick={() => navigate('/activities')} 
//                 className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl backdrop-blur-md transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2"
//               >
//                 <span>Xem trải nghiệm bản địa</span>
//               </button>
//             </div>
//           </div>
//         </section>

//       </div>
//     </UserLayout>
//   );
// }``