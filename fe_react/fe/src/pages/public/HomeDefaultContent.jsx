

import { useState } from 'react';
export default function HomeDefaultContent({ setHasSearched, favorites, toggleFavorite, HomestayCard }) {
  
  // State quản lý Tab thành phố đang được chọn (Mặc định là Đà Lạt)
  const [activeCity, setActiveCity] = useState('Đà Lạt');

  // Khởi tạo dữ liệu mẫu phân theo thành phố để phục vụ tính năng chia Tab (Giống ảnh image_95ba24.jpg)
  const citiesData = {
    'Đà Lạt': [
      { id: 10, name: "Mộc Lâm Đỉnh Villa - View Rừng Thông Thơ Mộng", location: "Lạc Dương, Đà Lạt", price: "1,200,000", oldPrice: "1,800,000", rate: "4.9", orders: "142", img: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=400&auto=format&fit=crop" },
      { id: 12, name: "Cozygo Lake House - Bên Bờ Hồ Tuyền Lâm Bình Yên", location: "Hồ Tuyền Lâm, Đà Lạt", price: "2,100,000", oldPrice: "2,500,000", rate: "5.0", orders: "210", img: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=400&auto=format&fit=crop" },
      { id: 14, name: "Nhà Gỗ Nhỏ Tổ Chim - Homestay Săn Mây Ngoại Ô", location: "Trại Mát, Đà Lạt", price: "950,000", oldPrice: "1,300,000", rate: "4.8", orders: "85", img: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=400&auto=format&fit=crop" },
      { id: 15, name: "Biệt Thự Đất Nung Nguyên Căn Cao Cấp", location: "Phường 11, Đà Lạt", price: "3,200,000", oldPrice: "4,000,000", rate: "4.7", orders: "54", img: "https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=400&auto=format&fit=crop" },
    ],
    'Cần Thơ': [
      { id: 11, name: "Nha Mộc Riêng Biệt - Nhà Vườn Miền Tây Đậm Chất", location: "Ninh Kiều, Cần Thơ", price: "650,000", oldPrice: "900,000", rate: "4.8", orders: "98", img: "https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=400&auto=format&fit=crop" },
      { id: 16, name: "Cozygo Riverside Bungalow - View Sông Lộng Gió", location: "Cái Răng, Cần Thơ", price: "800,000", oldPrice: "1,100,000", rate: "4.9", orders: "120", img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=400&auto=format&fit=crop" },
    ],
    'Sapa': [
      { id: 13, name: "Nhà Tổ Chim Rừng Sâu - View Ruộng Bậc Thang", location: "Sapa, Lào Cai", price: "850,000", oldPrice: "1,200,000", rate: "4.7", orders: "64", img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=400&auto=format&fit=crop" },
      { id: 17, name: "Mộc Vân Bungalow - Bản Cát Cát Săn Mây Đỉnh Đèo", location: "Bản Cát Cát, Sapa", price: "1,150,000", oldPrice: "1,600,000", rate: "4.9", orders: "76", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400&auto=format&fit=crop" },
    ]
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* ==========================================
          SECTION 1: KHÁM PHÁ VIỆT NAM (GIỮ NGUYÊN LAYOUT CŨ)
         ========================================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-12 text-left animate-fade-in">
        <div className="mb-8">
          <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15] mb-1">Khám phá Việt Nam</h2>
          <p className="text-sm text-gray-400">Chọn địa danh để hiển thị ngay các homestay đặc trưng tại khu vực đó</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Đà Lạt Mộng Mơ", text: "Trốn nóng vùng cao cao nguyên sương phủ", img: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600&auto=format&fit=crop" },
            { name: "Cần Thơ Sông Nước", text: "Trải nghiệm văn hóa chợ nổi mộc mạc", img: "https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=600&auto=format&fit=crop" },
            { name: "Sapa Tây Bắc", text: "Ngắm ruộng bậc thang ngập tràn mây trắng", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop" }
          ].map((loc, idx) => (
            <div 
              key={idx} 
              onClick={() => setHasSearched(true)}
              className="relative h-56 rounded-2xl overflow-hidden shadow-md group cursor-pointer border border-[#6E473B]/5"
            >
              <img src={loc.img} alt={loc.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 brightness-[0.65]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#23150d]/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-left text-[#F4F1EA]">
                <h4 className="font-classic text-lg font-bold text-white mb-0.5">{loc.name}</h4>
                <p className="text-[11px] text-white/70 font-medium">{loc.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          SECTION 2: GÓI TRẢI NGHIỆM BẢN ĐỊA (GIỮ NGUYÊN THEO FILE CŨ)
         ========================================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 text-left">
        <div className="mb-8">
          <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15] mb-1">Gói trải nghiệm độc quyền</h2>
          <p className="text-sm text-gray-400">Thiết kế chuyến đi trọn vẹn hơn khi kết hợp lưu trú cùng các hoạt động mang đậm bản sắc địa phương</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: "Tour Lội Suối Cổ Sơ & BBQ", 
              desc: "Trekking nhẹ nhàng xuyên qua rừng thông già, lội suối đá và thưởng thức tiệc nướng gà đồi mộc mạc bên bờ suối.", 
              tag: "🌲 Bán chạy nhất", 
              price: "450.000đ/khách",
              bgImg: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=500"
            },
            { 
              title: "Bình Minh Chèo Sup Săn Mây", 
              desc: "Thức dậy từ 4:30 sáng, chèo sup lướt trên mặt hồ sương phủ và ngắm trọn vẹn khoảnh khắc bình minh đổ vàng trên đỉnh đồi.", 
              tag: "🛶 Trải nghiệm độc đáo", 
              price: "350.000đ/khách",
              bgImg: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=500"
            },
            { 
              title: "Một Ngày Làm Nông Dân", 
              desc: "Tự tay xuống ruộng cấy lúa nước, hái rau hữu cơ tại vườn mộc và học cách nướng cá lóc trui rơm chuẩn vị miền Tây.", 
              tag: "🌾 Văn hóa bản địa", 
              price: "290.000đ/khách",
              bgImg: "https://images.unsplash.com/photo-1599933310682-933fb45df8f5?q=80&w=500"
            }
          ].map((exp, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-[#6E473B]/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="h-44 w-full overflow-hidden relative">
                <img src={exp.bgImg} alt={exp.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <span className="absolute top-3 left-3 bg-[#2C3E2B] text-white font-bold text-[10px] px-2.5 py-1 rounded-md shadow-sm">{exp.tag}</span>
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-classic text-sm font-bold text-[#2C1E15] group-hover:text-[#6E473B] transition">{exp.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{exp.desc}</p>
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6E473B]">{exp.price}</span>
                  <button onClick={() => setHasSearched(true)} className="text-[11px] font-bold text-[#2C3E2B] hover:underline">
                    Xem homestay áp dụng →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================================================
          [THAY THẾ] SECTION 3: CHƯƠNG TRÌNH KHUYẾN MẠI CHỖ Ở (DỰA THEO ẢNH image_95c0a7.jpg)
          ========================================================================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 text-left">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-classic text-xl md:text-2xl font-bold text-[#2C1E15]">Chương trình khuyến mại chỗ ở</h2>
            <p className="text-sm text-gray-400 mt-0.5">Nhận các ưu đãi đặc quyền, giảm giá sâu cho hành trình của bạn</p>
          </div>
          <button 
            onClick={() => setHasSearched(true)} 
            className="text-sm font-bold text-[#2C3E2B] hover:text-[#6E473B] flex items-center gap-1 transition"
          >
            Xem tất cả <span className="text-[10px]">❯</span>
          </button>
        </div>

        {/* Thanh Slider Banner Khuyến Mãi Ngang */}
        <div className="relative flex items-center group">
          <div className="w-full overflow-x-auto flex space-x-5 scrollbar-none pb-4 snap-x">
            
            {/* Banner 1: Nhận mọi ưu đãi */}
            <div className="flex-shrink-0 w-[320px] sm:w-[380px] h-40 bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl p-5 relative overflow-hidden text-white flex flex-col justify-center snap-start border border-black/5 shadow-sm">
              <div className="absolute right-4 top-2 text-yellow-300 font-bold opacity-25 text-6xl select-none">%</div>
              <span className="bg-white/20 text-[9px] font-bold px-2 py-0.5 rounded-full w-fit mb-2">Độc quyền Cozygo</span>
              <h4 className="text-lg font-black leading-tight">Nhận mọi ưu đãi<br/>của quý khách tại đây!</h4>
              <p className="text-[10px] text-purple-200 mt-1 font-medium">✦ Áp dụng tự động khi thanh toán trực tuyến</p>
            </div>

            {/* Banner 2: Rừng thông mùa hè */}
            <div className="flex-shrink-0 w-[320px] sm:w-[380px] h-40 bg-gradient-to-r from-teal-700 to-[#2C3E2B] rounded-2xl p-5 relative overflow-hidden text-white flex flex-col justify-center snap-start border border-black/5 shadow-sm">
              <span className="bg-amber-400 text-[#23150d] text-[9px] font-extrabold px-2 py-0.5 rounded-md w-fit mb-2">WORLDWIDE</span>
              <h4 className="text-lg font-black leading-tight">Top Match-Day<br/>Mộc Lâm Homestay</h4>
              <p className="text-[10px] text-teal-100 mt-1 font-medium">✦ Miễn phí dịch vụ nướng củi sân vườn đêm</p>
            </div>

            {/* Banner 3: Nghỉ hè bơi lướt */}
            <div className="flex-shrink-0 w-[320px] sm:w-[380px] h-40 bg-gradient-to-r from-green-600 to-[#7d9f81] rounded-2xl p-5 relative overflow-hidden text-white flex flex-col justify-center snap-start border border-black/5 shadow-sm">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <span className="bg-white text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full w-fit mb-2">Nghỉ Hè Rực Rỡ</span>
              <h4 className="text-lg font-black leading-tight">Bơi, lướt, lặn, tiết kiệm<br/>Giảm thêm 15%</h4>
              <p className="text-[10px] text-green-100 mt-1 font-medium">✦ Áp dụng cho các căn hộ có hồ bơi vô cực</p>
            </div>

          </div>

          {/* Nút điều hướng mũi tên lướt sang phải như ảnh Booking */}
          <button className="absolute -right-3 bg-white text-gray-700 border border-gray-200 shadow-md w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs hover:bg-[#2C3E2B] hover:text-white hover:border-[#2C3E2B] transition z-20">
            ❯
          </button>
        </div>
      </section>

      {/* ==========================================================================
          [THAY THẾ] SECTION 4: NHỮNG CHỖ NGHỈ NỔI BẬT ĐƯỢC ĐỀ XUẤT (DỰA THEO ẢNH image_95ba24.jpg)
          ========================================================================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 text-left">
        
        {/* Tiêu đề & Nút Xem thêm thay đổi linh hoạt theo Tab */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="font-classic text-xl md:text-2xl font-bold text-[#2C1E15]">Những chỗ nghỉ nổi bật được đề xuất cho quý khách:</h2>
            <p className="text-sm text-gray-400 mt-0.5">Top danh mục phòng chất lượng cao được bình chọn nhiều nhất tuần qua</p>
          </div>
          <button 
            onClick={() => setHasSearched(true)}
            className="text-sm font-bold text-[#2C3E2B] hover:text-[#6E473B] hover:underline whitespace-nowrap shrink-0 transition"
          >
            Xem thêm các chỗ nghỉ ({activeCity}) ❯
          </button>
        </div>

        {/* HỆ THỐNG MENU TAB ĐA THÀNH PHỐ CHUẨN GIAO DIỆN MẪU */}
        <div className="flex space-x-6 border-b border-gray-200 text-xs font-bold mb-6 overflow-x-auto scrollbar-none">
          {Object.keys(citiesData).map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
              className={`pb-3 border-b-2 transition-all whitespace-nowrap px-1 ${
                activeCity === city
                  ? 'border-[#2C3E2B] text-[#2C3E2B] font-extrabold text-[13px]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* DANH SÁCH HOMESTAY PHÙ HỢP VỚI TAB THÀNH PHỐ ĐANG HOẠT ĐỘNG */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {citiesData[activeCity].map(item => (
            <HomestayCard 
              key={item.id} 
              item={item} 
              isFav={favorites.includes(item.id)} 
              onFavToggle={toggleFavorite} 
            />
          ))}
        </div>
      </section>

      {/* ==========================================
          SECTION 5: NHẬT KÝ REVIEW KHÁCH HÀNG (GIỮ NGUYÊN)
         ========================================== */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 text-left">
        <div className="mb-8">
          <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15] mb-1">Nhật ký những bước chân ấm</h2>
          <p className="text-sm text-gray-400">Những chia sẻ mộc mạc từ những người lữ hành đã chọn dừng chân tại hệ thống Cozygo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Minh Tú", role: "Cặp đôi trải nghiệm", avatar: "M", comment: "Căn homestay ở Hồ Tuyền Lâm thực sự làm vợ chồng mình sững sờ. Đêm lạnh, nhóm lò củi sưởi lên rồi cùng nhâm nhi tách trà cổ thì không còn gì bằng. Chắc chắn sẽ quay lại!", target: "Cozygo Lake House", stars: "⭐⭐⭐⭐⭐" },
            { name: "Khánh Linh", role: "Solo Traveler", avatar: "K", comment: "Đi trốn deadline một mình mà tìm được chỗ này ưng quá trời. Phòng tắm bồn gỗ mùi thông thơm thoang thoảng siêu thư giãn, chủ nhà lại nhiệt tình chỉ chỗ ăn bản địa ngon rẻ.", target: "Nha Mộc Riêng Biệt", stars: "⭐⭐⭐⭐⭐" },
            { name: "Gia đình anh Đức", role: "Chuyến đi 5 thành viên", avatar: "Đ", comment: "Sân cỏ rộng vô cùng, các bé nhà mình chạy nhảy thoải mái không lo xe cộ. Tối cả nhà cùng mở tiệc nướng BBQ ngoài trời giữa không khí se lạnh Đà Lạt cực kỳ kỷ niệm.", target: "Mộc Lâm Đỉnh Villa", stars: "⭐⭐⭐⭐★" }
          ].map((rev, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-[#6E473B]/5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-amber-400 text-xs tracking-tighter">{rev.stars}</div>
                <p className="text-xs text-gray-600 italic leading-relaxed">"{rev.comment}"</p>
              </div>
              <div className="flex items-center space-x-3 pt-2 border-t border-gray-50">
                <div className="w-8 h-8 rounded-full bg-[#2C3E2B] text-[#F4F1EA] text-xs font-bold flex items-center justify-center">{rev.avatar}</div>
                <div>
                  <h4 className="text-sm font-bold text-[#2C1E15]">{rev.name}</h4>
                  <p className="text-[12px] text-gray-400 font-medium">{rev.role} • <span className="text-[#6E473B] font-semibold">{rev.target}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}