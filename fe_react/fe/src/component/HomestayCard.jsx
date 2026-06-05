
export default function HomestayCard({ item, isFav, onFavToggle }) {
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
        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] text-[#F4F1EA] font-bold">
          <span>⭐ {item.rate}</span>
        </div>
      </div>
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-classic text-sm font-bold text-[#2C1E15] mb-0.5 line-clamp-1">{item.name}</h3>
          <p className="text-[11px] text-gray-400 font-medium">📍 {item.location}</p>
        </div>
        <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 line-through font-medium">{item.oldPrice}đ</span>
            <span className="text-xs font-bold text-[#6E473B]">{item.price}đ<span className="text-[10px] text-gray-400 font-normal"> /đêm</span></span>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold bg-gray-50 px-2 py-1 rounded-md">📈 {item.orders} lượt đặt</span>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-[#7d9f81]/40 backdrop-blur-sm h-22 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center px-4 z-30 shadow-2xl">
        <button className="w-full bg-[#6E473B] hover:bg-[#57362c] text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl shadow-md transition">
          Đặt phòng ngay
        </button>
      </div>
    </div>
  );
}