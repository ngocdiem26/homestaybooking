// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import UserLayout from '../../layout/UserLayout';

// export default function Activities() {
//   const navigate = useNavigate();
//   const [currentIndex, setCurrentIndex] = useState(2);

//   const activitiesList = [
//     {
//       id: "bat-ca",
//       title: "Trải Nghiệm Bắt Cá Đồng",
//       desc: "Tự tay xắn quần, lội mương bọng và trải nghiệm cảm giác nôm cá, bắt cá lóc đồng bằng tay trần cực kỳ phấn khích như một người nông dân thực thụ.",
//       img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600"
//     },
//     {
//       id: "trong-lua",
//       title: "Một Ngày Làm Nông Dân Cấy Lúa",
//       desc: "Bước chân xuống những thửa ruộng sình bùn mộc mạc, học cách cấy từng cây mạ non và lắng nghe câu chuyện lúa nước từ người bản địa.",
//       img: "https://images.unsplash.com/photo-1599933310682-933fb45df8f5?q=80&w=600"
//     },
//     {
//       id: "san-may",
//       title: "Săn Mây Đỉnh Đồi Lúc Bình Minh",
//       desc: "Thức giấc lúc 4:30 sáng, xe đón tận homestay đưa lên đỉnh mỏm đá cao để chạm tay vào biển mây bồng bềnh tràn ngập ánh nắng ban mai.",
//       img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600"
//     },
//     {
//       id: "loi-suoi",
//       title: "Trekking Rừng Già & Lội Suối Cổ",
//       desc: "Băng qua những cánh rừng thông nguyên sinh, lội dọc theo dòng suối đá trong vắt và tận hưởng dòng thác đổ mát lạnh đổ xuống từ thượng nguồn.",
//       img: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600"
//     },
//     {
//       id: "nuong-bbq",
//       title: "Tiệc Nướng BBQ Củi Đêm Lạnh",
//       desc: "Bếp nướng củi than rực hồng sẵn sàng ngoài thảm cỏ xanh mướt. Thưởng thức thịt xiên nướng, ngô khoai lùi giữa cái se lạnh sương mờ.",
//       img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600"
//     },
//     {
//       id: "lam-gom",
//       title: "Xoay Gốm Thủ Công Nung Củi",
//       desc: "Tự tay nhào nặn đất sét trên bàn xoay truyền thống, tạo hình chiếc cốc mộc mạc cho riêng mình dưới sự hướng dẫn của nghệ nhân lâu năm.",
//       img: "https://images.unsplash.com/photo-1565192647048-f997ded87950?q=80&w=600"
//     },
//     {
//       id: "hai-hong",
//       title: "Thu Hoạch Hồng Chín Tại Vườn",
//       desc: "Lạc bước vào vườn hồng trĩu quả chín mọng ngọt lịm, tự tay hái những quả hồng giòn rụm và thưởng thức ngay dưới bóng mát của cây.",
//       img: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=600"
//     }
//   ];

//   const handleNext = () => {
//     setCurrentIndex((prev) => (prev + 1) % activitiesList.length);
//   };

//   const handlePrev = () => {
//     setCurrentIndex((prev) => (prev - 1 + activitiesList.length) % activitiesList.length);
//   };

//   const handleSelectActivity = (activityId) => {
//     navigate('/', { state: { filterActivity: activityId } });
//   };

//   return (
//     <UserLayout>
//       <div className="bg-[#F4F1EA] min-h-screen text-[#23150d] space-y-24 pb-24">
        
//         {/* BANNER NỀN TỐI CHỨA CAROUSEL */}
// {/* SAU KHI SỬA */}
// <section className="bg-[#202c3c] pt-12 pb-16 px-4 md:px-8 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[620px]">          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-0 pointer-events-none"></div>
          
