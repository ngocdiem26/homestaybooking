// // export default function SearchContent({ setHasSearched, favorites, toggleFavorite }) {
// //   return (
// //     <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in text-left">
      
// //       {/* Thanh thông tin nhỏ gọn ở đỉnh */}
// //       <div className="mb-6 p-3.5 bg-white border border-[#6E473B]/10 rounded-xl flex items-center justify-between shadow-sm">
// //         <div className="text-xs font-bold text-gray-500">
// //           Kết quả tìm kiếm tại Đà Lạt: Đã tìm thấy <span className="text-[#6E473B] font-extrabold text-sm">758 nơi lưu trú</span> cho bạn
// //         </div>
// //         <button 
// //           onClick={() => setHasSearched(false)} 
// //           className="text-xs text-[#6E473B] font-bold hover:underline flex items-center gap-1"
// //         >
// //           ↩ Thay đổi tùy chọn tìm kiếm
// //         </button>
// //       </div>

// //       <div className="flex flex-col lg:flex-row gap-6">
        
// //         {/* CỘT SƯỜN TRÁI: BẢN ĐỒ & BỘ LỌC CHỌN THEO KIỂU BOOKING */}
// //         <aside className="w-full lg:w-[260px] shrink-0 space-y-4">
// //           <div className="relative h-36 rounded-xl overflow-hidden border border-[#6E473B]/10 shadow-sm group">
// //             <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=300" alt="Map" className="w-full h-full object-cover grayscale brightness-95" />
// //             <div className="absolute inset-0 bg-[#2C3E2B]/10 flex items-center justify-center">
// //               <button className="bg-[#2C3E2B] text-white font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg shadow-md hover:bg-[#1f2d20] transition">
// //                 🗺️ Hiển thị trên bản đồ
// //               </button>
// //             </div>
// //           </div>

// //           <div className="bg-white p-5 rounded-xl border border-[#6E473B]/10 shadow-sm space-y-5">
// //             <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100">Chọn lọc theo:</h3>
            
// //             <div>
// //               <h4 className="font-bold text-xs text-[#2C1E15] mb-2">Dùng các bộ lọc cũ</h4>
// //               <div className="space-y-2 text-xs">
// //                 {[{l: 'Chỗ nghỉ nhà dân', c: 84}, {l: 'Khách sạn', c: 433}, {l: 'Biệt thự', c: 29}].map((i, idx) => (
// //                   <label key={idx} className="flex items-center justify-between text-gray-600 cursor-pointer hover:text-[#2C3E2B]">
// //                     <div className="flex items-center">
// //                       <input type="checkbox" className="rounded border-gray-300 text-[#2C3E2B] mr-2 accent-[#2C3E2B] focus:ring-0" />
// //                       {i.l}
// //                     </div>
// //                     <span className="text-gray-400 text-[10px]">{i.c}</span>
// //                   </label>
// //                 ))}
// //               </div>
// //             </div>

// //             <div>
// //               <h4 className="font-bold text-xs text-[#2C1E15] mb-1">Ngân sách của bạn (mỗi đêm)</h4>
// //               <p className="text-[10px] text-gray-400 font-semibold mb-2">VND 50.000 - VND 2.000.000+</p>
// //               <input type="range" min="50000" max="2000000" className="w-full accent-[#2C3E2B]" />
// //             </div>

// //             <div>
// //               <h4 className="font-bold text-xs text-[#2C1E15] mb-2">Tiện nghi phòng</h4>
// //               <div className="space-y-2 text-xs">
// //                 {['🛌 Phòng ngủ khép kín', '🚿 Phòng tắm bồn gỗ', '🍳 Bếp đầy đủ gia vị', '🏊 Hồ bơi vô cực'].map((item, idx) => (
// //                   <label key={idx} className="flex items-center text-gray-600 cursor-pointer hover:text-[#2C3E2B]">
// //                     <input type="checkbox" className="rounded border-gray-300 text-[#2C3E2B] mr-2 accent-[#2C3E2B] focus:ring-0" /> {item}
// //                   </label>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         </aside>

