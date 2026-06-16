import ModalPortal from '../../common/ModalPortal';
import { DISCOUNT_TYPE_OPTIONS, PROMOTION_STATUS_OPTIONS } from './adminPromotionFormatters';

export default function AdminPromotionFormModal({
  editingPromotion,
  form,
  isOpen,
  onClose,
  onSave,
  onUpdateField,
}) {
  if (!isOpen) {
    return null;
  }

  const title = editingPromotion ? 'Cập nhật mã khuyến mãi' : 'Tạo mã khuyến mãi mới';

  return (
    <ModalPortal>
      <div className="bg-[#F8F9FA] w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[86vh] border border-white/20">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl shrink-0">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C3E2B]">{title}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {editingPromotion ? `Mã cố định: ${editingPromotion.code}` : 'Thiết lập voucher áp dụng cho hệ thống.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#2C1E15] hover:bg-[#6E473B] text-white shadow-lg border-2 border-white font-black transition active:scale-95"
            type="button"
            aria-label="Đóng"
          >
            x
          </button>
        </div>

        <form onSubmit={onSave} className="flex-grow overflow-y-auto p-6 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="space-y-4">
              <Field label="Mã khuyến mãi" required>
                <input
                  required
                  disabled={Boolean(editingPromotion)}
                  value={form.promotionCode}
                  onChange={(event) => onUpdateField('promotionCode', event.target.value)}
                  className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/10 outline-none text-xs font-mono uppercase transition disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="VD: SUMMER25"
                />
              </Field>

              <Field label="Loại giảm">
                <div className="flex gap-4 p-2 bg-white rounded-xl border border-gray-200">
                  {DISCOUNT_TYPE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                      <input
                        type="radio"
                        name="discountType"
                        value={option.value}
                        checked={form.discountType === option.value}
                        onChange={(event) => onUpdateField('discountType', event.target.value)}
                        className="accent-[#2C3E2B] w-4 h-4"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Giảm tối đa">
                  <NumberInput value={form.maxDiscount} onChange={(value) => onUpdateField('maxDiscount', value)} placeholder="VNĐ" />
                </Field>
                <Field label="Đơn tối thiểu">
                  <NumberInput value={form.minOrderAmount} onChange={(value) => onUpdateField('minOrderAmount', value)} placeholder="VNĐ" />
                </Field>
              </div>

              <Field label="Giới hạn mỗi khách">
                <NumberInput value={form.usageLimitPerUser} onChange={(value) => onUpdateField('usageLimitPerUser', value)} placeholder="Mặc định: không giới hạn" />
              </Field>

              <Field label="Trạng thái">
                <select
                  value={form.status}
                  onChange={(event) => onUpdateField('status', event.target.value)}
                  className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/10 outline-none text-xs font-bold"
                >
                  {PROMOTION_STATUS_OPTIONS.filter((option) => option.value !== 'ALL').map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="space-y-4">
              <Field label="Tên chương trình" required>
                <input
                  required
                  value={form.promotionName}
                  onChange={(event) => onUpdateField('promotionName', event.target.value)}
                  className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/10 outline-none text-xs transition"
                  placeholder="Nhập tên hiển thị..."
                />
              </Field>

              <Field label="Giá trị giảm" required>
                <NumberInput value={form.discountValue} onChange={(value) => onUpdateField('discountValue', value)} placeholder="Nhập số..." required />
              </Field>

              <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-2xl border border-gray-200/60 shadow-inner">
                <Field label="Từ ngày" required>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(event) => onUpdateField('startDate', event.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-gray-100 bg-gray-50 text-[11px] outline-none font-mono"
                  />
                </Field>
                <Field label="Đến ngày" required>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(event) => onUpdateField('endDate', event.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-gray-100 bg-gray-50 text-[11px] outline-none font-mono"
                  />
                </Field>
              </div>

              <Field label="Tổng giới hạn lượt dùng">
                <NumberInput value={form.usageLimitTotal} onChange={(value) => onUpdateField('usageLimitTotal', value)} placeholder="Không giới hạn nếu bỏ trống" />
              </Field>

              <Field label="Mô tả">
                <textarea
                  rows="3"
                  value={form.promotionDescription}
                  onChange={(event) => onUpdateField('promotionDescription', event.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/10 outline-none text-xs resize-none transition"
                  placeholder="Ghi chú nội bộ..."
                />
              </Field>
            </div>
          </div>
        </form>

        <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3 rounded-b-3xl shrink-0">
          <button onClick={onClose} className="px-6 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition border-none cursor-pointer" type="button">
            Hủy bỏ
          </button>
          <button onClick={onSave} className="px-10 py-2 bg-[#2C3E2B] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#2C3E2B]/20 hover:scale-[1.02] active:scale-95 transition border-none cursor-pointer" type="button">
            Lưu chương trình
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}

function Field({ children, label, required = false }) {
  return (
    <div className="space-y-1">
      <label className="text-gray-400 text-[10px] font-black uppercase tracking-wider pl-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function NumberInput({ onChange, placeholder, required = false, value }) {
  return (
    <input
      type="number"
      min="0"
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/10 outline-none text-xs transition"
      placeholder={placeholder}
    />
  );
}
