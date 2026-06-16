import { MdEdit, MdOutlinePauseCircle, MdOutlinePlayCircle, MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import Pagination from '../../common/Pagination';
import AdminPromotionDetailModal from './AdminPromotionDetailModal';
import AdminPromotionFormModal from './AdminPromotionFormModal';
import {
  formatDateRange,
  formatPromotionValue,
  getDiscountTypeLabel,
  getPromotionStatusClass,
  getPromotionStatusLabel,
  PROMOTION_STATUS_OPTIONS,
} from './adminPromotionFormatters';

export default function AdminPromotionsView({
  closeForm,
  currentPage,
  currentPromotions,
  editingPromotion,
  errorMessage,
  filteredPromotions,
  form,
  indexOfFirstPromotion,
  indexOfLastPromotion,
  isFormOpen,
  isLoading,
  onBackToDashboard,
  onDelete,
  onEdit,
  onRefresh,
  onResetFilters,
  onSearchChange,
  onSelectPromotion,
  onStatusFilterChange,
  onToggleStatus,
  openCreateForm,
  promotions,
  savePromotion,
  searchTerm,
  selectedPromotion,
  setCurrentPage,
  setSelectedPromotion,
  statusFilter,
  totalPages,
  updateFormField,
}) {
  return (
    <>
      <div className="space-y-5 animate-fade-in text-left text-sm -mt-6">
        <div className="flex justify-start">
          <button
            onClick={onBackToDashboard}
            className="inline-flex items-center justify-center gap-1.5 text-xs bg-white hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl font-bold transition duration-200 cursor-pointer shadow-sm active:scale-95 border border-gray-200/40 focus:outline-none"
            type="button"
          >
            <span>&lt;</span>
            <span>Về bảng điều khiển</span>
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 bg-[#2C3E2B]/10 rounded-xl flex items-center justify-center text-[#2C3E2B] shrink-0 border border-[#2C3E2B]/5 shadow-inner">
              <span className="text-xl font-black">%</span>
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#2C1E15]">Quản lý mã khuyến mãi</h2>
              <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-lg mt-0.5">
                Tạo, chỉnh sửa và quản lý các đợt phát hành mã giảm giá ưu đãi cho khách hàng trên toàn hệ thống.
              </p>
            </div>
          </div>
          <button
            onClick={openCreateForm}
            className="bg-[#2C3E2B] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-opacity-90 transition active:scale-95 shrink-0 cursor-pointer border-none"
            type="button"
          >
            + Tạo mã mới
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-bold">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 w-full">
            <div className="flex bg-white p-1.5 font-bold text-[11px] rounded-xl border-gray-200/80 shadow-sm overflow-x-auto max-w-full shrink-0 h-fit scrollbar-none">
              {PROMOTION_STATUS_OPTIONS.map((option) => (
                <FilterButton
                  count={option.value === 'ALL' ? promotions.length : undefined}
                  isActive={statusFilter === option.value}
                  key={option.value}
                  label={option.label}
                  onClick={() => onStatusFilterChange(option.value)}
                />
              ))}
            </div>

            <div className="flex items-center flex-grow gap-3 max-w-xl">
              <div className="bg-white px-4 h-10 rounded-xl border border-gray-200/80 shadow-sm flex items-center flex-grow group focus-within:border-[#2C3E2B]/50 transition">
                <span className="text-gray-400 mr-2.5">⌕</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm mã, tên khuyến mãi..."
                  value={searchTerm}
                  onChange={(event) => onSearchChange(event.target.value)}
                  className="w-full bg-transparent border-none text-sm text-gray-800 focus:outline-none placeholder-gray-400 font-medium"
                />
              </div>
              <button
                onClick={() => {
                  onResetFilters();
                  onRefresh();
                }}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#6E473B] font-bold px-4 h-10 rounded-xl bg-white border border-gray-200/80 shadow-sm hover:shadow transition duration-200 cursor-pointer shrink-0 active:scale-95"
                type="button"
              >
                Làm mới
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] table-fixed text-left text-base border-collapse">
                <colgroup>
                  <col className="w-[150px]" />
                  <col className="w-[34%]" />
                  <col className="w-[150px]" />
                  <col className="w-[120px]" />
                  <col className="w-[190px]" />
                  <col className="w-[140px]" />
                  <col className="w-[310px]" />
                </colgroup>
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200/60 text-gray-500 font-bold uppercase text-xs tracking-wider">
                    <th className="p-4 align-middle">Mã</th>
                    <th className="p-4 align-middle">Tên khuyến mãi</th>
                    <th className="p-4 align-middle">Loại</th>
                    <th className="p-4 align-middle">Giá trị</th>
                    <th className="p-4 align-middle">Hiệu lực</th>
                    <th className="p-4 text-center align-middle">Trạng thái</th>
                    <th className="p-4 text-right align-middle">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400 italic">
                        Đang tải danh sách mã khuyến mãi...
                      </td>
                    </tr>
                  ) : currentPromotions.length > 0 ? (
                    currentPromotions.map((promotion) => (
                      <PromotionRow
                        key={promotion.id}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onSelectPromotion={onSelectPromotion}
                        onToggleStatus={onToggleStatus}
                        promotion={promotion}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400 italic">
                        Không tìm thấy mã khuyến mãi nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              totalItems={filteredPromotions.length}
              indexOfFirstItem={indexOfFirstPromotion}
              indexOfLastItem={indexOfLastPromotion}
              itemName="mã"
            />
          </div>
        </div>
      </div>

      <AdminPromotionFormModal
        editingPromotion={editingPromotion}
        form={form}
        isOpen={isFormOpen}
        onClose={closeForm}
        onSave={savePromotion}
        onUpdateField={updateFormField}
      />
      <AdminPromotionDetailModal
        promotion={selectedPromotion}
        onClose={() => setSelectedPromotion(null)}
      />
    </>
  );
}

function PromotionRow({ onDelete, onEdit, onSelectPromotion, onToggleStatus, promotion }) {
  return (
    <tr className="hover:bg-gray-50/40 transition">
      <td className="p-4 align-middle">
        <span className="px-3 py-1 bg-gray-600 text-white text-[11px] font-bold rounded-full font-mono tracking-wide">
          {promotion.code}
        </span>
      </td>
      <td className="p-4 align-middle">
        <p className="text-gray-900 font-bold truncate max-w-full" title={promotion.name}>
          {promotion.name}
        </p>
      </td>
      <td className="p-4 align-middle">
        <span className="inline-flex max-w-full text-[11px] px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 font-bold">
          {getDiscountTypeLabel(promotion.discountType)}
        </span>
      </td>
      <td className="p-4 align-middle">
        <span className="inline-flex text-xs font-bold bg-[#eaac99]/5 text-[#e75225] px-2.5 py-1 rounded-md border border-[#e75225]/10">
          {formatPromotionValue(promotion)}
        </span>
      </td>
      <td className="p-4 align-middle">
        <div className="text-xs text-gray-500 font-mono font-medium leading-5">
          {formatDateRange(promotion.startDate, promotion.endDate)}
        </div>
      </td>
      <td className="p-4 text-center align-middle">
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold border min-w-[96px] ${getPromotionStatusClass(promotion.status)}`}>
          {getPromotionStatusLabel(promotion.status)}
        </span>
      </td>
      <td className="p-4 text-right align-middle">
        <div className="flex items-center justify-end gap-2">
          <ActionButton icon={<MdOutlineRemoveRedEye className="w-4 h-4" />} label="Xem" tone="blue" onClick={() => onSelectPromotion(promotion)} />
          <ActionButton icon={<MdEdit className="w-4 h-4" />} label="Sửa" tone="gray" onClick={() => onEdit(promotion)} />
          <ActionButton
            icon={promotion.status === 'ACTIVE' ? <MdOutlinePauseCircle className="w-4 h-4" /> : <MdOutlinePlayCircle className="w-4 h-4" />}
            label={promotion.status === 'ACTIVE' ? 'Ngưng' : 'Bật'}
            tone={promotion.status === 'ACTIVE' ? 'amber' : 'green'}
            onClick={() => onToggleStatus(promotion)}
          />
          <ActionButton icon={<RiDeleteBin6Line className="w-4 h-4" />} label="Xóa" tone="red" onClick={() => onDelete(promotion)} />
        </div>
      </td>
    </tr>
  );
}

function ActionButton({ icon, label, onClick, tone }) {
  const toneClass = {
    amber: 'bg-amber-50 hover:bg-amber-100 text-amber-700',
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600',
    gray: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    green: 'bg-green-50 hover:bg-green-100 text-green-700',
    red: 'bg-red-50 hover:bg-red-100 text-red-600',
  }[tone];

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 text-xs px-2.5 h-8 rounded-xl font-bold transition duration-200 cursor-pointer shadow-sm active:scale-95 border-none shrink-0 ${toneClass}`}
      type="button"
      title={label}
    >
      {icon}
      {label}
    </button>
  );
}

function FilterButton({ count, isActive, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
        isActive ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}
      type="button"
    >
      {label}
      {count !== undefined ? ` (${count})` : ''}
    </button>
  );
}