// //         {/* CỘT PHẢI: KẾT QUẢ HIỂN THỊ DẠNG NGANG CHUẨN BOOKING COM */}
// //         <section className="flex-grow space-y-4">
// //           <div className="bg-white px-4 py-2.5 rounded-lg border border-[#6E473B]/10 shadow-sm inline-flex items-center space-x-2 text-xs font-semibold">
// //             <span className="text-gray-400">Sắp xếp theo:</span>
// //             <select className="border-0 bg-transparent py-0 pl-0 pr-6 text-[#6E473B] font-bold focus:ring-0 cursor-pointer appearance-none">
// //               <option>Lựa chọn hàng đầu của Cozygo</option>
// //               <option>Giá tốt nhất trước</option>
// //               <option>Điểm đánh giá sao cao nhất</option>
// //             </select>
// //           </div>

// //           <div className="space-y-4">
// //             {[
// //               {
// //                 id: 1,
// //                 name: "Lam Vien Garden Villa - Homestay Da Lat",
// //                 location: "Đà Lạt",
// //                 distance: "Cách trung tâm 3.8km",
// //                 roomType: "Căn Hộ Bản Địa 2 Phòng Ngủ",
// //                 details: "1 căn hộ nguyên căn • 2 phòng ngủ • 1 phòng khách • 1 phòng tắm • 1 phòng bếp • 50 m²",
// //                 beds: "5 giường (2 giường đôi, 2 giường đơn, 1 giường đôi lớn)",
// //                 alert: "Chúng tôi còn 1 phòng trống với giá này",
// //                 score: "9.1",
// //                 reviewText: "Tuyệt hảo",
// //                 reviewsCount: 95,
// //                 price: "2.718.400",
// //                 tax: "+VND 249.853 thuế và phí dịch vụ",
// //                 img: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=500"
// //               },
// //               {
// //                 id: 2,
// //                 name: "Mộc Lâm Đỉnh Đồi Bungalow Rừng Thông",
// //                 location: "Đà Lạt",
// //                 distance: "Cách trung tâm 1.5km",
// //                 roomType: "Bungalow Gỗ Thông Biệt Lập",
// //                 details: "Nguyên căn riêng tư • 1 phòng ngủ • 1 phòng tắm bồn gỗ mộc • Ban công ngắm mây • 35 m²",
// //                 beds: "1 giường đôi cực lớn King-size",
// //                 alert: "Ưu Đãi Đặc Biệt - Giảm ngay 20% trong hôm nay",
// //                 score: "9.5",
// //                 reviewText: "Xuất sắc",
// //                 reviewsCount: 142,
// //                 price: "1.350.000",
// //                 tax: "Đã bao gồm đầy đủ thuế phí",
// //                 img: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=500"
// //               }
// //             ].map(item => (
// //               <HorizontalHomestayCard 
// //                 key={item.id}
// //                 item={item}
// //                 isFav={favorites.includes(item.id)}
// //                 onFavToggle={toggleFavorite}
// //               />
// //             ))}
// //           </div>
// //         </section>

// //       </div>
// //     </div>
// //   );
// // }

// // /* COMPONENT CARD NGANG PHONG CÁCH BOOKING (NỀN HOVER KÍNH MỜ XUYÊN THẤU) */
// // function HorizontalHomestayCard({ item, isFav, onFavToggle }) {
// //   return (
// //     <div className="bg-white rounded-xl border border-[#6E473B]/10 shadow-sm hover:shadow-xl transition-all duration-300 p-4 flex flex-col md:flex-row gap-5 group relative overflow-hidden text-left">
// //       <div className="w-full md:w-[220px] h-[160px] rounded-lg overflow-hidden shrink-0 relative bg-gray-100">
// //         <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
// //         <button 
// //           onClick={() => onFavToggle(item.id)}
// //           className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition"
// //         >
// //           <span className="text-xs">{isFav ? '❤️' : '🤍'}</span>
// //         </button>
// //       </div>

