import ModalPortal from '../../common/ModalPortal';
import {
  formatCurrency,
  formatDateRange,
  formatPromotionValue,
  getDiscountTypeLabel,
  getPromotionScopeLabel,
  getPromotionStatusClass,
  getPromotionStatusLabel,
} from './adminPromotionFormatters';

export default function AdminPromotionDetailModal({ onClose, promotion }) {
  if (!promotion) {
    return null;
  }

  return (
    <ModalPortal>
      <div className="relative max-h-[86vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-3xl border border-[#6E473B]/20 bg-white p-6 font-semibold text-gray-600 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-0 top-0 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#2C1E15] text-white shadow-lg transition hover:bg-[#6E473B] active:scale-95"
          type="button"
          aria-label="Đóng"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="border-b border-gray-200 pb-3">
          <h3 className="font-serif text-lg font-bold text-[#2C1E15]">Chi tiết mã khuyến mãi</h3>
          <p className="mt-1 font-mono text-xs text-gray-400">{promotion.code}</p>
        </div>

        <div className="space-y-2.5 text-xs md:text-sm">
          <InfoRow label="Tên" value={promotion.name} />
          <InfoRow label="Phạm vi" value={getPromotionScopeLabel(promotion.promotionScope)} />
          <InfoRow label="Loại giảm" value={getDiscountTypeLabel(promotion.discountType)} />
          <InfoRow label="Giá trị" value={formatPromotionValue(promotion)} highlight />
          <InfoRow label="Hiệu lực" value={formatDateRange(promotion.startDate, promotion.endDate)} isMono />
          <InfoRow label="Đơn tối thiểu" value={formatCurrency(promotion.minOrderAmount)} />
          <InfoRow label="Giảm tối đa" value={formatCurrency(promotion.maxDiscount)} />
          <InfoRow label="Tổng lượt" value={promotion.usageLimitTotal ?? 'Không giới hạn'} />
          <InfoRow label="Mỗi khách" value={promotion.usageLimitPerUser ?? 'Không giới hạn'} />
          <p>
            <span className="inline-block w-28 text-gray-400">Trạng thái:</span>
            <span className={`ml-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getPromotionStatusClass(promotion.status)}`}>
              {getPromotionStatusLabel(promotion.status)}
            </span>
          </p>
        </div>

        <TargetPreview title="Khách hàng áp dụng" items={promotion.assignedUsers} />
        <TargetPreview title="Homestay áp dụng" items={promotion.assignedHomestays} />
        <TargetPreview title="Hạng thành viên áp dụng" items={promotion.assignedTiers} />

        {promotion.description && (
          <p className="border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-500">
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
      <span className="inline-block w-28 text-gray-400">{label}:</span>
      <span className={`${highlight ? 'text-[#6E473B]' : 'text-gray-800'} font-bold ${isMono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </p>
  );
}

function TargetPreview({ items = [], title }) {
  if (!items.length) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-[#F8F6F0] p-3">
      <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item.id} className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-gray-600 shadow-sm" title={item.subLabel || item.label}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