//           <div className="relative z-10 max-w-3xl mx-auto mb-6">
//             <span className="bg-[#6E473B] text-white text-[11px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full shadow-md">
//               Hệ thống trải nghiệm Cozygo
//             </span>
//             <h1 className="font-classic text-3xl md:text-4xl font-serif text-white font-bold mt-3">
//               Hoạt Động Trải Nghiệm Bản Địa
//             </h1>
//           </div>

//           {/* ==========================================================================
//               VÙNG KHÔNG GIAN 3D: PHÓNG ĐẠI KÍCH THƯỚC THẺ CHỨA HOẠT ĐỘNG (THEO ẢNH MẪU)
//               ========================================================================== */}
//           <div className="relative w-full max-w-7xl h-[520px] flex items-center justify-center z-10 perspective-[1800px]">
//             {activitiesList.map((act, idx) => {
//               let offset = idx - currentIndex;
              
//               if (offset < -Math.floor(activitiesList.length / 2)) offset += activitiesList.length;
//               if (offset > Math.floor(activitiesList.length / 2)) offset -= activitiesList.length;

//               const absOffset = Math.abs(offset);
//               if (absOffset > 2) return null;

//               // TỐI ƯU TOÀN DIỆN: Tăng dịch chuyển X lên 260px để không đè lên thẻ siêu lớn
//               const transformStyle = {
//                 transform: `translateX(${offset * 260}px) scale(${1 - absOffset * 0.2}) rotateY(${offset * -30}deg) translateZ(${absOffset * -150}px)`,
//                 zIndex: 10 - absOffset,
//                 opacity: absOffset === 0 ? 1 : absOffset === 1 ? 0.55 : 0.15,
//               };

//               return (
//                 <div
//                   key={act.id}
//                   style={transformStyle}
//                   onClick={() => absOffset === 0 ? handleSelectActivity(act.id) : setCurrentIndex(idx)}
//                   // SỬA CHÍNH: Phóng to kích thước hộp thẻ cực đại (w-[350px] md:w-[380px] h-[490px]) và bo góc tròn trịa chuẩn mượt
//                   className={`absolute w-[320px] sm:w-[350px] md:w-[380px] h-[490px] rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 ease-out cursor-pointer border ${
//                     absOffset === 0 
//                       ? 'border-[#E7B10A] ring-4 ring-[#E7B10A]/20' 
//                       : 'border-white/10'
//                   }`}
//                 >
//                   {/* Ảnh nền hoạt động */}
//                   <img src={act.img} alt={act.title} className="w-full h-full object-cover brightness-[0.6] group-hover:scale-103 transition duration-700" />
                  
//                   {/* Khối nội dung chữ, nút bấm phủ kính mờ */}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent p-7 flex flex-col justify-end text-left text-white">
//                     <h3 className="font-classic text-base md:text-xl font-bold text-white mb-2.5 tracking-wide drop-shadow">
//                       {act.title}
//                     </h3>
//                     <p className={`text-xs text-gray-300 leading-relaxed transition-all duration-300 ${absOffset === 0 ? 'opacity-100 max-h-24 overflow-y-auto' : 'line-clamp-1 opacity-40'}`}>
//                       {act.desc}
//                     </p>
                    
//                     {absOffset === 0 && (
//                       <button className="mt-5 bg-[#6E473B] hover:bg-[#57362c] text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-2xl w-full text-center shadow-lg transition transform active:scale-98">
//                         ⚡ Tìm homestay có hoạt động này
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* BỘ NÚT CHUYỂN ĐỘNG PREV / NEXT */}
//           <div className="flex items-center space-x-4 mt-6 z-20">
//             <button 
//               onClick={handlePrev} 
//               className="bg-white/10 backdrop-blur-md text-white border border-white/15 text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-white hover:text-[#202c3c] transition-all"
//             >
//               PREV
//             </button>
//             <button 
//               onClick={handleNext} 
//               className="bg-[#6E473B] text-white border border-white/15 text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-[#57362c] transition-all"
//             >
//               NEXT
//             </button>
//           </div>
//         </section>

