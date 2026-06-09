import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layout/AdminLayout';
import Pagination from '../../component/admin/Pagination';
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";


export default function AdminHomestays() {
  const navigate = useNavigate();

  // 1. DỮ LIỆU GIẢ LẬP DANH SÁCH HOMESTAY
  const [homestays, setHomestays] = useState([
    { id: "HMS-001", name: "Bungalow Gỗ Bên Sông", ownerId: "USR-004", ownerName: "Thiên Lê", ownerPhone: "0933445566", ownerEmail: "ownerthien@example.com", address: "Cái Răng, Cần Thơ", price: "850,000đ", image: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=400&auto=format&fit=crop", status: "Chờ phê duyệt" },
    { id: "HMS-002", name: "Nhà Gỗ Thông Đà Lạt", ownerId: "USR-006", ownerName: "Customer Three", ownerPhone: "0955667788", ownerEmail: "customer3@example.com", address: "Phường 3, Đà Lạt", price: "1,200,000đ", image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=400&auto=format&fit=crop", status: "Đã phê duyệt" },
    { id: "HMS-003", name: "Căn Hộ Mộc Bên Bờ Biển", ownerId: "USR-004", ownerName: "Thiên Lê", ownerPhone: "0933445566", ownerEmail: "ownerthien@example.com", address: "Trần Phú, Vũng Tàu", price: "1,500,000đ", image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=400&auto=format&fit=crop", status: "Đã phê duyệt" },
    { id: "HMS-004", name: "Nhà Sàn Gỗ Tây Bắc", ownerId: "USR-012", ownerName: "Hoàng Văn Thắng", ownerPhone: "0922113344", ownerEmail: "thanghoang@example.com", address: "Bản Hồ, Sapa", price: "600,000đ", image: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=400&auto=format&fit=crop", status: "Từ chối" },
    { id: "HMS-005", name: "Homestay Rừng Tràm Mộc", ownerId: "USR-015", ownerName: "Nguyễn Văn An", ownerPhone: "0977889900", ownerEmail: "annv@example.com", address: "U Minh, Cà Mau", price: "500,000đ", image: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?q=80&w=400&auto=format&fit=crop", status: "Bị chặn" },
  ]);

  // 2. CÁC STATE QUẢN LÝ TƯƠNG TÁC
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedHome, setSelectedHome] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // 3. LOGIC XỬ LÝ TRẠNG THÁI HOMESTAY
  const handleUpdateStatus = (id, nextStatus) => {
    let confirmMsg = `Xác nhận chuyển trạng thái homestay này thành [${nextStatus}]?`;
    if (nextStatus === "Xóa") confirmMsg = "Bạn có chắc chắn muốn xóa homestay này khỏi danh sách quản lý?";

    if (window.confirm(confirmMsg)) {
      if (nextStatus === "Xóa") {
        setHomestays(homestays.filter(home => home.id !== id));
        if (selectedHome && selectedHome.id === id) setSelectedHome(null);
      } else {
        setHomestays(homestays.map(home => home.id === id ? { ...home, status: nextStatus } : home));
        if (selectedHome && selectedHome.id === id) {
          setSelectedHome(prev => ({ ...prev, status: nextStatus }));
        }
      }
    }
  };

  // 4. BỘ LỌC DỮ LIỆU
  const filteredHomestays = homestays.filter(home => {
    const matchesSearch = home.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          home.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          home.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || home.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 5. PHÂN TRANG
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHomestays.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHomestays.length / itemsPerPage);

  return (
    <>
      <AdminLayout>
        {/* -mt-6 ép sát sườn nội dung lên phía trên thanh Header */}
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.06 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" />
                </svg>
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
            
            {/* Đã lược bỏ toàn bộ icon trong tab lọc để đồng điệu tối giản */}
            <div className="flex bg-[#ffffff] p-1.5 rounded-xl font-bold text-[11px] shadow-inner border border-gray-300/30 overflow-x-auto max-w-full shrink-0 h-fit self-start lg:self-center scrollbar-none">
              <button onClick={() => { setStatusFilter('All'); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'All' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tất cả ({homestays.length})</button>
              <button onClick={() => { setStatusFilter('Chờ phê duyệt'); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Chờ phê duyệt' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Chờ duyệt</button>
              <button onClick={() => { setStatusFilter('Đã phê duyệt'); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Đã phê duyệt' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Đã duyệt</button>
              <button onClick={() => { setStatusFilter('Từ chối'); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Từ chối' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Từ chối</button>
              <button onClick={() => { setStatusFilter('Bị chặn'); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Bị chặn' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Bị chặn</button>
            </div>
          </div>

          {/* HÀNG 3: THANH TÌM KIẾM & BẢNG DANH SÁCH LIỀN KỀ */}
          <div className="space-y-4">
            
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="bg-white px-4 h-11 rounded-xl border border-gray-200/80 shadow-sm flex items-center flex-grow group focus-within:border-[#2C3E2B]/50 transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-gray-400 mr-2.5 group-focus-within:text-[#2C3E2B] transition">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm theo tên homestay, chủ nhà, địa chỉ..." 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-transparent border-none text-sm text-gray-800 focus:outline-none placeholder-gray-400 font-medium"
                />
              </div>

              <button 
                onClick={() => { setSearchTerm(''); setStatusFilter('All'); setCurrentPage(1); }}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#6E473B] font-bold px-4 h-11 rounded-xl bg-white border border-gray-200/80 shadow-sm hover:shadow transition duration-200 cursor-pointer shrink-0 active:scale-95 border-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <span>Làm mới</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-base">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-200/60 text-gray-500 font-bold text-xs uppercase tracking-wider">
                      <th className="p-4">Căn hộ lưu trú</th>
                      <th className="p-4">Đối tác sở hữu</th>
                      <th className="p-4">Địa chỉ cụ thể</th>
                      <th className="p-4 text-center">Trạng thái sàn</th>
                      <th className="p-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-700 text-sm">
                    {currentItems.length > 0 ? (
                      currentItems.map((home) => (
                        <tr key={home.id} className="hover:bg-gray-50/40 transition">
                          
                          {/* Cột căn hộ: Đã lược bỏ hoàn toàn giá tiền và mã số phòng theo yêu cầu */}
                          <td className="p-4">
                            <div className="flex items-center space-x-3.5">
                              <img src={home.image} alt={home.name} className="w-14 h-10 object-cover rounded-lg shadow-sm shrink-0 border border-gray-100" />
                              <p className="text-gray-900 font-bold text-base leading-tight">{home.name}</p>
                            </div>
                          </td>
                          
                          {/* Cột Đối tác: Đã đổi icon chữ i tròn sang dấu chấm than (!) màu xanh dương chuyên nghiệp */}
                          <td className="p-4">
                            <div className="space-y-1">
                              <p className="text-gray-800 font-bold text-sm">{home.ownerName}</p>
                              <button 
                                onClick={() => setSelectedOwner(home)}
                                className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                </svg>
                                <span>Xem thông tin chủ</span>
                              </button>
                            </div>
                          </td>
                          
                          <td className="p-4 text-gray-500 max-w-xs truncate font-medium">{home.address}</td>
                          
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold border
                              ${home.status === 'Đã phê duyệt' ? 'bg-green-50 text-green-700 border-green-200/50' : ''}
                              ${home.status === 'Chờ phê duyệt' ? 'bg-amber-50 text-amber-700 border-amber-200/50' : ''}
                              ${home.status === 'Từ chối' ? 'bg-red-50 text-red-600 border-red-200/50' : ''}
                              ${home.status === 'Bị chặn' ? 'bg-red-50 text-red-700 border-red-200/50' : ''}
                            `}>
                              {home.status}
                            </span>
                          </td>
                          
                          {/* Cột Thao tác: flex-wrap tự rớt hàng linh hoạt, không bị nén chữ */}
                          <td className="p-4 text-right whitespace-normal max-w-[280px]">
                            <div className="flex flex-wrap items-center justify-end gap-2 align-middle">
                              
                              {/* Nút Chi tiết: Icon con mắt Solid sắc nét */}
                              <button 
                                onClick={() => setSelectedHome(home)}
                                className="inline-flex items-center justify-center gap-1.5 text-xs bg-[#2C3E2B]/10 hover:bg-[#2C3E2B]/20 text-[#2C3E2B] px-3 h-8 rounded-xl font-bold transition duration-200 cursor-pointer shadow-sm active:scale-95 border-none" title="Xem Chi tiết">
                                <MdOutlineRemoveRedEye className="w-4 h-4 shrink-0" />
                                <span>Chi tiết</span>
                              </button>

                              {/* Menu nút thay đổi theo trạng thái duyệt phòng */}
                              {home.status === "Chờ phê duyệt" && (
                                <>
                                  <button 
                                    onClick={() => handleUpdateStatus(home.id, "Đã phê duyệt")} 
                                    className="inline-flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-2.5 h-8 rounded-xl font-bold transition cursor-pointer border-none shadow-sm active:scale-95 shrink-0"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.14-.1l3.75-5.25z" clipRule="evenodd" />
                                    </svg>
                                    <span>Duyệt</span>
                                  </button>
                                  {/* Đã sửa nút từ chối sang tone màu ĐỎ cảnh báo */}
                                  <button 
                                    onClick={() => handleUpdateStatus(home.id, "Từ chối")} 
                                    className="inline-flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 h-8 rounded-xl font-bold transition cursor-pointer border-none shadow-sm active:scale-95 shrink-0"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                                    </svg>
                                    <span>Từ chối</span>
                                  </button>
                                </>
                              )}

                              {home.status === "Đã phê duyệt" && (
                                <button 
                                  onClick={() => handleUpdateStatus(home.id, "Bị chặn")} 
                                  className="inline-flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 h-8 rounded-xl font-bold transition cursor-pointer border-none shadow-sm active:scale-95 shrink-0"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634h5.25c.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634h-5.25z" clipRule="evenodd" />
                                  </svg>
                                  <span>Chặn phòng</span>
                                </button>
                              )}

                              {home.status === "Bị chặn" && (
                                <button 
                                  onClick={() => handleUpdateStatus(home.id, "Đã phê duyệt")} 
                                  className="inline-flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-600 px-2.5 h-8 rounded-xl font-bold transition cursor-pointer border-none shadow-sm active:scale-95 shrink-0"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                    <path d="M6 12a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H6.75A.75.75 0 016 12z" />
                                  </svg>
                                  <span>Bỏ chặn</span>
                                </button>
                              )}

                              {/* Nút Xóa: Đã cập nhật mẫu SVG Outline quai tròn bo cạnh vuông đúng y hệt hình mẫu image_b16f67.png */}
                              <button 
                                onClick={() => handleUpdateStatus(home.id, "Xóa")} 
                                className="inline-flex items-center justify-center  gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-500 px-3 h-8 rounded-xl font-bold transition cursor-pointer border-none shadow-sm active:scale-95 shrink-0"
                                title="Xóa danh mục lưu trú"
                              >
                                <RiDeleteBin6Line className="w-4 h-4 shrink-0" />
                                <span>Xóa</span>
                              </button>

                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-gray-400 italic">Không tìm thấy căn hộ homestay phù hợp.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* THANH PHÂN TRANG DÙNG CHUNG TÁCH BIỆT */}
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
                totalItems={filteredHomestays.length}
                indexOfFirstItem={indexOfFirstItem}
                indexOfLastItem={indexOfLastItem}
                itemName="Homestay"
              />
            </div>

          </div>
        </div>
      </AdminLayout>
      {/* POPUP MODAL 1: XEM CHI TIẾT NGƯỜI CHỦ SỞ HỮU */}
        {selectedOwner && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-left text-sm">
            <div className="bg-[#F4F1EA] max-w-sm w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative font-semibold text-gray-600">
              <button onClick={() => setSelectedOwner(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none">✖</button>
              <div className="border-b border-gray-200 pb-2">
                <h3 className="font-serif text-lg font-bold text-[#2C1E15]">Thông tin chủ đối tác</h3>
                <p className="text-xs text-gray-400 font-mono">{selectedOwner.ownerId}</p>
              </div>
              <div className="space-y-2.5 text-xs md:text-sm">
                <p><span className="text-gray-400 inline-block w-24">Họ và tên:</span> <span className="text-gray-800 font-bold">{selectedOwner.ownerName}</span></p>
                <p><span className="text-gray-400 inline-block w-24">Số điện thoại:</span> <span className="text-gray-800 font-bold">{selectedOwner.ownerPhone}</span></p>
                <p><span className="text-gray-400 inline-block w-24">Email:</span> <span className="text-gray-800 font-mono font-bold">{selectedOwner.ownerEmail}</span></p>
              </div>
      
            </div>
          </div>
        )}

        {/* POPUP MODAL 2: XEM CHI TIẾT HOMESTAY ĐỦ PROFILE GIÁ TIỀN & MÃ SỐ */}
        {selectedHome && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-left text-sm">
            <div className="bg-[#F4F1EA] max-w-lg w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative font-semibold text-gray-600">
              <button onClick={() => setSelectedHome(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none z-10">✖</button>
              
              <div className="w-full h-48 rounded-2xl overflow-hidden shadow-md relative border border-gray-200">
                <img src={selectedHome.image} alt={selectedHome.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-3 right-3 bg-[#2C1E15]/80 text-white px-3 py-1 rounded-lg text-xs font-bold font-mono">
                  {selectedHome.price}/đêm
                </div>
              </div>

              <div className="border-b border-gray-200 pb-2">
                <h3 className="font-serif text-xl font-bold text-[#2C1E15]">{selectedHome.name}</h3>
                <p className="text-xs text-gray-400 font-mono">{selectedHome.id}</p>
              </div>

              <div className="space-y-2.5 text-xs md:text-sm">
                <p><span className="text-gray-400 inline-block w-28">Địa điểm phòng:</span> <span className="text-gray-800 font-medium">{selectedHome.address}</span></p>
                <p><span className="text-gray-400 inline-block w-28">Người đại diện:</span> <span className="text-gray-800 font-bold">{selectedHome.ownerName} ({selectedHome.ownerId})</span></p>
                <p><span className="text-gray-400 inline-block w-28">Trạng thái sàn:</span> 
                  <span className={`ml-1 font-bold text-xs px-2 py-0.5 rounded border
                    ${selectedHome.status === 'Đã phê duyệt' ? 'bg-green-50 text-green-600 border-green-200' : ''}
                    ${selectedHome.status === 'Chờ phê duyệt' ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}
                    ${selectedHome.status === 'Từ chối' ? 'bg-red-50 text-red-600 border-red-200' : ''}
                    ${selectedHome.status === 'Bị chặn' ? 'bg-red-50 text-red-600 border-red-200' : ''}
                  `}>
                    {selectedHome.status}
                  </span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200/60">
                {selectedHome.status === "Chờ phê duyệt" ? (
                  <>
                    <button onClick={() => handleUpdateStatus(selectedHome.id, "Đã phê duyệt")} className="bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-xs font-bold transition border-none shadow-sm cursor-pointer">Phê duyệt</button>
                    <button onClick={() => handleUpdateStatus(selectedHome.id, "Từ chối")} className="bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition border-none shadow-sm cursor-pointer">Từ chối</button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleUpdateStatus(selectedHome.id, selectedHome.status === "Bị chặn" ? "Đã phê duyệt" : "Bị chặn")} 
                    className={`py-2.5 rounded-xl text-xs font-bold text-white transition border-none shadow-sm cursor-pointer col-span-2
                      ${selectedHome.status === "Bị chặn" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                  >
                    {selectedHome.status === "Bị chặn" ? "🔓 Bỏ chặn hiển thị" : "🚫 Chặn homestay"}
                  </button>
                )}
                <button 
                  onClick={() => handleUpdateStatus(selectedHome.id, "Xóa")}
                  className="bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition cursor-pointer text-center"
                >
                  🗑️ Xóa mục
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}