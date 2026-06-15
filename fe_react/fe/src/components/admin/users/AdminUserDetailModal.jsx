import ModalPortal from '../../common/ModalPortal';
import {
  getAvatarLabel,
  getGenderLabel,
  getRoleLabel,
  getStatusLabel,
} from './adminUserFormatters';

export default function AdminUserDetailModal({
  onChangeRole,
  onClose,
  onToggleStatus,
  user,
}) {
  if (!user) {
    return null;
  }

  const isActive = user.status === 'ACTIVE';
  const canChangeRole = user.role !== 'ADMIN';

  return (
    <ModalPortal>
      <div className="bg-[#F4F1EA] max-w-md w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-5 relative font-semibold text-gray-600">
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

        <div className="text-center border-b border-gray-200 pb-3 space-y-2">
          <div className="w-14 h-14 bg-[#2C3E2B] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto shadow-sm">
            {getAvatarLabel(user.name)}
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C1E15]">{user.name}</h3>
            <p className="text-xs text-gray-400 font-mono">{user.code}</p>
          </div>
        </div>

        <div className="space-y-3 text-xs md:text-sm">
          <InfoRow label="Email" value={user.email} isMono />
          <InfoRow label="Số điện thoại" value={user.phone || 'Chưa cập nhật'} />
          <InfoRow label="Ngày sinh" value={user.dob || 'Chưa cập nhật'} />
          <InfoRow label="Giới tính" value={getGenderLabel(user.gender)} />
          <InfoRow label="Địa chỉ" value={user.address || 'Chưa cập nhật'} />
          <p>
            <span className="text-gray-400 inline-block w-28">Vai trò:</span>
            <span className={`ml-1 font-bold text-xs px-2 py-0.5 rounded border ${user.role === 'HOST' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
              {getRoleLabel(user.role)}
            </span>
          </p>
          <p>
            <span className="text-gray-400 inline-block w-28">Trạng thái:</span>
            <span className={`ml-1 font-bold text-xs ${isActive ? 'text-green-600' : 'text-red-500'}`}>
              {getStatusLabel(user.status)}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200/60">
          <button
            disabled={!canChangeRole}
            onClick={() => onChangeRole(user)}
            className="inline-flex items-center justify-center gap-1.5 bg-white border border-[#2C3E2B] text-[#2C3E2B] h-10 rounded-xl text-xs font-bold hover:bg-gray-50 transition cursor-pointer text-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            Đổi vai trò
          </button>
          <button
            onClick={() => onToggleStatus(user)}
            className={`inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold text-white transition cursor-pointer text-center shadow-sm border-none ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            type="button"
          >
            {isActive ? 'Khóa tài khoản' : 'Mở tài khoản'}
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}

function InfoRow({ isMono = false, label, value }) {
  return (
    <p>
      <span className="text-gray-400 inline-block w-28">{label}:</span>
      <span className={`text-gray-800 font-bold ${isMono ? 'font-mono' : ''}`}>{value}</span>
    </p>
  );
}
