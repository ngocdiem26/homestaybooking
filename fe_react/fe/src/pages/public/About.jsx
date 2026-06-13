import { useNavigate } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';

export default function About() {
  const navigate = useNavigate();

  return (
    <UserLayout>
      <div className="bg-[#F4F1EA] min-h-screen text-[#23150d] animate-fade-in">
        
        {/* ==========================================
            1. KHỐI TIÊU ĐỀ TRANG (HERO SECTION)
           ========================================== */}
        <section className="bg-[#202c3c] text-white pt-20 pb-24 px-6 md:px-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/50 z-0 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-3">
            <span className="bg-[#6E473B] text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow-sm">
              Câu chuyện thương hiệu
            </span>
            <h1 className="font-classic text-3xl md:text-5xl font-serif font-bold tracking-tight">
              Về Cozygo – Homestay
            </h1>
            <p className="text-xs md:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
              Hành trình định nghĩa lại những chuyến đi trốn, nơi mỗi điểm dừng chân đều ôm ấp bước chân người lữ hành bằng hơi ấm bản địa.
            </p>
          </div>
        </section>

        {/* ==========================================
            2. KHỐI CÂU CHUYỆN SÁNG LẬP & TẦM NHÌN (STORY)
           ========================================== */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#6E473B] uppercase tracking-wider block">Chúng tôi là ai?</span>
              <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15] leading-tight">
                Khởi nguồn từ mong muốn tìm lại sự bình yên trong tâm hồn
              </h2>
            </div>
            
            <div className="text-xs md:text-sm text-gray-600 space-y-4 leading-relaxed font-medium">
              <p>
                Cozygo được thành lập vào năm 2026, bắt đầu từ tình yêu nguyên bản với những ngôi nhà gỗ nép mình bên sườn đồi sương phủ ở Đà Lạt, những căn nhà bên bến sông lộng gió miền Tây hay những mái tranh mộc mạc vùng cao Tây Bắc.
              </p>
              <p>
                Chúng tôi nhận ra rằng, giữa nhịp sống đô thị hối hả và áp lực, du khách ngày nay không chỉ đơn thuần tìm kiếm một chiếc giường để ngủ qua đêm. Họ tìm kiếm một **Chốn về ấm cúng giữa lòng thiên nhiên** — nơi họ có thể thực sự ngắt kết nối với thế giới công nghệ để kết nối lại với chính mình và những người thân yêu.
              </p>
              <p>
                Chính vì vậy, Cozygo ra đời không chỉ với tư cách là một nền tảng đặt phòng, mà là cầu nối mang những trải nghiệm văn hóa bản địa mộc mạc, chân thực nhất đến gần hơn với bước chân người lữ hành.
              </p>
            </div>
          </div>

          {/* Hình ảnh minh họa không gian mộc mạc */}
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="space-y-4">
              <img src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=400" alt="Chốn về thiên nhiên 1" className="w-full h-64 object-cover rounded-3xl border border-[#6E473B]/10 shadow-sm" />
              <img src="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=400" alt="Chốn về thiên nhiên 2" className="w-full h-44 object-cover rounded-3xl border border-[#6E473B]/10 shadow-sm" />
            </div>
            <div className="space-y-4 pt-8">
              <img src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=400" alt="Chốn về thiên nhiên 3" className="w-full h-44 object-cover rounded-3xl border border-[#6E473B]/10 shadow-sm" />
              <img src="https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=400" alt="Chốn về thiên nhiên 4" className="w-full h-64 object-cover rounded-3xl border border-[#6E473B]/10 shadow-sm" />
            </div>
          </div>
        </section>

        {/* ==========================================
            3. KHỐI GIÁ TRỊ CỐT LÕI (CORE VALUES)
           ========================================== */}
        <section className="bg-white py-20 border-y border-[#6E473B]/10 text-left">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
              <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15]">Giá Trị Chúng Tôi Theo Đuổi</h2>
              <p className="text-xs text-gray-400">Những nguyên tắc cốt lõi giúp Cozygo xây dựng lòng tin bền vững trong lòng khách hàng</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "🪵", title: "Kiến trúc mộc bản", desc: "100% các không gian lưu trú trong hệ thống Cozygo đều sở hữu ngôn ngữ thiết kế mộc mạc, ưu tiên vật liệu gỗ thông thủ công đem lại sự ấm cúng kỳ diệu." },
                { icon: "🌾", title: "Trải nghiệm chân thực", desc: "Chúng tôi kết hợp sâu sắc việc lưu trú cùng các hoạt động văn hóa bản địa: tát mương bắt cá đồng, cấy lúa nước hay dệt thổ cẩm cùng đồng bào vùng cao." },
                { icon: "✨", title: "Kính mờ xuyên thấu", desc: "Triết lý thiết kế giao diện Glassmorphism hiện đại phản chiếu qua dịch vụ: rõ ràng, minh bạch thông tin giá cả, luôn đặt sự hài lòng của khách lên hàng đầu." }
              ].map((value, i) => (
                <div key={i} className="bg-[#F4F1EA]/40 p-6 rounded-2xl border border-[#6E473B]/5 space-y-3 hover:shadow-md transition duration-300">
                  <span className="text-3xl block p-2 bg-white rounded-xl w-fit shadow-sm">{value.icon}</span>
                  <h3 className="font-classic text-sm font-bold text-[#2C1E15]">{value.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================
            4. KHỐI CON SỐ THỐNG KÊ ẤN TƯỢNG (STATS)
           ========================================== */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 text-center">
          <div className="bg-[#2C3E2B] rounded-[32px] p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[#7d9f81]/5 backdrop-blur-[2px] pointer-events-none"></div>
            {[
              { number: "750+", label: "Homestay Nguyên Căn" },
              { number: "25K+", label: "Lượt Đặt Phòng Thành Công" },
              { number: "98%", label: "Khách Hàng Hài Lòng" },
              { number: "15+", label: "Vùng Trải Nghiệm Bản Địa" }
            ].map((stat, i) => (
              <div key={i} className="relative z-10 space-y-1">
                <div className="text-2xl md:text-4xl font-black text-[#E7B10A] tracking-tight font-mono">{stat.number}</div>
                <div className="text-[10px] md:text-xs font-bold text-gray-300 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================
            5. KHỐI KÊU GỌI HÀNH ĐỘNG (CTA)
           ========================================== */}
        <section className="max-w-4xl mx-auto px-6 pb-20 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15]">Sẵn sàng cho một hành trình tìm về?</h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Hãy để Cozygo đồng hành cùng bạn trên từng cung đường, lưu giữ những bước chân ấm áp bên cạnh những người thân yêu nhất.
            </p>
          </div>
          <div className="flex justify-center gap-4 text-xs font-bold uppercase tracking-wider">
            <button 
              onClick={() => navigate('/')} 
              className="bg-[#6E473B] hover:bg-[#57362c] text-white px-8 py-3.5 rounded-xl shadow-md transition active:scale-95"
            >
              Đặt chỗ ở ngay 🏠
            </button>
            <button 
              onClick={() => navigate('/activities')} 
              className="bg-[#2C3E2B] hover:bg-[#1f2d20] text-white px-8 py-3.5 rounded-xl shadow-md transition active:scale-95"
            >
              Xem hoạt động trải nghiệm 🌲
            </button>
          </div>
        </section>

      </div>
    </UserLayout>
  );
}