// //       <div className="flex-grow flex flex-col justify-between">
// //         <div className="space-y-1">
// //           <div className="flex flex-wrap items-start gap-1">
// //             <h3 className="font-classic text-sm md:text-base font-bold text-[#2C1E15] hover:text-[#6E473B] transition cursor-pointer line-clamp-1">{item.name}</h3>
// //             <span className="inline-block bg-[#E7B10A]/20 text-[#967205] text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase mt-0.5">👍+</span>
// //           </div>
// //           <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5 flex-wrap">
// //             <span className="text-[#6E473B] font-bold underline">{item.location}</span>
// //             <span className="text-gray-300">|</span>
// //             <span className="underline text-[#2C3E2B]">{item.distance}</span>
// //           </div>
// //           <div className="pt-2 border-l-2 border-[#2C3E2B]/20 pl-2 space-y-0.5 text-[11px]">
// //             <p className="font-bold text-gray-700">{item.roomType}</p>
// //             <p className="text-gray-500">{item.details}</p>
// //             <p className="text-gray-400 italic">{item.beds}</p>
// //           </div>
// //         </div>
// //         <p className="text-[10px] text-red-600 font-bold bg-red-50 inline-block px-2 py-0.5 rounded mt-2 w-fit">⚠️ {item.alert}</p>
// //       </div>

// //       <div className="w-full md:w-[180px] shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4 flex flex-row md:flex-col justify-between items-end text-right">
// //         <div className="flex items-center space-x-2">
// //           <div className="flex flex-col items-end">
// //             <span className="text-xs font-bold text-[#2C1E15]">{item.reviewText}</span>
// //             <span className="text-[10px] text-gray-400">{item.reviewsCount} đánh giá</span>
// //           </div>
// //           <div className="w-7 h-7 bg-[#2C3E2B] text-white font-black text-xs rounded-lg rounded-br-none flex items-center justify-center shadow-sm">{item.score}</div>
// //         </div>
// //         <div className="space-y-0.5 mt-auto w-full">
// //           <span className="text-[10px] text-gray-400 block font-medium">Giá tính cho 2 đêm, 2 người</span>
// //           <div className="text-sm md:text-base font-black text-[#6E473B] tracking-tight">VND {item.price}</div>
// //           <div className="text-[9px] text-gray-400 font-semibold block">{item.tax}</div>
// //           <button className="w-full mt-2 bg-[#2C3E2B] hover:bg-[#1f2d20] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center shadow-sm">
// //             <span>Xem mọi lựa chọn</span>
// //           </button>
// //         </div>
// //       </div>

// //       {/* HIỆU ỨNG RÊ CHUỘT NỀN KÍNH MỜ TRONG SUỐT XUYÊN THẤU ĐÚNG Ý BẠN */}
// //       <div className="absolute inset-0 bg-[#7d9f81]/35 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20 pointer-events-none">
// //         <button className="bg-[#6E473B] text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-xl pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
// //           ⚡ Đặt phòng cấp tốc
// //         </button>
// //       </div>

// //     </div>
// //   );
// // }
// import { useState } from 'react';

// export default function SearchContent({ setHasSearched, favorites, toggleFavorite }) {
//   // State quản lý chế độ hiển thị: 'horizontal' (mặc định kiểu Booking) hoặc 'vertical' (kiểu ô lưới dọc)
//   const [viewMode, setViewMode] = useState('horizontal');

//   const mockData = [
//     {
//       id: 1,
//       name: "Lam Vien Garden Villa - Homestay Da Lat",
//       location: "Đà Lạt",
//       distance: "Cách trung tâm 3.8km",
//       roomType: "Căn Hộ Bản Địa 2 Phòng Ngủ",
//       details: "1 căn hộ nguyên căn • 2 phòng ngủ • 1 phòng khách • 1 phòng tắm • 1 phòng bếp • 50 m²",
//       beds: "5 giường (2 giường đôi, 2 giường đơn, 1 giường đôi lớn)",
//       alert: "Chúng tôi còn 1 phòng trống với giá này",
//       score: "9.1",
//       reviewText: "Tuyệt hảo",
//       reviewsCount: 95,
//       price: "2.718.400",
//       oldPrice: "3.500.000", // Thêm giá cũ cho card dọc
//       orders: "142",         // Thêm số lượt đặt cho card dọc
//       tax: "+VND 249.853 thuế và phí dịch vụ",
//       img: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=500"
//     },
//     {
//       id: 2,
//       name: "Mộc Lâm Đỉnh Đồi Bungalow Rừng Thông",
//       location: "Đà Lạt",
//       distance: "Cách trung tâm 1.5km",
//       roomType: "Bungalow Gỗ Thông Biệt Lập",
//       details: "Nguyên căn riêng tư • 1 phòng ngủ • 1 phòng tắm bồn gỗ mộc • Ban công ngắm mây • 35 m²",
//       beds: "1 giường đôi cực lớn King-size",
//       alert: "Ưu Đãi Đặc Biệt - Giảm ngay 20% trong hôm nay",
//       score: "9.5",
//       reviewText: "Xuất sắc",
//       reviewsCount: 142,
//       price: "1.350.000",
//       oldPrice: "1.800.000",
//       orders: "210",
//       tax: "Đã bao gồm đầy đủ thuế phí",
//       img: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=500"
//     }
//   ];

