
// export default function VerticalHomestayCard({ item, isFav, onFavToggle }) {
//   return (
//     <div onClick={openDetail} className="bg-white p-3.5 cursor-pointer rounded-2xl border border-[#6E473B]/5 shadow-sm hover:shadow-xl group relative overflow-hidden text-left transition-all duration-300 flex flex-col h-full">
//       <div className="h-44 w-full bg-gray-100 rounded-xl mb-3.5 relative overflow-hidden shrink-0">
//         <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
//         <button 
//           onClick={(e) => { e.stopPropagation(); onFavToggle(item.id); }}
//           className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-white/20 text-gray-400 hover:text-red-500 shadow-sm transition z-20"
//         >
//           <span className="text-xs">{isFav ? '❤️' : '🤍'}</span>
//         </button>
//         <div className="absolute bottom-2 left-2 bg-[#2C3E2B]/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] text-[#F4F1EA] font-extrabold flex items-center space-x-1 shadow-sm">
//           <span>⭐ {item.score} ({item.reviewText})</span>
//         </div>
//       </div>

//       <div className="flex-grow flex flex-col justify-between">
//         <div className="space-y-1">
//           <h3 className="font-classic text-sm font-bold text-[#2C1E15] mb-0.5 line-clamp-1 hover:text-[#6E473B] cursor-pointer">{item.name}</h3>
//           <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">📍 {item.location} • <span className="text-gray-500 font-normal">{item.distance}</span></p>
//           <p className="text-[10px] text-[#2C3E2B] font-bold bg-[#2C3E2B]/5 px-2 py-0.5 rounded w-fit mt-1">{item.roomType}</p>
//         </div>
//         <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between">
//           <div className="flex flex-col">
//             <span className="text-[10px] text-gray-400 line-through font-medium">{item.oldPrice}đ</span>
//             <span className="text-xs font-bold text-[#6E473B]">{item.price}đ<span className="text-[10px] text-gray-400 font-normal"> /đêm</span></span>
//           </div>
//           <span className="text-[10px] text-gray-400 font-semibold bg-gray-50 px-2 py-1 rounded-md">📈 {item.orders} lượt đặt</span>
//         </div>
//       </div>
      
//       <div className="absolute inset-x-0 bottom-0 bg-[#7d9f81]/40 backdrop-blur-sm h-22 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center px-4 z-30 shadow-2xl pointer-events-none">
//         <button type="button" className="w-full bg-[#6E473B] hover:bg-[#57362c] text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl shadow-md transition transform active:scale-98 pointer-events-auto">
//           Đặt phòng ngay
//         </button>
//       </div>
//     </div>
//   );
// }
import { useNavigate } from 'react-router-dom';
import { HiStar, HiMapPin } from 'react-icons/hi2';

export default function VerticalHomestayCard({ item, isFav, onFavToggle }) {
  const navigate = useNavigate();
  const openDetail = () => navigate('/homestay/' + (item.homeId || item.id));

  // Tính toán giá gốc tự động tăng 20% làm giá mồi nếu database của bạn không lưu trường giá cũ
  const originalPrice = item.oldPrice || Math.round(item.pricePerNight * 1.2);

  return (
    <div onClick={openDetail} className="bg-white p-3.5 cursor-pointer rounded-2xl border border-[#6E473B]/5 shadow-sm hover:shadow-xl group relative overflow-hidden text-left transition-all duration-300 flex flex-col h-full font-sans">
      
      {/* ─── KHU VỰC HÌNH ẢNH & THÔNG TIN NỔI (BADGES) ─── */}
      <div className="h-44 w-full bg-gray-100 rounded-xl mb-3.5 relative overflow-hidden shrink-0">
        <img 
          src={item.images?.[0]?.url || item.img} 
          alt={item.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
        />
        
        {/* Nút yêu thích sử dụng React Icons và hiệu ứng tim chuyển sắc */}
        <button 
          onClick={(e) => { e.stopPropagation(); onFavToggle(item.id); }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-white/20 text-gray-400 hover:text-red-500 shadow-sm transition z-20"
        >
          <span className="text-xs">{isFav ? '❤️' : '🤍'}</span>
        </button>
        
        {/* Dải thông tin đánh giá nổi trên ảnh (Chuẩn yêu cầu: Sao trái - Lượt đánh giá phải) */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-2">
          {/* Bên trái: Điểm sao */}
          <div className="bg-[#2C3E2B]/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] text-[#F4F1EA] font-extrabold flex items-center gap-1 shadow-sm">
            <HiStar size={11} className="text-amber-400" />
            <span>{item.rating || item.score || 5.0}</span>
          </div>
          
          {/* Bên phải: Lượt đánh giá */}
          <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] text-white font-medium shadow-sm">
            {item.reviewCount > 0 ? `${item.reviewCount} đánh giá` : 'Chưa có đánh giá'}
          </div>
        </div>
      </div>

      {/* ─── KHU VỰC THÔNG TIN VĂN BẢN (DỮ LIỆU ĐỒNG BỘ DB) ─── */}
      <div className="flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#2C1E15] mb-0.5 line-clamp-1 hover:text-[#6E473B] cursor-pointer transition">
            {item.name}
          </h3>
          
          {/* Địa chỉ chi tiết từ Database */}
          <p className="text-[11px] font-medium flex items-center gap-1 line-clamp-1">
            <HiMapPin size={12} className="text-[#a50000] shrink-0" /> 
            <span className="text-[11px] text-[#2C3E2B]">{item.address || item.location}</span>
          </p>
          
          {/* Trạng thái vận hành hiện tại hoặc Thành phố */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <p className="text-[10px] text-[#2C3E2B] font-bold bg-[#2C3E2B]/5 px-2 py-0.5 rounded w-fit">
              {item.city || "Chỗ nghỉ tư nhân"}
            </p>
          </div>
        </div>

        {/* Khu vực hiển thị Tài chính & Lượt đặt phòng */}
        <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col text-left">
            {/* Giá mồi giảm giá */}
            <span className="text-[13px] text-gray-700 line-through font-medium">
              {originalPrice.toLocaleString('vi-VN')} đ
            </span>
            {/* Giá thực tế trên ngày */}
            <span className="text-[13px] font-bold shadow-lg  bg-[#f9dfd7] text-[#904630] px-2 py-1 rounded-r-3xl">
              {(item.pricePerNight || item.price).toLocaleString('vi-VN')} đ
              <span className="text-[13px] ">/đêm</span>
            </span>
          </div>
          
          {/* Thống kê lượt đặt lưu trú */}
          <span className="text-[10px] text-gray-700 font-bold bg-gray-50 border border-gray-100 px-0 py-1 rounded-md shadow-md shrink-0">
            {item.orders || 0} lượt đặt
          </span>
        </div>
      </div>
      
      {/* ─── HIỆU ỨNG ĐÈ LÊN (HOVER BUTTON) ─── */}
      <div className="absolute inset-x-0 bottom-0 bg-[#7d9f81]/40 backdrop-blur-sm h-20 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center px-4 z-30 shadow-2xl pointer-events-none">
        <button type="button" className="w-full bg-[#6E473B] hover:bg-[#57362c] text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl shadow-md transition transform active:scale-98 pointer-events-auto border-none cursor-pointer">
          Đặt phòng ngay
        </button>
      </div>
      
    </div>
  );
}
