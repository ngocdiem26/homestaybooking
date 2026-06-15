import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import Pagination from '../../common/Pagination';
import AdminHomestayDetailModal from './AdminHomestayDetailModal';
import AdminOwnerModal from './AdminOwnerModal';
import {
  formatNightlyPrice,
  getHomestayStatusClass,
  getHomestayStatusLabel,
  HOMESTAY_STATUS_OPTIONS,
} from './adminHomestayFormatters';

export default function AdminHomestaysView({
  currentHomestays,
  currentPage,
  errorMessage,
  filteredHomestays,
  homestays,
  indexOfFirstHomestay,
  indexOfLastHomestay,
  isLoading,
  onBackToDashboard,
  onDelete,
  onRefresh,
  onResetFilters,
  onSearchChange,
  onSelectHomestay,
  onSelectOwner,
  onStatusFilterChange,
  onUpdateStatus,
  searchTerm,
  selectedHomestay,
  selectedOwner,
  setCurrentPage,
  setSelectedHomestay,
  setSelectedOwner,
  statusFilter,
  totalPages,
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

        <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 bg-[#2C3E2B]/10 rounded-xl flex items-center justify-center text-[#2C3E2B] shrink-0 border border-[#2C3E2B]/5 shadow-inner mt-0.5">
              <span className="text-xl font-black">H</span>
            </div>
            <div className="space-y-0.5">
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#2C1E15]">
                Quản lý Homestay
              </h2>
              <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-2xl">
                Kiểm duyệt lưu trú mới đăng ký, theo dõi chất lượng phòng và xử lý các homestay vi phạm quy chế sàn.
              </p>
            </div>
          </div>

          <div className="flex bg-white p-1.5 rounded-xl font-bold text-[11px] shadow-inner border border-gray-300/30 overflow-x-auto max-w-full shrink-0 h-fit self-start lg:self-center scrollbar-none">
            {HOMESTAY_STATUS_OPTIONS.map((option) => (
              <FilterButton
                count={option.value === 'ALL' ? homestays.length : undefined}
                isActive={statusFilter === option.value}
                key={option.value}
                label={option.label}
                onClick={() => onStatusFilterChange(option.value)}
              />
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-xs font-bold">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="bg-white px-4 h-11 rounded-xl border border-gray-200/80 shadow-sm flex items-center flex-grow group focus-within:border-[#2C3E2B]/50 transition">
              <span className="text-gray-400 mr-2.5">⌕</span>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên homestay, chủ nhà, địa chỉ..."
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
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#6E473B] font-bold px-4 h-11 rounded-xl bg-white border border-gray-200/80 shadow-sm hover:shadow transition duration-200 cursor-pointer shrink-0 active:scale-95"
              type="button"
            >
              Làm mới
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-base">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200/60 text-gray-500 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">Căn hộ lưu trú</th>
                    <th className="p-4">Đối tác sở hữu</th>
                    <th className="p-4">Địa chỉ</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400 italic">
                        Đang tải danh sách homestay...
                      </td>
                    </tr>
                  ) : currentHomestays.length > 0 ? (
                    currentHomestays.map((homestay) => (
                      <HomestayRow
                        homestay={homestay}
                        key={homestay.id}
                        onDelete={onDelete}
                        onSelectHomestay={onSelectHomestay}
                        onSelectOwner={onSelectOwner}
                        onUpdateStatus={onUpdateStatus}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400 italic">
                        Không tìm thấy căn hộ homestay phù hợp.
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
              totalItems={filteredHomestays.length}
              indexOfFirstItem={indexOfFirstHomestay}
              indexOfLastItem={indexOfLastHomestay}
              itemName="Homestay"
            />
          </div>
        </div>
      </div>

      <AdminOwnerModal homestay={selectedOwner} onClose={() => setSelectedOwner(null)} />
      <AdminHomestayDetailModal
        homestay={selectedHomestay}
        onClose={() => setSelectedHomestay(null)}
        onDelete={onDelete}
        onUpdateStatus={onUpdateStatus}
      />
    </>
  );
}

function HomestayRow({ homestay, onDelete, onSelectHomestay, onSelectOwner, onUpdateStatus }) {
  return (
    <tr className="hover:bg-gray-50/40 transition">
      <td className="p-4">
        <div className="flex items-center space-x-3.5">
          <img src={homestay.image} alt={homestay.name} className="w-14 h-10 object-cover rounded-lg shadow-sm shrink-0 border border-gray-100" />
          <div>
            <p className="text-gray-900 font-bold text-base leading-tight">{homestay.name}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              {homestay.code} · {formatNightlyPrice(homestay.pricePerNight)}
            </p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="space-y-1">
          <p className="text-gray-800 font-bold text-sm">{homestay.ownerName}</p>
          <button
            onClick={() => onSelectOwner(homestay)}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 focus:outline-none"
            type="button"
          >
            <span>ⓘ</span>
            <span>Xem thông tin chủ</span>
          </button>
        </div>
      </td>
      <td className="p-4 text-gray-500 max-w-xs truncate font-medium">
        {homestay.address}, {homestay.province}
      </td>
      <td className="p-4 text-center">
        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold border ${getHomestayStatusClass(homestay.status)}`}>
          {getHomestayStatusLabel(homestay.status)}
        </span>
      </td>
      <td className="p-4 text-right whitespace-normal max-w-[280px]">
        <div className="flex flex-wrap items-center justify-end gap-2 align-middle">
          <button
            onClick={() => onSelectHomestay(homestay)}
            className="inline-flex items-center justify-center gap-1.5 text-xs bg-[#2C3E2B]/10 hover:bg-[#2C3E2B]/20 text-[#2C3E2B] px-3 h-8 rounded-xl font-bold transition duration-200 cursor-pointer shadow-sm active:scale-95 border-none"
            title="Xem chi tiết"
            type="button"
          >
            <MdOutlineRemoveRedEye className="w-4 h-4 shrink-0" />
            <span>Chi tiết</span>
          </button>

          {homestay.status === 'PENDING' && (
            <>
              <ActionButton label="Duyệt" tone="green" onClick={() => onUpdateStatus(homestay, 'APPROVED')} />
              <ActionButton label="Từ chối" tone="red" onClick={() => onUpdateStatus(homestay, 'REJECTED')} />
            </>
          )}

          {homestay.status === 'APPROVED' && (
            <ActionButton label="Chặn" tone="red" onClick={() => onUpdateStatus(homestay, 'BLOCKED')} />
          )}

          {homestay.status === 'BLOCKED' && (
            <ActionButton label="Bỏ chặn" tone="green" onClick={() => onUpdateStatus(homestay, 'APPROVED')} />
          )}

          <button
            onClick={() => onDelete(homestay)}
            className="inline-flex items-center justify-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 h-8 rounded-xl font-bold transition cursor-pointer border-none shadow-sm active:scale-95 shrink-0"
            title="Xóa danh mục lưu trú"
            type="button"
          >
            <RiDeleteBin6Line className="w-4 h-4 shrink-0" />
            <span>Xóa</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

function ActionButton({ label, onClick, tone }) {
  const toneClass =
    tone === 'green'
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : 'bg-red-50 hover:bg-red-100 text-red-600';

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-xs px-2.5 h-8 rounded-xl font-bold transition cursor-pointer border-none shadow-sm active:scale-95 shrink-0 ${toneClass}`}
      type="button"
    >
      {label}
    </button>
  );
}

function FilterButton({ count, isActive, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
        isActive ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}
      type="button"
    >
      {label}
      {count !== undefined ? ` (${count})` : ''}
    </button>
  );
}