//         {/* ==========================================
//             KHỐI NỘI DUNG PHÍA DƯỚI (GIỮ NGUYÊN)
//            ========================================== */}
        
//         {/* 1. LỊCH TRÌNH TRẢI NGHIỆM GỢI Ý THEO GIỜ TRONG NGÀY */}
//         <section className="max-w-6xl mx-auto px-6 text-left">
//           <div className="mb-10 text-center md:text-left">
//             <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15] mb-1">An tâm trải nghiệm – Gợi ý mốc thời gian lý tưởng</h2>
//             <p className="text-xs text-gray-400">Giúp bạn sắp xếp quỹ thời gian để tận hưởng trọn vẹn từng khoảnh khắc trong ngày</p>
//           </div>

//           <div className="relative border-l-2 border-[#6E473B]/20 ml-4 md:ml-32 space-y-10">
//             {[
//               { time: "05:00 - 07:00", act: "🌅 Đón sương bình minh", desc: "Thực hiện hành trình săn mây đỉnh đồi thông, hít thở bầu không khí se lạnh tinh khôi của núi rừng." },
//               { time: "08:30 - 11:30", act: "🌾 Xuống ruộng & Bắt cá", desc: "Trải nghiệm cấy lúa nước truyền thống, tự tay nôm cá lóc lội mương bọng và chuẩn bị nguyên liệu cho bữa trưa." },
//               { time: "14:00 - 16:30", act: "🪵 Lội suối đá & Xoay gốm", desc: "Trekking nhẹ nhàng giải nhiệt bên dòng suối mát lạnh hoặc ngồi bên bàn xoay học làm một chiếc tách đất nung mộc mạc." },
//               { time: "18:00 - 21:30", act: "🥩 Đốt lửa trại & Tiệc BBQ", desc: "Quây quản bên lò sưởi bập bùng, cùng nướng thịt, uống rượu cần và trò chuyện ca hát dưới bầu trời sao đêm." }
//             ].map((timeline, index) => (
//               <div key={index} className="relative pl-6 md:pl-8 group">
//                 <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[#F4F1EA] border-2 border-[#6E473B] group-hover:bg-[#6E473B] transition-all duration-300"></div>
//                 <div className="md:absolute md:-left-36 md:top-1 font-mono text-xs font-bold text-[#6E473B] bg-[#6E473B]/10 px-2 py-0.5 rounded w-fit mb-2 md:mb-0">
//                   {timeline.time}
//                 </div>
//                 <div className="bg-white p-5 rounded-2xl border border-[#6E473B]/5 shadow-sm hover:shadow-md transition">
//                   <h4 className="text-sm font-bold text-[#2C1E15] mb-1">{timeline.act}</h4>
//                   <p className="text-xs text-gray-500 leading-relaxed">{timeline.desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* 2. BẢN ĐỒ PHÂN BỐ HOẠT ĐỘNG TƯƠNG TÁC */}
//         <section className="max-w-7xl mx-auto px-4 md:px-8">
//           <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#6E473B]/10 shadow-sm flex flex-col lg:flex-row items-center gap-8 text-left">
//             <div className="lg:w-1/2 space-y-4">
//               <span className="bg-[#2C3E2B]/10 text-[#2C3E2B] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">Bản đồ hoạt động</span>
//               <h2 className="font-classic text-xl md:text-2xl font-bold text-[#2C1E15]">Tìm Kiếm Trải Nghiệm Theo Vùng Bản Địa</h2>
//               <p className="text-xs text-gray-500 leading-relaxed">
//                 Mỗi vùng đất trong hệ thống liên kết của Cozygo đều mang một bản sắc văn hóa riêng biệt:
//               </p>
//               <ul className="space-y-2 text-xs font-medium text-gray-600">
//                 <li>🌲 <span className="font-bold text-[#2C1E15]">Vùng cao Tây Bắc (Sapa):</span> Chuyên sâu về hái lá thuốc thuốc Dao đỏ, gặt lúa bậc thang, vượt thác lội suối cổ sơ.</li>
//                 <li>🌬️ <span className="font-bold text-[#2C1E15]">Cao nguyên sương mù (Đà Lạt):</span> Săn mây thung lũng, thu hoạch quả hồng chín ngọt, tiệc nướng sưởi ấm đêm lạnh.</li>
//                 <li>🛶 <span className="font-bold text-[#2C1E15]">Miền Tây sông nước (Cần Thơ):</span> Chèo thuyền đi chợ nổi miệt vườn, tát mương bắt cá đồng, làm bánh dân gian.</li>
//               </ul>
//             </div>
            
