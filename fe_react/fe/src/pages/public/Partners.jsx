import { useNavigate } from 'react-router-dom';
import UserLayout from '../../layout/UserLayout';

export default function Partners() {
  const navigate = useNavigate();

  // Hàm xử lý điều hướng thẳng đến trang đăng ký với vai trò Chủ nhà mặc định
  const handleGoToRegisterHost = () => {
    navigate('/register', { 
      state: { userType: 'host' } 
    });
  };

  return (
    <UserLayout>
      <div className="bg-[#F4F1EA] min-h-screen text-[#23150d] animate-fade-in space-y-16 pb-24">
        
        {/* ==========================================
            1. HERO BANNER ĐẦU TRANG
           ========================================== */}
        <section className="bg-[#202c3c] text-white pt-20 pb-24 px-6 md:px-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50 z-0 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-3">
            <span className="bg-[#6E473B] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-sm">
              Cộng đồng chủ nhà Cozygo
            </span>
            <h1 className="font-classic text-3xl md:text-5xl font-serif font-bold tracking-tight">
              Hợp Tác Phát Triển Cùng Cozygo
            </h1>
            <p className="text-xs md:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
              Khai phóng tiềm năng cơ sở lưu trú của bạn. Kết nối trực tiếp với cộng đồng lữ khách đam mê trải nghiệm mộc mạc và thiên nhiên hoang sơ.
            </p>
          </div>
        </section>

        {/* ==========================================
            2. KHỐI LÝ DO NÊN CHỌN COZYGO (ĐIỂM KHÁC BIỆT SO VỚI SÀN KHÁC)
           ========================================== */}
        <section className="max-w-6xl mx-auto px-6 text-left">
          <div className="text-center md:text-left mb-10 space-y-1">
            <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15]">
              Tại sao nên chọn Cozygo mà không phải sàn khác?
            </h2>
            <p className="text-xs text-gray-400">
              Chúng tôi tạo ra một hệ sinh thái ngách chuyên biệt, nơi giá trị không gian của bạn được trân trọng tối đa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-[#6E473B]/10 shadow-sm space-y-3">
              <div className="text-2xl bg-[#6E473B]/10 text-[#6E473B] w-10 h-10 rounded-xl flex items-center justify-center">🎯</div>
              <h3 className="font-classic text-sm font-bold text-[#2C1E15]">Đúng tệp khách hàng mục tiêu</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Khác với các sàn OTA đại trà (như Agoda, Booking), tệp khách hàng của Cozygo là những người chủ động tìm kiếm gu nghỉ dưỡng mộc mạc, yêu thiên nhiên, và sẵn sàng chi trả cao cho các gói trải nghiệm bản địa đi kèm.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#6E473B]/10 shadow-sm space-y-3">
              <div className="text-2xl bg-[#2C3E2B]/10 text-[#2C3E2B] w-10 h-10 rounded-xl flex items-center justify-center">📉</div>
              <h3 className="font-classic text-sm font-bold text-[#2C1E15]">Chiết khấu sàn cực thấp (Chỉ 8%)</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Nói tạm biệt với mức phí hoa hồng cắt cổ 15% - 20% từ các tập đoàn nước ngoài. Cozygo đồng hành bền vững cùng chủ nhà Việt với mức phí tối ưu chỉ 8%, giúp bạn tối đa hóa biên lợi nhuận thực tế.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#6E473B]/10 shadow-sm space-y-3">
              <div className="text-2xl bg-amber-500/10 text-amber-700 w-10 h-10 rounded-xl flex items-center justify-center">⚡</div>
              <h3 className="font-classic text-sm font-bold text-[#2C1E15]">Hệ thống vận hành tự động</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Tích hợp lịch đồng bộ thời gian thực chống overbook, hệ thống tự động tạo mã tracking, gửi thông báo trạng thái đặt phòng qua email và đối soát doanh thu tự động chuẩn xác hàng tuần.
              </p>
            </div>
          </div>
        </section>

        {/* ==========================================
            3. KHỐI QUYỀN LỢI CỦA ĐỐI TÁC CHỦ NHÀ
           ========================================== */}
        <section className="max-w-6xl mx-auto px-6 text-left">
          <div className="text-center md:text-left mb-10 space-y-1">
            <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15]">
              Quyền lợi đặc quyền khi đồng hành
            </h2>
            <p className="text-xs text-gray-400">
              Cozygo cam kết hỗ trợ toàn diện để cơ sở kinh doanh của bạn đạt tỷ lệ lấp phòng tối ưu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm font-medium text-gray-600">
            <div className="flex items-start gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xl">📸</span>
              <div>
                <h4 className="font-bold text-[#2C1E15] mb-1">Hỗ trợ truyền thông & Nhiếp ảnh</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Đội ngũ media của Cozygo hỗ trợ chụp ảnh không gian, quay video ngắn trải nghiệm bản địa miễn phí để đẩy mạnh quảng bá trên đa nền tảng mạng xã hội.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xl">🛠️</span>
              <div>
                <h4 className="font-bold text-[#2C1E15] mb-1">Hệ thống quản lý thông minh (CMS)</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Cung cấp tài khoản Extranet chuyên nghiệp độc quyền, giúp quản lý quỹ phòng, điều chỉnh bảng giá mùa cao điểm/thấp điểm linh hoạt chỉ trong 1 chạm.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xl">🤝</span>
              <div>
                <h4 className="font-bold text-[#2C1E15] mb-1">Đóng gói gói trải nghiệm độc quyền</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Hỗ trợ thiết kế, lồng ghép các hoạt động đặc thù tại homestay của bạn (như tiệc nướng BBQ, lội suối, cấy lúa) thành combo hấp dẫn để gia tăng doanh thu trên mỗi lượt khách.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-xl">⚖️</span>
              <div>
                <h4 className="font-bold text-[#2C1E15] mb-1">Bảo vệ quyền lợi chủ nhà tuyệt đối</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Áp dụng chính sách đặt cọc nghiêm ngặt, quy trình xử lý đền bù hư tổn tài sản minh bạch và bộ quy tắc ứng xử bắt buộc đối với mọi lữ khách khi thuê phòng.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            4. KHỐI ĐIỀU KHOẢN SỬ DỤNG TÀI KHOẢN ĐỐI TÁC
           ========================================== */}
        <section className="max-w-4xl mx-auto px-6 text-left">
          <div className="space-y-4 bg-white p-6 md:p-8 rounded-2xl border border-[#6E473B]/5 shadow-sm">
            <h2 className="font-classic text-xl md:text-2xl font-bold text-[#2C1E15] border-b border-gray-100 pb-3 flex items-center gap-2">
              📜 Quy định điều khoản sử dụng tài khoản đối tác Cozygo
            </h2>
            <div className="text-xs md:text-sm text-gray-600 leading-relaxed space-y-3 font-medium">
              <p>
                Cá nhân có quyền truy cập vào hệ thống quản lý trực tuyến (**Cozygo Extranet**) phải tuân thủ nghiêm ngặt các quy định sau: không gửi tin nhắn rác tiếp thị sai mục đích đến khách hàng, không giả mạo danh tính, không chia sẻ hay bán lại thông tin đăng nhập, không tải lên mã độc gây suy yếu máy chủ dữ liệu.
              </p>
              <p>
                Mọi hành vi vi phạm ảnh hưởng đến uy tín hệ thống sẽ bị **đình chỉ quyền truy cập lập tức** và chấm dứt hợp đồng vĩnh viễn theo thỏa thuận ký kết chính thức.
              </p>
            </div>
          </div>
        </section>

        {/* ==========================================
            5. KHỐI NÚT KÊU GỌI HÀNH ĐỘNG KHỔ LỚN (THAY CHO KHUNG CŨ)
           ========================================== */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-[#2C3E2B] text-white p-8 md:p-12 rounded-[32px] space-y-6 shadow-xl relative overflow-hidden flex flex-col items-center justify-center">
            {/* Lớp kính mờ nghệ thuật */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none"></div>
            
            <div className="relative z-10 max-w-xl mx-auto space-y-2">
              <h3 className="font-classic text-xl md:text-2xl font-bold text-[#E7B10A]">
                Bắt đầu hành trình thịnh vượng cùng Cozygo ngay hôm nay
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Hệ thống tự động đồng bộ vai trò Chủ Nhà để tối giản hóa các bước xác minh hồ sơ của bạn.
              </p>
            </div>

            {/* NÚT ĐIỀU HƯỚNG LINK SANG TRANG ĐĂNG KÝ VỚI TYPE CHỦ NHÀ MẶC ĐỊNH */}
            <button 
              onClick={handleGoToRegisterHost}
              className="relative z-10 bg-[#6E473B] hover:bg-[#57362c] text-white font-bold text-xs md:text-sm uppercase tracking-widest px-10 py-4 rounded-2xl shadow-xl transition transform active:scale-98 flex items-center gap-2"
            >
              🚀 Đăng ký kinh doanh với vai trò chủ nhà
            </button>
          </div>
        </section>

      </div>
    </UserLayout>
  );
}