//   return (
//     <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in text-left">
      
//       {/* Thanh thông tin nhỏ gọn ở đỉnh */}
//       <div className="mb-6 p-3.5 bg-white border border-[#6E473B]/10 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
//         <div className="text-xs font-bold text-gray-500">
//           Kết quả tìm kiếm tại Đà Lạt: Đã tìm thấy <span className="text-[#6E473B] font-extrabold text-sm">758 nơi lưu trú</span> cho bạn
//         </div>
//         <button 
//           onClick={() => setHasSearched(false)} 
//           className="text-xs text-[#6E473B] font-bold hover:underline flex items-center gap-1"
//         >
//           ↩ Thay đổi tùy chọn tìm kiếm
//         </button>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-6">
        
//         {/* CỘT SƯỜN TRÁI: BẢN ĐỒ & BỘ LỌC CHỌN THEO KIỂU BOOKING */}
//         <aside className="w-full lg:w-[260px] shrink-0 space-y-4">
//           <div className="relative h-36 rounded-xl overflow-hidden border border-[#6E473B]/10 shadow-sm group">
//             <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=300" alt="Map" className="w-full h-full object-cover grayscale brightness-95" />
//             <div className="absolute inset-0 bg-[#2C3E2B]/10 flex items-center justify-center">
//               <button className="bg-[#2C3E2B] text-white font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg shadow-md hover:bg-[#1f2d20] transition">
//                 🗺️ Hiển thị trên bản đồ
//               </button>
//             </div>
//           </div>

//           <div className="bg-white p-5 rounded-xl border border-[#6E473B]/10 shadow-sm space-y-5">
//             <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100">Chọn lọc theo:</h3>
            
//             <div>
//               <h4 className="font-bold text-xs text-[#2C1E15] mb-2">Dùng các bộ lọc cũ</h4>
//               <div className="space-y-2 text-xs">
//                 {[{l: 'Chỗ nghỉ nhà dân', c: 84}, {l: 'Khách sạn', c: 433}, {l: 'Biệt thự', c: 29}].map((i, idx) => (
//                   <label key={idx} className="flex items-center justify-between text-gray-600 cursor-pointer hover:text-[#2C3E2B]">
//                     <div className="flex items-center">
//                       <input type="checkbox" className="rounded border-gray-300 text-[#2C3E2B] mr-2 accent-[#2C3E2B] focus:ring-0" />
//                       {i.l}
//                     </div>
//                     <span className="text-gray-400 text-[10px]">{i.c}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <h4 className="font-bold text-xs text-[#2C1E15] mb-1">Ngân sách của bạn (mỗi đêm)</h4>
//               <p className="text-[10px] text-gray-400 font-semibold mb-2">VND 50.000 - VND 2.000.000+</p>
//               <input type="range" min="50000" max="2000000" className="w-full accent-[#2C3E2B]" />
//             </div>

//             <div>
//               <h4 className="font-bold text-xs text-[#2C1E15] mb-2">Tiện nghi phòng</h4>
//               <div className="space-y-2 text-xs">
//                 {['🛌 Phòng ngủ khép kín', '🚿 Phòng tắm bồn gỗ', '🍳 Bếp đầy đủ gia vị', '🏊 Hồ bơi vô cực'].map((item, idx) => (
//                   <label key={idx} className="flex items-center text-gray-600 cursor-pointer hover:text-[#2C3E2B]">
//                     <input type="checkbox" className="rounded border-gray-300 text-[#2C3E2B] mr-2 accent-[#2C3E2B] focus:ring-0" /> {item}
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </aside>