//             <div className="w-full lg:w-1/2 h-52 sm:h-64 rounded-2xl overflow-hidden border border-gray-200 relative group shadow-inner shrink-0">
//               <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600" alt="Bản đồ" className="w-full h-full object-cover grayscale brightness-90 group-hover:scale-102 transition duration-700" />
//               <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
//                 <button onClick={() => navigate('/')} className="bg-[#2C3E2B] text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl shadow-lg hover:bg-[#1f2d20] transition">
//                   🗺️ Mở bản đồ định vị homestay
//                 </button>
//               </div>
//             </div>
//           </div>
//         </section>

//       </div>
//     </UserLayout>
//   );
// }
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLayout from '../../layout/UserLayout';

export default function Activities() {
  const navigate = useNavigate();
  
  // State quản lý Slide hoạt động 3D ở Banner
  const [currentIndex, setCurrentIndex] = useState(2);
  
  // State quản lý Tab lịch trình đang xem ở bên dưới
  const [activeSchedule, setActiveSchedule] = useState('dalat');

  // Danh sách các hoạt động phục vụ hệ thống 3D Banner
  const activitiesList = [
    {
      id: "bat-ca",
      title: "Trải Nghiệm Bắt Cá Đồng",
      desc: "Tự tay xắn quần, lội mương bọng và trải nghiệm cảm giác nôm cá, bắt cá lóc đồng bằng tay trần cực kỳ phấn khích như một người nông dân thực thụ.",
      img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=600"
    },
    {
      id: "trong-lua",
      title: "Một Ngày Làm Nông Dân Cấy Lúa",
      desc: "Bước chân xuống những thửa ruộng sình bùn mộc mạc, học cách cấy từng cây mạ non và lắng nghe câu chuyện lúa nước từ người bản địa.",
      img: "https://images.unsplash.com/photo-1599933310682-933fb45df8f5?q=80&w=600"
    },
    {
      id: "san-may",
      title: "Săn Mây Đỉnh Đồi Lúc Bình Minh",
      desc: "Thức giấc lúc 4:30 sáng, xe đón tận homestay đưa lên đỉnh mỏm đá cao để chạm tay vào biển mây bồng bềnh tràn ngập ánh nắng ban mai.",
      img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600"
    },
    {
      id: "loi-suoi",
      title: "Trekking Rừng Già & Lội Suối Cổ",
      desc: "Băng qua những cánh rừng thông nguyên sinh, lội dọc theo dòng suối đá trong vắt và tận hưởng dòng thác đổ mát lạnh đổ xuống từ thượng nguồn.",
      img: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600"
    },
    {
      id: "nuong-bbq",
      title: "Tiệc Nướng BBQ Củi Đêm Lạnh",
      desc: "Bếp nướng củi than rực hồng sẵn sàng ngoài thảm cỏ xanh mướt. Thưởng thức thịt xiên nướng, ngô khoai lùi giữa cái se lạnh sương mờ.",
      img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600"
    },
    {
      id: "lam-gom",
      title: "Xoay Gốm Thủ Công Nung Củi",
      desc: "Tự tay nhào nặn đất sét trên bàn xoay truyền thống, tạo hình chiếc cốc mộc mạc cho riêng mình dưới sự hướng dẫn của nghệ nhân lâu năm.",
      img: "https://images.unsplash.com/photo-1565192647048-f997ded87950?q=80&w=600"
    },
    {
      id: "hai-hong",
      title: "Thu Hoạch Hồng Chín Tại Vườn",
      desc: "Lạc bước vào vườn hồng trĩu quả chín mọng ngọt lịm, tự tay hái những quả hồng giòn rụm và thưởng thức ngay dưới bóng mát của cây.",
      img: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=600"
    }
  ];

  // Kho dữ liệu đa dạng các lịch trình trải nghiệm hình ảnh (Gợi ý nhiều phương án cho khách)
  const schedulesData = {
    dalat: {
      title: "Lịch trình Săn Mây & Lửa Trại Cao Nguyên (Đà Lạt)",
      subtitle: "Phù hợp cho các cặp đôi và tín đồ mê chụp ảnh, tận hưởng trọn vẹn cái se lạnh đồi thông.",
      steps: [
        { time: "05:00 - 07:00", act: "🌅 Đón sương bình minh", desc: "Thực hiện hành trình săn mây đỉnh đồi thông, hít thở bầu không khí se lạnh tinh khôi của núi rừng.", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400" },
        { time: "08:30 - 11:30", act: "🍓 Thu hoạch nông sản hữu cơ", desc: "Tự tay ghé thăm các nhà vườn liên kết, hái hái dâu tây hoặc những quả hồng chín mọng trĩu cành.", img: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=400" },
        { time: "14:00 - 16:30", act: "🪵 Lội suối đá & Xoay gốm", desc: "Trekking nhẹ nhàng giải nhiệt bên dòng suối mát lạnh hoặc ngồi bên bàn xoay học làm một chiếc tách đất nung mộc mạc.", img: "https://images.unsplash.com/photo-1565192647048-f997ded87950?q=80&w=400" },
        { time: "18:00 - 21:30", act: "🥩 Đốt lửa trại & Tiệc BBQ", desc: "Quây quần bên lò sưởi bập bùng, cùng nướng thịt, uống rượu cần và trò chuyện ca hát dưới bầu trời sao đêm.", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400" }
      ]
    },
    cantho: {
      title: "Lịch trình Đậm Chất Văn Hóa Miền Tây (Cần Thơ)",
      subtitle: "Trải nghiệm trọn vẹn nếp sống sông nước dân dã, tát mương bắt cá đồng miệt vườn vui nhộn.",
      steps: [
        { time: "05:30 - 08:00", act: "🛶 Chèo ghe đi chợ nổi miệt vườn", desc: "Len lỏi qua dòng sông lộng gió sớm, thưởng thức tô bún riêu ngay trên ghe và ngắm cảnh nông sản tấp nập.", img: "https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=400" },
        { time: "09:30 - 12:00", act: "🌾 Tát mương bắt cá lóc đồng", desc: "Thay đồ bà ba, lội bùn mương bọng để nôm cá, bắt cá bằng tay trần rồi nướng trui rơm chuẩn vị quê hương.", img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=400" },
        { time: "14:30 - 16:30", act: "🥞 Tự làm bánh dân gian khéo tay", desc: "Học cách xay bột nước cối đá cổ, tự tay đổ những chiếc bánh xèo giòn rụm với rau rừng hái quanh vườn.", img: "https://images.unsplash.com/photo-1599933310682-933fb45df8f5?q=80&w=400" },
        { time: "18:30 - 21:00", act: "🎶 Đờn ca tài tử & Ngắm đom đóm đêm", desc: "Ngồi bên hiên nhà gỗ ven sông tĩnh lặng, thưởng thức giai điệu quê hương và ngắm đom đóm lập lòe lãng mạn.", img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=400" }
      ]
    },
    sapa: {
      title: "Lịch trình Bản Làng & Chinh Phục Đại Ngàn (Sapa)",
      subtitle: "Hành trình thám hiểm hoang sơ, hòa mình vào nếp sống mộc mạc vùng cao Tây Bắc.",
      steps: [
        { time: "06:00 - 08:30", act: "🏔️ Thức giấc bản làng giữa biển sương", desc: "Ngắm bình minh lấp ló trên những thửa ruộng bậc thang, đón những tia nắng sớm xuyên qua vách nhà tranh.", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400" },
        { time: "09:00 - 12:00", act: "🥾 Trekking cung đường Ý Linh Hồ", desc: "Băng qua những con đường mòn nhỏ hoang sơ, tìm hiểu kỹ nghệ dệt thổ cẩm truyền thống của đồng bào bản địa.", img: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=400" },
        { time: "14:30 - 17:00", act: "🍃 Tắm bồn gỗ Pơ-mu thuốc Dao đỏ", desc: "Tự tay tìm hiểu các vị thuốc quý núi rừng và ngâm mình phục hồi năng lượng trong bồn nước nóng sực nức mùi thơm thảo mộc.", img: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=400" },
        { time: "18:30 - 21:30", act: "🪵 Đốt lửa bản làng & Thưởng thức thắng cố", desc: "Quây quần bên hố lửa bập bùng của nhà sàn, nhâm nhi chén rượu ngô ấm nồng và tham gia điệu múa sạp rộn ràng.", img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=400" }
      ]
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activitiesList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activitiesList.length) % activitiesList.length);
  };

  const handleSelectActivity = (activityId) => {
    navigate('/', { state: { filterActivity: activityId } });
  };

  return (
    <UserLayout>
      <div className="bg-[#F4F1EA] min-h-screen text-[#23150d] space-y-24 pb-24">
        
        {/* ==========================================================================
            1. KHU VỰC BANNER 3D SLIDER (ĐÃ GIẢM CHIỀU CAO XUỐNG 640PX NHƯNG THẺ VẪN SIÊU TO)
            ========================================================================== */}
        <section className="bg-[#202c3c] pt-12 pb-16 px-4 md:px-8 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[640px]">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 z-0 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto mb-4">
            <span className="bg-[#6E473B] text-white text-[11px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full shadow-md">
              Hệ thống trải nghiệm Cozygo
            </span>
            <h1 className="font-classic text-3xl md:text-4xl font-serif text-white font-bold mt-3">
              Hoạt Động Trải Nghiệm Bản Địa
            </h1>
          </div>

          {/* VÙNG KHÔNG GIAN KHUNG 3D CHỨA THẺ HOẠT ĐỘNG SIÊU LỚN */}
          <div className="relative w-full max-w-7xl h-[500px] flex items-center justify-center z-10 perspective-[1800px]">
            {activitiesList.map((act, idx) => {
              let offset = idx - currentIndex;
              
              if (offset < -Math.floor(activitiesList.length / 2)) offset += activitiesList.length;
              if (offset > Math.floor(activitiesList.length / 2)) offset -= activitiesList.length;

              const absOffset = Math.abs(offset);
              if (absOffset > 2) return null;

              const transformStyle = {
                transform: `translateX(${offset * 260}px) scale(${1 - absOffset * 0.2}) rotateY(${offset * -30}deg) translateZ(${absOffset * -150}px)`,
                zIndex: 10 - absOffset,
                opacity: absOffset === 0 ? 1 : absOffset === 1 ? 0.55 : 0.15,
              };

              return (
                <div
                  key={act.id}
                  style={transformStyle}
                  onClick={() => absOffset === 0 ? handleSelectActivity(act.id) : setCurrentIndex(idx)}
                  className={`absolute w-[320px] sm:w-[350px] md:w-[380px] h-[460px] rounded-[32px] overflow-hidden shadow-2xl transition-all duration-500 ease-out cursor-pointer border ${
                    absOffset === 0 
                      ? 'border-[#E7B10A] ring-4 ring-[#E7B10A]/20' 
                      : 'border-white/10'
                  }`}
                >
                  <img src={act.img} alt={act.title} className="w-full h-full object-cover brightness-[0.6] group-hover:scale-103 transition duration-700" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent p-7 flex flex-col justify-end text-left text-white">
                    <h3 className="font-classic text-base md:text-xl font-bold text-white mb-2.5 tracking-wide drop-shadow">
                      {act.title}
                    </h3>
                    <p className={`text-xs text-gray-300 leading-relaxed transition-all duration-300 ${absOffset === 0 ? 'opacity-100 max-h-24 overflow-y-auto' : 'line-clamp-1 opacity-40'}`}>
                      {act.desc}
                    </p>
                    
                    {absOffset === 0 && (
                      <button className="mt-5 bg-[#6E473B] hover:bg-[#57362c] text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded-2xl w-full text-center shadow-lg transition transform active:scale-98">
                        ⚡ Tìm homestay có hoạt động này
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* BỘ NÚT CHUYỂN ĐỘNG SLIDER */}
          <div className="flex items-center space-x-4 mt-4 z-20">
            <button 
              onClick={handlePrev} 
              className="bg-white/10 backdrop-blur-md text-white border border-white/15 text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-white hover:text-[#202c3c] transition-all"
            >
              PREV
            </button>
            <button 
              onClick={handleNext} 
              className="bg-[#6E473B] text-white border border-white/15 text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-xl hover:bg-[#57362c] transition-all"
            >
              NEXT
            </button>
          </div>
        </section>

        {/* ==========================================================================
            2. KHỐI LỊCH TRÌNH TRẢI NGHIỆM ĐỒ HỌA HÌNH ẢNH (DỰA THEO MẪU GIỐNG ẢNH image_92fb2e.png)
            ========================================================================== */}
        <section className="max-w-6xl mx-auto px-6 text-left space-y-10">
          
          {/* Tiêu đề phần lịch trình chuẩn khung mẫu */}
          <div className="text-center md:text-left">
            <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15] mb-1">
              An tâm trải nghiệm – Gợi ý mốc thời gian lý tưởng
            </h2>
            <p className="text-xs text-gray-400">
              Giúp bạn sắp xếp quỹ thời gian để tận hưởng trọn vẹn từng khoảnh khắc trong ngày
            </p>
          </div>

          {/* THANH TAB ĐIỀU HƯỚNG: CHO PHÉP KHÁCH THAM KHẢO NHIỀU LỊCH TRÌNH KHÁC NHAU */}
          <div className="flex bg-[#23150d]/5 p-1.5 rounded-xl text-xs font-bold border border-gray-200 w-fit overflow-x-auto scrollbar-none max-w-full">
            <button 
              onClick={() => setActiveSchedule('dalat')}
              className={`px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${activeSchedule === 'dalat' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-[#2C3E2B]'}`}
            >
              🌲 Lịch trình Đà Lạt
            </button>
            <button 
              onClick={() => setActiveSchedule('cantho')}
              className={`px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${activeSchedule === 'cantho' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-[#2C3E2B]'}`}
            >
              🛶 Lịch trình Cần Thơ
            </button>
            <button 
              onClick={() => setActiveSchedule('sapa')}
              className={`px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${activeSchedule === 'sapa' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-[#2C3E2B]'}`}
            >
              🏔️ Lịch trình Sapa
            </button>
          </div>

          {/* Hộp thông tin bổ trợ tiểu mục tóm tắt cho Tab đang mở */}
          <div className="bg-[#6E473B]/5 border border-[#6E473B]/10 p-4 rounded-xl animate-fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6E473B]">🎯 {schedulesData[activeSchedule].title}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{schedulesData[activeSchedule].subtitle}</p>
          </div>

          {/* HỆ THỐNG CÂY LỊCH TRÌNH ĐỒ HỌA TRỰC QUAN KÈM HÌNH ẢNH MÔ TẢ TỪNG BƯỚC */}
          <div className="relative border-l-2 border-[#6E473B]/20 ml-4 md:ml-36 space-y-8 animate-fade-in">
            {schedulesData[activeSchedule].steps.map((step, index) => (
              <div key={index} className="relative pl-6 md:pl-10 group">
                
                {/* Dấu chấm mốc tròn của cây thư mục đứng đồng bộ với trục tọa độ của ảnh image_92fb2e.png */}
                <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#F4F1EA] border-2 border-[#6E473B] group-hover:bg-[#6E473B] group-hover:scale-110 transition-all duration-300 z-10"></div>
                
                {/* Khung mốc thời gian hiển thị bay lệch hẳn sang cột bên trái */}
                <div className="md:absolute md:-left-40 md:top-1/2 md:-translate-y-1/2 font-mono text-[11px] font-bold text-[#6E473B] bg-[#6E473B]/10 px-2.5 py-1 rounded-md w-fit mb-3 md:mb-0 shadow-sm border border-[#6E473B]/5">
                  {step.time}
                </div>

                {/* THIẾT KẾ CARD NÂNG CẤP: Chứa ảnh bo góc mịn màng tích hợp thông tin chữ */}
                <div className="bg-white rounded-2xl border border-[#6E473B]/5 shadow-sm hover:shadow-xl transition-all duration-300 p-4 flex flex-col sm:flex-row gap-5 overflow-hidden">
                  
                  {/* Thumbnail minh họa cho hoạt động đó */}
                  <div className="w-full sm:w-40 h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative">
                    <img 
                      src={step.img} 
                      alt={step.act} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    />
                  </div>

                  {/* Text mô tả chi tiết kế bên ảnh */}
                  <div className="flex flex-col justify-center text-left space-y-1.5">
                    <h4 className="text-sm md:text-base font-extrabold text-[#2C1E15] group-hover:text-[#6E473B] transition duration-200">
                      {step.act}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>

                </div>

              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
            3. BẢN ĐỒ PHÂN BỐ HOẠT ĐỘNG TƯƠNG TÁC (GIỮ NGUYÊN)
           ========================================== */}
        <section className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#6E473B]/10 shadow-sm flex flex-col lg:flex-row items-center gap-8 text-left">
            <div className="lg:w-1/2 space-y-4">
              <span className="bg-[#2C3E2B]/10 text-[#2C3E2B] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">Bản đồ hoạt động</span>
              <h2 className="font-classic text-xl md:text-2xl font-bold text-[#2C1E15]">Tìm Kiếm Trải Nghiệm Theo Vùng Bản Địa</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Mỗi vùng đất trong hệ thống liên kết của Cozygo đều mang một bản sắc văn hóa riêng biệt:
              </p>
              <ul className="space-y-2 text-xs font-medium text-gray-600">
                <li>🌲 <span className="font-bold text-[#2C1E15]">Vùng cao Tây Bắc (Sapa):</span> Chuyên sâu về hái lá thuốc thuốc Dao đỏ, gặt lúa bậc thang, vượt thác lội suối cổ sơ.</li>
                <li>🌬️ <span className="font-bold text-[#2C1E15]">Cao nguyên sương mù (Đà Lạt):</span> Săn mây thung lũng, thu hoạch quả hồng chín ngọt, tiệc nướng sưởi ấm đêm lạnh.</li>
                <li>🛶 <span className="font-bold text-[#2C1E15]">Miền Tây sông nước (Cần Thơ):</span> Chèo thuyền đi chợ nổi miệt vườn, tát mương bắt cá đồng, làm bánh dân gian.</li>
              </ul>
            </div>
            
            <div className="w-full lg:w-1/2 h-52 sm:h-64 rounded-2xl overflow-hidden border border-gray-200 relative group shadow-inner shrink-0">
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600" alt="Bản đồ" className="w-full h-full object-cover grayscale brightness-90 group-hover:scale-102 transition duration-700" />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <button onClick={() => navigate('/')} className="bg-[#2C3E2B] text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-xl shadow-lg hover:bg-[#1f2d20] transition">
                  🗺️ Mở bản đồ định vị homestay
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </UserLayout>
  );
}