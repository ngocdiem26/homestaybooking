import { useEffect, useRef, useState } from 'react';
import {
  FaBath,
  FaBed,
  FaBox,
  FaCamera,
  FaCar,
  FaCheckCircle,
  FaCouch,
  FaEye,
  FaFileAlt,
  FaFire,
  FaImage,
  FaMapMarkerAlt,
  FaPen,
  FaPlus,
  FaSearch,
  FaShieldAlt,
  FaSlidersH,
  FaSoap,
  FaSyncAlt,
  FaTimes,
  FaToggleOff,
  FaToggleOn,
  FaTrashAlt,
  FaTv,
  FaUsers,
  FaUtensils,
  FaWifi,
  FaWind,
} from 'react-icons/fa';
import HostLayout from '../../layouts/HostLayout';
import ModalPortal from '../../components/common/ModalPortal';
import Pagination from '../../components/common/Pagination';
import { PRESET_AMENITIES, PRESET_RULES, PRESET_SERVICES } from '../../data/hostHomestayData';
import { VIETNAM_CITIES } from '../../data/vietnamCities';
import { useHostHomestays } from '../../hooks/useHostHomestays';

const amenityIcons = {
  'Wi-Fi': FaWifi,
  'Chỗ đậu xe': FaCar,
  'Máy giặt': FaSoap,
  'Máy lạnh': FaWind,
  Bếp: FaFire,
  TV: FaTv,
};
function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ';
}
function normalizeMainImages(images = []) {
  if (images.length === 0) return [];
  const mainIndex = images.findIndex((image) => Boolean(image.isMain));
  const selectedIndex = mainIndex >= 0 ? mainIndex : 0;

  return images.map((image, index) => ({
    ...image,
    isMain: index === selectedIndex,
  }));
}


