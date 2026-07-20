import { useNavigate } from 'react-router-dom';
import { HiStar, HiMapPin } from 'react-icons/hi2';
import { calculateNights, getStoredSearchState } from '../../services/searchState';

function toNumber(value) {
  if (typeof value === 'number') return value;
  const parsed = Number(String(value || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN') + ' đ';
}

function getPriceSummary(item) {
  const search = getStoredSearchState();
  const nights = calculateNights(search.checkIn, search.checkOut);
  const pricePerNight = toNumber(item.pricePerNight || item.price);
  return {
    nights,
    pricePerNight,
    totalPrice: pricePerNight * nights,
    oldTotalPrice: Math.round(pricePerNight * 1.18) * nights,
  };
}

export default function VerticalHomestayCard({ item, isFav, onFavToggle }) {
  const navigate = useNavigate();
  const openDetail = () => navigate('/homestay/' + (item.homeId || item.id));
  const displayCity = item.city || item.province || 'Chưa cập nhật';
  const score = item.rating || item.score || '0.0';
  const reviewCount = Number(item.reviewCount ?? item.reviewsCount ?? 0);
  const { nights, totalPrice, oldTotalPrice } = getPriceSummary(item);

  return (
    <div onClick={openDetail} className="bg-white p-3.5 cursor-pointer rounded-2xl border border-[#6E473B]/5 shadow-sm hover:shadow-2xl hover:-translate-y-0.5 group relative overflow-hidden text-left transition-all duration-300 flex flex-col h-full font-sans">
      <div className="h-44 w-full bg-gray-100 rounded-xl mb-3.5 relative overflow-hidden shrink-0">
        <img
          src={item.images?.[0]?.url || item.img}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onFavToggle(item.id); }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border border-white/20 text-gray-400 hover:text-red-500 shadow-sm transition z-20"
        >
          <span className="text-xs">{isFav ? '❤️' : '🤍'}</span>
        </button>
      </div>

      <div className="flex-grow flex flex-col justify-between">
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-[#2C1E15] mb-0.5 line-clamp-1 hover:text-[#6E473B] cursor-pointer transition">
            {item.name}
          </h3>
          <p className="text-[11px] font-medium flex items-center gap-1 line-clamp-1">
            <HiMapPin size={12} className="text-[#a50000] shrink-0" />
            <span className="text-[11px] text-[#2C3E2B]">{displayCity}</span>
          </p>
          <div className="inline-flex items-center gap-2">
             <div className="w-8 h-8 bg-[#2C3E2B] text-white font-black text-xs rounded-lg  rounded-br-none flex items-center justify-center shadow-sm">
            <HiStar className="h-3 w-3 text-amber-300" /> <div className="ml-0.5 mr-0.5">{score}</div>
          </div>
          <span className=" gap-2 rounded-xl bg-[#2C3E2B]/5 border border-[#2C3E2B]/10 px-2.5 py-2 text-[10px] font-bold text-gray-700">{reviewCount > 0 ? reviewCount + ' đánh giá' : 'Chưa có đánh giá'}</span>
          
        </div>
        </div>

        <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex flex-col text-left">
            <span className="text-[12px] text-gray-500 line-through font-semibold">
              {formatCurrency(oldTotalPrice)}
            </span>
            <span className="text-[13px] font-bold shadow-lg bg-[#f9dfd7] text-[#904630] px-2 py-1 rounded-r-3xl">
              {formatCurrency(totalPrice)}
              <span className="text-[11px] text-[#904630]/80"> / {nights} đêm</span>
            </span>
          </div>
          <span className="text-[10px] text-gray-700 font-bold bg-gray-50 border border-gray-100 px-2 py-1 rounded-md shadow-md shrink-0">
            {item.orders || 0} lượt đặt
          </span>
        </div>
      </div>
    </div>
  );
}
