import { useNavigate } from 'react-router-dom';
import HostLayout from '../../layouts/HostLayout';

export default function HostDashboard() {
  const navigate = useNavigate();

  // Dữ liệu cấu trúc thống kê 5 ô vuông hàng đầu (Đồng bộ 100% hình mẫu image_2a7003.jpg)
  const statsData = [
    { id: 1, label: "Homestay đang quản lý", count: "3", tag: "Tài sản", icon: "🏠", iconBg: "bg-gray-100 text-gray-700" },
    { id: 2, label: "Đơn chờ xác nhận", count: "1", tag: "Cần xử lý", icon: "📅", iconBg: "bg-gray-100 text-gray-700" },
    { id: 3, label: "Doanh thu khả dụng", count: "4.323.000 đ", tag: "Tháng này", icon: "🪙", iconBg: "bg-gray-100 text-gray-700", isCurrency: true },
    { id: 4, label: "Đánh giá mới", count: "2", tag: "Phản hồi", icon: "💬", iconBg: "bg-gray-100 text-gray-700" },
    { id: 5, label: "Khiếu nại mở", count: "1", tag: "Ưu tiên", icon: "⚠️", iconBg: "bg-gray-100 text-gray-700" }
  ];

  // Danh mục phím điều hướng lối tắt chứa URL thực tế cho việc chuyển hướng router vật lý
  const quickModules = [
    { id: 'homestays', title: "Quản lý Homestay", desc: "Cập nhật thông tin, ảnh, tiện nghi, dịch vụ và quy tắc riêng cho từng homestay bạn đang sở hữu.", icon: "🏠", btnText: "Vào quản lý", path: "/host/homestays" },
    { id: 'bookings', title: "Đơn đặt Homestay", desc: "Xem đơn đặt phòng mới, xác nhận lưu trú, theo dõi trạng thái nhận/trả phòng và tổng tiền của khách.", icon: "📅", btnText: "Vào quản lý đơn", path: "/host/bookings" },
    { id: 'revenue', title: "Quản lý Doanh thu", desc: "Thống kê chi tiết tài chính, số tiền thực nhận sau chiết khấu sàn, biểu đồ tăng trưởng và lịch sử rút tiền.", icon: "💰", btnText: "Xem doanh thu", path: "/host/revenue" },
    { id: 'reviews', title: "Quản lý Đánh giá", desc: "Đọc nhận xét của khách hàng đã lưu trú, theo dõi điểm số sao trung bình và viết phản hồi công khai.", icon: "💬", btnText: "Xem đánh giá", path: "/host/reviews" },
    { id: 'complaints', title: "Quản lý Khiếu nại", desc: "Tiếp nhận phản ánh từ khách về sự cố phát sinh, ghi nhận hướng xử lý hoàn cọc hoặc đền bù tổn thất.", icon: "⚠️", btnText: "Kiểm tra", path: "/host/complaints" }
  ];

  return (
    <HostLayout currentTab="dashboard">
      <div className="space-y-8 animate-fade-in">
        
        {/* BANNER KHÔNG GIAN LÀM VIỆC CHỦ NHÀ */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/70 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-[#6E473B] font-bold text-[10px] uppercase tracking-widest font-mono">OWNER WORKSPACE</p>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2C1E15]">Bảng điều khiển chủ homestay</h2>
            <p className="text-xs md:text-sm text-gray-400 font-medium">Theo dõi tài sản, đơn đặt phòng, doanh thu, đánh giá và khiếu nại của các homestay đang vận hành.</p>
          </div>
          <button 
            onClick={() => navigate('/host/homestays')}
            className="bg-[#2C3E2B] hover:bg-[#1f2d20] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition active:scale-95 border-none cursor-pointer shrink-0 self-start sm:self-auto flex items-center gap-1"
          >
            <span>+ Thêm homestay</span>
          </button>
        </div>

        {/* =========================================================
            A. KHỐI THỐNG KÊ CHI TIẾT 5 Ô VUÔNG ĐỒNG BỘ 100%
           ========================================================= */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statsData.map((stat) => (
            <div 
              key={stat.id}
              className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-between h-40 relative group hover:shadow-md transition duration-300"
            >
              <div className="flex items-center justify-between w-full">
                <span className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center text-sm shadow-inner`}>
                  {stat.icon}
                </span>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase tracking-tight">
                  {stat.tag}
                </span>
              </div>

              <div className="space-y-1 mt-auto">
                <h4 className={`font-black text-[#2C1E15] tracking-tight leading-none font-mono truncate
                  ${stat.isCurrency ? 'text-lg md:text-xl' : 'text-3xl md:text-4xl'}`}>
                  {stat.count}
                </h4>
                <p className="text-[11px] md:text-xs font-bold text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">{stat.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* =========================================================
            B. KHỐI CÁC LỐI TẮT CHỨC NĂNG - TỰ ĐỘNG CĂN GIỮA HÀNG CUỐI
           ========================================================= */}
        <section className="space-y-6">
          <h3 className="font-serif text-lg font-bold text-[#2C1E15] border-l-4 border-[#6E473B] pl-2.5">
            Danh mục quản lý hệ thống
          </h3>

          {/* Sử dụng Flexbox để tự động căn giữa các thẻ thừa ở hàng cuối */}
          <div className="flex flex-wrap justify-center gap-6 w-full">
            {quickModules.map((module) => (
              <div 
                key={module.id}
                onClick={() => navigate(module.path)}
                className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm flex flex-col justify-between h-64 hover:shadow-md hover:border-[#2C3E2B]/20 transition-all duration-300 group relative animate-fade-in w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] min-w-[280px] cursor-pointer"
              >
                {/* Mũi tên định hướng góc trên bên phải giống hệt ảnh image_2a0b7d.png */}
                <span className="absolute top-5 right-5 text-gray-300 group-hover:text-[#2C3E2B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                </span>

                <div className="space-y-4">
                  <span className="w-10 h-10 bg-[#2C3E2B] text-white rounded-xl flex items-center justify-center text-lg shadow-md group-hover:scale-105 transition">
                    {module.icon}
                  </span>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-extrabold text-[#2C1E15] border-b-2 border-transparent group-hover:text-[#2C3E2B] transition inline-block pb-0.5">
                      {module.title}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-3">
                      {module.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-start">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn kích hoạt sự kiện click của thẻ div cha bên ngoài
                      navigate(module.path);
                    }}
                    className="bg-[#2C3E2B] hover:bg-[#1f2d20] text-white text-[11px] font-bold px-4 py-2 rounded-lg shadow-sm transition active:scale-95 cursor-pointer border-none"
                  >
                    {module.btnText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </HostLayout>
  );
}