//         {/* CỘT PHẢI: KẾT QUẢ HIỂN THỊ DẠNG NGANG CHUẨN BOOKING COM HOẶC DẠNG LƯỚI DỌC */}
//         <section className="flex-grow space-y-4">
//           <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#6E473B]/10 shadow-sm">
//             <div className="inline-flex items-center space-x-2 text-xs font-semibold">
//               <span className="text-gray-400">Sắp xếp theo:</span>
//               <select className="border-0 bg-transparent py-0 pl-0 pr-6 text-[#6E473B] font-bold focus:ring-0 cursor-pointer appearance-none">
//                 <option>Lựa chọn hàng đầu của Cozygo</option>
//                 <option>Giá tốt nhất trước</option>
//                 <option>Điểm đánh giá sao cao nhất</option>
//               </select>
//             </div>

//             {/* THANH ĐIỀU KHIỂN CHUYỂN ĐỔI CHẾ ĐỘ XEM (XEM NGANG / XEM DỌC) */}
//             <div className="flex items-center bg-[#F4F1EA] p-1 rounded-lg text-[11px] font-bold border border-gray-200">
//               <button 
//                 onClick={() => setViewMode('horizontal')}
//                 className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${viewMode === 'horizontal' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-[#2C3E2B]'}`}
//               >
//                 <span>📋</span> Xem ngang
//               </button>
//               <button 
//                 onClick={() => setViewMode('vertical')}
//                 className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${viewMode === 'vertical' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-[#2C3E2B]'}`}
//               >
//                 <span>📱</span> Xem dọc
//               </button>
//             </div>
//           </div>

//           {/* HIỂN THỊ NỘI DUNG THEO BIẾN VIEWMODE */}
//           {viewMode === 'horizontal' ? (
//             // Bố cục danh sách dọc xếp chồng (Card nằm ngang)
//             <div className="space-y-4">
//               {mockData.map(item => (
//                 <HorizontalHomestayCard 
//                   key={item.id}
//                   item={item}
//                   isFav={favorites.includes(item.id)}
//                   onFavToggle={toggleFavorite}
//                 />
//               ))}
//             </div>
//           ) : (
//             // Bố cục lưới Grid ô vuông (Card dựng đứng)
//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
//               {mockData.map(item => (
//                 <VerticalHomestayCard 
//                   key={item.id}
//                   item={item}
//                   isFav={favorites.includes(item.id)}
//                   onFavToggle={toggleFavorite}
//                 />
//               ))}
//             </div>
//           )}
//         </section>

//       </div>
//     </div>
//   );
// }

// /* ==========================================================================
//    COMPONENT 1: CARD NẰM NGANG PHONG CÁCH BOOKING (NỀN KÍNH MỜ TRONG SUỐT HOVER)
//    ========================================================================== */
// function HorizontalHomestayCard({ item, isFav, onFavToggle }) {
//   return (
//     <div className="bg-white rounded-xl border border-[#6E473B]/10 shadow-sm hover:shadow-xl transition-all duration-300 p-4 flex flex-col md:flex-row gap-5 group relative overflow-hidden text-left">
//       <div className="w-full md:w-[220px] h-[160px] rounded-lg overflow-hidden shrink-0 relative bg-gray-100">
//         <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
//         <button 
//           onClick={() => onFavToggle(item.id)}
//           className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition"
//         >
//           <span className="text-xs">{isFav ? '❤️' : '🤍'}</span>
//         </button>
//       </div>

