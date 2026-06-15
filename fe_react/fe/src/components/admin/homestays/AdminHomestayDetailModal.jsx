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
  if (!homestay) {
    return null;
  }

  return (
    <ModalPortal>
      <div className="bg-[#F4F1EA] max-w-2xl w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative font-semibold text-gray-600">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none z-10"
          type="button"
        >
          x
        </button>

        <div className="w-full h-48 rounded-2xl overflow-hidden shadow-md relative border border-gray-200">
          <img src={homestay.image} alt={homestay.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-3 right-3 bg-[#2C1E15]/85 text-white px-3 py-1 rounded-lg text-xs font-bold">
            {formatNightlyPrice(homestay.pricePerNight)}/đêm
          </div>
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
