import { useState } from 'react';
import ModalPortal from '../../common/ModalPortal';
import {
  formatNightlyPrice,
  formatTime,
  getHomestayStatusClass,
  getHomestayStatusLabel,
} from './adminHomestayFormatters';

export default function AdminHomestayDetailModal({
  homestay,
  onClose,
  onDelete,
  onUpdateStatus,
}) {
  const [galleryState, setGalleryState] = useState({ homeId: null, index: 0 });

  if (!homestay) {
    return null;
  }

  const images = homestay.images?.length ? homestay.images : [homestay.image];
  const activeIndex = galleryState.homeId === homestay.id ? galleryState.index : 0;
  const activeImage = images[activeIndex] || images[0];
  const hasMultipleImages = images.length > 1;

  const changeImage = (nextIndex) => {
    const normalizedIndex = (nextIndex + images.length) % images.length;
    setGalleryState({ homeId: homestay.id, index: normalizedIndex });
  };

  return (
    <ModalPortal>
      <div className="bg-[#F4F1EA] max-w-3xl w-full max-h-[92vh] overflow-y-auto rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative font-semibold text-gray-600">
        {/* <button
          onClick={onClose}
          className="absolute -top-0 -right-0 w-7 h-7 rounded-full bg-[#2C1E15] hover:bg-[#6E473B] text-white border-2 border-white shadow-xl z-20 flex items-center justify-center text-lg font-black cursor-pointer transition active:scale-95"
          type="button"
          aria-label="Đóng"
        >
          x
        </button> */}

        <button
          onClick={onClose}
          className="absolute -top-0 -right-0 w-8 h-8 rounded-full bg-[#2C1E15] hover:bg-[#6E473B] text-white border-2 border-white shadow-lg z-20 flex items-center justify-center cursor-pointer transition active:scale-95"
          type="button"
          aria-label="Đóng"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-3">
          <div className="w-full h-64 rounded-2xl overflow-hidden shadow-md relative border border-gray-200 bg-gray-100">
            <img src={activeImage} alt={homestay.name} className="w-full h-full object-cover" />

            {hasMultipleImages && (
              <>
                <button
                  onClick={() => changeImage(activeIndex - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/75 text-white border border-white/20 shadow-lg flex items-center justify-center transition"
                  type="button"
                  aria-label="Ảnh trước"
                >
                  <i className="fa-solid fa-chevron-left text-sm"></i>
                </button>
                <button
                  onClick={() => changeImage(activeIndex + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/75 text-white border border-white/20 shadow-lg flex items-center justify-center transition"
                  type="button"
                  aria-label="Ảnh sau"
                >
                  <i className="fa-solid fa-chevron-right text-sm"></i>
                </button>
              </>
            )}

            <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold">
              {activeIndex + 1}/{images.length}
            </div>
            <div className="absolute bottom-3 right-3 bg-[#2C1E15]/85 text-white px-3 py-1 rounded-lg text-xs font-bold">
            {formatNightlyPrice(homestay.pricePerNight)}/đêm
            </div>
          </div>
          {hasMultipleImages && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  onClick={() => changeImage(index)}
                  className={`w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                    index === activeIndex ? 'border-[#2C3E2B] shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  type="button"
                  aria-label={`Xem ảnh ${index + 1}`}
                >
                  <img src={imageUrl} alt={`${homestay.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 pb-2">
          <h3 className="font-serif text-xl font-bold text-[#2C1E15]">{homestay.name}</h3>
          <p className="text-xs text-gray-400 font-mono">{homestay.code}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-6 gap-y-2.5 text-xs md:text-sm">
          <InfoRow label="Địa điểm" value={`${homestay.address}, ${homestay.province}`} />
          <InfoRow label="Chủ nhà" value={`${homestay.ownerName} (${homestay.ownerCode})`} />
          <InfoRow label="Sức chứa" value={`${homestay.maxGuest || 0} khách`} />
          <InfoRow label="Đánh giá" value={`${homestay.ratingAvg || 0}/5 (${homestay.ratingCount || 0})`} />
          <InfoRow label="Phòng ngủ" value={`${homestay.bedroomCount || 0} phòng`} />
          <InfoRow label="Giường" value={`${homestay.bedCount || 0} giường`} />
          <InfoRow label="Phòng tắm" value={`${homestay.bathroomCount || 0} phòng`} />
          <InfoRow label="Bếp" value={`${homestay.kitchenCount || 0} bếp`} />
          <InfoRow label="Check-in" value={formatTime(homestay.checkinTime)} />
          <InfoRow label="Check-out" value={formatTime(homestay.checkoutTime)} />
          <p className="md:col-span-2">
            <span className="text-gray-400 inline-block w-28">Trạng thái:</span>
            <span className={`ml-1 font-bold text-xs px-2 py-0.5 rounded border ${getHomestayStatusClass(homestay.status)}`}>
              {getHomestayStatusLabel(homestay.status)}
            </span>
          </p>
        </div>

        {homestay.description && (
          <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-200/60 pt-3">
            {homestay.description}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200/60">
          {homestay.status === 'PENDING' ? (
            <>
              <button
                onClick={() => onUpdateStatus(homestay, 'APPROVED')}
                className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-bold transition border-none shadow-sm cursor-pointer"
                type="button"
              >
                Phê duyệt
              </button>
              <button
                onClick={() => onUpdateStatus(homestay, 'REJECTED')}
                className="bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition border-none shadow-sm cursor-pointer"
                type="button"
              >
                Từ chối
              </button>
            </>
          ) : (
            <button
              onClick={() => onUpdateStatus(homestay, homestay.status === 'BLOCKED' ? 'APPROVED' : 'BLOCKED')}
              className={`py-2.5 rounded-xl text-xs font-bold text-white transition border-none shadow-sm cursor-pointer col-span-2 ${
                homestay.status === 'BLOCKED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
              type="button"
            >
              {homestay.status === 'BLOCKED' ? 'Bỏ chặn hiển thị' : 'Chặn homestay'}
            </button>
          )}
          <button
            onClick={() => onDelete(homestay)}
            className="bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition cursor-pointer text-center"
            type="button"
          >
            Xóa mục
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}

function InfoRow({ label, value }) {
  return (
    <p>
      <span className="text-gray-400 inline-block w-28">{label}:</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </p>
  );
}

