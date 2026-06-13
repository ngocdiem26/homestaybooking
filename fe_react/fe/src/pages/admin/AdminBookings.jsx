import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/common/Pagination';

export default function AdminBookings() {
  const navigate = useNavigate();

  // 1. DỮ LIỆU GIẢ LẬP DANH SÁCH ĐƠN ĐẶT PHÒNG (Dựa theo cấu trúc image_b10283.jpg) thêm setBookings để có thể cập nhật trạng thái đơn khi xử lý
  const [bookings] = useState([
    { id: "325", customerName: "Trần Thị Thanh Thanh", customerEmail: "thanhthanh1995@gmail.com", totalAmount: "4.200.000đ", status: "Chờ xác nhận", createdAt: "11/12/2025 12:05", homestayName: "Bungalow Gỗ Bên Sông", checkIn: "15/12/2025", checkOut: "17/12/2025" },
    { id: "324", customerName: "Mộc Miên", customerEmail: "mienmoc@gmail.com", totalAmount: "1.800.000đ", status: "Đang xử lý", createdAt: "11/12/2025 11:00", homestayName: "Nhà Gỗ Thông Đà Lạt", checkIn: "20/12/2025", checkOut: "21/12/2025" },
    { id: "323", customerName: "Customer Test", customerEmail: "cust_test@example.com", totalAmount: "3.560.000đ", status: "Đang xử lý", createdAt: "11/12/2025 10:35", homestayName: "Căn Hộ Mộc Bên Bờ Biển", checkIn: "24/12/2025", checkOut: "26/12/2025" },
    { id: "322", customerName: "Thiên Lê", customerEmail: "ownerthien@example.com", totalAmount: "5.240.000đ", status: "Đang xử lý", createdAt: "11/12/2025 10:20", homestayName: "Căn Hộ Mộc Bên Bờ Biển", checkIn: "28/12/2025", checkOut: "31/12/2025" },
    { id: "321", customerName: "Hoàng Văn Thắng", customerEmail: "thanghoang@example.com", totalAmount: "4.088.000đ", status: "Đang xử lý", createdAt: "11/12/2025 10:09", homestayName: "Nhà Sàn Gỗ Tây Bắc", checkIn: "02/01/2026", checkOut: "05/01/2026" },
    { id: "320", customerName: "Nguyễn Văn An", customerEmail: "annv@example.com", totalAmount: "1.320.000đ", status: "Đã xác nhận", createdAt: "11/12/2025 09:51", homestayName: "Homestay Rừng Tràm Mộc", checkIn: "10/01/2026", checkOut: "11/01/2026" },
  ]);

  // 2. CÁC STATE QUẢN LÝ BỘ LỌC VÀ TƯƠNG TÁC
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Hiển thị 5 đơn mỗi trang giống như giao diện mẫu

  // 3. BỘ LỌC DỮ LIỆU
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.id.includes(searchId) || 
                          booking.customerName.toLowerCase().includes(searchId.toLowerCase());
    const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 4. PHÂN TRANG DỮ LIỆU
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  return (
    <>
      <AdminLayout>
        {/* -mt-6 dời toàn bộ nội dung lên trên sát sườn thanh Header */}
        <div className="space-y-5 animate-fade-in text-left text-sm -mt-6">
          
          {/* HÀNG 1: NÚT QUAY VỀ BIỆT LẬP TRÊN CÙNG */}
          <div className="flex justify-start">
            <button 
              onClick={() => navigate('/admin')}
              className="inline-flex items-center justify-center gap-1.5 text-xs bg-white hover:bg-gray-100 text-gray-600 px-3.5 py-1.5 rounded-xl font-bold transition duration-200 cursor-pointer shadow-sm active:scale-95 border border-gray-200/40 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span>Về bảng điều khiển</span>
            </button>
          </div>

          {/* HÀNG 2: KHỐI TIÊU ĐỀ CHÍNH NỀN TRẮNG ĐỔ BÓNG MỀM */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 bg-[#2C3E2B]/10 rounded-xl flex items-center justify-center text-[#2C3E2B] shrink-0 border border-[#2C3E2B]/5 shadow-inner mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.732 2.076 1.704m-5.8 0a48.224 48.224 0 00-4.534.388C5.605 4.43 4.75 5.372 4.75 6.503v12.495A2.25 2.25 0 007 21.25h6.108c.23 0 .452-.035.664-.1" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <h2 className="font-serif text-xl md:text-2xl font-bold text-[#2C1E15]">
                  Quản lý đơn đặt phòng
                </h2>
                <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-2xl">
                  Theo dõi tình trạng đặt phòng toàn sàn, xử lý dòng tiền giao dịch và hỗ trợ kỹ thuật các sự cố lưu trú.
                </p>
              </div>
            </div>
            
            {/* Bộ lọc tinh giản không có icon thừa theo đúng phong cách tối giản */}
            <div className="flex bg-[#ffffff] p-1.5 rounded-xl font-bold text-[11px] shadow-inner border border-gray-300/30 overflow-x-auto max-w-full shrink-0 h-fit self-start lg:self-center scrollbar-none">
              <button onClick={() => { setStatusFilter('All'); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'All' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tất cả ({bookings.length})</button>
              <button onClick={() => { setStatusFilter('Chờ xác nhận'); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Chờ xác nhận' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Chờ xác nhận</button>
              <button onClick={() => { setStatusFilter('Đang xử lý'); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Đang xử lý' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Đang xử lý</button>
              <button onClick={() => { setStatusFilter('Đã xác nhận'); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Đã xác nhận' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Đã xác nhận</button>
            </div>
          </div>

          {/* HÀNG 3: THANH TÌM KIẾM LIỀN KỀ GẮN KẾT VỚI KHUNG BẢNG */}
          <div className="space-y-4">
            
            {/* Thanh công cụ tìm kiếm chuẩn hình mẫu image_b10283.jpg */}
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="bg-white px-4 h-11 rounded-xl border border-gray-200/80 shadow-sm flex items-center flex-grow group focus-within:border-[#2C3E2B]/50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-gray-400 mr-2.5 group-focus-within:text-[#2C3E2B] transition">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Nhập mã đơn hoặc tên khách hàng..." 
                  value={searchId}
                  onChange={(e) => { setSearchId(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-transparent border-none text-sm text-gray-800 focus:outline-none placeholder-gray-400 font-medium"
                />
              </div>

              <button 
                onClick={() => { setSearchId(''); setStatusFilter('All'); setCurrentPage(1); }}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#6E473B] font-bold px-4 h-11 rounded-xl bg-white border border-gray-200/80 shadow-sm hover:shadow transition duration-200 cursor-pointer shrink-0 active:scale-95 border-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>Làm mới</span>
              </button>
            </div>

            {/* KHỐI BẢNG QUẢN LÝ ĐƠN ĐẶT PHÒNG */}
            <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-base">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-200/60 text-gray-500 font-bold text-xs uppercase tracking-wider">
                      <th className="p-4 w-24">Mã đơn</th>
                      <th className="p-4">Khách hàng</th>
                      <th className="p-4">Tổng tiền</th>
                      <th className="p-4 text-center">Trạng thái</th>
                      <th className="p-4">Ngày tạo</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-700 text-sm">
                    {currentItems.length > 0 ? (
                      currentItems.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50/40 transition">
                          
                          {/* Cột mã đơn font chữ mono đặc trưng hệ thống */}
                          <td className="p-4 font-mono font-bold text-gray-900">{booking.id}</td>
                          
                          {/* Cột thông tin khách hàng */}
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <p className="text-gray-900 font-bold text-base leading-tight">{booking.customerName}</p>
                              <p className="text-xs text-gray-400 font-mono tracking-tight">{booking.customerEmail}</p>
                            </div>
                          </td>
                          
                          {/* Cột tổng số tiền thanh toán */}
                          <td className="p-4">
                            <span className="text-xs font-bold bg-[#eaac99]/5 text-[#e75225] px-2 py-0.5 rounded-md border border-[#e75225]/10">
                              {booking.totalAmount}
                            </span>
                          </td>
                          {/* Cột trạng thái */}
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold border
                              ${booking.status === 'Đã xác nhận' ? 'bg-green-50 text-green-700 border-green-200/50' : ''}
                              ${booking.status === 'Chờ xác nhận' ? 'bg-amber-50 text-amber-700 border-amber-200/50' : ''}
                              ${booking.status === 'Đang xử lý' ? 'bg-blue-50 text-blue-700 border-blue-200/50' : ''}
                            `}>
                              {booking.status}
                            </span>
                          </td>
                          
                          {/* Cột ngày tạo đơn */}
                          <td className="p-4 font-mono text-gray-500 font-medium">{booking.createdAt}</td>
                          
                          {/* Cột thao tác tự tương thích rớt dòng khi quá giới hạn */}
                          <td className="p-4 text-right whitespace-normal max-w-[160px]">
                            <div className="flex flex-wrap items-center justify-end gap-2 align-middle">
                              
                              {/* Nút Xem chi tiết chuẩn Icon Con Mắt đặc Solid */}
                              <button 
                                onClick={() => setSelectedBooking(booking)}
                                className="inline-flex items-center justify-center gap-1.5 text-xs bg-[#2C3E2B]/10 hover:bg-[#2C3E2B]/20 text-[#2C3E2B] px-3 h-8 rounded-xl font-bold transition duration-200 cursor-pointer shadow-sm active:scale-95 border-none shrink-0"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                                  <path fillRule="evenodd" d="M1.323 11.416C2.405 7.302 6.134 4.35 10.5 4.35s8.094 2.953 9.177 7.066c.11.422.11.866 0 1.288-1.083 4.114-4.81 7.066-9.177 7.066s-8.094-2.952-9.177-7.066a1.921 1.921 0 010-1.288zM12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" clipRule="evenodd" />
                                </svg>
                                <span>Xem chi tiết</span>
                              </button>

                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-gray-400 italic">Không tìm thấy đơn đặt phòng nào phù hợp.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* THANH PHÂN TRANG DÙNG CHUNG HỆ THỐNG COZYGO */}
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                totalItems={filteredBookings.length}
                indexOfFirstItem={indexOfFirstItem}
                indexOfLastItem={indexOfLastItem}
                itemName="đơn đặt"
              />
            </div>

          </div>
        </div>
      </AdminLayout>

      {/* ==========================================
          POPUP WINDOW MODAL: XEM CHI TIẾT ĐƠN ĐẶT PHÒNG
         ========================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-left text-sm">
          <div className="bg-[#F4F1EA] max-w-md w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative font-semibold text-gray-600">
            <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none">✖</button>
            
            <div className="border-b border-gray-200 pb-2">
              <h3 className="font-serif text-lg font-bold text-[#2C1E15]">Chi tiết hóa đơn đặt phòng</h3>
              <p className="text-xs text-gray-400 font-mono">Mã giao dịch: #{selectedBooking.id}</p>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <p><span className="text-gray-400 inline-block w-28">Tên Homestay:</span> <span className="text-gray-800 font-bold">{selectedBooking.homestayName}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Khách hàng:</span> <span className="text-gray-800 font-bold">{selectedBooking.customerName}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Ngày nhận phòng:</span> <span className="text-gray-800 font-mono font-medium">{selectedBooking.checkIn}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Ngày trả phòng:</span> <span className="text-gray-800 font-mono font-medium">{selectedBooking.checkOut}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Tổng tiền toán:</span> <span className="text-[#6E473B] font-bold">{selectedBooking.totalAmount}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Thời gian tạo:</span> <span className="text-gray-600 font-mono font-medium">{selectedBooking.createdAt}</span></p>
              <p><span className="text-gray-400 inline-block w-28">Trạng thái:</span> 
                <span className={`ml-1 font-bold text-xs px-2 py-0.5 rounded border
                  ${selectedBooking.status === 'Đã xác nhận' ? 'bg-green-50 text-green-600 border-green-200' : ''}
                  ${selectedBooking.status === 'Chờ xác nhận' ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}
                  ${selectedBooking.status === 'Đang xử lý' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}
                `}>
                  {selectedBooking.status}
                </span>
              </p>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="w-full bg-[#2C3E2B] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#2C3E2B]/90 transition shadow-sm border-none cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}