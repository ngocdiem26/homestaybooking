import { useMemo, useState } from 'react';
import ModalPortal from '../../common/ModalPortal';
import PrettySelect from '../../common/PrettySelect';
import { DISCOUNT_TYPE_OPTIONS, PROMOTION_STATUS_OPTIONS } from './adminPromotionFormatters';

const PROMOTION_SCOPE_OPTIONS = [
  { value: 'GLOBAL', label: 'Toàn sàn', description: 'Mọi khách hàng và mọi homestay đều có thể dùng mã.' },
  { value: 'HOMESTAY', label: 'Theo homestay', description: 'Chỉ áp dụng cho các homestay được chọn.' },
  { value: 'USER', label: 'Theo khách hàng', description: 'Chỉ áp dụng cho các khách hàng được chọn.' },
  { value: 'TIER', label: 'Theo hạng thành viên', description: 'Chỉ áp dụng cho khách thuộc các hạng được chọn.' },
  { value: 'HOMESTAY_USER', label: 'Homestay + khách hàng', description: 'Chỉ khách được chọn đặt đúng homestay được chọn mới dùng được.' },
  { value: 'HOMESTAY_TIER', label: 'Homestay + hạng thành viên', description: 'Chỉ hạng được chọn đặt đúng homestay được chọn mới dùng được.' },
];

function needsUsers(scope) {
  return scope === 'USER' || scope === 'HOMESTAY_USER';
}

function needsHomestays(scope) {
  return scope === 'HOMESTAY' || scope === 'HOMESTAY_USER' || scope === 'HOMESTAY_TIER';
}

function needsTiers(scope) {
  return scope === 'TIER' || scope === 'HOMESTAY_TIER';
}

