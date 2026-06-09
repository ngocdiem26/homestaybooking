

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layout/AdminLayout';
import Pagination from '../../component/admin/Pagination';
import { MdOutlineRemoveRedEye } from "react-icons/md";

export default function AdminUsers() {
  const navigate = useNavigate();

  // 1. DỮ LIỆU KHỞI TẠO DANH SÁCH NGƯỜI DÙNG
  const [users, setUsers] = useState([
    { id: "USR-001", name: "Trần Thị Thanh Thanh", email: "thanhthanh1995@gmail.com", phone: "0912345678", role: "Khách hàng", status: "Đang hoạt động", dob: "1995-08-12", address: "Ninh Kiều, Cần Thơ" },
    { id: "USR-002", name: "Mộc Miên", email: "mienmoc@gmail.com", phone: "0987654321", role: "Khách hàng", status: "Đang hoạt động", dob: "1998-03-20", address: "Đà Lạt, Lâm Đồng" },
    { id: "USR-003", name: "Customer Test", email: "cust_test@example.com", phone: "0900112233", role: "Khách hàng", status: "Đang hoạt động", dob: "2000-01-01", address: "Quận 1, TP. Hồ Chí Minh" },
    { id: "USR-004", name: "Thiên Lê", email: "ownerthien@example.com", phone: "0933445566", role: "Chủ nhà", status: "Đang hoạt động", dob: "1990-11-05", address: "Vũng Tàu, Bà Rịa" },
    { id: "USR-005", name: "Customer Four", email: "customer4@example.com", phone: "0944556677", role: "Khách hàng", status: "Bị khóa", dob: "1993-05-15", address: "Sapa, Lào Cai" },
    { id: "USR-006", name: "Customer Three", email: "customer3@example.com", phone: "0955667788", role: "Chủ nhà", status: "Đang hoạt động", dob: "1988-07-25", address: "Phú Quốc, Kiên Giang" },
  ]);

  // 2. CÁC STATE QUẢN LÝ BỘ LỌC, PHÂN TRANG VÀ POPUP MODAL
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 4;

  // 3. LOGIC XỬ LÝ KHÓA / MỞ KHÓA TÀI KHOẢN
  const handleToggleBlock = (id, currentStatus) => {
    const action = currentStatus === "Đang hoạt động" ? "KHÓA" : "MỞ KHÓA";
    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này không?`)) {
      setUsers(users.map(user => {
        if (user.id === id) {
          const nextStatus = currentStatus === "Đang hoạt động" ? "Bị khóa" : "Đang hoạt động";
          return { ...user, status: nextStatus };
        }
        return user;
      }));
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser(prev => ({
          ...prev,
          status: currentStatus === "Đang hoạt động" ? "Bị khóa" : "Đang hoạt động"
        }));
      }
    }
  };

  // 4. LOGIC XỬ LÝ CHUYỂN ĐỔI VAI TRÒ
  const handleChangeRole = (id, currentRole) => {
    const nextRole = currentRole === "Khách hàng" ? "Chủ nhà" : "Khách hàng";
    if (window.confirm(`Chuyển đổi vai trò tài khoản này thành [${nextRole}]?`)) {
      setUsers(users.map(user => user.id === id ? { ...user, role: nextRole } : user));
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser(prev => ({ ...prev, role: nextRole }));
      }
    }
  };

  // 5. BỘ LỌC DỮ LIỆU
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // 6. TÍNH TOÁN PHÂN TRANG
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <>
      <AdminLayout>
          {/* Thay đổi mt-0 và -mt-6 để kéo toàn bộ nội dung ép sát lên phía trên Header */}
          <div className="space-y-5 animate-fade-in text-left text-sm -mt-6">
            
            {/* ==========================================
                HÀNG 1: NÚT QUAY VỀ NẰM ĐỘC LẬP TRÊN CÙNG
              ========================================== */}
            <div className="flex justify-start">
              <button 
                onClick={() => navigate('/admin')}
                className="inline-flex items-center justify-center gap-1.5 text-xs bg-white hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-xl font-bold transition duration-200 cursor-pointer shadow-sm active:scale-95 border border-gray-200/40 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                <span>Về bảng điều khiển</span>
              </button>
            </div>

            {/* ==========================================
                HÀNG 2: KHỐI TIÊU ĐỀ CHÍNH NỀN TRẮNG ĐỔ BÓNG
              ========================================== */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 bg-[#2C3E2B]/10 rounded-xl flex items-center justify-center text-[#2C3E2B] shrink-0 border border-[#2C3E2B]/5 shadow-inner mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-2.533-3.076c-1.3-.443-2.617-.796-3.928-1.056a8.844 8.844 0 00-.73 2.25c-.275 1.065-.738 2.197-1.555 2.462zM3.623 18.548a9.337 9.337 0 014.122-.952 9.38 9.38 0 012.625.372c-.817-.265-1.28-1.397-1.555-2.462a8.844 8.844 0 01-.73-2.25c-1.311.26-2.629.613-3.928 1.056A4.125 4.125 0 001 17.407a9.337 9.337 0 012.623 1.141zM12 12a3 3 0 100-6 3 3 0 000 6zM3.53 9.17a2 2 0 11-2.288 3.276 2 2 0 012.288-3.276zM22.759 12.446a2 2 0 11-2.288-3.276 2 2 0 012.288 3.276zM18.156 21.036H5.844c-.72 0-1.2-.614-1.05-1.312a7.125 7.125 0 0113.413 0c.15.698-.33 1.312-1.051 1.312z" />
                  </svg>
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
              
              <div className="flex bg-[#ffffff] p-1.5 rounded-xl font-bold text-[11px] shadow-inner border border-gray-300/30 shrink-0 h-fit self-start lg:self-center">
                <button 
                  onClick={() => { setRoleFilter('All'); setCurrentPage(1); }} 
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${roleFilter === 'All' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Tất cả ({users.length})
                </button>
                <button 
                  onClick={() => { setRoleFilter('Khách hàng'); setCurrentPage(1); }} 
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${roleFilter === 'Khách hàng' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <span>👤</span> Khách hàng
                </button>
                <button 
                  onClick={() => { setRoleFilter('Chủ nhà'); setCurrentPage(1); }} 
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${roleFilter === 'Chủ nhà' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <span>🏡</span> Chủ nhà
                </button>
              </div>

            </div>

            {/* ==========================================
                HÀNG 3: KHU VỰC CÔNG CỤ TRA CỨU & BẢNG SÁT NHAU
              ========================================== */}
            <div className="space-y-4">
              
              {/* Thanh Tìm kiếm và Làm mới */}
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="bg-white px-4 h-11 rounded-xl border border-gray-200/80 shadow-sm flex items-center flex-grow group focus-within:border-[#2C3E2B]/50 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-gray-400 mr-2.5 group-focus-within:text-[#2C3E2B] transition">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm theo họ tên, địa chỉ email..." 
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-transparent border-none text-sm text-gray-800 focus:outline-none placeholder-gray-400 font-medium"
                  />
                </div>

                <button 
                  onClick={() => { setSearchTerm(''); setRoleFilter('All'); setCurrentPage(1); }}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#6E473B] font-bold px-4 h-11 rounded-xl bg-white border border-gray-200/80 shadow-sm hover:shadow transition duration-200 cursor-pointer shrink-0 active:scale-95 border-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>Làm mới</span>
                </button>
              </div>

              {/* Bảng danh sách người dùng */}
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
                      {currentUsers.length > 0 ? (
                        currentUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50/40 transition">
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-[#2C3E2B] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-gray-900 font-bold text-base leading-tight">{user.name}</p>
                                  <p className="text-xs text-gray-400 font-mono tracking-tight mt-0.5">{user.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-sm text-gray-500">{user.email}</td>
                            <td className="p-4 text-center">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${user.role === 'Chủ nhà' ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 'bg-blue-50 text-blue-700 border-blue-200/60'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 text-sm ${user.status === 'Đang hoạt động' ? 'text-green-600' : 'text-red-500'}`}>
                                <span className={`w-2 h-2 rounded-full ${user.status === 'Đang hoạt động' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {user.status}
                              </span>
                            </td>
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center justify-end gap-2 align-middle">
                                
                                {/* 1. NÚT CHI TIẾT */}
                                <button 
                                  onClick={() => setSelectedUser(user)}
                                  className="inline-flex items-center justify-center gap-1.5 text-xs bg-[#2C3E2B]/10 hover:bg-[#2C3E2B]/20 text-[#2C3E2B] px-3 h-8 rounded-xl font-bold transition duration-200 cursor-pointer shadow-sm active:scale-95 border-none"
                                >
                                  <MdOutlineRemoveRedEye className="w-4 h-4 shrink-0" />
                                  <span>Chi tiết</span>
                                </button>

                                {/* 2. NÚT KHÓA / MỞ KHÓA */}
                                <button 
                                  onClick={() => handleToggleBlock(user.id, user.status)}
                                  className={`inline-flex items-center justify-center gap-1.5 text-xs px-3 h-8 rounded-xl transition duration-200 cursor-pointer font-bold shadow-sm active:scale-95 border-none
                                    ${user.status === 'Đang hoạt động' 
                                      ? 'bg-red-50 hover:bg-red-100/80 text-red-600' 
                                      : 'bg-green-50 hover:bg-green-100/80 text-green-600'}`}
                                >
                                  {user.status === 'Đang hoạt động' ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
                                      <path d="M18 1.5c-2.9 0-5.25 2.35-5.25 5.25v3.75a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3H14.25V6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 101.5 0A5.25 5.25 0 0018 1.5z" />
                                    </svg>
                                  )}
                                  <span>{user.status === 'Đang hoạt động' ? 'Khóa' : 'Mở khóa'}</span>
                                </button>

                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-gray-400 italic">Không tìm thấy kết quả người dùng phù hợp.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* THANH PHÂN TRANG */}
                {/* Sử dụng Component phân trang dùng chung */}
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
      </AdminLayout>
      {/* POPUP MODAL CHI TIẾT NGƯỜI DÙNG */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-left text-sm">
          <div className="bg-[#F4F1EA] max-w-md w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-5 relative font-semibold text-gray-600">
            <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none">✖</button>
            
            <div className="text-center border-b border-gray-200 pb-3 space-y-2">
              <div className="w-14 h-14 bg-[#2C3E2B] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto shadow-sm">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#2C1E15]">{selectedUser.name}</h3>
                <p className="text-xs text-gray-400 font-mono">{selectedUser.id}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <p><span className="text-gray-400 inline-block w-28">Địa chỉ Email:</span> <span className="text-gray-800 font-mono font-bold">{selectedUser.email}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Số điện thoại:</span> <span className="text-gray-800 font-bold">{selectedUser.phone}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Ngày sinh:</span> <span className="text-gray-800 font-medium">{selectedUser.dob}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Địa chỉ cư trú:</span> <span className="text-gray-800 font-medium">{selectedUser.address}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Vai trò hiện tại:</span> 
                <span className={`ml-1 font-bold text-xs px-2 py-0.5 rounded border ${selectedUser.role === 'Chủ nhà' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                  {selectedUser.role}
                </span>
              </p>
              <p><span className="text-gray-400 inline-block w-28">Trạng thái:</span> 
                <span className={`ml-1 font-bold text-xs ${selectedUser.status === 'Đang hoạt động' ? 'text-green-600' : 'text-red-500'}`}>
                  {selectedUser.status}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200/60">
              <button 
                onClick={() => handleChangeRole(selectedUser.id, selectedUser.role)}
                className="inline-flex items-center justify-center gap-1.5 bg-white border border-[#2C3E2B] text-[#2C3E2B] h-10 rounded-xl text-xs font-bold hover:bg-gray-50 transition cursor-pointer text-center shadow-sm"
              >
                🔄 Chuyển vai trò
              </button>
              <button 
                onClick={() => handleToggleBlock(selectedUser.id, selectedUser.status)}
                className={`inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-bold text-white transition cursor-pointer text-center shadow-sm border-none
                  ${selectedUser.status === 'Đang hoạt động' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {selectedUser.status === 'Đang hoạt động' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18 1.5c-2.9 0-5.25 2.35-5.25 5.25v3.75a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3H14.25V6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 101.5 0A5.25 5.25 0 0018 1.5z" />
                  </svg>
                )}
                <span>{selectedUser.status === 'Đang hoạt động' ? 'Khóa tài khoản' : 'Mở tài khoản'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}