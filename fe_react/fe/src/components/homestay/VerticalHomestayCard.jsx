
export default function VerticalHomestayCard({ item, isFav, onFavToggle }) {
  return (
    <div className="bg-white p-3.5 rounded-2xl border border-[#6E473B]/5 shadow-sm hover:shadow-xl group relative overflow-hidden text-left transition-all duration-300 flex flex-col h-full">
      <div className="h-44 w-full bg-gray-100 rounded-xl mb-3.5 relative overflow-hidden shrink-0">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <button 
          onClick={(e) => { e.stopPropagation(); onFavToggle(item.id); }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-white/20 text-gray-400 hover:text-red-500 shadow-sm transition z-20"
        >
          <span className="text-xs">{isFav ? '❤️' : '🤍'}</span>
        </button>
        <div className="absolute bottom-2 left-2 bg-[#2C3E2B]/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] text-[#F4F1EA] font-extrabold flex items-center space-x-1 shadow-sm">
          <span>⭐ {item.score} ({item.reviewText})</span>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          <h3 className="font-classic text-sm font-bold text-[#2C1E15] mb-0.5 line-clamp-1 hover:text-[#6E473B] cursor-pointer">{item.name}</h3>
          <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">📍 {item.location} • <span className="text-gray-500 font-normal">{item.distance}</span></p>
          <p className="text-[10px] text-[#2C3E2B] font-bold bg-[#2C3E2B]/5 px-2 py-0.5 rounded w-fit mt-1">{item.roomType}</p>
        </div>
        <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 line-through font-medium">{item.oldPrice}đ</span>
            <span className="text-xs font-bold text-[#6E473B]">{item.price}đ<span className="text-[10px] text-gray-400 font-normal"> /đêm</span></span>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold bg-gray-50 px-2 py-1 rounded-md">📈 {item.orders} lượt đặt</span>
        </div>
      </div>
      
      <div className="absolute inset-x-0 bottom-0 bg-[#7d9f81]/40 backdrop-blur-sm h-22 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center px-4 z-30 shadow-2xl pointer-events-none">
        <button className="w-full bg-[#6E473B] hover:bg-[#57362c] text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl shadow-md transition transform active:scale-98 pointer-events-auto">
          Đặt phòng ngay
        </button>
      </div>
    </div>
  );
}