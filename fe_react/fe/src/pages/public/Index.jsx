import { useState } from 'react';
import banner from '../../assets/nha5.jpg';

// Import đúng component card dọc đã được chia tách ra thư mục riêng
import VerticalHomestayCard from '../../component/VerticalHomestayCard';

// Import Layout chung và các vùng nội dung động
import UserLayout from '../../layout/UserLayout'; 
import HomeDefaultContent from './HomeDefaultContent';
import SearchContent from './SearchContent';

// SỬA TẠI ĐÂY: Nhận các props favorites và toggleFavorite từ AppRouter truyền xuống
export default function Index({ favorites, toggleFavorite }) {
  // Trạng thái kiểm soát việc bấm tìm kiếm (false: hiển thị trang chủ mặc định, true: hiển thị kết quả bộ lọc)
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
  };

  return (
    // Bọc toàn bộ trang bằng UserLayout cố định Header và Footer
    <UserLayout>
      
      {/* ==========================================
          1. HERO BANNER & THANH SEARCH BOX CỐ ĐỊNH TRÊN ẢNH
         ========================================== */}
      <section className="relative h-[540px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={banner} alt="Cozy Home Banner" className="w-full h-full brightness-[0.8] scale-100 object-cover" />
        </div>

        <div className="relative z-10 text-center text-[#F4F1EA] max-w-2xl px-4 animate-fade-in">
          <h1 className="font-classic text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight mb-4 drop-shadow-lg">
            Chốn Về Ấm Cúng<br/>Giữa Lòng Thiên Nhiên
          </h1>
          <button 
            onClick={() => { const el = document.getElementById('destination-input'); el && el.focus(); }}
            className="bg-[#6E473B] hover:bg-[#57362c] border border-white/10 text-white font-semibold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg transition"
          >
            Xem chi tiết & đặt phòng
          </button>
        </div>

        {/* THANH TÌM KIẾM ĐÈ LÊN BANNER CHÂN THỰC */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-20">
          <form onSubmit={handleSearch} className="bg-[#23150d]/90 backdrop-blur-md p-3 rounded-2xl md:rounded-full border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-2 md:gap-4 text-[#F4F1EA]">
            <div className="w-full md:w-auto px-4 py-2 font-bold text-xs uppercase tracking-wider text-white/50 border-b md:border-b-0 md:border-r border-white/10 whitespace-nowrap">
              Check Availability
            </div>
            <div className="w-full grid grid-cols-1 sm:grid-cols-4 gap-2 flex-grow">
              <div><input id="destination-input" type="text" required placeholder="📍Điểm đến ?" className="w-full bg-white text-gray-800 text-xs px-4 py-3 rounded-xl focus:outline-none border-0" /></div>
              <div><input type="text" required placeholder="🗓️ Nhận phòng" onFocus={(e) => e.target.type = 'date'} onBlur={(e) => e.target.type = 'text'} className="w-full bg-white text-gray-800 text-xs px-4 py-3 rounded-xl focus:outline-none border-0" /></div>
              <div><input type="text" required placeholder="🗓️ Trả phòng" onFocus={(e) => e.target.type = 'date'} onBlur={(e) => e.target.type = 'text'} className="w-full bg-white text-gray-800 text-xs px-4 py-3 rounded-xl focus:outline-none border-0" /></div>
              <div><input type="text" required placeholder="👤 Số khách" className="w-full bg-white text-gray-800 text-xs px-4 py-3 rounded-xl focus:outline-none border-0" /></div>
            </div>
            <button type="submit" className="w-full md:w-auto bg-[#6E473B] hover:bg-[#57362c] text-white font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-xl md:rounded-full shadow-lg shrink-0">Tìm kiếm</button>
          </form>
        </div>
      </section>

      {/* ==========================================
          2. ĐIỀU PHỐI NỘI DUNG ĐỘNG PHÍA DƯỚI BANNER
         ========================================== */}
      {!hasSearched ? (
        <HomeDefaultContent 
          setHasSearched={setHasSearched}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          // SỬA TẠI ĐÂY: Truyền đúng component card dọc đã tách làm module dùng chung
          HomestayCard={VerticalHomestayCard} 
        />
      ) : (
        <SearchContent 
          setHasSearched={setHasSearched}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}

    </UserLayout>
  );
}