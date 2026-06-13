
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/common/Pagination';

export default function AdminPromotions() {
  const navigate = useNavigate();

  // 1. DỮ LIỆU GIẢ LẬP DANH SÁCH MÃ KHUYẾN MÃI
  const [promos, setPromos] = useState([
    { id: "DEALHOT20", name: "Giảm 200K đơn từ 2TR", type: "Giảm VNĐ", value: "200.000đ", validity: "01/12/2025 - 31/12/2025", status: "Đang hoạt động" },
    { id: "DEALHOT", name: "DEAL CUỐI NĂM", type: "Giảm VNĐ", value: "500.000đ", validity: "01/12/2025 - 14/12/2025", status: "Ngưng" },
    { id: "SUMMER25", name: "Giảm 15% mùa hè", type: "Giảm %", value: "15%", validity: "01/11/2025 - 31/12/2025", status: "Đang hoạt động" },
  ]);


  // 2. STATE QUẢN LÝ TÌM KIẾM, BỘ LỌC VÀ CÁC MODAL
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [editingPromo, setEditingPromo] = useState(null);

// Mở rộng state form tạo mới khớp với giao diện thiết kế
  const [newPromo, setNewPromo] = useState({ 
    id: "", 
    name: "", 
    type: "Phần trăm (%)", 
    value: "", 
    maxDiscount: "",
    minOrder: "",
    usageLimit: "",
    perUserLimit: "",
    isCumulative: false,
    description: "",
    validity: "01/01/2026 - 31/12/2026", 
    status: "Đang hoạt động" 
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  
// Xử lý tạo mới mã
  const handleCreatePromo = (e) => {
    e.preventDefault();
    if (!newPromo.id || !newPromo.name || !newPromo.value) return alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
    if (promos.some(p => p.id.toLowerCase() === newPromo.id.trim().toLowerCase())) return alert("Mã khuyến mãi này đã tồn tại!");
    
    setPromos([ ...promos, { ...newPromo, id: newPromo.id.trim().toUpperCase() } ]);
    setNewPromo({ 
      id: "", name: "", type: "Phần trăm (%)", value: "", maxDiscount: "", 
      minOrder: "", usageLimit: "", perUserLimit: "", isCumulative: false, 
      description: "", validity: "01/01/2026 - 31/12/2026", status: "Đang hoạt động" 
    });
    setIsCreateModalOpen(false);
  };

  // Xử lý lưu chỉnh sửa
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setPromos(promos.map(p => p.id === editingPromo.id ? editingPromo : p));
    setEditingPromo(null);
  };

  // Xử lý xóa mã
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã khuyến mãi này vĩnh viễn không?")) {
      setPromos(promos.filter(p => p.id !== id));
      if (selectedDetail && selectedDetail.id === id) setSelectedDetail(null);
    }
  };

  const filteredPromos = promos.filter(p => 
    (statusFilter === 'All' || p.status === statusFilter) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const totalPages = Math.ceil(filteredPromos.length / itemsPerPage);
  const currentItems = filteredPromos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                <span className="text-xl">🏷️</span>
              </div>
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-[#2C1E15]">Quản lý mã khuyến mãi</h2>
                <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-lg mt-0.5">
                  Tạo, chỉnh sửa và quản lý các đợt phát hành mã giảm giá ưu đãi cho khách hàng trên toàn hệ thống.
                </p>
              </div>
            </div>
            <button onClick={() => setIsCreateModalOpen(true)} className="bg-[#2C3E2B] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-opacity-90 transition active:scale-95 shrink-0 cursor-pointer border-none">＋ Tạo mã mới</button>
          </div>

          {/* TÌM KIẾM & BỘ LỌC */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 w-full">
              <div className="flex bg-[#ffffff] p-1.5 font-bold text-[11px] rounded-xl border-gray-200/80 shadow-sm overflow-x-auto max-w-full shrink-0 h-fit scrollbar-none">
                <button onClick={() => { setStatusFilter('All'); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'All' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tất cả ({promos.length})</button>
                <button onClick={() => { setStatusFilter('Đang hoạt động'); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Đang hoạt động' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Đang hoạt động</button>
                <button onClick={() => { setStatusFilter('Ngưng'); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${statusFilter === 'Ngưng' ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Ngưng</button>
              </div>

              <div className="flex items-center flex-grow gap-3 max-w-xl">
                <div className="bg-white px-4 h-10 rounded-xl border border-gray-200/80 shadow-sm flex items-center flex-grow group focus-within:border-[#2C3E2B]/50 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-gray-400 mr-2.5 group-focus-within:text-[#2C3E2B] transition">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.602 10.602z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm mã, tên khuyến mãi..." 
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

            {/* BẢNG DỮ LIỆU ĐƯỢC FORMAT GỌN GÀNG, SẮC NÉT */}
            <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base border-collapse">
                  <thead>
                    <tr className="bg-gray-50/70 border-b border-gray-200/60 text-gray-500 font-bold uppercase text-xs tracking-wider">
                      <th className="p-4">Mã</th>
                      <th className="p-4">Tên khuyến mãi</th>
                      <th className="p-4">Loại</th>
                      <th className="p-4">Giá trị</th>
                      <th className="p-4">Hiệu lực</th>
                      <th className="p-4 text-center">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-700 text-sm">
                    {currentItems.length > 0 ? (
                      currentItems.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/40 transition">
                          {/* Định dạng Mã hiển thị dạng hộp viên thuốc xám đặc trưng */}
                          <td className="p-4">
                            <span className="px-3 py-1 bg-gray-600 text-white text-[11px] font-bold rounded-full font-mono tracking-wide">
                              {p.id}
                            </span>
                          </td>
                          <td className="p-4 text-gray-900 font-bold">{p.name}</td>
                          <td className="p-4">
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600 font-bold">
                              {p.type}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold bg-[#eaac99]/5 text-[#e75225] px-2 py-0.5 rounded-md border border-[#e75225]/10">
                              {p.value}
                            </span>
                          </td>
                          {/* Định dạng cột hiệu lực liền mạch kèm icon lịch vector */}
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono font-medium">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400 shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75zM9.75 15h4.5m-4.5 3h4.5m-4.5-6h4.5m-4.5 3h4.5M6 12h3v3H6v-3z" />
                              </svg>
                              {p.validity}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${p.status === 'Đang hoạt động' ? 'bg-green-50 text-green-700 border-green-200/50' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{p.status}</span>
                          </td>
                          
                          {/* CỘT THAO TÁC RỚT DÒNG LINH HOẠT THỨ TỰ CHUẨN: XEM - SỬA - XÓA */}
                          <td className="p-4 text-right whitespace-normal max-w-[260px]">
                            <div className="inline-flex items-center justify-end gap-1.5 align-middle">
                              
                              {/* 1. NÚT XEM (Icon Con Mắt đặc Solid) */}
                              <button 
                                onClick={() => setSelectedDetail(p)} 
                                className="inline-flex items-center justify-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2.5 h-8 rounded-xl font-bold transition duration-200 cursor-pointer shadow-sm active:scale-95 border-none shrink-0" 
                                title="Xem chi tiết"
                              >
                                  <svg xmlns="http:www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                <span>Xem</span>
                              </button>

                              {/* 2. NÚT CHỈNH SỬA (Icon Cây Bút đặc Solid) */}
                              <button 
                                onClick={() => setEditingPromo(p)} 
                                className="inline-flex items-center justify-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 h-8 rounded-xl font-bold transition duration-200 cursor-pointer shadow-sm active:scale-95 border-none shrink-0" 
                                title="Chỉnh sửa"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                  <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712z"/>
                                  <path fillRule="evenodd" d="M19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" clipRule="evenodd"/>
                                </svg>
                                <span>Sửa</span>
                              </button>

                              {/* 3. NÚT XÓA (Icon Thùng rác Solid + Chữ Xóa) */}
                              <button 
                                onClick={() => handleDelete(p.id)} 
                                className="inline-flex items-center gap-1.5 p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer border-none text-xs font-bold shrink-0" 
                                title="Xóa vĩnh viễn"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                <span>Xóa</span>
                              </button>

                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-gray-400 italic">Không tìm thấy mã khuyến mãi nào phù hợp.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                setCurrentPage={setCurrentPage}
                totalItems={filteredPromos.length} 
                itemName="mã" 
              />
            </div>
          </div>
        </div>
      </AdminLayout>

      {/* ==========================================
            MODAL 1: MẪU FORM TẠO MÃ KHUYẾN MÃI MỚI (Tối ưu chiều dọc hoàn hảo, cuộn nội dung, fix cứng header/footer)
          ========================================== */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-fade-in">
            <div className="bg-[#F8F9FA] w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[75vh] border border-white/20">
              
              {/* Modal Header (Cố định chiều cao, bo tròn góc) */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-3xl shrink-0">
                <h3 className="font-serif text-lg font-bold text-[#2C3E2B] flex items-center gap-2">
                  <span className="p-2 bg-[#2C3E2B]/5 rounded-lg text-sm">✨</span>
                  Tạo mã khuyến mãi mới
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-full border-none cursor-pointer">✖</button>
              </div>

              {/* Modal Body (Chỉ phần này có scroll dọc nếu nội dung dài) */}
              <form onSubmit={handleCreatePromo} className="flex-grow overflow-y-auto p-6 scrollbar-thin">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  
                  {/* Cột 1 */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] font-black uppercase tracking-wider pl-1">Mã (Code) <span className="text-red-500">*</span></label>
                      <input required value={newPromo.id} onChange={e => setNewPromo({...newPromo, id: e.target.value})} className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/10 outline-none text-xs font-mono uppercase transition" placeholder="VD: TLPAMPS" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] font-black uppercase tracking-wider pl-1">Loại giảm</label>
                      <div className="flex gap-4 p-2 bg-white rounded-xl border border-gray-200">
                        {['Phần trăm (%)', 'Cố định (VNĐ)'].map(type => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                            <input type="radio" name="type" value={type} checked={newPromo.type === type} onChange={e => setNewPromo({...newPromo, type: e.target.value})} className="accent-[#2C3E2B] w-4 h-4" />
                            {type}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-gray-400 text-[10px] font-black uppercase tracking-wider pl-1">Giảm tối đa</label>
                        <input type="number" value={newPromo.maxDiscount} onChange={e => setNewPromo({...newPromo, maxDiscount: e.target.value})} className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/10 outline-none text-xs transition" placeholder="VNĐ" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 text-[10px] font-black uppercase tracking-wider pl-1">Đơn tối thiểu</label>
                        <input type="number" value={newPromo.minOrder} onChange={e => setNewPromo({...newPromo, minOrder: e.target.value})} className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/10 outline-none text-xs transition" placeholder="VNĐ" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] font-black uppercase tracking-wider pl-1 text-blue-600">Giới hạn khách (lượt)</label>
                      <input type="number" value={newPromo.perUserLimit} onChange={e => setNewPromo({...newPromo, perUserLimit: e.target.value})} className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/10 outline-none text-xs transition" placeholder="Mặc định: 1" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Cho phép cộng dồn mã</span>
                      <input type="checkbox" checked={newPromo.isCumulative} onChange={e => setNewPromo({...newPromo, isCumulative: e.target.checked})} className="w-5 h-5 accent-[#2C3E2B] cursor-pointer" />
                    </div>
                  </div>

                  {/* Cột 2 */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] font-black uppercase tracking-wider pl-1">Tiêu đề chương trình <span className="text-red-500">*</span></label>
                      <input required value={newPromo.name} onChange={e => setNewPromo({...newPromo, name: e.target.value})} className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/10 outline-none text-xs transition" placeholder="Nhập tên hiển thị..." />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] font-black uppercase tracking-wider pl-1">Giá trị giảm <span className="text-red-500">*</span></label>
                      <input required type="number" value={newPromo.value} onChange={e => setNewPromo({...newPromo, value: e.target.value})} className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/10 outline-none text-xs transition font-bold" placeholder="Nhập số..." />
                    </div>

                    {/* Lịch Chỉnh sửa Ngày Hiệu Lực */}
                    <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded-2xl border border-gray-200/60 shadow-inner">
                      <div className="space-y-1">
                        <label className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Từ ngày <span className="text-red-500">*</span></label>
                        <input type="date" required value={newPromo.startDate} onChange={e => setNewPromo({...newPromo, startDate: e.target.value})} className="w-full h-9 px-2 rounded-lg border border-gray-100 bg-gray-50 text-[11px] outline-none font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-gray-400 text-[10px] font-black uppercase tracking-wider">Đến ngày <span className="text-red-500">*</span></label>
                        <input type="date" required value={newPromo.endDate} onChange={e => setNewPromo({...newPromo, endDate: e.target.value})} className="w-full h-9 px-2 rounded-lg border border-gray-100 bg-gray-50 text-[11px] outline-none font-mono" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] font-black uppercase tracking-wider pl-1 text-orange-600">Tổng giới hạn lượt dùng</label>
                      <input type="number" value={newPromo.usageLimit} onChange={e => setNewPromo({...newPromo, usageLimit: e.target.value})} className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/10 outline-none text-xs transition" placeholder="Vô hạn nếu bỏ trống" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-400 text-[10px] font-black uppercase tracking-wider pl-1">Mô tả tóm tắt</label>
                      <textarea rows="2" value={newPromo.description} onChange={e => setNewPromo({...newPromo, description: e.target.value})} className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/10 outline-none text-xs resize-none transition" placeholder="Ghi chú nội bộ..." />
                    </div>
                  </div>
                </div>
              </form>

              {/* Modal Footer (Cố định chiều cao) */}
              <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3 rounded-b-3xl shrink-0">
                <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition border-none cursor-pointer">Hủy bỏ</button>
                <button onClick={handleCreatePromo} className="px-10 py-2 bg-[#2C3E2B] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#2C3E2B]/20 hover:scale-[1.02] active:scale-95 transition border-none cursor-pointer">Lưu chương trình</button>
              </div>
            </div>
          </div>
        )}

  {/* ==========================================
            MODAL 2: POPUP XEM CHI TIẾT KHUYẾN MÃI
          ========================================== */}
        {selectedDetail && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-left text-sm">
            <div className="bg-[#ffffff] max-w-sm w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative font-semibold text-gray-600">
              <button onClick={() => setSelectedDetail(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none">✖</button>
              <div className="border-b border-gray-200 pb-2">
                <h3 className="font-serif text-lg font-bold text-[#2C1E15]">Chi tiết mã khuyến mãi</h3>
                <p className="text-xs text-gray-400 font-mono">Mã: {selectedDetail.id}</p>
              </div>
              <div className="space-y-2.5 text-xs md:text-sm">
                <p><span className="text-gray-400 inline-block w-28">Tên chương trình:</span> <span className="text-gray-800 font-bold">{selectedDetail.name}</span></p>
                <p><span className="text-gray-400 inline-block w-28">Phương thức giảm:</span> <span className="text-gray-800 font-medium">{selectedDetail.type}</span></p>
                <p><span className="text-gray-400 inline-block w-28">Mức độ ưu đãi:</span> <span className="text-[#6E473B] font-bold">{selectedDetail.value}</span></p>
                <p><span className="text-gray-400 inline-block w-28">Hiệu lực áp dụng:</span> <span className="text-gray-800 font-medium font-mono">{selectedDetail.validity}</span></p>
                <p><span className="text-gray-400 inline-block w-28">Trạng thái sàn:</span> 
                  <span className={`ml-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${selectedDetail.status === 'Đang hoạt động' ? 'bg-green-50 text-green-700 border-green-200/50' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {selectedDetail.status}
                  </span>
                </p>
              </div>
              <div className="pt-2">
                <button onClick={() => setSelectedDetail(null)} className="w-full bg-[#2C3E2B] text-white py-2.5 rounded-xl text-xs font-bold transition shadow-sm border-none cursor-pointer">Đóng cửa sổ</button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            MODAL 3: POPUP CHỈNH SỬA MÃ (Date Picker trên Lịch)
          ========================================== */}
        {editingPromo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in text-left text-sm">
            <div className="bg-[#ffffff] max-w-md w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative font-semibold text-gray-600 max-h-[85vh] overflow-y-auto">
              <button onClick={() => setEditingPromo(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none">✖</button>
              <div className="border-b border-gray-200 pb-2">
                <h3 className="font-serif text-lg font-bold text-[#2C1E15]">Cập nhật mã khuyến mãi</h3>
                <p className="text-xs text-gray-400 font-mono">Mã cố định: {editingPromo.id}</p>
              </div>
              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs md:text-sm">
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold">Tên chương trình:</label>
                  <input 
                    required value={editingPromo.name} 
                    onChange={(e) => setEditingPromo({...editingPromo, name: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/20 focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-bold">Giá trị ưu đãi:</label>
                  <input 
                    required value={editingPromo.value} 
                    onChange={(e) => setEditingPromo({...editingPromo, value: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/20 focus:outline-none" 
                  />
                </div>
                
                {/* PHẦN CHỌN NGÀY HIỆU LỰC (Date Picker trực tiếp trên lịch) */}
                <div className="space-y-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <label className="text-gray-700 font-bold block border-b pb-1">Chỉnh sửa ngày hiệu lực:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-gray-400 text-[10px] font-bold uppercase">Bắt đầu:</label>
                      <input 
                        type="date" 
                        className="w-full p-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 text-xs font-mono h-9" 
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-[10px] font-bold uppercase">Kết thúc:</label>
                      <input 
                        type="date" 
                        className="w-full p-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 text-xs font-mono h-9" 
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 italic">Chọn ngày bắt đầu và kết thúc phía trên để thiết lập lại thời gian áp dụng mã.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-bold">Trạng thái:</label>
                  <select 
                    value={editingPromo.status} 
                    onChange={(e) => setEditingPromo({...editingPromo, status: e.target.value})}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2C3E2B]/20 focus:outline-none"
                  >
                    <option>Đang hoạt động</option>
                    <option>Ngưng</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button type="button" onClick={() => setEditingPromo(null)} className="bg-gray-200 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-300 transition border-none cursor-pointer text-gray-700">Hủy bỏ</button>
                  <button type="submit" className="bg-[#2C3E2B] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-90 transition border-none cursor-pointer">Cập nhật</button>
                </div>
              </form>
            </div>
          </div>
        )}

    </>
  );
}