export default function AdminPromotionFormModal({
  editingPromotion,
  form,
  isOpen,
  onClose,
  onSave,
  onUpdateField,
  targetOptions = { users: [], homestays: [], tiers: [] },
}) {
  if (!isOpen) {
    return null;
  }

  const title = editingPromotion ? 'Cập nhật mã khuyến mãi' : 'Tạo mã khuyến mãi mới';
  const selectedScope = form.promotionScope || 'GLOBAL';
  const selectedScopeOption = PROMOTION_SCOPE_OPTIONS.find((option) => option.value === selectedScope);
  const usesPersonalValidity = needsTiers(selectedScope);

  return (
    <ModalPortal>
      <div className="flex max-h-[88vh] w-full max-w-5xl flex-col rounded-3xl border border-white/20 bg-[#F8F9FA] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between rounded-t-3xl border-b border-gray-100 bg-white p-5">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C3E2B]">{title}</h3>
            <p className="mt-1 text-xs text-gray-400">
              {editingPromotion ? `Mã cố định: ${editingPromotion.code}` : 'Thiết lập voucher theo toàn sàn, user, homestay hoặc hạng thành viên.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full border-2 border-white bg-[#2C1E15] font-black text-white shadow-lg transition hover:bg-[#6E473B] active:scale-95"
            type="button"
            aria-label="Đóng"
          >
            x
          </button>
        </div>

        <form onSubmit={onSave} className="flex-grow overflow-y-auto p-6 scrollbar-thin">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <div className="space-y-4">
              <Field label="Mã khuyến mãi" required>
                <input
                  required
                  disabled={Boolean(editingPromotion)}
                  value={form.promotionCode}
                  onChange={(event) => onUpdateField('promotionCode', event.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 font-mono text-xs uppercase outline-none transition focus:ring-2 focus:ring-[#2C3E2B]/10 disabled:bg-gray-100 disabled:text-gray-400"
                  placeholder="VD: SUMMER25"
                />
              </Field>

              <Field label="Loại giảm">
                <div className="flex gap-4 rounded-xl border border-gray-200 bg-white p-2">
                  {DISCOUNT_TYPE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
                      <input
                        type="radio"
                        name="discountType"
                        value={option.value}
                        checked={form.discountType === option.value}
                        onChange={(event) => onUpdateField('discountType', event.target.value)}
                        className="h-4 w-4 accent-[#2C3E2B]"
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
                <PrettySelect
                  value={form.status}
                  onChange={(value) => onUpdateField('status', value)}
                  options={PROMOTION_STATUS_OPTIONS.filter((option) => option.value !== 'ALL')}
                  className="w-full"
                  minWidth="min-w-full"
                />
              </Field>
            </div>

            <div className="space-y-4">
              <Field label="Tên chương trình" required>
                <input
                  required
                  value={form.promotionName}
                  onChange={(event) => onUpdateField('promotionName', event.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 text-xs outline-none transition focus:ring-2 focus:ring-[#2C3E2B]/10"
                  placeholder="Nhập tên hiển thị..."
                />
              </Field>

              <Field label="Giá trị giảm" required>
                <NumberInput value={form.discountValue} onChange={(value) => onUpdateField('discountValue', value)} placeholder="Nhập số..." required />
              </Field>

              <div className="rounded-2xl border border-gray-200/60 bg-white p-3 shadow-inner">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Từ ngày" required={!usesPersonalValidity}>
                    <input
                      type="date"
                      required={!usesPersonalValidity}
                      disabled={usesPersonalValidity}
                      value={usesPersonalValidity ? '' : form.startDate}
                      onChange={(event) => onUpdateField('startDate', event.target.value)}
                      className="h-9 w-full rounded-lg border border-gray-100 bg-gray-50 px-2 font-mono text-[11px] outline-none disabled:text-gray-400"
                    />
                  </Field>
                  <Field label="Đến ngày" required={!usesPersonalValidity}>
                    <input
                      type="date"
                      required={!usesPersonalValidity}
                      disabled={usesPersonalValidity}
                      value={usesPersonalValidity ? '' : form.endDate}
                      onChange={(event) => onUpdateField('endDate', event.target.value)}
                      className="h-9 w-full rounded-lg border border-gray-100 bg-gray-50 px-2 font-mono text-[11px] outline-none disabled:text-gray-400"
                    />
                  </Field>
                </div>
                {usesPersonalValidity && (
                  <p className="mt-2 rounded-xl bg-[#F8F6F0] px-3 py-2 text-[11px] font-bold leading-5 text-[#6C483A]">
                    Mã theo hạng tồn tại lâu dài. Hạn dùng được tính riêng cho từng khách từ ngày mở khóa hạng.
                  </p>
                )}
              </div>

              <Field label="Tổng giới hạn lượt dùng">
                <NumberInput value={form.usageLimitTotal} onChange={(value) => onUpdateField('usageLimitTotal', value)} placeholder="Không giới hạn nếu bỏ trống" />
              </Field>

              <Field label="Mô tả">
                <textarea
                  rows="3"
                  value={form.promotionDescription}
                  onChange={(event) => onUpdateField('promotionDescription', event.target.value)}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-xs outline-none transition focus:ring-2 focus:ring-[#2C3E2B]/10"
                  placeholder="Ghi chú nội bộ..."
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <div className="rounded-3xl border border-[#E7DDD0] bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#B6784F]">Phạm vi áp dụng</p>
                    <h4 className="mt-1 font-serif text-xl font-bold text-[#2C1E15]">Mã này dùng cho ai?</h4>
                    <p className="mt-1 text-xs font-semibold text-gray-500">{selectedScopeOption?.description}</p>
                  </div>
                  <span className="rounded-full bg-[#F8F6F0] px-3 py-1.5 text-xs font-black text-[#6C483A]">{selectedScopeOption?.label}</span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {PROMOTION_SCOPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onUpdateField('promotionScope', option.value)}
                      className={`rounded-2xl border p-3 text-left transition ${selectedScope === option.value ? 'border-[#2C3E2B] bg-[#F2F7F1] shadow-md' : 'border-gray-200 bg-white hover:border-[#D8B48A] hover:shadow-sm'}`}
                    >
                      <p className="text-sm font-black text-[#2C1E15]">{option.label}</p>
                      <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-gray-500">{option.description}</p>
                    </button>
                  ))}
                </div>

                {selectedScope !== 'GLOBAL' && (
                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    {needsUsers(selectedScope) && (
                      <TargetChecklist
                        label="Khách hàng được áp dụng"
                        kind="user"
                        options={targetOptions.users}
                        selectedIds={form.userIds}
                        onChange={(ids) => onUpdateField('userIds', ids)}
                      />
                    )}
                    {needsHomestays(selectedScope) && (
                      <TargetChecklist
                        label="Homestay được áp dụng"
                        kind="homestay"
                        options={targetOptions.homestays}
                        selectedIds={form.homeIds}
                        onChange={(ids) => onUpdateField('homeIds', ids)}
                      />
                    )}
                    {needsTiers(selectedScope) && (
                      <TargetChecklist
                        label="Hạng thành viên được áp dụng"
                        kind="tier"
                        options={targetOptions.tiers}
                        selectedIds={form.tierIds}
                        onChange={(ids) => onUpdateField('tierIds', ids)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        <div className="flex shrink-0 justify-end gap-3 rounded-b-3xl border-t border-gray-100 bg-white p-5">
          <button onClick={onClose} className="cursor-pointer rounded-xl border-none px-6 py-2 text-xs font-bold text-gray-500 transition hover:bg-gray-50" type="button">
            Hủy bỏ
          </button>
          <button onClick={onSave} className="cursor-pointer rounded-xl border-none bg-[#2C3E2B] px-10 py-2 text-xs font-bold text-white shadow-lg shadow-[#2C3E2B]/20 transition hover:scale-[1.02] active:scale-95" type="button">
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
      <label className="pl-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
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
      className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 text-xs outline-none transition focus:ring-2 focus:ring-[#2C3E2B]/10"
      placeholder={placeholder}
    />
  );
}

function targetCode(kind, id) {
  const numericId = Number(id);
  const paddedId = Number.isFinite(numericId) ? String(numericId).padStart(3, '0') : String(id || '');
  if (kind === 'user') return `USR-${paddedId}`;
  if (kind === 'homestay') return `HMS-${paddedId}`;
  if (kind === 'tier') return `TIER-${paddedId}`;
  return paddedId;
}

function normalizeSearch(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function compactCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[\s_-]/g, '');
}

function optionMatches(option, query, kind) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return true;
  const code = targetCode(kind, option.id);
  const haystack = normalizeSearch(`${code} ${option.code || ''} ${option.label || ''} ${option.subLabel || ''}`);
  return haystack.includes(normalizedQuery) || compactCode(code).includes(compactCode(query));
}

function isExactCodeMatch(option, query, kind) {
  const cleanQuery = compactCode(query);
  if (!cleanQuery) return false;
  const codes = [option.code, targetCode(kind, option.id)].map(compactCode);
  const numericId = String(Number(option.id));
  return codes.includes(cleanQuery) || cleanQuery === numericId;
}

function TargetChecklist({ kind = 'target', label, onChange, options = [], selectedIds = [] }) {
  const [query, setQuery] = useState('');
  const [quickMessage, setQuickMessage] = useState('');
  const selectedSet = new Set(selectedIds.map(Number));
  const quickPlaceholder =
    kind === 'user'
      ? 'Nhập mã khách: USR-005 hoặc tên/email'
      : kind === 'homestay'
        ? 'Nhập mã homestay: HMS-012 hoặc tên'
        : 'Nhập mã hoặc tên hạng';
  const filteredOptions = useMemo(
    () => options.filter((option) => optionMatches(option, query, kind)),
    [kind, options, query]
  );

  const toggle = (id) => {
    const numericId = Number(id);
    const next = selectedSet.has(numericId)
      ? selectedIds.filter((currentId) => Number(currentId) !== numericId)
      : [...selectedIds, numericId];
    onChange(next);
  };

  const selectId = (id) => {
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) return;
    if (selectedSet.has(numericId)) {
      setQuickMessage('Mã này đã được chọn.');
      return;
    }
    onChange([...selectedIds, numericId]);
    setQuickMessage(`Đã thêm ${targetCode(kind, numericId)}.`);
  };

  const addByCode = () => {
    const exactMatch = options.find((option) => isExactCodeMatch(option, query, kind));
    const singleFiltered = filteredOptions.length === 1 ? filteredOptions[0] : null;
    const optionToAdd = exactMatch || singleFiltered;

    if (!optionToAdd) {
      setQuickMessage('Không tìm thấy mã phù hợp. Vui lòng kiểm tra lại.');
      return;
    }

    selectId(optionToAdd.id);
    setQuery('');
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-[#FBFAF7] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-black text-[#2C1E15]">{label}</p>
        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-gray-500 shadow-sm">{selectedIds.length} chọn</span>
      </div>
      <div className="mt-3 rounded-2xl border border-[#E7DDD0] bg-white p-2 shadow-sm">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setQuickMessage('');
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addByCode();
              }
            }}
            className="h-10 min-w-0 flex-1 rounded-xl border border-gray-100 bg-[#FBFAF7] px-3 text-xs font-bold text-[#2C1E15] outline-none transition focus:border-[#6C483A] focus:bg-white focus:ring-2 focus:ring-[#6C483A]/10"
            placeholder={quickPlaceholder}
          />
          <button
            type="button"
            onClick={addByCode}
            className="shrink-0 rounded-xl bg-[#6C483A] px-4 text-xs font-black text-white shadow-md shadow-[#6C483A]/15 transition hover:bg-[#7B5447] active:scale-95"
          >
            Thêm
          </button>
        </div>
        {quickMessage && <p className="mt-2 px-1 text-[11px] font-bold text-[#6C483A]">{quickMessage}</p>}
      </div>
      <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
        {options.length === 0 ? (
          <p className="rounded-xl bg-white px-3 py-3 text-xs font-semibold text-gray-400">Chưa có dữ liệu để chọn.</p>
        ) : filteredOptions.length === 0 ? (
          <p className="rounded-xl bg-white px-3 py-3 text-xs font-semibold text-gray-400">Không có kết quả phù hợp với từ khóa.</p>
        ) : filteredOptions.map((option) => (
          <label key={option.id} className="flex cursor-pointer items-start gap-2 rounded-xl bg-white px-3 py-2 shadow-sm transition hover:bg-[#F8F6F0]">
            <input
              type="checkbox"
              checked={selectedSet.has(Number(option.id))}
              onChange={() => toggle(option.id)}
              className="mt-0.5 h-4 w-4 accent-[#2C3E2B]"
            />
            <span className="min-w-0">
              <span className="mb-1 inline-flex rounded-lg bg-[#F1E9DF] px-2 py-0.5 font-mono text-[10px] font-black text-[#6C483A]">
                {option.code || targetCode(kind, option.id)}
              </span>
              <span className="block truncate text-xs font-black text-gray-700">{option.label}</span>
              {option.subLabel && <span className="block truncate text-[11px] font-semibold text-gray-400">{option.subLabel}</span>}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
