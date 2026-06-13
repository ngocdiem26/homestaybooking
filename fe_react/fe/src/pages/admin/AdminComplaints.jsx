
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/common/Pagination';

export default function AdminComplaints() {
  const navigate = useNavigate();

  // 1. DỮ LIỆU KHIẾU NẠI VỚI TRẠNG THÁI MẶC ĐỊNH "Chưa xử lý"
  const [complaints, setComplaints] = useState([
    { id: "KNI-08", type: "Đơn đặt phòng", bookingId: "BKG-325", customerName: "Trần Thị Thanh Thanh", totalAmount: "4.200.000đ", title: "Hủy phòng do sự cố cá nhân", content: "Khách hàng yêu cầu hỗ trợ hoàn tiền cọc do lịch trình thay đổi đột xuất.", status: "Chưa xử lý", time: "08/12/2025 21:07" },
    { id: "KNI-07", type: "Vấn đề chung", bookingId: "BKG-324", customerName: "Mộc Miên", totalAmount: "1.800.000đ", title: "Giao homestay không đúng mô tả", content: "Tiện nghi phòng không có máy lạnh như bài viết đã đăng tải.", status: "Đã xử lý", time: "30/11/2025 10:00" },
    { id: "KNI-06", type: "Đơn đặt phòng", bookingId: "BKG-323", customerName: "Nguyễn Văn An", totalAmount: "1.320.000đ", title: "Giao nhà không đúng ảnh", content: "Nhà nhận thực tế khác xa hình ảnh cung cấp trên hệ thống.", status: "Đang xử lý", time: "26/11/2025 12:29" },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBookingDetailOpen, setIsBookingDetailOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Xử lý lọc tìm kiếm
  const filteredComplaints = complaints.filter(c => 
    (statusFilter === 'All' || c.status === statusFilter) &&
    (c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const currentItems = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Thay đổi trạng thái trực tiếp từ bảng
  const handleStatusChange = (id, newStatus) => {
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  // Xử lý mở xem chi tiết khiếu nại
  const openDetailModal = (complaint) => {
    setActiveComplaint(complaint);
    setIsDetailModalOpen(true);
  };

  // Xử lý mở xem chi tiết đơn đặt phòng liên quan
  const openBookingDetail = (complaint) => {
    setActiveComplaint(complaint);
    setIsBookingDetailOpen(true);
  };

  // Xử lý mở form phản hồi
  const openReplyModal = (complaint) => {
    // Chỉ khóa nút phản hồi khi trạng thái là "Đã xử lý"
    if (complaint.status === 'Đã xử lý') return;
    setActiveComplaint(complaint);
    setReplyContent('');
    setIsReplyModalOpen(true);
  };

  // Xử lý gửi phản hồi
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return alert("Vui lòng nhập nội dung phản hồi!");
    
    // Nếu khiếu nại đang là "Chưa xử lý" thì tự động chuyển sang "Đang xử lý", ngược lại giữ nguyên trạng thái hiện tại
    setComplaints(complaints.map(c => 
      c.id === activeComplaint.id ? { 
        ...c, 
        status: c.status === 'Chưa xử lý' ? 'Đang xử lý' : c.status 
      } : c
    ));
    
    setIsReplyModalOpen(false);
    setReplyContent('');
    alert("Phản hồi khiếu nại thành công!");
  };

  return (
    <>
        <AdminLayout>
            <div className="space-y-5 animate-fade-in text-left text-sm -mt-6">
                
                {/* NÚT QUAY VỀ */}
                <div className="flex justify-start">
                <button 
                    onClick={() => navigate('/admin')}
                    className="inline-flex items-center justify-center gap-1.5 text-xs bg-white hover:bg-gray-100 text-gray-600 px-3.5 py-1.5 rounded-xl font-bold transition duration-200 cursor-pointer shadow-sm active:scale-95 border border-gray-200/40 focus:outline-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd"/></svg>
                    <span>Về bảng điều khiển</span>
                </button>
                </div>

                {/* HEADER */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#2C3E2B]/10 rounded-xl flex items-center justify-center text-[#2C3E2B] shrink-0 border border-[#2C3E2B]/5 shadow-inner mt-0.5">
                    <span className="text-xl">💬</span>
                    </div>
                    <div>
                    <h2 className="font-serif text-xl md:text-2xl font-bold text-[#2C1E15]">Quản lý khiếu nại</h2>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-lg mt-0.5">
                        Tiếp nhận, cập nhật trạng thái xử lý và giải quyết phản hồi từ khách hàng.
                    </p>
                    </div>
                </div>
                </div>

                {/* TÌM KIẾM & BỘ LỌC */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-1.5 bg-[#ffffff] p-1 rounded-xl font-bold text-[11px] shadow-inner border border-gray-300/30 overflow-x-auto max-w-full shrink-0 h-fit scrollbar-none">
                    <button onClick={() => { setStatusFilter('All'); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'All' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tất cả ({complaints.length})</button>
                    <button onClick={() => { setStatusFilter('Chưa xử lý'); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Chưa xử lý' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Chưa xử lý</button>
                    <button onClick={() => { setStatusFilter('Đang xử lý'); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Đang xử lý' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Đang xử lý</button>
                    <button onClick={() => { setStatusFilter('Đã xử lý'); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Đã xử lý' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Đã xử lý</button>
                </div>
                
                <div className="flex items-center flex-grow max-w-xs gap-2">
                    <input 
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow h-9 px-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 text-xs" 
                    placeholder="Tìm ID hoặc tiêu đề..." 
                    />
                    <button onClick={() => { setSearchTerm(''); setStatusFilter('All'); }} className="h-9 px-3.5 bg-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition border-none cursor-pointer">Làm mới</button>
                </div>
                </div>

                {/* BẢNG DỮ LIỆU */}
                <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed min-w-[950px]">
                    <thead>
                        <tr className="bg-gray-50/70 border-b border-gray-200/60 text-gray-500 font-bold uppercase text-xs tracking-wider">
                        <th className="p-4 w-[8%]">ID</th>
                        <th className="p-4 w-[10%]">Loại</th>
                        <th className="p-4 w-[10%]">Đơn #</th>
                        <th className="p-4 w-[18%]">Tiêu đề</th>
                        <th className="p-4 w-[12%] text-center">Trạng thái</th>
                        <th className="p-4 w-[14%]">Thời gian</th>
                        <th className="p-4 w-[28%] text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold text-gray-700 text-sm">
                        {currentItems.length > 0 ? (
                        currentItems.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50/40 transition">
                            <td className="p-4 font-mono font-bold text-gray-900 truncate">{c.id}</td>
                            <td className="p-4 truncate">{c.type}</td>
                            <td className="p-4 font-mono text-xs text-blue-600 font-bold truncate">{c.bookingId}</td>
                            <td className="p-4 truncate font-bold" title={c.title}>{c.title}</td>
                            <td className="p-4 text-center truncate">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block max-w-full truncate
                                ${c.status === 'Đã xử lý' ? 'bg-green-50 text-green-700 border-green-200/50' : ''}
                                ${c.status === 'Đang xử lý' ? 'bg-amber-50 text-amber-700 border-amber-200/50' : ''}
                                ${c.status === 'Chờ xác nhận' || c.status === 'Chưa xử lý' ? 'bg-gray-100 text-gray-600 border-gray-200' : ''}
                                `}>
                                {c.status === 'Chờ xác nhận' ? 'Chưa xử lý' : c.status}
                                </span>
                            </td>
                            <td className="p-4 font-mono text-xs text-gray-400 truncate">{c.time}</td>
                            
                            <td className="p-4 whitespace-nowrap">
                                <div className="flex items-center justify-end gap-2 shrink-0">
                                
                                {/* Sửa dropdown trạng thái */}
                                <select 
                                    value={c.status} 
                                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                                    className={`h-9 px-3 border rounded-xl text-xs font-bold cursor-pointer appearance-none bg-no-repeat pr-6 focus:outline-none focus:ring-2 shadow-sm
                                    ${c.status === 'Chưa xử lý' ? 'bg-gray-50 border-gray-200 text-gray-600 focus:ring-gray-200/50' : ''}
                                    ${c.status === 'Đang xử lý' ? 'bg-amber-50 border-amber-200/50 text-amber-700 focus:ring-amber-200/50' : ''}
                                    ${c.status === 'Đã xử lý' ? 'bg-green-50 border-green-200/50 text-green-700 focus:ring-green-200/50' : ''}
                                    `}
                                    style={{
                                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3e%3cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3e%3c/svg%3e")`,
                                    backgroundPosition: 'right 6px center',
                                    backgroundSize: '16px 16px'
                                    }}
                                >
                                    <option value="Chưa xử lý">Chưa xử lý</option>
                                    <option value="Đang xử lý">Đang xử lý</option>
                                    <option value="Đã xử lý">Đã xử lý</option>
                                </select>

                                {/* NÚT XEM KHIẾU NẠI */}
                                <button onClick={() => openDetailModal(c)} className="inline-flex items-center justify-center w-9 h-9 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition cursor-pointer shrink-0 shadow-sm" title="Xem chi tiết khiếu nại">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>

                                {/* NÚT XEM ĐƠN ĐẶT PHÒNG */}
                                <button onClick={() => openBookingDetail(c)} className="inline-flex items-center justify-center w-9 h-9 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl hover:bg-blue-100 transition cursor-pointer shrink-0 shadow-sm" title="Xem chi tiết đơn đã khiếu nại">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.125H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                </button>

                                {/* NÚT PHẢN HỒI - Chỉ khóa khi trạng thái là "Đã xử lý" */}
                                <button 
                                    onClick={() => openReplyModal(c)} 
                                    disabled={c.status === 'Đã xử lý'}
                                    className={`inline-flex items-center justify-center gap-1.5 text-xs px-3.5 h-9 rounded-xl font-bold transition duration-200 cursor-pointer border shrink-0 shadow-sm
                                    ${c.status === 'Đã xử lý' ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#2C3E2B]/10 border-[#2C3E2B]/20 hover:bg-[#2C3E2B]/15 text-[#2C3E2B] active:scale-95'}`}
                                    title={c.status === 'Đã xử lý' ? 'Đã phản hồi xong' : 'Phản hồi khiếu nại'}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a2.625 2.625 0 015.625 0m5.625 0H8.625m5.625 4.125H8.625m4.125-8.25h4.125m-4.125 4.125h4.125m-4.125 4.125h4.125m-4.125 4.125h4.125m-10.5 4.125V4.125c0-.621.504-1.125 1.125-1.125h8.25c.621 0 1.125.504 1.125.125v15.75c0 .621-.504 1.125-1.125 1.125h-8.25c-.621 0-1.125-.504-1.125-1.125z" />
                                    </svg>
                                    <span>{c.status === 'Đã xử lý' ? 'Đã phản hồi' : 'Phản hồi'}</span>
                                </button>

                                </div>
                            </td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan="7" className="p-8 text-center text-gray-400 italic">Không tìm thấy khiếu nại nào phù hợp.</td>
                        </tr>
                        )}
                    </tbody>
                    </table>
                </div>
                <Pagination 
                    currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}
                    totalItems={filteredComplaints.length} itemName="khiếu nại"
                />
                </div>
            </div>
        </AdminLayout>

        {/* MODAL 1: XEM CHI TIẾT THÔNG TIN KHIẾU NẠI */}
      {isDetailModalOpen && activeComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in text-left text-sm">
          <div className="bg-[#F4F1EA] max-w-sm w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative font-semibold text-gray-600">
            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none">✖</button>
            <div className="border-b border-gray-200 pb-2">
              <h3 className="font-serif text-lg font-bold text-[#2C1E15]">Thông tin khiếu nại</h3>
              <p className="text-xs text-gray-400 font-mono">ID: {activeComplaint.id}</p>
            </div>
            
            <div className="space-y-3 text-xs md:text-sm">
              <p><span className="text-gray-400 inline-block w-28">Phân loại:</span> <span className="text-gray-800 font-bold">{activeComplaint.type}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Mã đơn #:</span> <span className="text-blue-600 font-mono font-bold">{activeComplaint.bookingId}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Tiêu đề:</span> <span className="text-gray-800 font-bold">{activeComplaint.title}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Nội dung:</span> <span className="text-gray-700 font-medium leading-relaxed">{activeComplaint.content}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Thời gian:</span> <span className="text-gray-500 font-mono text-xs">{activeComplaint.time}</span></p>
            </div>

            <div className="pt-2">
              <button onClick={() => setIsDetailModalOpen(false)} className="w-full bg-[#2C3E2B] text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm border-none cursor-pointer">Đóng cửa sổ</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: XEM CHI TIẾT ĐƠN ĐẶT PHÒNG KHIẾU NẠI */}
      {isBookingDetailOpen && activeComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-left text-sm">
          <div className="bg-[#F4F1EA] max-w-sm w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative font-semibold text-gray-600">
            <button onClick={() => setIsBookingDetailOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none">✖</button>
            <div className="border-b border-gray-200 pb-2">
              <h3 className="font-serif text-lg font-bold text-[#2C1E15]">Chi tiết đơn đã khiếu nại</h3>
              <p className="text-xs text-gray-400 font-mono">Mã đơn: {activeComplaint.bookingId}</p>
            </div>
            
            <div className="space-y-3 text-xs md:text-sm">
              <p><span className="text-gray-400 inline-block w-32">Khách hàng:</span> <span className="text-gray-800 font-bold">{activeComplaint.customerName}</span></p>
              <p><span className="text-gray-400 inline-block w-32">Tổng tiền thanh toán:</span> <span className="text-[#6E473B] font-bold">{activeComplaint.totalAmount}</span></p>
              <p><span className="text-gray-400 inline-block w-32">Loại hình dịch vụ:</span> <span className="text-gray-700 font-medium">{activeComplaint.type}</span></p>
            </div>

            <div className="pt-2">
              <button onClick={() => setIsBookingDetailOpen(false)} className="w-full bg-[#2C3E2B] text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm border-none cursor-pointer">Đóng cửa sổ</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PHẢN HỒI KHIẾU NẠI */}
      {isReplyModalOpen && activeComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in text-left text-sm">
          <div className="bg-[#F4F1EA] max-w-md w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative font-semibold text-gray-600 max-h-[85vh] overflow-y-auto">
            <button onClick={() => setIsReplyModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none">✖</button>
            <div className="border-b border-gray-200 pb-2">
              <h3 className="font-serif text-lg font-bold text-[#2C1E15]">Xử lý khiếu nại</h3>
              <p className="text-xs text-gray-400 font-mono">ID: {activeComplaint.id}</p>
            </div>
            
            <div className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-inner space-y-2 text-xs">
              <p className="text-gray-400 font-bold">Nội dung khiếu nại của khách:</p>
              <p className="text-gray-700 font-medium bg-gray-50 p-2.5 rounded-lg border border-gray-100">{activeComplaint.content}</p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-3">
              <div className="space-y-1">
                <label className="text-gray-400 text-xs font-bold">Nội dung phản hồi:</label>
                <textarea 
                  rows="3" value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/20 focus:outline-none text-xs" 
                  placeholder="Nhập thông điệp hoặc phương án giải quyết cho khách hàng..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button type="button" onClick={() => setIsReplyModalOpen(false)} className="bg-gray-200 py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer">Hủy</button>
                <button type="submit" className="bg-[#2C3E2B] text-white py-2.5 rounded-xl text-xs font-bold border-none cursor-pointer">Lưu phản hồi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}