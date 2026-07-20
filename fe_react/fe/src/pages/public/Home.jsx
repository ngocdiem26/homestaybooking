import { useNavigate } from 'react-router-dom';
import banner from '../../assets/images/nha5.jpg';

// Import đúng component card dọc đã được chia tách ra thư mục riêng
import VerticalHomestayCard from '../../components/homestay/VerticalHomestayCard';
import HomestaySearchForm from '../../components/homestay/HomestaySearchForm';
import { buildSearchParams, saveSearchState } from '../../services/searchState';

// Import Layout chung và các vùng nội dung động
import UserLayout from '../../layouts/UserLayout'; 
import HomeDefaultContent from './HomeDefaultContent';

// SỬA TẠI ĐÂY: Nhận các props favorites và toggleFavorite từ AppRouter truyền xuống
export default function Home({ favorites, toggleFavorite }) {
  const navigate = useNavigate();

  const goToSearch = (search = {}) => {
    const savedSearch = saveSearchState(search);
    const params = buildSearchParams(savedSearch);
    navigate('/search' + (params.toString() ? '?' + params.toString() : ''));
  };

  return (
    // Bọc toàn bộ trang bằng UserLayout cố định Header và Footer
    <UserLayout>
      
      {/* ==========================================
          1. HERO BANNER & THANH SEARCH BOX CỐ ĐỊNH TRÊN ẢNH
         ========================================== */}
      <section className="relative h-[540px] flex items-center  justify-center overflow-visible z-20 ">
        <div className="absolute rounded-b-[50px] inset-0 z-0 overflow-hidden">
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
            Tìm kiếm ngay homestay cho chuyến đi của bạn 
          </button>
        </div>

        {/* THANH TÌM KIẾM ĐÈ LÊN BANNER CHÂN THỰC */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
          <HomestaySearchForm onSearch={goToSearch} />
        </div>
      </section>

      {/* ==========================================
          2. ĐIỀU PHỐI NỘI DUNG ĐỘNG PHÍA DƯỚI BANNER
         ========================================== */}
      <HomeDefaultContent 
        setHasSearched={goToSearch}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        HomestayCard={VerticalHomestayCard} 
      />

    </UserLayout>
  );
}