//       <div className="flex-grow flex flex-col justify-between">
//         <div className="space-y-1">
//           <div className="flex flex-wrap items-start gap-1">
//             <h3 className="font-classic text-sm md:text-base font-bold text-[#2C1E15] hover:text-[#6E473B] transition cursor-pointer line-clamp-1">{item.name}</h3>
//             <span className="inline-block bg-[#E7B10A]/20 text-[#967205] text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase mt-0.5">👍+</span>
//           </div>
//           <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5 flex-wrap">
//             <span className="text-[#6E473B] font-bold underline">{item.location}</span>
//             <span className="text-gray-300">|</span>
//             <span className="underline text-[#2C3E2B]">{item.distance}</span>
//           </div>
//           <div className="pt-2 border-l-2 border-[#2C3E2B]/20 pl-2 space-y-0.5 text-[11px]">
//             <p className="font-bold text-gray-700">{item.roomType}</p>
//             <p className="text-gray-500">{item.details}</p>
//             <p className="text-gray-400 italic">{item.beds}</p>
//           </div>
//         </div>
//         <p className="text-[10px] text-red-600 font-bold bg-red-50 inline-block px-2 py-0.5 rounded mt-2 w-fit">⚠️ {item.alert}</p>
//       </div>

//       <div className="w-full md:w-[180px] shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4 flex flex-row md:flex-col justify-between items-end text-right">
//         <div className="flex items-center space-x-2">
//           <div className="flex flex-col items-end">
//             <span className="text-xs font-bold text-[#2C1E15]">{item.reviewText}</span>
//             <span className="text-[10px] text-gray-400">{item.reviewsCount} đánh giá</span>
//           </div>
//           <div className="w-7 h-7 bg-[#2C3E2B] text-white font-black text-xs rounded-lg rounded-br-none flex items-center justify-center shadow-sm">{item.score}</div>
//         </div>
//         <div className="space-y-0.5 mt-auto w-full">
//           <span className="text-[10px] text-gray-400 block font-medium">Giá tính cho 2 đêm, 2 người</span>
//           <div className="text-sm md:text-base font-black text-[#6E473B] tracking-tight">VND {item.price}</div>
//           <div className="text-[9px] text-gray-400 font-semibold block">{item.tax}</div>
//           <button className="w-full mt-2 bg-[#2C3E2B] hover:bg-[#1f2d20] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center shadow-sm">
//             <span>Xem mọi lựa chọn</span>
//           </button>
//         </div>
//       </div>

//       <div className="absolute inset-0 bg-[#7d9f81]/35 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20 pointer-events-none">
//         <button className="bg-[#6E473B] text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-xl pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
//           ⚡ Đặt phòng cấp tốc
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ==========================================================================
//    COMPONENT 2: CARD DỰNG ĐỨNG (CHIỀU DỌC LƯỚI Ô VUÔNG CÓ HIỆU ỨNG TRONG SUỐT)
//    ========================================================================== */
// function VerticalHomestayCard({ item, isFav, onFavToggle }) {
//   return (
//     <div className="bg-white p-3.5 rounded-2xl border border-[#6E473B]/5 shadow-sm hover:shadow-xl group relative overflow-hidden text-left transition-all duration-300 flex flex-col h-full">
      
//       {/* Khung ảnh */}
//       <div className="h-44 w-full bg-gray-100 rounded-xl mb-3.5 relative overflow-hidden shrink-0">
//         <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        
//         <button 
//           onClick={(e) => { e.stopPropagation(); onFavToggle(item.id); }}
//           className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-white/20 text-gray-400 hover:text-red-500 shadow-sm transition z-20"
//         >
//           <span className="text-xs">{isFav ? '❤️' : '🤍'}</span>
//         </button>

//         {/* Badge hiển thị điểm số chuẩn Booking bo góc trên ảnh */}
//         <div className="absolute bottom-2 left-2 bg-[#2C3E2B]/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] text-[#F4F1EA] font-extrabold flex items-center space-x-1 shadow-sm">
//           <span>⭐ {item.score} ({item.reviewText})</span>
//         </div>
//       </div>

//       {/* Thông tin chữ */}
//       <div className="flex-grow flex flex-col justify-between">
//         <div className="space-y-1">
//           <h3 className="font-classic text-sm font-bold text-[#2C1E15] mb-0.5 line-clamp-1 hover:text-[#6E473B] cursor-pointer">{item.name}</h3>
//           <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">📍 {item.location} • <span className="text-gray-500 font-normal">{item.distance}</span></p>
//           <p className="text-[10px] text-[#2C3E2B] font-bold bg-[#2C3E2B]/5 px-2 py-0.5 rounded w-fit mt-1">{item.roomType}</p>
//         </div>

