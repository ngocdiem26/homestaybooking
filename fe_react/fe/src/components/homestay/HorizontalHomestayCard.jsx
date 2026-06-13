export default function HorizontalHomestayCard({ item, isFav, onFavToggle }) {
  return (
    <div className="bg-white rounded-xl border border-[#6E473B]/10 shadow-sm hover:shadow-xl transition-all duration-300 p-4 flex flex-col md:flex-row gap-5 group relative overflow-hidden text-left">
      <div className="w-full md:w-[220px] h-[160px] rounded-lg overflow-hidden shrink-0 relative bg-gray-100">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <button 
          onClick={() => onFavToggle(item.id)}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition"
        >
          <span className="text-xs">{isFav ? '❤️' : '🤍'}</span>
        </button>
      </div>

      <div className="flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-start gap-1">
            <h3 className="font-classic text-sm md:text-base font-bold text-[#2C1E15] hover:text-[#6E473B] transition cursor-pointer line-clamp-1">{item.name}</h3>
            <span className="inline-block bg-[#E7B10A]/20 text-[#967205] text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase mt-0.5">👍+</span>
          </div>
          <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5 flex-wrap">
            <span className="text-[#6E473B] font-bold underline">{item.location}</span>
            <span className="text-gray-300">|</span>
            <span className="underline text-[#2C3E2B]">{item.distance}</span>
          </div>
          <div className="pt-2 border-l-2 border-[#2C3E2B]/20 pl-2 space-y-0.5 text-[11px]">
            <p className="font-bold text-gray-700">{item.roomType}</p>
            <p className="text-gray-500">{item.details}</p>
            <p className="text-gray-400 italic">{item.beds}</p>
          </div>
        </div>
        <p className="text-[10px] text-red-600 font-bold bg-red-50 inline-block px-2 py-0.5 rounded mt-2 w-fit">⚠️ {item.alert}</p>
      </div>

      <div className="w-full md:w-[180px] shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4 flex flex-row md:flex-col justify-between items-end text-right">
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-[#2C1E15]">{item.reviewText}</span>
            <span className="text-[10px] text-gray-400">{item.reviewsCount} đánh giá</span>
          </div>
          <div className="w-7 h-7 bg-[#2C3E2B] text-white font-black text-xs rounded-lg rounded-br-none flex items-center justify-center shadow-sm">{item.score}</div>
        </div>
        <div className="space-y-0.5 mt-auto w-full">
          <span className="text-[10px] text-gray-400 block font-medium">Giá tính cho 2 đêm, 2 người</span>
          <div className="text-sm md:text-base font-black text-[#6E473B] tracking-tight">VND {item.price}</div>
          <div className="text-[9px] text-gray-400 font-semibold block">{item.tax}</div>
          <button className="w-full mt-2 bg-[#2C3E2B] hover:bg-[#1f2d20] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center shadow-sm">
            <span>Xem mọi lựa chọn</span>
          </button>
        </div>
      </div>

      <div className="absolute inset-0 bg-[#7d9f81]/35 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20 pointer-events-none">
        <button className="bg-[#6E473B] text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-xl pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          ⚡ Đặt phòng cấp tốc
        </button>
      </div>
    </div>
  );
}