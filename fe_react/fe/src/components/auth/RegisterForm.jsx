import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import AuthToast from './AuthToast';

export default function RegisterForm({
  form,
  isSubmitting,
  showConfirmPassword,
  showPassword,
  toast,
  onSubmit,
  onToggleConfirmPassword,
  onTogglePassword,
  onUpdateField,
}) {
  return (
    <>
      <div className="fade-in-active flex-grow flex flex-col justify-start pt-0 h-full">
        <div className="flex items-center gap-4 border-b border-gray-200/50 pb-2 mb-3">
          <div className="flex-shrink-0">
            <Logo />
          </div>
          <div className="text-left flex-grow">
            <h3 className="font-classic text-xl sm:text-2xl font-bold text-[#2C1E15] leading-tight">
              Tạo tài khoản
            </h3>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
              Chỉ vài bước để đặt hoặc cho thuê homestay
            </p>
          </div>
        </div>

        <form className="flex-grow flex flex-col justify-between mt-3 text-left" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                <span className="text-red-500">*</span> Loại tài khoản
              </label>
              <div className="flex bg-gray-200/60 p-1 rounded-full text-xs w-fit border border-gray-300/40">
                <button
                  type="button"
                  className={`px-4 py-1.5 rounded-full transition-all duration-300 font-semibold ${form.accountType === 'host' ? 'bg-[#2C3E2B] text-[#F4F1EA] shadow' : 'text-gray-500'}`}
                  onClick={() => onUpdateField('accountType', 'host')}
                >
                  Chủ nhà
                </button>
                <button
                  type="button"
                  className={`px-4 py-1.5 rounded-full transition-all duration-300 font-semibold ${form.accountType === 'guest' ? 'bg-[#2C3E2B] text-[#F4F1EA] shadow' : 'text-gray-500'}`}
                  onClick={() => onUpdateField('accountType', 'guest')}
                >
                  Khách
                </button>
              </div>
            </div>

            <TextInput
              icon="fa-regular fa-user"
              label="Họ tên"
              name="fullName"
              placeholder="Nguyễn Văn A"
              value={form.fullName}
              onUpdateField={onUpdateField}
            />
            <TextInput
              icon="fa-regular fa-envelope"
              label="Email"
              name="email"
              placeholder="example@gmail.com"
              type="email"
              value={form.email}
              onUpdateField={onUpdateField}
            />
            <PasswordInput
              label="Mật khẩu"
              name="password"
              showPassword={showPassword}
              value={form.password}
              onTogglePassword={onTogglePassword}
              onUpdateField={onUpdateField}
            />
            <PasswordInput
              label="Nhập lại mật khẩu"
              name="confirmPassword"
              showPassword={showConfirmPassword}
              value={form.confirmPassword}
              onTogglePassword={onToggleConfirmPassword}
              onUpdateField={onUpdateField}
            />
            <TextInput
              icon="fa-solid fa-phone"
              label="Số điện thoại"
              name="phoneNumber"
              placeholder="0912345678"
              type="tel"
              value={form.phoneNumber}
              onUpdateField={onUpdateField}
            />
            <TextInput
              icon="fa-regular fa-calendar-days"
              label="Ngày sinh"
              name="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onUpdateField={onUpdateField}
            />
            <SelectInput
              icon="fa-solid fa-venus-mars"
              label="Giới tính"
              name="gender"
              value={form.gender}
              onUpdateField={onUpdateField}
              options={[
                { label: 'Nữ', value: 'female' },
                { label: 'Nam', value: 'male' },
                { label: 'Khác', value: 'other' },
              ]}
            />
            <TextInput
              icon="fa-solid fa-location-dot"
              label="Địa chỉ thường trú"
              name="address"
              placeholder="Ninh Kiều, Cần Thơ"
              value={form.address}
              onUpdateField={onUpdateField}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2C3E2B] hover:bg-[#1a291b] disabled:bg-gray-400 disabled:cursor-not-allowed text-[#F4F1EA] font-semibold py-3 rounded-full shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-200 text-xs mt-4"
          >
            {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="text-center text-[11px] text-gray-400 mt-2.5 flex-shrink-0">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-[#6E473B] font-bold cursor-pointer hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>

      <AuthToast toast={toast} />

      <div className="mt-4 pt-3 border-t border-gray-200/50 text-center flex items-center justify-between text-[11px] text-gray-400 font-medium italic flex-shrink-0">
        <span>© 2026 Cozygo</span>
        <span className="text-[#6E473B]">Chuyến đi ấm áp bên gia đình</span>
      </div>
    </>
  );
}

function TextInput({ icon, label, name, onUpdateField, placeholder, type = 'text', value }) {
  return (
    <div className="space-y-0.5">
      <label className="block text-xs font-semibold text-gray-700">
        <span className="text-red-500">*</span> {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
          <i className={`${icon} text-xs`}></i>
        </span>
        <input
          type={type}
          required
          value={value}
          placeholder={placeholder}
          onChange={(event) => onUpdateField(name, event.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] transition-all text-gray-800"
        />
      </div>
    </div>
  );
}

function SelectInput({ icon, label, name, onUpdateField, options, value }) {
  return (
    <div className="space-y-0.5">
      <label className="block text-xs font-semibold text-gray-700">
        <span className="text-red-500">*</span> {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
          <i className={`${icon} text-xs`}></i>
        </span>
        <select
          required
          value={value}
          onChange={(event) => onUpdateField(name, event.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] transition-all text-gray-800"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function PasswordInput({ label, name, onTogglePassword, onUpdateField, showPassword, value }) {
  return (
    <div className="space-y-0.5">
      <label className="block text-xs font-semibold text-gray-700">
        <span className="text-red-500">*</span> {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
          <i className="fa-solid fa-lock text-xs"></i>
        </span>
        <input
          type={showPassword ? 'text' : 'password'}
          required
          value={value}
          placeholder="********"
          onChange={(event) => onUpdateField(name, event.target.value)}
          className="w-full pl-9 pr-9 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] transition-all text-gray-800"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-pointer hover:text-gray-600 bg-transparent border-0"
          onClick={onTogglePassword}
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
        </button>
      </div>
    </div>
  );
}