//         {/* Khối giá tiền & Lượt đặt tích hợp thông số mockData */}
//         <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between">
//           <div className="flex flex-col">
//             <span className="text-[10px] text-gray-400 line-through font-medium">{item.oldPrice}đ</span>
//             <span className="text-xs font-bold text-[#6E473B]">{item.price}đ<span className="text-[10px] text-gray-400 font-normal"> /đêm</span></span>
//           </div>
//           <span className="text-[10px] text-gray-400 font-semibold bg-gray-50 px-2 py-1 rounded-md">
//             📈 {item.orders} lượt đặt
//           </span>
//         </div>
//       </div>
      
//       {/* NỀN KÍNH MỜ TRONG SUỐT KHI HOVER RÊ CHUỘT (ĐỒNG BỘ MẪU TRƯỚC ĐÓ) */}
//       <div className="absolute inset-x-0 bottom-0 bg-[#7d9f81]/40 backdrop-blur-sm h-22 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center px-4 z-30 shadow-2xl pointer-events-none">
//         <button className="w-full bg-[#6E473B] hover:bg-[#57362c] text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl shadow-md transition transform active:scale-98 pointer-events-auto">
//           Đặt phòng ngay
//         </button>
//       </div>

//     </div>
//   );
// }

import { useState } from 'react';
// Import 2 loại card từ thư mục component
import HorizontalHomestayCard from '../../components/homestay/HorizontalHomestayCard';
import VerticalHomestayCard from '../../components/homestay/VerticalHomestayCard';

