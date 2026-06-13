import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/common/Pagination';
import { BiCommentDetail } from "react-icons/bi";

export default function AdminReviews() {
  const navigate = useNavigate();

  // 1. DỮ LIỆU GIẢ LẬP ĐÁNH GIÁ
  const [reviews, setReviews] = useState([
    { id: "REV-01", star: 5, customerName: "Trần Thị Thanh Thanh", content: "Quá tuyệt dịch vụ...", date: "30/11/2025 18:13", bookingId: "#303", homestayName: "Bungalow Gỗ Bên Sông", status: "Hiển thị" },
    { id: "REV-02", star: 5, customerName: "Mộc Miên", content: "Dịch vụ rất ok sẽ...", date: "25/11/2025 19:06", bookingId: "#270", homestayName: "Nhà Gỗ Thông Đà Lạt", status: "Hiển thị" },
    { id: "REV-03", star: 4, customerName: "Nguyễn Văn An", content: "Tuyệt lắm nha", date: "12/11/2025 16:30", bookingId: "#266", homestayName: "Nhà Gỗ Thông Đà Lạt", status: "Đã ẩn" },
    { id: "REV-04", star: 4, customerName: "Phạm Văn B", content: "Quá ok tuyệt lắm", date: "07/11/2025 14:02", bookingId: "#265", homestayName: "Homestay Rừng Tràm Mộc", status: "Hiển thị" },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Xử lý ẩn/hiện đánh giá
  const handleToggleHide = (id) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: r.status === 'Đã ẩn' ? 'Hiển thị' : 'Đã ẩn' } : r));
  };

  // Xử lý xóa đánh giá vĩnh viễn
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này không?")) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  // Xử lý mở xem chi tiết đánh giá
  const openDetailModal = (review) => {
    setActiveReview(review);
    setIsDetailModalOpen(true);
  };

  // Lọc và tìm kiếm
  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.homestayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const currentItems = filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Hàm render số sao trực quan
  const renderStars = (count) => {
    return "⭐️".repeat(count);
  };

  return (
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
              <span className="text-xl">⭐</span>
            </div>
            <div>
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#2C1E15]">Quản lý đánh giá</h2>
              <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-lg mt-0.5">
                Kiểm duyệt đánh giá, phản hồi và ẩn các đánh giá vi phạm tiêu chuẩn cộng đồng trên hệ thống.
              </p>
            </div>
          </div>
        </div>

        {/* TÌM KIẾM & BỘ LỌC */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 w-full">
              <div className="flex bg-[#ffffff] p-1.5 font-bold text-[11px] rounded-xl border-gray-200/80 shadow-sm overflow-x-auto max-w-full shrink-0 h-fit scrollbar-none">
              <button onClick={() => { setStatusFilter('All'); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'All' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tất cả ({reviews.length})</button>
              <button onClick={() => { setStatusFilter('Hiển thị'); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Hiển thị' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Đang hiển thị</button>
              <button onClick={() => { setStatusFilter('Đã ẩn'); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Đã ẩn' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Đã ẩn</button>
            </div>

            <div className="flex items-center flex-grow gap-3 max-w-xl">
              <div className="bg-white px-4 h-10 rounded-xl border border-gray-200/80 shadow-sm flex items-center flex-grow group focus-within:border-[#2C3E2B]/50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-gray-400 mr-2.5 group-focus-within:text-[#2C3E2B] transition">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm khách hàng hoặc homestay..." 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-transparent border-none text-sm text-gray-800 focus:outline-none placeholder-gray-400 font-medium"
                />
              </div>
              <button 
                onClick={() => { setSearchTerm(''); setStatusFilter('All'); setCurrentPage(1); }}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#6E473B] font-bold px-4 h-10 rounded-xl bg-white border border-gray-200/80 shadow-sm hover:shadow transition duration-200 cursor-pointer shrink-0 active:scale-95 border-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* BẢNG DỮ LIỆU */}
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[950px] text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200/60 text-gray-500 font-bold uppercase text-xs tracking-wider">
                    <th className="p-4 w-[12%]">Sao</th>
                    <th className="p-4 w-[18%]">Khách hàng</th>
                    <th className="p-4 w-[22%]">Nội dung</th>
                    <th className="p-4 w-[14%]">Ngày</th>
                    <th className="p-4 w-[8%]">Đơn #</th>
                    <th className="p-4 w-[10%] text-center">Trạng thái</th>
                    <th className="p-4 w-[16%] text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-gray-700 text-sm">
                  {currentItems.length > 0 ? (
                    currentItems.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/40 transition">
                        <td className="p-4 font-mono font-bold text-amber-500 truncate">{renderStars(item.star)}</td>
                        <td className="p-4 text-gray-900 font-bold truncate" title={item.customerName}>{item.customerName}</td>
                        <td className="p-4 truncate text-xs text-gray-600" title={item.content}>{item.content}</td>
                        <td className="p-4 font-mono text-xs text-gray-500 truncate">{item.date}</td>
                        <td className="p-4 font-mono text-xs text-blue-600 font-bold truncate">{item.bookingId}</td>
                        <td className="p-4 text-center truncate">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block max-w-full truncate
                            ${item.status === 'Hiển thị' ? 'bg-green-50 text-green-700 border-green-200/50' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        
                        {/* CỘT THAO TÁC - BỔ SUNG NÚT XEM CHI TIẾT */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5 align-middle">
                            
                            {/* NÚT XEM CHI TIẾT ĐÁNH GIÁ (Kính lúp) */}
                            <button 
                              onClick={() => openDetailModal(item)}
                              className="inline-flex items-center justify-center w-8 h-8 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition cursor-pointer shrink-0 shadow-sm" 
                              title="Xem chi tiết đánh giá"
                            >
                              <BiCommentDetail className="w-4 h-4" />
                            </button>
                            
                            {/* NÚT ẨN / HIỆN ĐÁNH GIÁ */}
                            <button 
                              onClick={() => handleToggleHide(item.id)} 
                              className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 h-8 rounded-xl transition cursor-pointer border shrink-0 shadow-sm active:scale-95
                                ${item.status === 'Đã ẩn' 
                                  ? 'bg-green-50 text-green-600 border-green-200' 
                                  : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                              title={item.status === 'Đã ẩn' ? "Bỏ ẩn đánh giá" : "Ẩn đánh giá"}
                            >
                              {item.status === 'Đã ẩn' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.223 6.223A10.472 10.472 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.223 6.223L3 3m2.022 2.022A10.47 10.47 0 0112 4.5" />
                                </svg>
                              )}
                              <span>{item.status === 'Đã ẩn' ? 'Hiện' : 'Ẩn'}</span>
                            </button>

                            {/* NÚT XÓA ĐÁNH GIÁ */}
                            <button 
                              onClick={() => handleDelete(item.id)} 
                              className="inline-flex items-center justify-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3.5 h-8 rounded-xl font-bold transition cursor-pointer border-none shadow-sm active:scale-95 shrink-0"
                              title="Xóa vĩnh viễn"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Xóa</span>
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400 italic">Không tìm thấy đánh giá nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              setCurrentPage={setCurrentPage}
              totalItems={filteredReviews.length} 
              itemName="đánh giá" 
            />
          </div>
        </div>
      </div>

      {/* MODAL: XEM CHI TIẾT ĐÁNH GIÁ */}
      {isDetailModalOpen && activeReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in text-left text-sm">
          <div className="bg-[#F4F1EA] max-w-sm w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative font-semibold text-gray-600">
            <button onClick={() => setIsDetailModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none">✖</button>
            <div className="border-b border-gray-200 pb-2">
              <h3 className="font-serif text-lg font-bold text-[#2C1E15]">Chi tiết đánh giá</h3>
              <p className="text-xs text-gray-400 font-mono">ID: {activeReview.id}</p>
            </div>
            
            <div className="space-y-3 text-xs md:text-sm">
              <p><span className="text-gray-400 inline-block w-28">Khách hàng:</span> <span className="text-gray-800 font-bold">{activeReview.customerName}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Số sao:</span> <span className="text-amber-500 font-bold tracking-widest">{renderStars(activeReview.star)}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Nội dung:</span> <span className="text-gray-700 font-medium leading-relaxed">{activeReview.content}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Thời gian:</span> <span className="text-gray-500 font-mono text-xs">{activeReview.date}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Mã đơn #:</span> <span className="text-blue-600 font-mono font-bold">{activeReview.bookingId}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Homestay:</span> <span className="text-gray-800 font-bold">{activeReview.homestayName}</span></p>
            </div>

            <div className="pt-2">
              <button onClick={() => setIsDetailModalOpen(false)} className="w-full bg-[#2C3E2B] text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm border-none cursor-pointer">Đóng cửa sổ</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}