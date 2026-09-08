import { useEffect, useRef, useState } from 'react';
import { HiCamera, HiCheck, HiChevronDown } from 'react-icons/hi2';

const genderOptions = [
  { value: 'female', label: 'Nữ' },
  { value: 'male', label: 'Nam' },
];

function GenderDropdown({ value, disabled, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selected = genderOptions.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-xl border border-gray-200 bg-[#F4F1EA]/30 px-4 py-2.5 text-left text-base font-medium transition focus:border-[#2C3E2B] focus:outline-none ${disabled ? 'cursor-default text-gray-600 opacity-75' : 'cursor-pointer text-gray-800 hover:border-[#BBAA9C] hover:bg-white'}`}
      >
        <span>{selected?.label || 'Chọn giới tính'}</span>
        <HiChevronDown className={`h-5 w-5 text-gray-400 transition ${isOpen ? 'rotate-180 text-[#6E473B]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-2xl ring-1 ring-black/5">
          {genderOptions.map((option) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-black transition ${active ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-600 hover:bg-[#F4F1EA] hover:text-[#2C3E2B]'}`}
              >
                {option.label}
                {active && <HiCheck className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AccountInfo({
  isEditing,
  setIsEditing,
  tempInfo,
  setTempInfo,
  handleSaveInfo,
  fileInputRef,
  handleAvatarChange,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const avatarLabel = String(tempInfo?.name || 'U').trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="space-y-4 text-left animate-fade-in">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Hồ sơ cá nhân</h2>
          <p className="text-xs font-medium text-gray-400">Quản lý và cập nhật thông tin liên hệ của bạn</p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="cursor-pointer rounded-xl bg-[#6E473B] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#57362c]"
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      <section className="mx-auto flex w-full max-w-sm flex-col items-center justify-center rounded-2xl border border-[#E8DED5] bg-[#FAF7F2] px-5 py-4 text-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative h-20 w-20 cursor-pointer rounded-full focus:outline-none focus:ring-4 focus:ring-[#7A5547]/20"
          aria-label="Đổi ảnh đại diện"
        >
          <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#2C3E2B] text-2xl font-black text-white shadow-inner ring-4 ring-white transition group-hover:brightness-90">
            {tempInfo.avatar ? <img src={tempInfo.avatar} alt="Ảnh đại diện" className="h-full w-full object-cover" /> : avatarLabel}
          </span>
          <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#7A5547] text-white shadow-md ring-2 ring-white transition group-hover:bg-[#6C483A]">
            <HiCamera className="h-4 w-4" />
          </span>
        </button>
        <p className="mt-2 text-sm font-black text-[#2C1E15]">Ảnh đại diện</p>
        <p className="mt-1 text-xs font-semibold text-gray-500">Bấm vào ảnh để đổi ảnh đại diện.</p>
        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
      </section>

      <form onSubmit={handleSaveInfo} className="grid grid-cols-1 gap-4 text-sm font-bold text-gray-600 sm:grid-cols-2">
        <div className="space-y-1">
          <label>Họ và tên</label>
          <input
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            type="text"
            disabled={!isEditing}
            value={tempInfo.name || ''}
            onChange={(e) => setTempInfo({ ...tempInfo, name: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-[#F4F1EA]/30 px-4 py-2.5 text-base font-medium text-gray-800 focus:border-[#2C3E2B] focus:outline-none disabled:opacity-75"
          />
        </div>
        <div className="space-y-1">
          <label>Địa chỉ Email</label>
          <input
            required
            type="email"
            autoComplete="email"
            disabled={!isEditing}
            value={tempInfo.email || ''}
            onChange={(e) => setTempInfo({ ...tempInfo, email: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-[#F4F1EA]/30 px-4 py-2.5 text-base font-medium text-gray-800 focus:border-[#2C3E2B] focus:outline-none disabled:opacity-75"
          />
        </div>
        <div className="space-y-1">
          <label>Số điện thoại</label>
          <input
            required
            type="tel"
            inputMode="tel"
            pattern="^(0|\+84)(3|5|7|8|9)\d{8}$"
            autoComplete="tel"
            disabled={!isEditing}
            value={tempInfo.phone || ''}
            onChange={(e) => setTempInfo({ ...tempInfo, phone: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-[#F4F1EA]/30 px-4 py-2.5 text-base font-medium text-gray-800 focus:border-[#2C3E2B] focus:outline-none disabled:opacity-75"
          />
        </div>
        <div className="space-y-1">
          <label>Ngày sinh</label>
          <input
            type="date"
            max={today}
            disabled={!isEditing}
            value={tempInfo.dob || ''}
            onChange={(e) => setTempInfo({ ...tempInfo, dob: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-[#F4F1EA]/30 px-4 py-2.5 text-base font-medium text-gray-500 focus:border-[#2C3E2B] focus:outline-none disabled:opacity-75"
          />
        </div>
        <div className="space-y-1">
          <label>Giới tính</label>
          <GenderDropdown
            disabled={!isEditing}
            value={tempInfo.gender || ''}
            onChange={(value) => setTempInfo({ ...tempInfo, gender: value })}
          />
        </div>
        <div className="space-y-1">
          <label>Địa chỉ thường trú</label>
          <input
            required
            minLength={5}
            maxLength={255}
            type="text"
            autoComplete="street-address"
            disabled={!isEditing}
            value={tempInfo.address || ''}
            onChange={(e) => setTempInfo({ ...tempInfo, address: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-[#F4F1EA]/30 px-4 py-2.5 text-base font-medium text-gray-800 focus:border-[#2C3E2B] focus:outline-none disabled:opacity-75"
          />
        </div>
        {isEditing && (
          <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="cursor-pointer rounded-xl bg-gray-100 px-5 py-2.5 font-bold text-gray-500 hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-[#2C3E2B] px-6 py-2.5 font-bold text-white shadow-md hover:bg-[#1f2d20]"
            >
              Lưu thông tin
            </button>
          </div>
        )}
      </form>
    </div>
  );
}




