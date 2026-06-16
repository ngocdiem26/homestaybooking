import ModalPortal from '../../common/ModalPortal';
import {
  formatCurrency,
  formatDateRange,
  formatPromotionValue,
  getDiscountTypeLabel,
  getPromotionStatusClass,
  getPromotionStatusLabel,
} from './adminPromotionFormatters';

export default function AdminPromotionDetailModal({ onClose, promotion }) {
  if (!promotion) {
    return null;
  }

  return (
    <ModalPortal>
      <div className="bg-white max-w-md w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative font-semibold text-gray-600">
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

        <div className="border-b border-gray-200 pb-3">
          <h3 className="font-serif text-lg font-bold text-[#2C1E15]">Chi tiết mã khuyến mãi</h3>
          <p className="text-xs text-gray-400 font-mono mt-1">{promotion.code}</p>
        </div>

        <div className="space-y-2.5 text-xs md:text-sm">
          <InfoRow label="Tên" value={promotion.name} />
          <InfoRow label="Loại giảm" value={getDiscountTypeLabel(promotion.discountType)} />
          <InfoRow label="Giá trị" value={formatPromotionValue(promotion)} highlight />
          <InfoRow label="Hiệu lực" value={formatDateRange(promotion.startDate, promotion.endDate)} isMono />
          <InfoRow label="Đơn tối thiểu" value={formatCurrency(promotion.minOrderAmount)} />
          <InfoRow label="Giảm tối đa" value={formatCurrency(promotion.maxDiscount)} />
          <InfoRow label="Tổng lượt" value={promotion.usageLimitTotal ?? 'Không giới hạn'} />
          <InfoRow label="Mỗi khách" value={promotion.usageLimitPerUser ?? 'Không giới hạn'} />
          <p>
            <span className="text-gray-400 inline-block w-28">Trạng thái:</span>
            <span className={`ml-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getPromotionStatusClass(promotion.status)}`}>
              {getPromotionStatusLabel(promotion.status)}
            </span>
          </p>
        </div>

        {promotion.description && (
          <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
            {promotion.description}
          </p>
        )}
      </div>
    </ModalPortal>
  );
}

function InfoRow({ highlight = false, isMono = false, label, value }) {
  return (
    <p>
      <span className="text-gray-400 inline-block w-28">{label}:</span>
      <span className={`${highlight ? 'text-[#6E473B]' : 'text-gray-800'} font-bold ${isMono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </p>
  );
}
