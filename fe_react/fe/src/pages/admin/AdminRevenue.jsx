import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/common/Pagination';

// Cài đặt đồ thị giả lập bằng Chart.js hoặc Recharts (sử dụng div minh họa để tránh lỗi biên dịch nếu chưa cài thư viện đồ thị)
// Hướng dẫn tích hợp thực tế: Có thể dùng Recharts hoặc react-chartjs-2
export default function AdminRevenue() {
  const navigate = useNavigate();

  // 1. DỮ LIỆU GIẢ LẬP KHOẢN THU
  const [revenueStats] = useState({
    totalRevenue: "100.783.000đ",
    totalOrders: 115,
  });

  const [activeTab, setActiveTab] = useState('Theo tháng');
  const [statusTab, setStatusTab] = useState('Tất cả');
  const [selectedMonth, setSelectedMonth] = useState('2025-11');
  const [selectedHomestay, setSelectedHomestay] = useState('Tất cả homestay');

  // Dữ liệu bảng lịch sử giao dịch doanh thu
  const [transactions] = useState([
    { id: "BKG-325", customer: "Trần Thị Thanh Thanh", homestay: "Bungalow Gỗ Bên Sông", amount: "4.200.000đ", status: "Hoàn tất", date: "30/11/2025 18:13" },
    { id: "BKG-324", customer: "Mộc Miên", homestay: "Nhà Gỗ Thông Đà Lạt", amount: "1.800.000đ", status: "Hoàn tất", date: "25/11/2025 19:06" },
    { id: "BKG-323", customer: "Nguyễn Văn An", homestay: "Nhà Gỗ Thông Đà Lạt", amount: "3.560.000đ", status: "Hoàn tất", date: "12/11/2025 16:30" },
    { id: "BKG-320", customer: "Phạm Văn B", homestay: "Homestay Rừng Tràm Mộc", amount: "1.320.000đ", status: "Hoàn tất", date: "07/11/2025 14:02" },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const currentItems = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Dữ liệu mô phỏng biểu đồ đường (Doanh thu theo ngày tháng 11/2025)
  const chartData = [
    { day: "01/11", value: 15000000 },
    { day: "03/11", value: 8000000 },
    { day: "05/11", value: 6000000 },
    { day: "07/11", value: 3000000 },
    { day: "09/11", value: 13000000 },
    { day: "11/11", value: 17500000 },
    { day: "13/11", value: 15000000 },
    { day: "15/11", value: 10000000 },
    { day: "17/11", value: 6000000 },
    { day: "19/11", value: 7000000 },
    { day: "21/11", value: 8000000 },
    { day: "23/11", value: 6000000 },
    { day: "25/11", value: 6500000 },
    { day: "27/11", value: 11000000 },
    { day: "29/11", value: 7000000 },
    { day: "30/11", value: 22000000 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5 animate-fade-in text-left text-sm -mt-6 font-sans text-gray-700">
        
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

        {/* HEADER VÀ THỐNG KÊ TỔNG QUAN */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 bg-[#2C3E2B]/10 rounded-xl flex items-center justify-center text-[#2C3E2B] shrink-0 border border-[#2C3E2B]/5 shadow-inner mt-0.5">
              <span className="text-xl">📊</span>
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-xl md:text-2xl font-bold text-[#2C1E15]">Quản lý doanh thu hệ thống</h2>
              <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-xl">
                Xem tổng quan doanh thu, thống kê chi tiết đơn đặt phòng, theo dõi theo ngày, tháng, năm hay bất kỳ mốc thời gian nào.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 self-stretch md:self-auto justify-end">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl min-w-[140px] text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng doanh thu</p>
              <p className="text-base font-extrabold text-[#2C3E2B] mt-1">{revenueStats.totalRevenue}</p>
            </div>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl min-w-[120px] text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tổng số đơn</p>
              <p className="text-base font-extrabold text-gray-700 mt-1">lượt {revenueStats.totalOrders}</p>
            </div>
          </div>
        </div>

        {/* BẢNG ĐIỀU KHIỂN THỜI GIAN & BỘ LỌC */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm space-y-4">
          {/* Tabs bộ lọc thời gian */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div className="flex bg-[#EBE7DF] p-1.5 rounded-xl font-bold text-[11px] shadow-inner border border-gray-300/30">
              {['Theo ngày', 'Theo tháng', 'Theo năm', 'Khoảng ngày'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${activeTab === tab ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-xs w-full">
              {activeTab === 'Theo tháng' && (
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 text-xs font-mono"
                />
              )}
              {activeTab === 'Theo ngày' && (
                <input 
                  type="date" 
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 text-xs font-mono"
                />
              )}
              {activeTab === 'Khoảng ngày' && (
                <div className="flex items-center gap-1 text-[10px] w-full">
                  <input type="date" className="w-full h-9 px-1.5 rounded-lg border border-gray-200" />
                  <span className="text-gray-400 font-bold">~</span>
                  <input type="date" className="w-full h-9 px-1.5 rounded-lg border border-gray-200" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-500">
            <span>Lọc trạng thái thanh toán:</span>
            <div className="flex flex-wrap gap-1.5">
              {['Tất cả', 'Đang chờ', 'Chờ thanh toán', 'Đã xác nhận', 'Đã thanh toán', 'Hoàn tất', 'Đã hủy'].map(status => (
                <button 
                  key={status} 
                  onClick={() => setStatusTab(status)}
                  className={`px-3 py-1.5 rounded-xl border transition ${statusTab === status ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-gray-500 pt-2 border-t">
            <span>Homestay:</span>
            <select 
              value={selectedHomestay} 
              onChange={(e) => setSelectedHomestay(e.target.value)}
              className="h-9 px-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3E2B]/20 text-xs font-semibold"
            >
              <option>Tất cả homestay</option>
              <option>Bungalow Gỗ Bên Sông</option>
              <option>Nhà Gỗ Thông Đà Lạt</option>
              <option>Homestay Rừng Tràm Mộc</option>
            </select>
          </div>
        </div>

        {/* BIỂU ĐỒ DOANH THU THEO NGÀY (Mô phỏng đồ thị) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-[#2C1E15]">Biểu đồ doanh thu theo ngày</h3>
          <div className="h-64 flex items-end gap-2 border-b border-l pb-2 pl-4 relative">
            {/* Trục tung (Giá trị ước tính) */}
            <div className="absolute -left-6 top-0 h-full flex flex-col justify-between text-[9px] text-gray-400 font-mono">
              <span>25.000.000đ</span>
              <span>18.750.000đ</span>
              <span>12.500.000đ</span>
              <span>6.250.000đ</span>
              <span>0đ</span>
            </div>

            {/* Các cột biểu đồ */}
            {chartData.map((d, index) => {
              const heightPercentage = (d.value / 25000000) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                  <div 
                    style={{ height: `${heightPercentage}%` }}
                    className="w-full max-w-[28px] bg-[#2C3E2B] rounded-t-lg hover:bg-opacity-80 transition relative"
                    title={`${Number(d.value).toLocaleString('vi-VN')}đ`}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 font-mono pointer-events-none">
                      {Number(d.value).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono mt-1 -rotate-45 md:rotate-0 translate-y-1 md:translate-y-0 origin-top-left md:origin-center">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BẢNG LỊCH SỬ GIAO DỊCH LỌC THEO DOANH THU */}
        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[750px]">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-200/60 text-gray-500 font-bold uppercase text-xs tracking-wider">
                  <th className="p-4 w-[15%]">Mã đơn</th>
                  <th className="p-4 w-[22%]">Khách hàng</th>
                  <th className="p-4 w-[28%]">Homestay</th>
                  <th className="p-4 w-[15%]">Tổng tiền</th>
                  <th className="p-4 w-[10%] text-center">Trạng thái</th>
                  <th className="p-4 w-[10%] text-right">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700 text-sm">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/40 transition">
                      <td className="p-4 font-mono font-bold text-gray-900 truncate">{item.id}</td>
                      <td className="p-4 truncate">{item.customer}</td>
                      <td className="p-4 truncate">{item.homestay}</td>
                      <td className="p-4 text-[#6E473B] font-bold truncate">{item.amount}</td>
                      <td className="p-4 text-center truncate">
                        <span className="px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-200/50 font-bold text-[10px] inline-block max-w-full truncate">
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[10px] text-gray-400 text-right truncate">{item.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400 italic">Không tìm thấy dữ liệu giao dịch.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            setCurrentPage={setCurrentPage}
            totalItems={transactions.length} 
            itemName="giao dịch" 
          />
        </div>
      </div>
    </AdminLayout>
  );
}