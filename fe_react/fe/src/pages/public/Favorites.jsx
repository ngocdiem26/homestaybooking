import UserLayout from '../../layout/UserLayout';
// SỬA TẠI ĐÂY: Import đúng tên component card dọc đã chia module
import VerticalHomestayCard from '../../component/VerticalHomestayCard';

export default function Favorites({ favorites, toggleFavorite }) {
  
  // Dữ liệu mock-data danh sách phòng mẫu để tìm kiếm đối chiếu hiển thị
  const allHomestays = [
    { id: 10, name: "Mộc Lâm Đỉnh Villa", location: "Lạc Dương, Đà Lạt", price: "1,200,000", oldPrice: "1,800,000", score: "4.9", reviewText: "Tuyệt hảo", reviewsCount: 142, orders: "142", roomType: "Biệt thự gỗ", distance: "Cách trung tâm 2km", img: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=400&auto=format&fit=crop" },
    { id: 11, name: "Nha Mộc Riêng Biệt", location: "Ninh Kiều, Cần Thơ", price: "650,000", oldPrice: "900,000", score: "4.8", reviewText: "Rất tốt", reviewsCount: 98, orders: "98", roomType: "Nhà vườn mộc", distance: "Cách trung tâm 1km", img: "https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=400&auto=format&fit=crop" },
    { id: 12, name: "Cozygo Lake House", location: "Hồ Tuyền Lâm, Đà Lạt", price: "2,100,000", oldPrice: "2,500,000", score: "5.0", reviewText: "Xuất sắc", reviewsCount: 210, orders: "210", roomType: "Nhà ven hồ", distance: "Cách trung tâm 5km", img: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=400&auto=format&fit=crop" },
    { id: 13, name: "Nhà Tổ Chim Rừng Sâu", location: "Sapa, Lào Cai", price: "850,000", oldPrice: "1,200,000", score: "4.7", reviewText: "Tốt", reviewsCount: 64, orders: "64", roomType: "Bungalow mây", distance: "Cách trung tâm 3km", img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=400&auto=format&fit=crop" },
  ];

  // 1. Lọc ra danh sách các phòng mà người dùng ĐÃ bấm trái tim yêu thích
  const userFavoriteList = allHomestays.filter(item => favorites.includes(item.id));

  // 2. Lấy ra các phòng GỢI Ý (Những phòng còn lại mà người dùng CHƯA bấm yêu thích)
  const recommendedList = allHomestays.filter(item => !favorites.includes(item.id));

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 animate-fade-in text-left space-y-16">
        
        {/* KHỐI 1: DANH SÁCH HOMESTAY ĐÃ YÊU THÍCH */}
        <div>
          <div className="border-b border-gray-200 pb-4 mb-8">
            <h1 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15] flex items-center gap-2">
              ❤️ Danh sách yêu thích của bạn
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Lưu trữ những chốn dừng chân ấm áp bạn đã chọn cho hành trình sắp tới ({userFavoriteList.length} chỗ nghỉ)
            </p>
          </div>

          {userFavoriteList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center max-w-md mx-auto space-y-4">
              <span className="text-4xl block">🤍</span>
              <h3 className="font-bold text-sm text-[#2C1E15]">Chưa có homestay yêu thích nào</h3>
              <p className="text-xs text-gray-400">Hãy duyệt quanh trang chủ và bấm vào biểu tượng trái tim trên các căn hộ gỗ để lưu giữ chúng tại đây.</p>
              <a href="/" className="inline-block bg-[#2C3E2B] text-white font-bold text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-sm hover:bg-[#1f2d20] transition">
                Khám phá chỗ ở ngay
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {userFavoriteList.map(item => (
                // SỬA TẠI ĐÂY: Đổi tên thẻ thành VerticalHomestayCard
                <VerticalHomestayCard 
                  key={item.id}
                  item={item}
                  isFav={true} 
                  onFavToggle={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>

        {/* KHỐI 2: ĐỀ XUẤT CÁC HOMESTAY TƯƠNG TỰ (TỰ ĐỘNG CẬP NHẬT) */}
        <div>
          <div className="border-b border-gray-200 pb-4 mb-8">
            <h2 className="font-classic text-xl md:text-2xl font-bold text-[#2C1E15]">
              💡 Có thể bạn cũng sẽ thích những không gian này
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Gợi ý dựa trên gu thẩm mỹ mộc mạc và tần suất tìm kiếm phổ biến từ cộng đồng lữ hành Cozygo
            </p>
          </div>

          {recommendedList.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Bạn đã yêu thích toàn bộ bộ sưu tập hiện tại của chúng tôi!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedList.map(item => (
                // SỬA TẠI ĐÂY: Đổi tên thẻ thành VerticalHomestayCard
                <VerticalHomestayCard 
                  key={item.id}
                  item={item}
                  isFav={favorites.includes(item.id)}
                  onFavToggle={toggleFavorite}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </UserLayout>
  );
}