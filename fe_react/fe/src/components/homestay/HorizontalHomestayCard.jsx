import { useNavigate } from 'react-router-dom';
import { HiStar } from 'react-icons/hi2';
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
    totalPrice: pricePerNight * nights,
  };
}

function getFacilitySummary(item) {
  const bedroomCount = toNumber(item.bedroomCount);
  const bathroomCount = toNumber(item.bathroomCount);
  const livingRoomCount = toNumber(item.livingRoomCount);
  const parts = [];

  if (bedroomCount > 0) parts.push(bedroomCount + ' phòng ngủ');
  if (bathroomCount > 0) parts.push(bathroomCount + ' phòng tắm');
  if (livingRoomCount > 0) parts.push(livingRoomCount + ' phòng khách');

  return parts.length > 0 ? parts.join(' • ') : 'Thông tin phòng đang được cập nhật';
}

function getGuestSummary(item) {
  const bedCount = toNumber(item.bedCount);
  const maxGuest = toNumber(item.maxGuest);
  const parts = [];

  if (bedCount > 0) parts.push(bedCount + ' giường');
  if (maxGuest > 0) parts.push('phù hợp ' + maxGuest + ' khách');

  return parts.length > 0 ? parts.join(' • ') : 'Sức chứa đang được cập nhật';
}

function getDiscountAlert(item) {
  const discountPercent = toNumber(item.discountPercent);
  if (discountPercent <= 0) return '';
  return 'Đang có ưu đãi ' + discountPercent + '%';
}

export default function HorizontalHomestayCard({ item, isFav, onFavToggle }) {
  const navigate = useNavigate();
  const openDetail = () => navigate('/homestay/' + (item.homeId || item.id));
  const displayCity = item.city || item.province || 'Chưa cập nhật';
  const reviewCount = Number(item.reviewCount ?? item.reviewsCount ?? 0);
  const score = item.score || item.rating || '0.0';
  const { nights, totalPrice } = getPriceSummary(item);
  const facilitySummary = getFacilitySummary(item);
  const guestSummary = getGuestSummary(item);
  const discountAlert = getDiscountAlert(item);

  return (
    <div
      onClick={openDetail}
      className="bg-white rounded-xl cursor-pointer border border-[#6E473B]/10 shadow-sm hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 p-4 flex flex-col md:flex-row gap-5 group relative overflow-hidden text-left"
    >
      <div className="w-full md:w-[220px] h-[160px] rounded-lg overflow-hidden shrink-0 relative bg-gray-100">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <button
          onClick={(event) => {
            event.stopPropagation();
            onFavToggle(item.id);
          }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-500 shadow-sm transition"
          aria-label={isFav ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
        >
          <span className="text-xs">{isFav ? '❤️' : '🤍'}</span>
        </button>
      </div>

      <div className="flex-grow flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-start gap-1">
            <h3 className="font-classic text-sm md:text-base font-bold text-[#2C1E15] hover:text-[#6E473B] transition cursor-pointer line-clamp-1">
              {item.name}
            </h3>
          
          </div>
          <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5 flex-wrap">
            <span className="text-[#6E473B] font-bold underline">{displayCity}</span>
          </div>
          <div className="pt-2 border-l-2 border-[#2C3E2B]/20 pl-2 space-y-1 text-[12px]">
            <p className="font-black text-[#2C1E15]">Cơ sở vật chất tại homestay</p>
            <p className="font-bold text-gray-600 leading-5">{facilitySummary}</p>
            <p className="font-semibold text-gray-500 leading-5">{guestSummary}</p>
          </div>
        </div>

        {discountAlert && (
          <p className="text-[10px] text-red-600 font-bold bg-red-50 inline-block px-2 py-0.5 rounded mt-2 w-fit">
            ⚠️ {discountAlert}
          </p>
        )}
      </div>

      <div className="w-full md:w-[180px] shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4 flex flex-row md:flex-col justify-between items-end text-right">
        <div className="inline-flex items-center gap-2">
          <span className="rounded-xl bg-[#2C3E2B]/5 border border-[#2C3E2B]/10 px-2.5 py-2 text-[10px] font-bold text-gray-700">
            {reviewCount > 0 ? reviewCount + ' đánh giá' : 'Chưa có đánh giá'}
          </span>
          <div className="w-10 h-8 bg-[#2C3E2B] text-white font-black text-xs rounded-lg rounded-br-none flex items-center justify-center shadow-sm">
            <HiStar className="h-3 w-3 text-amber-300" />
            <span className="ml-0.5 mr-0.5">{score}</span>
          </div>
        </div>

        <div className="space-y-0.5 mt-auto w-full">
          <span className="text-[10px] text-gray-400 block font-medium">Giá cho {nights} đêm</span>
          <div className="text-sm md:text-base font-black text-[#6E473B] tracking-tight">{formatCurrency(totalPrice)}</div>
          <div className="text-[9px] text-gray-400 font-semibold block">Đã bao gồm thuế và phí dịch vụ cơ bản</div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openDetail();
            }}
            className="w-full mt-2 bg-[#2C3E2B] hover:bg-[#1f2d20] text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center shadow-sm"
          >
            <span>Xem chi tiết</span>
          </button>
        </div>
      </div>
    </div>
  );
}