export default function HomestayManagement() {
  const {
    addAmenity,
    addImage,
    addRule,
    addService,
    cityFilter,
    closeConfig,
    closeForm,
    configTab,
    currentHomestays,
    currentPage,
    deleteAmenity,
    deleteHomestay,
    deleteImage,
    deleteRule,
    deleteService,
    detailHomestay,
    editingHomestay,
    filteredHomestays,
    formFields,
    homestays,
    error,
    loading,
    indexOfFirstHomestay,
    indexOfLastHomestay,
    isFormOpen,
    newAmenityText,
    newRuleText,
    newServiceName,
    newServicePrice,
    openAdd,
    openConfig,
    openEdit,
    resetFilters,
    saveConfig,
    saveHomestay,
    searchTerm,
    selectedHomestay,
    setCity,
    setConfigTab,
    setCurrentPage,
    setDetailHomestay,
    setFormFields,
    setMainImage,
    setNewAmenityText,
    setNewRuleText,
    setNewServiceName,
    setNewServicePrice,
    setSearch,
    setStatus,
    statusFilter,
    toggleService,
    totalPages,
  } = useHostHomestays();

  return (
    <HostLayout>
      <div className="space-y-5 animate-fade-in text-left text-sm -mt-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#6E473B]">Bảng điều khiển</p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2C1E15]">Quản lý Homestay</h2>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              {homestays.length} chỗ nghỉ đang sở hữu • {homestays.filter((homestay) => homestay.status === 'Đang hoạt động').length} đang hoạt động
            </p>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 bg-[#2C3E2B] hover:bg-[#1f2d20] text-white px-5 h-11 rounded-xl font-bold text-xs shadow-md transition active:scale-95"
            type="button"
          >
            <FaPlus />
            Thêm Homestay mới
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-500">
              <FaSlidersH />
              Lọc:
            </span>
            <FilterSelect label="Thành phố" value={cityFilter} onChange={setCity} options={['All', ...VIETNAM_CITIES]} />
            <FilterSelect label="Trạng thái" value={statusFilter} onChange={setStatus} options={['All', 'Đang hoạt động', 'Chờ duyệt']} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-1 xl:max-w-xl">
            <div className="bg-white px-4 h-11 rounded-xl border border-gray-200/80 shadow-sm flex items-center flex-1 focus-within:border-[#2C3E2B]/50 transition">
              <FaSearch className="text-gray-400 mr-2.5" />
              <input
                value={searchTerm}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm tên, mã homestay..."
                className="w-full bg-transparent border-none text-sm text-gray-800 focus:outline-none placeholder-gray-400 font-medium"
                type="text"
              />
            </div>
            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-[#6E473B] font-bold px-4 h-11 rounded-xl bg-white border border-gray-200/80 shadow-sm hover:shadow transition active:scale-95"
              type="button"
            >
              <FaSyncAlt />
              Làm mới
            </button>
          </div>
        </div>

        {(loading || error) && (
          <div className={
            'rounded-xl border px-4 py-3 text-sm font-semibold ' +
            (error
              ? 'border-red-100 bg-red-50 text-red-600'
              : 'border-emerald-100 bg-emerald-50 text-emerald-700')
          }>
            {error || 'Đang tải danh sách homestay từ backend...'}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-left text-base">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200/60 text-gray-500 font-bold text-xs uppercase tracking-wider">
                  <th className="px-2 py-2.5">Tên & mã</th>
                  <th className="px-2 py-2.5">Địa điểm</th>
                  <th className="px-2 py-2.5">Giá / đêm</th>
                  <th className="px-2 py-2.5 text-center">Khách</th>
                  <th className="px-2 py-2.5 text-center">Phòng ngủ</th>
                  <th className="px-2 py-2.5 text-center">WC</th>
                  <th className="px-2 py-2.5 text-center">Phòng khách</th>
                  <th className="px-2 py-2.5 text-center">Bếp</th>
                  <th className="px-2 py-2.5">Ngày tạo</th>
                  <th className="px-2 py-2.5 text-center">Trạng thái</th>
                  <th className="px-2 py-2.5 text-center">Cập nhật Homestay</th>
                  <th className="px-2 py-2.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700 text-sm">
                {filteredHomestays.length > 0 ? (
                  currentHomestays.map((homestay) => (
                    <HomestayRow
                      homestay={homestay}
                      key={homestay.id}
                      onOpenConfig={(tab) => openConfig(homestay, tab)}
                      onView={() => setDetailHomestay(homestay)}
                      onDelete={() => deleteHomestay(homestay.id)}
                      onEdit={() => openEdit(homestay)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="p-8 text-center text-gray-400 italic">
                      Không tìm thấy homestay nào.
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
            itemName="homestay"
          />
        </div>
      </div>

      {isFormOpen && (
        <HomestayFormModal
          editingHomestay={editingHomestay}
          fields={formFields}
          onChange={setFormFields}
          onClose={closeForm}
          onSubmit={saveHomestay}
        />
      )}

      {detailHomestay && (
        <HomestayDetailModal homestay={detailHomestay} onClose={() => setDetailHomestay(null)} />
      )}

      {selectedHomestay && (
        <ConfigModal
          activeTab={configTab}
          addAmenity={addAmenity}
          addImage={addImage}
          addRule={addRule}
          addService={addService}
          deleteAmenity={deleteAmenity}
          deleteImage={deleteImage}
          deleteRule={deleteRule}
          deleteService={deleteService}
          homestay={selectedHomestay}
          onSaveConfig={saveConfig}
          newAmenityText={newAmenityText}
          
          newRuleText={newRuleText}
          newServiceName={newServiceName}
          newServicePrice={newServicePrice}
          onClose={closeConfig}
          setConfigTab={setConfigTab}
          setMainImage={setMainImage}
          setNewAmenityText={setNewAmenityText}
    
          setNewRuleText={setNewRuleText}
          setNewServiceName={setNewServiceName}
          setNewServicePrice={setNewServicePrice}
          toggleService={toggleService}
        />
      )}
    </HostLayout>
  );
}

function HomestayRow({ homestay, onDelete, onEdit, onOpenConfig, onView }) {
  return (
    <tr className="hover:bg-gray-50/40 transition">
      <td className="px-2 py-3">
        <div>
          <p className="text-gray-900 font-bold text-base leading-tight max-w-[180px]">{homestay.name}</p>
          <p className="text-xs text-[#6E473B] font-mono mt-1">{homestay.id}</p>
        </div>
      </td>
      <td className="px-2 py-3 text-gray-500 max-w-[120px] truncate font-medium">
        <span className="inline-flex items-center gap-2">
          <FaMapMarkerAlt className="text-[#6E473B] shrink-0" />
          {homestay.city}
        </span>
      </td>
      <td className="px-2 py-3">
        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-[#6E473B] px-2 py-0.5 rounded-lg text-xs font-black whitespace-nowrap">
          {formatCurrency(homestay.price)}
        </span>
      </td>
      <td className="px-2 py-3 text-center"><NumChip icon={<FaUsers />} value={homestay.guests} /></td>
      <td className="px-2 py-3 text-center"><NumChip icon={<FaBed />} value={homestay.bedrooms} /></td>
      <td className="px-2 py-3 text-center"><NumChip icon={<FaBath />} value={homestay.bathrooms} /></td>
      <td className="px-2 py-3 text-center"><NumChip icon={<FaCouch />} value={homestay.livingRoom} /></td>
      <td className="px-2 py-3 text-center"><NumChip icon={<FaUtensils />} value={homestay.kitchen} /></td>
      <td className="px-2 py-3 text-gray-500 font-mono text-xs font-bold leading-tight whitespace-nowrap">{homestay.createdAt}</td>
      <td className="px-2 py-3 text-center">
        <span className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-1 rounded-full font-bold border leading-none whitespace-nowrap ${homestay.status === 'Đang hoạt động' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          <FaCheckCircle />
          {homestay.status}
        </span>
      </td>
      <td className="px-2 py-3 text-center whitespace-nowrap">
        <div className="inline-flex flex-nowrap items-center justify-center gap-1 whitespace-nowrap">
          <SmallIconButton label="Cập nhật ảnh" text="Ảnh" color="blue" onClick={() => onOpenConfig('images')}><FaImage /></SmallIconButton>
          <SmallIconButton label="Cập nhật tiện nghi" text="Tiện nghi" color="emerald" onClick={() => onOpenConfig('amenities')}><FaShieldAlt /></SmallIconButton>
          <SmallIconButton label="Cập nhật dịch vụ" text="Dịch vụ" color="amber" onClick={() => onOpenConfig('services')}><FaBox /></SmallIconButton>
          <SmallIconButton label="Cập nhật nội quy" text="Nội quy" color="red" onClick={() => onOpenConfig('rules')}><FaFileAlt /></SmallIconButton>
        </div>
      </td>
      <td className="px-2 py-3 text-center whitespace-nowrap">
        <div className="inline-flex flex-nowrap items-center justify-center gap-1 whitespace-nowrap">
          <SmallIconButton label="Xem chi tiết" color="green" onClick={onView}><FaEye /></SmallIconButton>
          <SmallIconButton label="Sửa thông tin" color="stone" onClick={onEdit}><FaPen /></SmallIconButton>
          <SmallIconButton label="Xóa homestay" color="red" onClick={onDelete}><FaTrashAlt /></SmallIconButton>
        </div>
      </td>
    </tr>
  );
}

function NumChip({ icon, value }) {
  return (
    <span className="inline-flex items-center justify-center gap-1 bg-[#F4F1EA] border border-gray-200 px-2 py-1 rounded-lg text-xs font-black text-[#6E473B] min-w-9">
      {icon}
      {value}
    </span>
  );
}

function SmallIconButton({ children, color, label, onClick, text }) {
  // Định nghĩa màu sắc theo phong cách ảnh bạn gửi:
  // Nền nhạt hơn, viền sáng màu, icon đậm màu tương ứng
  const colorClass = {
    blue: 'bg-indigo-50 border-indigo-200 text-indigo-500 hover:bg-indigo-100',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-500 hover:bg-emerald-100',
    amber: 'bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100',
    red: 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100',
    stone: 'bg-stone-100 border-stone-300 text-stone-600 hover:bg-stone-200',
    green: 'bg-teal-50 border-teal-200 text-teal-600 hover:bg-teal-100'
  }[color];

  return (
    <button
      className={`${text ? 'h-8 px-2.5 gap-1.5' : 'w-8 h-8'} rounded-xl border-1 flex items-center justify-center transition-all duration-200 active:scale-95 ${colorClass}`}
      onClick={onClick}
      title={label}
      type="button"
    >
      {/* Tăng kích thước icon lên một chút để nhìn rõ hơn */}
      <span className="text-sm shrink-0">{children}</span>
      {text && <span className="text-[11px] font-black leading-none">{text}</span>}
    </button>
  );
}

function FilterSelect({ label, onChange, options, value }) {
  const [isOpen, setIsOpen] = useState(false);
  const displayValue = value === 'All' ? 'Tất cả' : value;

  const chooseOption = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex h-10 items-center gap-2 rounded-xl bg-[#F4F1EA] border border-gray-200 px-3 text-xs font-bold text-gray-400">
      <span>{label}:</span>
      <button
        className="inline-flex min-w-28 items-center justify-between gap-2 text-[#2C3E2B] font-black outline-none"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="truncate">{displayValue}</span>
        <span className={(isOpen ? 'rotate-180 ' : '') + 'text-[10px] transition'}>▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-12 z-40 w-64 max-h-72 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-2xl">
          {options.map((option) => {
            const optionLabel = option === 'All' ? 'Tất cả' : option;
            const isSelected = option === value;

            return (
              <button
                className={(isSelected ? 'bg-[#2C3E2B] text-white' : 'text-gray-600 hover:bg-[#F4F1EA]') + ' w-full rounded-xl px-3 py-2 text-left text-xs font-bold transition'}
                key={option}
                onClick={() => chooseOption(option)}
                type="button"
              >
                {optionLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HomestayDetailModal({ homestay, onClose }) {
  const images = homestay.images?.length ? homestay.images : [];
  const firstMainIndex = Math.max(0, images.findIndex((image) => image.isMain));
  const [activeIndex, setActiveIndex] = useState(firstMainIndex);
  const activeImage = images[activeIndex] || images[0];
  const hasMultipleImages = images.length > 1;

  const changeImage = (nextIndex) => {
    if (images.length === 0) return;
    setActiveIndex((nextIndex + images.length) % images.length);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
        <div className="w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-white/70 overflow-hidden flex flex-col">
          <div className="px-5 sm:px-6 py-4 bg-[#202c3c] text-white flex items-start justify-between gap-4 shrink-0">
            <div className="min-w-0">
              <p className="text-[11px] font-mono text-gray-300">{homestay.id}</p>
              <h3 className="font-serif text-xl sm:text-2xl font-bold truncate">{homestay.name}</h3>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition" onClick={onClose} type="button">
              <FaTimes />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">
            <div className="space-y-3">
              {activeImage ? (
                <div className="relative h-44 sm:h-56 md:h-64 w-full rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-100">
                  <img alt={homestay.name} className="w-full h-full object-cover" src={activeImage.url} />

                  {hasMultipleImages && (
                    <>
                      <button
                        aria-label="Ảnh trước"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/75 text-white border border-white/20 shadow-lg flex items-center justify-center transition"
                        onClick={() => changeImage(activeIndex - 1)}
                        type="button"
                      >
                        <i className="fa-solid fa-chevron-left text-sm"></i>
                      </button>
                      <button
                        aria-label="Ảnh sau"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 hover:bg-black/75 text-white border border-white/20 shadow-lg flex items-center justify-center transition"
                        onClick={() => changeImage(activeIndex + 1)}
                        type="button"
                      >
                        <i className="fa-solid fa-chevron-right text-sm"></i>
                      </button>
                    </>
                  )}

                  <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {activeIndex + 1}/{images.length}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-[#2C1E15]/85 text-white px-3 py-1 rounded-lg text-xs font-bold">
                    {formatCurrency(homestay.price)}/đêm
                  </div>
                </div>
              ) : (
                <div className="h-44 sm:h-56 rounded-2xl bg-[#F4F1EA] border border-dashed border-gray-300 flex items-center justify-center text-sm font-bold text-gray-400">
                  Chưa có ảnh homestay
                </div>
              )}

              {hasMultipleImages && (
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
                  {images.map((image, index) => (
                    <button
                      aria-label={'Xem ảnh ' + (index + 1)}
                      className={
                        'w-20 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition bg-gray-100 ' +
                        (index === activeIndex
                          ? 'border-[#2C3E2B] shadow-md opacity-100'
                          : 'border-transparent opacity-70 hover:opacity-100')
                      }
                      key={(image.url || 'image') + '-' + index}
                      onClick={() => changeImage(index)}
                      type="button"
                    >
                      <img alt={homestay.name + ' ' + (index + 1)} className="w-full h-full object-cover" src={image.url} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <DetailItem label="Địa chỉ" value={homestay.address} />
              <DetailItem label="Thành phố" value={homestay.city} />
              <DetailItem label="Giá mỗi đêm" value={formatCurrency(homestay.price)} />
              <DetailItem label="Trạng thái" value={homestay.status} />
              <DetailItem label="Sức chứa" value={homestay.guests + ' khách'} />
              <DetailItem label="Phòng ngủ" value={homestay.bedrooms + ' phòng'} />
              <DetailItem label="WC" value={homestay.bathrooms + ' phòng'} />
              <DetailItem label="Bếp" value={homestay.kitchen + ' bếp'} />
              <DetailItem label="Phòng khách" value={homestay.livingRoom + ' phòng'} />
              <DetailItem label="Giường" value={homestay.beds + ' giường'} />
              <DetailItem label="Check-in" value={homestay.checkinTime || '14:00'} />
              <DetailItem label="Check-out" value={homestay.checkoutTime || '12:00'} />
            </div>

            {homestay.description && (
              <div className="rounded-2xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Mô tả</p>
                <p className="mt-2 text-sm font-semibold text-[#2C1E15] leading-relaxed">{homestay.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
              <SummaryBox label="Ảnh" value={homestay.images.length} />
              <SummaryBox label="Tiện nghi" value={homestay.amenities.length} />
              <SummaryBox label="Dịch vụ" value={homestay.services.length} />
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#F4F1EA] border border-gray-200 px-4 py-3 min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 font-bold text-[#2C1E15] break-words">{value}</p>
    </div>
  );
}

function SummaryBox({ label, value }) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 text-center shadow-sm">
      <p className="text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg text-[#2C3E2B]">{value}</p>
    </div>
  );
}
// function HomestayFormModal({ cities, editingHomestay, fields, onChange, onClose, onSubmit }) {
//   const updateField = (field, value) => onChange({ ...fields, [field]: value });

//   return (
//     <ModalPortal>
//       <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
//         <form className="w-full max-w-5xl max-h-[92vh] bg-[#F7F3EC] rounded-3xl shadow-2xl border border-white/70 overflow-hidden flex flex-col" onSubmit={onSubmit}>
//           <div className="px-6 py-5 bg-[#202c3c] text-white flex items-start justify-between gap-4">
//             <div>
//               <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#d9b18f]">{editingHomestay ? 'Cập nhật lưu trú' : 'Tạo lưu trú mới'}</p>
//               <h3 className="font-serif text-2xl font-bold mt-1">{editingHomestay ? 'Sửa thông tin homestay' : 'Thêm homestay mới'}</h3>
//               <p className="text-xs text-gray-300 mt-1">Điền thông tin theo bảng homestays: địa chỉ, giá, sức chứa, cấu trúc phòng và thời gian nhận/trả phòng.</p>
//             </div>
//             <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition" onClick={onClose} type="button">
//               <FaTimes />
//             </button>
//           </div>

//           <div className="overflow-y-auto p-5 space-y-4">
//             <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
//               <SectionHeader title="Thông tin cơ bản" description="Tên, vị trí và mô tả ngắn để khách hiểu nhanh về homestay." />
//               <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <TextField label="Tên homestay" value={fields.name} onChange={(value) => updateField('name', value)} placeholder="VD: Nhà Gỗ Ven Hồ Tuyền Lâm" required />
//                 <SelectField label="Tỉnh / Thành phố" value={fields.city} onChange={(value) => updateField('city', value)} options={cities} required />
//                 <TextField className="md:col-span-2" label="Địa chỉ chi tiết" value={fields.address} onChange={(value) => updateField('address', value)} placeholder="Số nhà, đường, phường/xã, quận/huyện..." required />
//                 <TextAreaField className="md:col-span-2" label="Mô tả homestay" value={fields.description} onChange={(value) => updateField('description', value)} placeholder="Không gian, phong cách, điểm nổi bật, phù hợp với nhóm khách nào..." />
//               </div>
//             </section>

//             <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
//               <SectionHeader title="Giá, khuyến mãi và thời gian" description="Các trường tương ứng price_per_night, discount_percent, checkin_time và checkout_time." />
//               <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <TextField label="Giá / đêm" type="number" min="0" step="10000" value={fields.price} onChange={(value) => updateField('price', value)} suffix="đ" required />
//                 <TextField label="Giảm giá" type="number" min="0" max="100" step="1" value={fields.discount} onChange={(value) => updateField('discount', value)} suffix="%" />
//                 <TextField label="Check-in" type="time" value={fields.checkinTime} onChange={(value) => updateField('checkinTime', value)} required />
//                 <TextField label="Check-out" type="time" value={fields.checkoutTime} onChange={(value) => updateField('checkoutTime', value)} required />
//               </div>
//             </section>

//             <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
//               <SectionHeader title="Sức chứa và cấu trúc phòng" description="Các chỉ số khách, phòng ngủ, WC, bếp, phòng khách và số giường của homestay." />
//               <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//                 <TextField label="Số khách" type="number" min="1" value={fields.guests} onChange={(value) => updateField('guests', value)} required />
//                 <TextField label="Số giường" type="number" min="1" value={fields.beds} onChange={(value) => updateField('beds', value)} required />
//                 <TextField label="Phòng ngủ" type="number" min="0" value={fields.bedrooms} onChange={(value) => updateField('bedrooms', value)} required />
//                 <TextField label="WC" type="number" min="0" value={fields.bathrooms} onChange={(value) => updateField('bathrooms', value)} required />
//                 <TextField label="Phòng khách" type="number" min="0" value={fields.livingRoom} onChange={(value) => updateField('livingRoom', value)} required />
//                 <TextField label="Bếp" type="number" min="0" value={fields.kitchen} onChange={(value) => updateField('kitchen', value)} required />
//               </div>
//             </section>

//             <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs font-semibold text-[#7c5a24] leading-relaxed">
//               Sau khi lưu homestay, bạn dùng các nút ở cột <span className="font-black">Cập nhật Homestay</span> để thêm ảnh, tiện nghi, dịch vụ và nội quy. Các phần đó nằm ở bảng riêng trong cơ sở dữ liệu nên được quản lý tách riêng.
//             </div>
//           </div>

//           <div className="px-6 py-4 bg-white flex justify-end gap-3 border-t border-gray-200">
//             <button className="px-5 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 text-xs font-bold shadow-sm hover:bg-gray-50 transition" onClick={onClose} type="button">Hủy</button>
//             <button className="px-6 h-11 rounded-xl bg-[#2C3E2B] hover:bg-[#223123] text-white text-xs font-bold shadow transition" type="submit">
//               {editingHomestay ? 'Lưu thay đổi' : 'Tạo homestay'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </ModalPortal>
//   );
// }
function HomestayFormModal({ editingHomestay, fields, onChange, onClose, onSubmit }) {
  const isEditing = Boolean(editingHomestay);

const createSteps = [
  { key: 'basic', label: 'Thông tin cơ bản', color: 'emerald' },
  { key: 'images', label: 'Hình ảnh', color: 'blue' },
  { key: 'amenities', label: 'Tiện nghi', color: 'violet' },
  { key: 'services', label: 'Dịch vụ', color: 'amber' },
  { key: 'rules', label: 'Nội quy', color: 'rose' },
  { key: 'confirm', label: 'Xác nhận', color: 'green' },
];
const editSteps = [{ key: 'basic', label: 'Thông tin cơ bản', color: 'emerald' }];
const steps = isEditing ? editSteps : createSteps;
  const [stepIndex, setStepIndex] = useState(0);
  const bodyRef = useRef(null);
  const [draftImages, setDraftImages] = useState(editingHomestay?.images ?? []);
  const [draftAmenities, setDraftAmenities] = useState(editingHomestay?.amenities ?? []);
  const [draftServices, setDraftServices] = useState(editingHomestay?.services ?? []);
  const [draftRules, setDraftRules] = useState(editingHomestay?.rules ?? []);

  // const [imageUrl, setImageUrl] = useState('');
  const [amenityText, setAmenityText] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [ruleText, setRuleText] = useState('');
  
  const currentStep = steps[stepIndex];
  useEffect(() => {
  bodyRef.current?.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}, [stepIndex]);
  const updateField = (field, value) => {
    onChange({ ...fields, [field]: value });
  };

  const isBasicInfoValid = () => {
    return (
      fields.name.trim() &&
      fields.city.trim() &&
      fields.address.trim() &&
      Number(fields.price) > 0 &&
      Number(fields.guests) > 0 &&
      Number(fields.beds) > 0 &&
      fields.checkinTime &&
      fields.checkoutTime
    );
  };

  const goNext = (event) => {
    event?.preventDefault();

    if (stepIndex === 0 && !isBasicInfoValid()) {
      window.alert('Vui lòng nhập đầy đủ thông tin cơ bản trước khi tiếp tục.');
      return;
    }

    if (stepIndex === 1 && draftImages.length === 0) {
      window.alert('Vui lòng thêm ít nhất một ảnh cho homestay.');
      return;
    }

    setStepIndex((current) => {
      const nextStep = Math.min(current + 1, steps.length - 1);
      return nextStep;
    });
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const handleFinalSubmit = (event) => {
    onSubmit(event, {
      images: draftImages,
      amenities: draftAmenities,
      services: draftServices,
      rules: draftRules,
    });
  };

  const addDraftImage = (files) => {
  const imageFiles = Array.from(files || []).filter((file) =>
    file.type.startsWith('image/')
  );

  if (imageFiles.length === 0) return;

  setDraftImages((current) => [
    ...current,
    ...imageFiles.map((file, index) => ({
      url: URL.createObjectURL(file),
      file,
      fileName: file.name,
      fileSize: file.size,
      isLocal: true,
      isMain: current.length === 0 && index === 0,
    })),
  ]);
};
  const setMainDraftImage = (index) => {
    setDraftImages((current) =>
      current.map((image, imageIndex) => ({
        ...image,
        isMain: imageIndex === index,
      }))
    );
  };

  const deleteDraftImage = (index) => {
    setDraftImages((current) => {
      const images = current.filter((_, imageIndex) => imageIndex !== index);

      if (images.length > 0 && !images.some((image) => image.isMain)) {
        images[0] = { ...images[0], isMain: true };
      }

      return images;
    });
  };

    const addDraftAmenity = () => {
    const amenity = amenityText.trim();

    if (!amenity) return;

    setDraftAmenities((current) =>
      current.includes(amenity) ? current : [...current, amenity]
    );

    setAmenityText('');
  };

  const addDraftService = () => {
    if (!serviceName.trim() || !servicePrice) return;

    setDraftServices((current) => [
      ...current,
      {
        id: Date.now(),
        name: serviceName.trim(),
        price: Number(servicePrice),
        pricePerDay: Number(servicePrice),
        description: serviceDescription.trim(),
        status: 'Đang hoạt động',
      },
    ]);

    setServiceName('');
    setServicePrice('');
    setServiceDescription('');
  };

  const togglePresetService = (presetService) => {
  setDraftServices((current) => {
    const exists = current.some((service) => service.name === presetService.name);

    if (exists) {
      return current.filter((service) => service.name !== presetService.name);
    }

    return [
      ...current,
      {
        id: Date.now() + Math.random(),
        name: presetService.name,
        price: presetService.pricePerDay,
        pricePerDay: presetService.pricePerDay,
        description: presetService.description,
        status: 'Đang hoạt động',
        isPreset: true,
      },
    ];
  });
};

  const toggleDraftAmenity = (amenity) => {
  setDraftAmenities((current) =>
    current.includes(amenity)
      ? current.filter((item) => item !== amenity)
      : [...current, amenity]
  );
};

  const deleteDraftAmenity = (amenity) => {
    setDraftAmenities((current) => current.filter((item) => item !== amenity));
  };

  

  const toggleDraftService = (serviceId) => {
    setDraftServices((current) =>
      current.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              status: service.status === 'Đang hoạt động' ? 'Tạm ngưng' : 'Đang hoạt động',
            }
          : service
      )
    );
  };

  const deleteDraftService = (serviceId) => {
    setDraftServices((current) => current.filter((service) => service.id !== serviceId));
  };

  const addDraftRule = () => {
    const rule = ruleText.trim();
    if (!rule) return;

    setDraftRules((current) => [...current, rule]);
    setRuleText('');
  };

  const toggleDraftRule = (rule) => {
  setDraftRules((current) =>
    current.includes(rule)
      ? current.filter((item) => item !== rule)
      : [...current, rule]
  );
};

  const deleteDraftRule = (index) => {
    setDraftRules((current) => current.filter((_, ruleIndex) => ruleIndex !== index));
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
       <form
          className="w-full max-w-5xl h-[90vh] bg-[#fefefd] rounded-3xl shadow-2xl border border-white/70 overflow-hidden flex flex-col"
          onSubmit={handleFinalSubmit}
        >
          <div className="px-6 py-5 bg-[#58677a] text-white flex items-start justify-between gap-4 shrink-0">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#d9b18f]">
                {isEditing ? 'Cập nhật lưu trú' : 'Tạo lưu trú mới'}
              </p>
              <h3 className="font-serif text-2xl font-bold mt-1">
                {isEditing ? 'Sửa thông tin homestay' : 'Thêm homestay mới'}
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                {isEditing ? 'Chỉ sửa thông tin cơ bản. Ảnh, tiện nghi, dịch vụ và nội quy nằm ở nhóm Cập nhật Homestay.' : 'Hoàn tất từng bước: thông tin cơ bản, ảnh, tiện nghi, dịch vụ và nội quy trước khi gửi duyệt.'}
              </p>
            </div>

            <button
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition"
              onClick={onClose}
              type="button"
            >
              <FaTimes />
            </button>
          </div>

          {!isEditing && <WizardStepper steps={steps} currentIndex={stepIndex} />}

          <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
            {currentStep.key === 'basic' && (
              <>
                <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
                  <SectionHeader
                    title="Thông tin cơ bản"
                    description="Tên, vị trí và mô tả ngắn để khách hiểu nhanh về homestay."
                  />

                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      label="Tên homestay"
                      value={fields.name}
                      onChange={(value) => updateField('name', value)}
                      placeholder="VD: Nhà Gỗ Ven Hồ Tuyền Lâm"
                      required
                    />

                    <SelectField
                      label="Tỉnh / Thành phố"
                      value={fields.city}
                      onChange={(value) => updateField('city', value)}
                      options={VIETNAM_CITIES}
                      required
                    />

                    <TextField
                      className="md:col-span-2"
                      label="Địa chỉ chi tiết"
                      value={fields.address}
                      onChange={(value) => updateField('address', value)}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                      required
                    />

                    <TextAreaField
                      className="md:col-span-2"
                      label="Mô tả homestay"
                      value={fields.description}
                      onChange={(value) => updateField('description', value)}
                      placeholder="Không gian, phong cách, điểm nổi bật, phù hợp với nhóm khách nào..."
                    />
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
                  <SectionHeader
                    title="Giá, khuyến mãi và thời gian"
                    description="Các trường tương ứng price_per_night, discount_percent, checkin_time và checkout_time."
                  />

                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <TextField
                      label="Giá / đêm"
                      type="number"
                      min="0"
                      step="10000"
                      value={fields.price}
                      onChange={(value) => updateField('price', value)}
                      suffix="đ"
                      required
                    />

                    <TextField
                      label="Giảm giá"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={fields.discount}
                      onChange={(value) => updateField('discount', value)}
                      suffix="%"
                    />

                    <TextField
                      label="Check-in"
                      type="time"
                      value={fields.checkinTime}
                      onChange={(value) => updateField('checkinTime', value)}
                      required
                    />

                    <TextField
                      label="Check-out"
                      type="time"
                      value={fields.checkoutTime}
                      onChange={(value) => updateField('checkoutTime', value)}
                      required
                    />
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
                  <SectionHeader
                    title="Sức chứa và cấu trúc phòng"
                    description="Các chỉ số khách, phòng ngủ, WC, bếp, phòng khách và số giường của homestay."
                  />

                  <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <TextField label="Số khách" type="number" min="1" value={fields.guests} onChange={(value) => updateField('guests', value)} required />
                    <TextField label="Số giường" type="number" min="1" value={fields.beds} onChange={(value) => updateField('beds', value)} required />
                    <TextField label="Phòng ngủ" type="number" min="0" value={fields.bedrooms} onChange={(value) => updateField('bedrooms', value)} required />
                    <TextField label="WC" type="number" min="0" value={fields.bathrooms} onChange={(value) => updateField('bathrooms', value)} required />
                    <TextField label="Phòng khách" type="number" min="0" value={fields.livingRoom} onChange={(value) => updateField('livingRoom', value)} required />
                    <TextField label="Bếp" type="number" min="0" value={fields.kitchen} onChange={(value) => updateField('kitchen', value)} required />
                  </div>
                </section>
              </>
            )}

            {!isEditing && currentStep.key === 'images' && (
              <ImageWizardStep
                images={draftImages}
                addImage={addDraftImage}
                deleteImage={deleteDraftImage}
                setMainImage={setMainDraftImage}
              />
            )}

            {!isEditing && currentStep.key === 'amenities' && (
              <AmenityWizardStep
                amenities={draftAmenities}
                amenityText={amenityText}
                setAmenityText={setAmenityText}
                addAmenity={addDraftAmenity}
                deleteAmenity={deleteDraftAmenity}
                toggleAmenity={toggleDraftAmenity}
              />
            )}

            {!isEditing && currentStep.key === 'services' && (
              <ServiceWizardStep
                services={draftServices}
                serviceName={serviceName}
                servicePrice={servicePrice}
                serviceDescription={serviceDescription}
                setServiceName={setServiceName}
                setServicePrice={setServicePrice}
                setServiceDescription={setServiceDescription}
                addService={addDraftService}
                togglePresetService={togglePresetService}
                toggleService={toggleDraftService}
                deleteService={deleteDraftService}
              />
            )}

            {!isEditing && currentStep.key === 'rules' && (
              <RuleWizardStep
                rules={draftRules}
                ruleText={ruleText}
                setRuleText={setRuleText}
                addRule={addDraftRule}
                deleteRule={deleteDraftRule}
                toggleRule={toggleDraftRule}
              />
            )}

            {!isEditing && currentStep.key === 'confirm' && (
              <ConfirmWizardStep
                fields={fields}
                images={draftImages}
                amenities={draftAmenities}
                services={draftServices}
                rules={draftRules}
                isEditing={isEditing}
              />
            )}
          </div>

          <div className="px-6 py-4 bg-white flex justify-between gap-3 border-t border-gray-200 shrink-0 mt-auto">
              <button
              className="px-5 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 text-xs font-bold shadow-sm hover:bg-gray-50 transition"
              onClick={onClose}
              type="button"
            >
              Hủy
            </button>

            <div className="flex gap-3">
              {stepIndex > 0 && (
                <button
                  className="px-5 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 text-xs font-bold shadow-sm hover:bg-gray-50 transition"
                  onClick={goBack}
                  type="button"
                >
                  Quay lại
                </button>
              )}

              {stepIndex < steps.length - 1 ? (
                <button
                className="px-6 h-11 rounded-xl bg-[#2C3E2B] hover:bg-[#223123] text-white text-xs font-bold shadow transition"
                onClick={goNext}
                type="button"
              >
                Tiếp tục
              </button>
              ) : (
                <button
                  className="px-6 h-11 rounded-xl bg-[#2C3E2B] hover:bg-[#223123] text-white text-xs font-bold shadow transition"
                  type="submit"
                >
                  {isEditing ? 'Lưu thay đổi' : 'Xác nhận đăng ký'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}

function SectionHeader({ description, title }) {
  return (
    <div className="px-5 py-4 bg-gray-50/70 border-b border-gray-100">
      <h4 className="font-serif text-xl font-bold text-[#2C1E15]">{title}</h4>
      <p className="mt-1 text-xs font-semibold text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}

function TextField({ className = '', label, onChange, suffix, type = 'text', value, ...props }) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">{label}</span>
      <div className="relative">
        <input
          className={`w-full h-11 rounded-xl border border-gray-200 bg-white px-4 ${suffix ? 'pr-10' : ''} text-sm font-bold text-gray-700 outline-none transition focus:border-[#2C3E2B] focus:ring-4 focus:ring-[#2C3E2B]/10`}
          onChange={(event) => onChange(event.target.value)}
          type={type}
          value={value}
          {...props}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">{suffix}</span>}
      </div>
    </label>
  );
}

function SelectField({ className = '', label, onChange, options, value }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = normalizedQuery
    ? options.filter((option) => option.toLowerCase().includes(normalizedQuery))
    : options;

  const chooseOption = (option) => {
    onChange(option);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className={['relative space-y-2', className].filter(Boolean).join(' ')}>
      <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">{label}</span>
      <button
        className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-left text-sm font-bold text-gray-700 outline-none transition hover:border-[#2C3E2B]/40 focus:border-[#2C3E2B] focus:ring-4 focus:ring-[#2C3E2B]/10 flex items-center justify-between gap-3"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="truncate">{value || 'Chọn tỉnh / thành phố'}</span>
        <span className={(isOpen ? 'rotate-180 ' : '') + 'text-xs text-gray-400 transition'}>▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[74px] z-50 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl">
          <input
            autoFocus
            className="mb-2 h-10 w-full rounded-xl border border-gray-200 px-3 text-sm font-semibold outline-none focus:border-[#2C3E2B]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tỉnh / thành phố..."
            type="text"
            value={query}
          />
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {filteredOptions.map((option) => (
              <button
                className={(option === value ? 'bg-[#2C3E2B] text-white' : 'text-gray-600 hover:bg-[#F4F1EA]') + ' w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition'}
                key={option}
                onClick={() => chooseOption(option)}
                type="button"
              >
                {option}
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <p className="px-3 py-4 text-center text-xs font-bold text-gray-400">Không tìm thấy tỉnh / thành phố.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TextAreaField({ className = '', label, onChange, value, ...props }) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">{label}</span>
      <textarea
        className="w-full min-h-24 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition resize-none focus:border-[#2C3E2B] focus:ring-4 focus:ring-[#2C3E2B]/10"
        onChange={(event) => onChange(event.target.value)}
        value={value}
        {...props}
      />
    </label>
  );
}

function ConfigModal(props) {
  const tabs = [
    { key: 'images', label: 'Hình ảnh', shortLabel: 'Ảnh', icon: <FaImage />, color: 'blue' },
    { key: 'amenities', label: 'Tiện nghi', shortLabel: 'Tiện nghi', icon: <FaShieldAlt />, color: 'emerald' },
    { key: 'services', label: 'Dịch vụ', shortLabel: 'Dịch vụ', icon: <FaBox />, color: 'amber' },
    { key: 'rules', label: 'Nội quy', shortLabel: 'Nội quy', icon: <FaFileAlt />, color: 'rose' },
  ];
  const [draftImages, setDraftImages] = useState(props.homestay.images ?? []);
  const [draftAmenities, setDraftAmenities] = useState(props.homestay.amenities ?? []);
  const [draftServices, setDraftServices] = useState(props.homestay.services ?? []);
  const [draftRules, setDraftRules] = useState(props.homestay.rules ?? []);
  const [amenityText, setAmenityText] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [ruleText, setRuleText] = useState('');
  const activeTab = props.activeTab || 'images';

  const addDraftImage = (files) => {
    const imageFiles = Array.from(files || []).filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setDraftImages((current) => normalizeMainImages([
      ...current,
      ...imageFiles.map((file, index) => ({
        url: URL.createObjectURL(file),
        file,
        fileName: file.name,
        fileSize: file.size,
        isLocal: true,
        isMain: current.length === 0 && index === 0,
      })),
    ]));
  };

  const setMainDraftImage = (index) => {
    setDraftImages((current) => normalizeMainImages(current.map((image, imageIndex) => ({ ...image, isMain: imageIndex === index }))));
  };

  const deleteDraftImage = (index) => {
    setDraftImages((current) => {
      const images = current.filter((_, imageIndex) => imageIndex !== index);
      return normalizeMainImages(images);
    });
  };

  const addDraftAmenity = () => {
    const amenity = amenityText.trim();
    if (!amenity) return;
    setDraftAmenities((current) => (current.includes(amenity) ? current : [...current, amenity]));
    setAmenityText('');
  };

  const toggleDraftAmenity = (amenity) => {
    setDraftAmenities((current) =>
      current.includes(amenity) ? current.filter((item) => item !== amenity) : [...current, amenity]
    );
  };

  const deleteDraftAmenity = (amenity) => {
    setDraftAmenities((current) => current.filter((item) => item !== amenity));
  };

  const addDraftService = () => {
    if (!serviceName.trim() || !servicePrice) return;
    setDraftServices((current) => [
      ...current,
      {
        id: Date.now(),
        name: serviceName.trim(),
        price: Number(servicePrice),
        pricePerDay: Number(servicePrice),
        description: serviceDescription.trim(),
        status: 'Đang hoạt động',
      },
    ]);
    setServiceName('');
    setServicePrice('');
    setServiceDescription('');
  };

  const togglePresetService = (presetService) => {
    setDraftServices((current) => {
      const exists = current.some((service) => service.name === presetService.name);
      if (exists) return current.filter((service) => service.name !== presetService.name);
      return [
        ...current,
        {
          id: Date.now() + Math.random(),
          name: presetService.name,
          price: presetService.pricePerDay,
          pricePerDay: presetService.pricePerDay,
          description: presetService.description,
          status: 'Đang hoạt động',
          isPreset: true,
        },
      ];
    });
  };

  const toggleDraftService = (serviceId) => {
    setDraftServices((current) =>
      current.map((service) =>
        service.id === serviceId
          ? { ...service, status: service.status === 'Đang hoạt động' ? 'Tạm ngưng' : 'Đang hoạt động' }
          : service
      )
    );
  };

  const deleteDraftService = (serviceId) => {
    setDraftServices((current) => current.filter((service) => service.id !== serviceId));
  };

  const addDraftRule = () => {
    const rule = ruleText.trim();
    if (!rule) return;
    setDraftRules((current) => (current.includes(rule) ? current : [...current, rule]));
    setRuleText('');
  };

  const toggleDraftRule = (rule) => {
    setDraftRules((current) =>
      current.includes(rule) ? current.filter((item) => item !== rule) : [...current, rule]
    );
  };

  const deleteDraftRule = (index) => {
    setDraftRules((current) => current.filter((_, ruleIndex) => ruleIndex !== index));
  };

  const handleSave = () => {
    props.onSaveConfig({
      images: draftImages,
      amenities: draftAmenities,
      services: draftServices,
      rules: draftRules,
    });
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-6xl h-[90vh] overflow-hidden bg-[#fefefd] rounded-3xl shadow-2xl border border-white/70 flex flex-col">
          <div className="px-6 py-5 bg-[#58677a] text-white flex items-start justify-between gap-4 shrink-0">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#d9b18f]">Cập nhật homestay</p>
              <h3 className="font-serif text-2xl font-bold mt-1">{props.homestay.name}</h3>
              <p className="text-xs text-gray-300 mt-1">Chỉnh ảnh, tiện nghi, dịch vụ và nội quy rồi bấm lưu để cập nhật vào database.</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 transition" onClick={props.onClose} type="button">
              <FaTimes />
            </button>
          </div>

          <div className="px-5 py-4 bg-white border-b border-gray-200 flex gap-2 overflow-x-auto shrink-0">
            {tabs.map((tab) => (
              <button
                className={
                  'inline-flex items-center gap-2 px-4 h-11 rounded-2xl text-xs font-black border transition shrink-0 ' +
                  (activeTab === tab.key
                    ? 'bg-[#2C3E2B] text-white border-[#2C3E2B] shadow-md'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#2C3E2B]/30 hover:text-[#2C3E2B]')
                }
                key={tab.key}
                onClick={() => props.setConfigTab(tab.key)}
                type="button"
              >
                {tab.icon}
                {tab.shortLabel}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
            {activeTab === 'images' && (
              <ImageWizardStep images={draftImages} addImage={addDraftImage} deleteImage={deleteDraftImage} setMainImage={setMainDraftImage} />
            )}
            {activeTab === 'amenities' && (
              <AmenityWizardStep
                amenities={draftAmenities}
                amenityText={amenityText}
                setAmenityText={setAmenityText}
                addAmenity={addDraftAmenity}
                deleteAmenity={deleteDraftAmenity}
                toggleAmenity={toggleDraftAmenity}
              />
            )}
            {activeTab === 'services' && (
              <ServiceWizardStep
                services={draftServices}
                serviceName={serviceName}
                servicePrice={servicePrice}
                serviceDescription={serviceDescription}
                setServiceName={setServiceName}
                setServicePrice={setServicePrice}
                setServiceDescription={setServiceDescription}
                addService={addDraftService}
                togglePresetService={togglePresetService}
                toggleService={toggleDraftService}
                deleteService={deleteDraftService}
              />
            )}
            {activeTab === 'rules' && (
              <RuleWizardStep
                rules={draftRules}
                ruleText={ruleText}
                setRuleText={setRuleText}
                addRule={addDraftRule}
                deleteRule={deleteDraftRule}
                toggleRule={toggleDraftRule}
              />
            )}
          </div>

          <div className="px-6 py-4 bg-white flex justify-end gap-3 border-t border-gray-200 shrink-0">
            <button className="px-5 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 text-xs font-bold shadow-sm hover:bg-gray-50 transition" onClick={props.onClose} type="button">
              Hủy
            </button>
            <button className="px-6 h-11 rounded-xl bg-[#2C3E2B] hover:bg-[#223123] text-white text-xs font-bold shadow transition" onClick={handleSave} type="button">
              Lưu cập nhật
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function WizardStepper({ currentIndex, steps }) {
  const colorClasses = {
    emerald: {
      active: 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-200',
      done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: 'bg-emerald-100 text-emerald-700',
      line: 'bg-emerald-300',
    },
    blue: {
      active: 'bg-blue-600 text-white border-blue-600 shadow-blue-200',
      done: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: 'bg-blue-100 text-blue-700',
      line: 'bg-blue-300',
    },
    violet: {
      active: 'bg-violet-600 text-white border-violet-600 shadow-violet-200',
      done: 'bg-violet-50 text-violet-700 border-violet-200',
      icon: 'bg-violet-100 text-violet-700',
      line: 'bg-violet-300',
    },
    amber: {
      active: 'bg-amber-500 text-white border-amber-500 shadow-amber-200',
      done: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: 'bg-amber-100 text-amber-700',
      line: 'bg-amber-300',
    },
    rose: {
      active: 'bg-rose-500 text-white border-rose-500 shadow-rose-200',
      done: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: 'bg-rose-100 text-rose-700',
      line: 'bg-rose-300',
    },
    green: {
      active: 'bg-[#2C3E2B] text-white border-[#2C3E2B] shadow-green-200',
      done: 'bg-green-50 text-green-700 border-green-200',
      icon: 'bg-green-100 text-green-700',
      line: 'bg-green-300',
    },
  };

  return (
    <div className="bg-white border-b border-gray-200 px-5 py-4 shrink-0">
      <div className="flex items-center justify-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;
          const color = colorClasses[step.color];

          return (
            <div className="flex items-center gap-2 shrink-0" key={step.key}>
              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 h-11 text-xs font-black border transition-all duration-300 ${
                  isActive
                    ? `${color.active} shadow-lg scale-[1.03]`
                    : isDone
                      ? color.done
                      : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] transition ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isDone
                        ? color.icon
                        : 'bg-white text-gray-400'
                  }`}
                >
                  {isDone ? <FaCheckCircle /> : index + 1}
                </span>

                <span className="whitespace-nowrap">
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-[2px] rounded-full transition ${
                    index < currentIndex ? color.line : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function ImageWizardStep({ addImage, deleteImage, images, setMainImage }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    addImage(files);
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
      <SectionHeader
        title="Hình ảnh homestay"
        description="Tải ảnh đại diện và các ảnh mô tả không gian homestay. Cần có ít nhất một ảnh trước khi tiếp tục."
      />

      <div className="p-5 space-y-4">
        <label
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition ${
            isDragging
              ? 'border-[#2C3E2B] bg-emerald-50'
              : 'border-gray-300 bg-gray-50 hover:bg-white'
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#F4F1EA] text-[#2C3E2B] flex items-center justify-center text-xl">
            <FaCamera />
          </div>

          <div>
            <p className="text-sm font-black text-[#2C1E15]">
              Tải ảnh homestay lên
            </p>
            <p className="text-xs font-semibold text-gray-400 mt-1">
              Chọn ảnh từ máy hoặc kéo thả ảnh vào khu vực này
            </p>
          </div>

          <span className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-[#2C3E2B] text-white text-xs font-bold shadow">
            Chọn ảnh từ máy
          </span>

          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              handleFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </label>

        {images.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
            <p className="text-sm font-semibold text-gray-400">
              Chưa có ảnh nào. Hãy tải lên ít nhất một ảnh để admin có thể duyệt homestay.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                key={`${image.url}-${index}`}
              >
                <img
                  alt={`Ảnh homestay ${index + 1}`}
                  className="h-40 w-full object-cover"
                  src={image.url}
                />

                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      className="text-xs font-bold text-[#2C3E2B] disabled:text-gray-400"
                      disabled={image.isMain}
                      onClick={() => setMainImage(index)}
                      type="button"
                    >
                      {image.isMain ? 'Ảnh chính' : 'Đặt làm chính'}
                    </button>

                    <button
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center"
                      onClick={() => deleteImage(index)}
                      type="button"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>

                  {image.fileName && (
                    <p className="text-[11px] text-gray-400 font-semibold truncate">
                      {image.fileName}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AmenityWizardStep({
  addAmenity,
  amenities,
  amenityText,
  deleteAmenity,
  setAmenityText,
  toggleAmenity,
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
      <SectionHeader
        title="Tiện nghi homestay"
        description="Chọn nhanh từ danh mục có sẵn hoặc thêm tiện nghi riêng của homestay."
      />

      <div className="p-5 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5">
        <FloatingPanel
          title="Tiện nghi có sẵn"
          description="Tick chọn các tiện nghi đang có tại homestay."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_AMENITIES.map((amenity) => {
              const selected = amenities.includes(amenity);
              const AmenityIcon = amenityIcons[amenity] || FaCheckCircle;

              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                    selected
                      ? 'bg-emerald-50 border-emerald-300 shadow-sm ring-2 ring-emerald-100'
                      : 'bg-white border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/40'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        selected
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-400 group-hover:text-emerald-600'
                      }`}
                    >
                      <AmenityIcon />
                    </span>

                    <span className="text-sm font-black text-[#2C1E15] truncate">
                      {amenity}
                    </span>
                  </span>

                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                      selected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-gray-300 text-transparent'
                    }`}
                  >
                    <FaCheckCircle />
                  </span>
                </button>
              );
            })}
          </div>
        </FloatingPanel>

        <FloatingPanel
          title="Thêm tiện nghi mới"
          description="Dùng khi tiện nghi chưa có trong danh mục."
        >
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                className="flex-1 h-11 rounded-xl border border-gray-200 px-4 text-sm font-semibold outline-none focus:border-[#2C3E2B] focus:ring-4 focus:ring-[#2C3E2B]/10"
                onChange={(event) => setAmenityText(event.target.value)}
                placeholder="Ví dụ: Bồn tắm, sân vườn..."
                value={amenityText}
              />

              <button
                className="h-11 px-4 rounded-xl bg-[#2C3E2B] text-white text-xs font-bold shadow hover:bg-[#223123]"
                onClick={addAmenity}
                type="button"
              >
                Thêm
              </button>
            </div>

            <SelectedPillList
              title="Tiện nghi đã chọn"
              emptyText="Chưa chọn tiện nghi nào."
              items={amenities}
              onRemove={deleteAmenity}
            />
          </div>
        </FloatingPanel>
      </div>
    </section>
  );
}

function ServiceWizardStep({
  addService,
  deleteService,
  serviceName,
  servicePrice,
  serviceDescription,
  services,
  setServiceName,
  setServicePrice,
  setServiceDescription,
  togglePresetService,
  toggleService,
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
      <SectionHeader
        title="Dịch vụ bổ sung"
        description="Chọn dịch vụ có sẵn hoặc thêm dịch vụ riêng với giá theo ngày và mô tả chi tiết."
      />

      <div className="p-5 grid grid-cols-1 xl:grid-cols-[1fr_0.95fr] gap-5">
        <FloatingPanel
          title="Dịch vụ có sẵn"
          description="Tick chọn nhanh các dịch vụ phổ biến."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-3">
            {PRESET_SERVICES.map((service) => {
              const selected = services.some((item) => item.name === service.name);

              return (
                <button
                  key={service.name}
                  type="button"
                  onClick={() => togglePresetService(service)}
                  className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                    selected
                      ? 'bg-amber-50 border-amber-300 shadow-sm ring-2 ring-amber-100'
                      : 'bg-white border-gray-200 hover:border-amber-200 hover:bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-[#2C1E15]">
                        {service.name}
                      </p>
                      <p className="mt-1 text-xs font-black text-[#6E473B]">
                        {formatCurrency(service.pricePerDay)} / ngày
                      </p>
                    </div>

                    <span
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] shrink-0 ${
                        selected
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-white border-gray-300 text-transparent'
                      }`}
                    >
                      <FaCheckCircle />
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-semibold text-gray-400 leading-relaxed">
                    {service.description}
                  </p>
                </button>
              );
            })}
          </div>
        </FloatingPanel>

        <FloatingPanel
          title="Thêm dịch vụ mới"
          description="Nhập đầy đủ tên dịch vụ, giá/ngày và mô tả để khách hiểu rõ."
        >
          <div className="space-y-3">
            <input
              className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm font-semibold outline-none focus:border-[#2C3E2B] focus:ring-4 focus:ring-[#2C3E2B]/10"
              onChange={(event) => setServiceName(event.target.value)}
              placeholder="Tên dịch vụ"
              value={serviceName}
            />

            <input
              className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm font-semibold outline-none focus:border-[#2C3E2B] focus:ring-4 focus:ring-[#2C3E2B]/10"
              onChange={(event) => setServicePrice(event.target.value)}
              placeholder="Giá / ngày"
              type="number"
              min="0"
              value={servicePrice}
            />

            <textarea
              className="w-full min-h-24 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold outline-none resize-none focus:border-[#2C3E2B] focus:ring-4 focus:ring-[#2C3E2B]/10"
              onChange={(event) => setServiceDescription(event.target.value)}
              placeholder="Mô tả dịch vụ, điều kiện sử dụng, phạm vi hỗ trợ..."
              value={serviceDescription}
            />

            <button
              className="w-full h-11 rounded-xl bg-[#2C3E2B] text-white text-xs font-bold shadow hover:bg-[#223123]"
              onClick={addService}
              type="button"
            >
              Thêm dịch vụ
            </button>
          </div>
        </FloatingPanel>

        <div className="xl:col-span-2">
          <FloatingPanel
            title="Dịch vụ đã thêm"
            description="Bạn có thể bật/tắt trạng thái hoặc xóa dịch vụ khỏi homestay."
          >
            {services.length === 0 ? (
              <EmptyWizardState text="Chưa có dịch vụ bổ sung. Bạn có thể bỏ qua nếu homestay không cung cấp dịch vụ riêng." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((service) => (
                  <div
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                    key={service.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-[#2C1E15]">
                          {service.name}
                        </p>

                        <p className="mt-1 text-xs text-[#6E473B] font-black">
                          {formatCurrency(service.pricePerDay ?? service.price)} / ngày
                        </p>
                      </div>

                      <button
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0"
                        onClick={() => deleteService(service.id)}
                        type="button"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>

                    {service.description && (
                      <p className="mt-3 text-xs font-semibold text-gray-400 leading-relaxed">
                        {service.description}
                      </p>
                    )}

                    <button
                      className={`mt-3 inline-flex items-center gap-2 px-3 h-8 rounded-xl text-xs font-bold ${
                        service.status === 'Đang hoạt động'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                      onClick={() => toggleService(service.id)}
                      type="button"
                    >
                      {service.status === 'Đang hoạt động' ? <FaToggleOn /> : <FaToggleOff />}
                      {service.status}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FloatingPanel>
        </div>
      </div>
    </section>
  );
}

function RuleWizardStep({
  addRule,
  deleteRule,
  ruleText,
  rules,
  setRuleText,
  toggleRule,
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
      <SectionHeader
        title="Nội quy homestay"
        description="Chọn nội quy có sẵn hoặc thêm quy định riêng cho homestay."
      />

      <div className="p-5 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5">
        <FloatingPanel
          title="Nội quy có sẵn"
          description="Tick chọn các quy định áp dụng cho khách lưu trú."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_RULES.map((rule) => {
              const selected = rules.includes(rule);

              return (
                <button
                  key={rule}
                  type="button"
                  onClick={() => toggleRule(rule)}
                  className={`group flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                    selected
                      ? 'bg-rose-50 border-rose-300 shadow-sm ring-2 ring-rose-100'
                      : 'bg-white border-gray-200 hover:border-rose-200 hover:bg-rose-50/40'
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        selected
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-gray-100 text-gray-400 group-hover:text-rose-600'
                      }`}
                    >
                      <FaFileAlt />
                    </span>

                    <span className="text-sm font-black text-[#2C1E15] leading-relaxed">
                      {rule}
                    </span>
                  </span>

                  <span
                    className={`w-5 h-5 mt-1 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                      selected
                        ? 'bg-rose-500 border-rose-500 text-white'
                        : 'bg-white border-gray-300 text-transparent'
                    }`}
                  >
                    <FaCheckCircle />
                  </span>
                </button>
              );
            })}
          </div>
        </FloatingPanel>

        <FloatingPanel
          title="Thêm nội quy mới"
          description="Dùng khi homestay có quy định riêng ngoài danh mục."
        >
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                className="flex-1 h-11 rounded-xl border border-gray-200 px-4 text-sm font-semibold outline-none focus:border-[#2C3E2B] focus:ring-4 focus:ring-[#2C3E2B]/10"
                onChange={(event) => setRuleText(event.target.value)}
                placeholder="Ví dụ: Không mở loa lớn sau 22:00..."
                value={ruleText}
              />

              <button
                className="h-11 px-4 rounded-xl bg-[#2C3E2B] text-white text-xs font-bold shadow hover:bg-[#223123]"
                onClick={addRule}
                type="button"
              >
                Thêm
              </button>
            </div>

            <SelectedPillList
              title="Nội quy đã chọn"
              emptyText="Chưa chọn nội quy nào."
              items={rules}
              onRemoveByIndex={deleteRule}
            />
          </div>
        </FloatingPanel>
      </div>
    </section>
  );
}

function FloatingPanel({ children, description, title }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white/90 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <h5 className="font-serif text-xl font-bold text-[#2C1E15]">
          {title}
        </h5>
        {description && (
          <p className="mt-1 text-xs font-semibold text-gray-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

function SelectedPillList({
  emptyText,
  items,
  onRemove,
  onRemoveByIndex,
  title,
}) {
  return (
    <div className="rounded-2xl bg-[#F7F3EC] border border-gray-200 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-gray-500">
        {title}
      </p>

      {items.length === 0 ? (
        <p className="mt-3 text-sm font-semibold text-gray-400">
          {emptyText}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-bold text-[#2C1E15] shadow-sm"
              key={`${item}-${index}`}
            >
              {item}

              <button
                className="text-red-400 hover:text-red-600"
                onClick={() => {
                  if (onRemoveByIndex) {
                    onRemoveByIndex(index);
                  } else {
                    onRemove(item);
                  }
                }}
                type="button"
              >
                <FaTimes />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmWizardStep({
  amenities = [],
  fields = {},
  images = [],
  rules = [],
  services = [],
}) 
 {
  const mainImage = images.find((image) => image.isMain) || images[0];

  return (
    <section className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
      <SectionHeader
        title="Xác nhận thông tin đăng ký homestay"
        description="Kiểm tra toàn bộ thông tin trước khi gửi yêu cầu cho admin duyệt."
      />

      <div className="p-5 space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-800">
          Sau khi bấm xác nhận đăng ký, homestay sẽ được tạo với trạng thái
          <span className="mx-1 px-2 py-1 rounded-full bg-white border border-emerald-200 text-emerald-700">
            Chờ duyệt
          </span>
          và gửi đến admin để kiểm tra.
        </div>

        {mainImage && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={mainImage.url}
              alt="Ảnh chính homestay"
              className="w-full h-60 object-cover"
            />
            <div className="px-4 py-3 bg-white">
              <p className="text-xs font-black text-[#2C3E2B]">
                Ảnh đại diện homestay
              </p>
              {mainImage.fileName && (
                <p className="text-[11px] text-gray-400 font-semibold mt-1 truncate">
                  {mainImage.fileName}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <DetailItem label="Tên homestay" value={fields.name || 'Chưa nhập'} />
          <DetailItem label="Thành phố" value={fields.city || 'Chưa nhập'} />
          <DetailItem label="Địa chỉ" value={fields.address || 'Chưa nhập'} />
          <DetailItem label="Giá mỗi đêm" value={formatCurrency(fields.price)} />
          <DetailItem label="Giảm giá" value={`${fields.discount || 0}%`} />
          <DetailItem label="Sức chứa" value={`${fields.guests} khách`} />
          <DetailItem label="Số giường" value={`${fields.beds} giường`} />
          <DetailItem label="Cấu trúc phòng" value={`${fields.bedrooms} phòng ngủ • ${fields.bathrooms} WC • ${fields.livingRoom} phòng khách • ${fields.kitchen} bếp`} />
          <DetailItem label="Check-in" value={fields.checkinTime} />
          <DetailItem label="Check-out" value={fields.checkoutTime} />
        </div>

        <div className="rounded-2xl bg-[#F4F1EA] border border-gray-200 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
            Mô tả homestay
          </p>
          <p className="mt-2 text-sm font-semibold text-[#2C1E15] leading-relaxed">
            {fields.description || 'Chưa nhập mô tả.'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
          <SummaryBox label="Ảnh" value={images.length} />
          <SummaryBox label="Tiện nghi" value={amenities.length} />
          <SummaryBox label="Dịch vụ" value={services.length} />
          <SummaryBox label="Nội quy" value={rules.length} />
        </div>

        <ConfirmList
          title="Danh sách ảnh"
          emptyText="Chưa có ảnh."
          items={images.map((image, index) =>
            image.isMain ? `Ảnh ${index + 1} - Ảnh chính` : `Ảnh ${index + 1}`
          )}
        />

        <ConfirmList
          title="Tiện nghi"
          emptyText="Chưa thêm tiện nghi."
          items={amenities}
        />

        <ConfirmList
          title="Dịch vụ bổ sung"
          emptyText="Chưa thêm dịch vụ."
          items={services.map((service) => {
            const price = service.pricePerDay ?? service.price;

            return `${service.name} - ${formatCurrency(price)} / ngày${
              service.description ? ` - ${service.description}` : ''
            }`;
          })}
        />

        <ConfirmList
          title="Nội quy"
          emptyText="Chưa thêm nội quy."
          items={rules}
        />
      </div>
    </section>
  );
}
 
function ConfirmList({ emptyText, items = [], title }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <h5 className="font-serif text-lg font-bold text-[#2C1E15]">
          {title}
        </h5>
      </div>

      <div className="p-4">
        {items.length === 0 ? (
          <p className="text-sm font-semibold text-gray-400">
            {emptyText}
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                className="rounded-xl bg-[#F4F1EA] border border-gray-200 px-4 py-3 text-xs font-bold text-[#2C1E15] leading-relaxed"
                key={`${item}-${index}`}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function EmptyWizardState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center">
      <p className="text-sm font-semibold text-gray-400">{text}</p>
    </div>
  );
}






