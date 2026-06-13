import { MdOutlineRemoveRedEye } from 'react-icons/md';
import Pagination from '../../common/Pagination';
import AdminUserDetailModal from './AdminUserDetailModal';
import { getAvatarLabel, getRoleLabel, getStatusLabel } from './adminUserFormatters';

export default function AdminUsersView({
  currentPage,
  currentUsers,
  errorMessage,
  filteredUsers,
  indexOfFirstUser,
  indexOfLastUser,
  isLoading,
  onBackToDashboard,
  onChangeRole,
  onRefresh,
  onResetFilters,
  onRoleFilterChange,
  onSearchChange,
  onSelectUser,
  onToggleStatus,
  roleFilter,
  searchTerm,
  selectedUser,
  setCurrentPage,
  setSelectedUser,
  totalPages,
  users,
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
              <span className="text-xl font-black">U</span>
            </div>
            <div className="space-y-0.5">
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#2C1E15]">
                Quản lý người dùng
              </h2>
              <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-2xl">
                Tra cứu danh sách thành viên, phân quyền vai trò tài khoản và kiểm soát trạng thái khóa/mở khóa hệ thống.
              </p>
            </div>
          </div>

          <div className="flex bg-white p-1.5 rounded-xl font-bold text-[11px] shadow-inner border border-gray-300/30 shrink-0 h-fit self-start lg:self-center">
            <FilterButton count={users.length} isActive={roleFilter === 'ALL'} label="Tất cả" onClick={() => onRoleFilterChange('ALL')} />
            <FilterButton isActive={roleFilter === 'CUSTOMER'} label="Khách hàng" onClick={() => onRoleFilterChange('CUSTOMER')} />
            <FilterButton isActive={roleFilter === 'HOST'} label="Chủ nhà" onClick={() => onRoleFilterChange('HOST')} />
            <FilterButton isActive={roleFilter === 'ADMIN'} label="Admin" onClick={() => onRoleFilterChange('ADMIN')} />
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
                placeholder="Tìm kiếm theo họ tên, email, số điện thoại..."
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
                    <th className="p-4">Người dùng</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-center">Vai trò</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400 italic">
                        Đang tải danh sách người dùng...
                      </td>
                    </tr>
                  ) : currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <UserRow
                        key={user.id}
                        onSelectUser={onSelectUser}
                        onToggleStatus={onToggleStatus}
                        user={user}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400 italic">
                        Không tìm thấy người dùng phù hợp.
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
              totalItems={filteredUsers.length}
              indexOfFirstItem={indexOfFirstUser}
              indexOfLastItem={indexOfLastUser}
              itemName="người dùng"
            />
          </div>
        </div>
      </div>

      <AdminUserDetailModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onChangeRole={onChangeRole}
        onToggleStatus={onToggleStatus}
      />
    </>
  );
}

function FilterButton({ count, isActive, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${isActive ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
      type="button"
    >
      {label}{typeof count === 'number' ? ` (${count})` : ''}
    </button>
  );
}

function UserRow({ onSelectUser, onToggleStatus, user }) {
  const isActive = user.status === 'ACTIVE';

  return (
    <tr className="hover:bg-gray-50/40 transition">
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#2C3E2B] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            {getAvatarLabel(user.name)}
          </div>
          <div>
            <p className="text-gray-900 font-bold text-base leading-tight">{user.name}</p>
            <p className="text-xs text-gray-400 font-mono tracking-tight mt-0.5">{user.code}</p>
          </div>
        </div>
      </td>
      <td className="p-4 font-mono text-sm text-gray-500">{user.email}</td>
      <td className="p-4 text-center">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${user.role === 'HOST' ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 'bg-blue-50 text-blue-700 border-blue-200/60'}`}>
          {getRoleLabel(user.role)}
        </span>
      </td>
      <td className="p-4 text-center">
        <span className={`inline-flex items-center gap-1.5 text-sm ${isActive ? 'text-green-600' : 'text-red-500'}`}>
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {getStatusLabel(user.status)}
        </span>
      </td>
      <td className="p-4 text-right whitespace-nowrap">
        <div className="inline-flex items-center justify-end gap-2 align-middle">
          <button
            onClick={() => onSelectUser(user)}
            className="inline-flex items-center justify-center gap-1.5 text-xs bg-[#2C3E2B]/10 hover:bg-[#2C3E2B]/20 text-[#2C3E2B] px-3 h-8 rounded-xl font-bold transition duration-200 cursor-pointer shadow-sm active:scale-95 border-none"
            type="button"
          >
            <MdOutlineRemoveRedEye className="w-4 h-4 shrink-0" />
            <span>Chi tiết</span>
          </button>

          <button
            onClick={() => onToggleStatus(user)}
            className={`inline-flex items-center justify-center gap-1.5 text-xs px-3 h-8 rounded-xl transition duration-200 cursor-pointer font-bold shadow-sm active:scale-95 border-none ${isActive ? 'bg-red-50 hover:bg-red-100/80 text-red-600' : 'bg-green-50 hover:bg-green-100/80 text-green-600'}`}
            type="button"
          >
            <span>{isActive ? 'Khóa' : 'Mở khóa'}</span>
          </button>
        </div>
      </td>
    </tr>
  );
}