export default function SearchContent({ setHasSearched, favorites, toggleFavorite }) {
  const [viewMode, setViewMode] = useState('horizontal');

  const mockData = [
    {
      id: 1,
      name: "Lam Vien Garden Villa - Homestay Da Lat",
      location: "Đà Lạt",
      distance: "Cách trung tâm 3.8km",
      roomType: "Căn Hộ Bản Địa 2 Phòng Ngủ",
      details: "1 căn hộ nguyên căn • 2 phòng ngủ • 1 phòng khách • 1 phòng tắm • 1 phòng bếp • 50 m²",
      beds: "5 giường (2 giường đôi, 2 giường đơn, 1 giường đôi lớn)",
      alert: "Chúng tôi còn 1 phòng trống với giá này",
      score: "9.1",
      reviewText: "Tuyệt hảo",
      reviewsCount: 95,
      price: "2.718.400",
      oldPrice: "3.500.000",
      orders: "142",
      tax: "+VND 249.853 thuế và phí dịch vụ",
      img: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=500"
    },
    {
      id: 2,
      name: "Mộc Lâm Đỉnh Đồi Bungalow Rừng Thông",
      location: "Đà Lạt",
      distance: "Cách trung tâm 1.5km",
      roomType: "Bungalow Gỗ Thông Biệt Lập",
      details: "Nguyên căn riêng tư • 1 phòng ngủ • 1 phòng tắm bồn gỗ mộc • Ban công ngắm mây • 35 m²",
      beds: "1 giường đôi cực lớn King-size",
      alert: "Ưu Đãi Đặc Biệt - Giảm ngay 20% trong hôm nay",
      score: "9.5",
      reviewText: "Xuất sắc",
      reviewsCount: 142,
      price: "1.350.000",
      oldPrice: "1.800.000",
      orders: "210",
      tax: "Đã bao gồm đầy đủ thuế phí",
      img: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=500"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in text-left">
      
      {/* Thanh thông tin nhỏ gọn ở đỉnh */}
      <div className="mb-6 p-3.5 bg-white border border-[#6E473B]/10 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="text-xs font-bold text-gray-500">
          Kết quả tìm kiếm tại Đà Lạt: Đã tìm thấy <span className="text-[#6E473B] font-extrabold text-sm">758 nơi lưu trú</span> cho bạn
        </div>
        <button 
          onClick={() => setHasSearched(false)} 
          className="text-xs text-[#6E473B] font-bold hover:underline flex items-center gap-1"
        >
          ↩ Thay đổi tùy chọn tìm kiếm
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* CỘT SƯỜN TRÁI: BẢN ĐỒ & BỘ LỌC CHỌN THEO KIỂU BOOKING */}
        <aside className="w-full lg:w-[260px] shrink-0 space-y-4">
          <div className="relative h-36 rounded-xl overflow-hidden border border-[#6E473B]/10 shadow-sm group">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=300" alt="Map" className="w-full h-full object-cover grayscale brightness-95" />
            <div className="absolute inset-0 bg-[#2C3E2B]/10 flex items-center justify-center">
              <button className="bg-[#2C3E2B] text-white font-bold text-[10px] uppercase tracking-wider px-3 py-2 rounded-lg shadow-md hover:bg-[#1f2d20] transition">
                🗺️ Hiển thị trên bản đồ
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#6E473B]/10 shadow-sm space-y-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100">Chọn lọc theo:</h3>
            
            <div>
              <h4 className="font-bold text-xs text-[#2C1E15] mb-2">Dùng các bộ lọc cũ</h4>
              <div className="space-y-2 text-xs">
                {[{l: 'Chỗ nghỉ nhà dân', c: 84}, {l: 'Khách sạn', c: 433}, {l: 'Biệt thự', c: 29}].map((i, idx) => (
                  <label key={idx} className="flex items-center justify-between text-gray-600 cursor-pointer hover:text-[#2C3E2B]">
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-[#2C3E2B] mr-2 accent-[#2C3E2B] focus:ring-0" />
                      {i.l}
                    </div>
                    <span className="text-gray-400 text-[10px]">{i.c}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-[#2C1E15] mb-1">Ngân sách của bạn (mỗi đêm)</h4>
              <p className="text-[10px] text-gray-400 font-semibold mb-2">VND 50.000 - VND 2.000.000+</p>
              <input type="range" min="50000" max="2000000" className="w-full accent-[#2C3E2B]" />
            </div>

            <div>
              <h4 className="font-bold text-xs text-[#2C1E15] mb-2">Tiện nghi phòng</h4>
              <div className="space-y-2 text-xs">
                {['🛌 Phòng ngủ khép kín', '🚿 Phòng tắm bồn gỗ', '🍳 Bếp đầy đủ gia vị', '🏊 Hồ bơi vô cực'].map((item, idx) => (
                  <label key={idx} className="flex items-center text-gray-600 cursor-pointer hover:text-[#2C3E2B]">
                    <input type="checkbox" className="rounded border-gray-300 text-[#2C3E2B] mr-2 accent-[#2C3E2B] focus:ring-0" /> {item}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* CỘT PHẢI: HIỂN THỊ ĐỘNG */}
        <section className="flex-grow space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#6E473B]/10 shadow-sm">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold">
              <span className="text-gray-400">Sắp xếp theo:</span>
              <select className="border-0 bg-transparent py-0 pl-0 pr-6 text-[#6E473B] font-bold focus:ring-0 cursor-pointer appearance-none">
                <option>Lựa chọn hàng đầu của Cozygo</option>
                <option>Giá tốt nhất trước</option>
                <option>Điểm đánh giá sao cao nhất</option>
              </select>
            </div>

            <div className="flex items-center bg-[#F4F1EA] p-1 rounded-lg text-[11px] font-bold border border-gray-200">
              <button 
                onClick={() => setViewMode('horizontal')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${viewMode === 'horizontal' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-[#2C3E2B]'}`}
              >
                <span>📋</span> Xem ngang
              </button>
              <button 
                onClick={() => setViewMode('vertical')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${viewMode === 'vertical' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-[#2C3E2B]'}`}
              >
                <span>📱</span> Xem dọc
              </button>
            </div>
          </div>

          {viewMode === 'horizontal' ? (
            <div className="space-y-4">
              {mockData.map(item => (
                <HorizontalHomestayCard 
                  key={item.id}
                  item={item}
                  isFav={favorites.includes(item.id)}
                  onFavToggle={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockData.map(item => (
                <VerticalHomestayCard 
                  key={item.id}
                  item={item}
                  isFav={favorites.includes(item.id)}
                  onFavToggle={toggleFavorite}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}