
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';

export default function HomestayDetail() {
  const { id } = useParams(); // Lấy ID homestay từ URL


  // --- MOCK DATA ---
  const homestay = {
    id: id || "HS-01",
    title: "GÂY THƯƠNG NHỚ Homestay (View Sông Lãng Mạn)",
    location: "Vinhones Grand Park, Quận 9, Hồ Chí Minh",
    rating: 4.8,
    reviewCount: 124,
    pricePerNight: 1250000,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 2,
    host: { name: "Diễm N.", avatar: "https://i.pravatar.cc/150?img=47", joined: "2023" },
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?q=80&w=1974&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1951&auto=format&fit=crop"
    ],
    description: "Tận hưởng kỳ nghỉ tuyệt vời tại căn homestay nguyên căn sang trọng với tầm nhìn ôm trọn sông ngắm bình minh tuyệt đẹp.\n\nKhông gian yên tĩnh, thiết kế mộc mạc phong cách Cozygo nhưng đầy đủ tiện nghi hiện đại. Rất phù hợp cho gia đình hoặc nhóm bạn tìm kiếm sự riêng tư và thoải mái như ở nhà.",
    highlights: [
      { icon: "✨", title: "Tầm nhìn tuyệt đẹp", desc: "Cửa sổ kính sát trần nhìn thẳng ra bờ sông mát mẻ." },
      { icon: "🍳", title: "Bếp đầy đủ dụng cụ", desc: "Tự do nấu nướng với bếp từ, lò vi sóng, gia vị cơ bản." },
      { icon: "🔑", title: "Tự nhận phòng", desc: "Nhận phòng cực kỳ dễ dàng bằng khóa mật mã thông minh." }
    ],
    amenities: ["Wi-Fi miễn phí tốc độ cao", "Hồ bơi vô cực", "Bãi đỗ xe an toàn", "Máy giặt & sấy", "Ban công / Sân hiên", "Smart TV 55 inch", "Điều hòa nhiệt độ 2 chiều", "Dụng cụ nướng BBQ", "Bồn tắm nước nóng"],
    reviews: [
      { id: 1, name: "Minh Tuấn", date: "Tháng 11, 2025", text: "Nhà rất sạch sẽ, view ban công buổi tối cực kỳ xịn xò. Chị chủ nhà hỗ trợ nhiệt tình, 10 điểm cho dịch vụ.", score: 5 },
      { id: 2, name: "Ngọc Hân", date: "Tháng 10, 2025", text: "Phòng ốc y hình, không gian chung rộng rãi cho nhóm 5 người. Đầy đủ bát đĩa để nấu lẩu, rất ưng ý.", score: 4.5 },
    ]
  };

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [activeTab, setActiveTab] = useState('tong-quan');

  useEffect(() => {
    window.scrollTo(0, 0); // Reset scroll khi vào trang
  }, [id]);
 
  const formatDmy = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const scrollToSection = (sectionId) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 140; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <UserLayout>
      <div className="bg-[#F4F1EA] min-h-screen pb-20 font-sans text-gray-800">
        
       {/* ==========================================
            1. THANH TÌM KIẾM (CHUẨN TRANG CHỦ COZYGO)
           ========================================== */}
        <div className="pt-6 pb-2 px-4 sm:px-6 lg:px-8 relative z-20 ">
          <div className="max-w-275 mx-auto ">
           <form className="bg-[#23150d]/90 backdrop-blur-md p-3 rounded-2xl md:rounded-full border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-2 md:gap-4 text-[#F4F1EA]">
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
        </div>
        {/* ========================================== */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
          
          {/* 1. TIÊU ĐỀ & ĐÁNH GIÁ NHANH */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2C1E15] leading-tight">
              {homestay.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium mt-2">
              <span className="flex items-center text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                {homestay.rating} ({homestay.reviewCount} đánh giá)
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center text-gray-600 hover:text-[#2C3E2B] transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                <span className="underline decoration-gray-300 underline-offset-4">{homestay.location}</span>
              </span>
            </div>
          </div>
          
          {/* 2. THƯ VIỆN ẢNH GRID CAO CẤP */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 h-[300px] md:h-[460px] rounded-[32px] overflow-hidden shadow-sm border border-gray-200/50">
            <div className="md:col-span-2 md:row-span-2 h-full relative cursor-pointer group">
              <img src={homestay.images[0]} alt="Main" className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition duration-500"></div>
            </div>
            <div className="hidden md:block cursor-pointer group relative overflow-hidden"><img src={homestay.images[1]} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out" alt="view1"/></div>
            <div className="hidden md:block cursor-pointer group relative overflow-hidden"><img src={homestay.images[2]} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out" alt="view2"/></div>
            <div className="hidden md:block cursor-pointer group relative overflow-hidden"><img src={homestay.images[3]} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out" alt="view3"/></div>
            <div className="hidden md:block cursor-pointer group relative overflow-hidden">
              <img src={homestay.images[4]} className="w-full h-full object-cover brightness-75 group-hover:scale-110 group-hover:brightness-90 transition duration-700 ease-out" alt="view4"/>
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition duration-300">
                <span className="text-white font-bold border-2 border-white/80 px-5 py-2.5 rounded-xl backdrop-blur-sm shadow-lg">Xem tất cả ảnh</span>
              </div>
            </div>
          </div>

          {/* 3. THANH ĐIỀU HƯỚNG NHANH (Sticky Tabs) */}
          <div className="sticky top-[76px] z-40 bg-[#F4F1EA]/95 backdrop-blur-md pt-5 pb-3 border-b border-gray-300 mb-8 hidden md:block">
            <div className="flex gap-8 font-bold text-sm text-gray-500 px-2">
              {['tong-quan', 'tien-nghi', 'danh-gia', 'chinh-sach'].map(tab => (
                <button 
                  key={tab} onClick={() => scrollToSection(tab)}
                  className={`pb-3 border-b-[3px] transition-all duration-300 cursor-pointer ${activeTab === tab ? 'border-[#2C3E2B] text-[#2C3E2B]' : 'border-transparent hover:text-gray-800'}`}
                >
                  {tab === 'tong-quan' ? 'Tổng quan' : tab === 'tien-nghi' ? 'Cơ sở vật chất' : tab === 'danh-gia' ? 'Đánh giá' : 'Chính sách'}
                </button>
              ))}
            </div>
          </div>

          {/* 4. NỘI DUNG CHÍNH CHIA 2 CỘT */}
          <div className="flex flex-col lg:flex-row gap-12 mt-8 md:mt-2">
            
            {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
            <div className="lg:w-2/3 space-y-12">
              
              {/* Mục Tổng quan */}
              <div id="tong-quan">
                <div className="flex justify-between items-start border-b border-gray-200 pb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-[#2C1E15] font-serif">Toàn bộ căn nhà - Thuê nguyên căn</h2>
                    <p className="text-gray-600 mt-3 font-medium flex flex-wrap gap-x-3 gap-y-2 text-sm items-center">
                      <span className="bg-white border border-gray-200 px-3 py-1 rounded-xl shadow-sm">Tối đa {homestay.maxGuests} khách</span>
                      <span className="bg-white border border-gray-200 px-3 py-1 rounded-xl shadow-sm">{homestay.bedrooms} phòng ngủ</span>
                      <span className="bg-white border border-gray-200 px-3 py-1 rounded-xl shadow-sm">{homestay.beds} giường</span>
                      <span className="bg-white border border-gray-200 px-3 py-1 rounded-xl shadow-sm">{homestay.bathrooms} phòng tắm</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0 ml-4">
                    <img src={homestay.host.avatar} alt="Host" className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover" />
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wide mt-1">Chủ nhà</span>
                    <span className="text-xs font-bold text-[#2C1E15]">{homestay.host.name}</span>
                  </div>
                </div>

                {/* Điểm nổi bật */}
                <div className="py-8 border-b border-gray-200 space-y-6">
                  <h3 className="font-bold text-xl text-[#2C1E15] font-serif">Điểm nổi bật nhất</h3>
                  <div className="space-y-5">
                    {homestay.highlights.map((hl, idx) => (
                      <div key={idx} className="flex gap-5 items-start bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <span className="text-3xl drop-shadow-sm">{hl.icon}</span>
                        <div>
                          <h4 className="font-bold text-gray-800 text-base">{hl.title}</h4>
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{hl.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mô tả */}
                <div className="py-8 border-b border-gray-200 space-y-4">
                  <h3 className="font-bold text-xl text-[#2C1E15] font-serif">Về không gian này</h3>
                  <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">{homestay.description}</p>
                  <button className="font-bold text-[#6E473B] underline text-sm mt-2 hover:text-[#2C1E15] transition cursor-pointer border-none bg-transparent">Đọc thêm chi tiết</button>
                </div>
              </div>

              {/* Cơ sở vật chất */}
              <div id="tien-nghi" className="py-8 border-b border-gray-200">
                <h3 className="font-bold text-xl text-[#2C1E15] mb-6 font-serif">Nơi này có những gì cho bạn</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6 text-sm text-gray-700 font-medium">
                  {homestay.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm shrink-0">
                        <svg className="w-4 h-4 text-[#2C3E2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-8 px-6 py-3 rounded-xl border border-gray-300 font-bold text-sm hover:bg-gray-100 transition shadow-sm bg-white text-gray-700 cursor-pointer">
                  Hiển thị tất cả 24 tiện nghi
                </button>
              </div>

              {/* Đánh giá */}
              <div id="danh-gia" className="py-8 border-b border-gray-200">
                <h3 className="font-bold text-xl text-[#2C1E15] mb-8 font-serif">Bài đánh giá từ khách thật</h3>
                
                <div className="flex flex-col md:flex-row gap-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                  <div className="flex flex-col items-center justify-center md:border-r border-gray-200 pb-6 md:pb-0 md:pr-10 shrink-0">
                    <div className="bg-[#2C3E2B] text-white text-5xl font-extrabold w-24 h-24 flex items-center justify-center rounded-[28px] shadow-xl shadow-[#2C3E2B]/20">
                      {homestay.rating}
                    </div>
                    <span className="font-black text-xl mt-4 text-[#2C1E15] uppercase tracking-wide">Tuyệt vời</span>
                    <span className="text-xs text-gray-500 font-medium mt-1">Dựa trên {homestay.reviewCount} đánh giá</span>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                    {[ 
                      {label: "Độ sạch sẽ", score: 4.9}, 
                      {label: "Dịch vụ chủ nhà", score: 4.8}, 
                      {label: "Vị trí địa lý", score: 4.7}, 
                      {label: "Đáng tiền", score: 4.9} 
                    ].map(stat => (
                      <div key={stat.label}>
                        <div className="flex justify-between text-xs font-bold mb-2 text-gray-700 uppercase tracking-wide">
                          <span>{stat.label}</span>
                          <span>{stat.score}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-[#2C3E2B] h-2 rounded-full" style={{ width: `${(stat.score / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {homestay.reviews.map(review => (
                    <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-lg border-2 border-white shadow-sm">{review.name.charAt(0)}</div>
                            <div>
                              <p className="font-bold text-sm text-[#2C1E15]">{review.name}</p>
                              <p className="text-[11px] text-gray-400 font-mono mt-0.5">{review.date}</p>
                            </div>
                          </div>
                          <div className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-100 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>
                            {review.score}
                          </div>
                        </div>
                        <p className="text-[13px] text-gray-600 leading-relaxed italic">"{review.text}"</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-8 font-bold text-[#6E473B] underline text-sm hover:text-[#2C1E15] transition">Đọc toàn bộ {homestay.reviewCount} bài đánh giá</button>
              </div>

              {/* Chính sách */}
              <div id="chinh-sach" className="py-8 mb-10">
                <h3 className="font-bold text-xl text-[#2C1E15] mb-6 font-serif">Quy định của chỗ nghỉ</h3>
                <div className="bg-white rounded-[32px] border border-gray-200 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm shadow-sm">
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 font-bold mb-3 text-gray-800 text-base"><span className="text-2xl">🕒</span> Nhận phòng</div>
                    <p className="text-gray-600 font-mono text-lg font-medium">14:00 - 22:00</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 font-bold mb-3 text-gray-800 text-base"><span className="text-2xl">🕛</span> Trả phòng</div>
                    <p className="text-gray-600 font-mono text-lg font-medium">Trước 12:00 trưa</p>
                  </div>
                  <div className="md:col-span-2 pt-6 border-t border-gray-100">
                    <div className="font-bold mb-4 text-gray-800 text-base">Lưu ý quan trọng từ chủ nhà:</div>
                    <ul className="list-none space-y-3">
                      {["Không mang theo vật nuôi / thú cưng.", "Không tổ chức tiệc tùng sầm uất gây ồn ào sau 22:00.", "Yêu cầu đặt cọc 1.000.000đ khi nhận nhà, hoàn trả khi check-out."].map((rule, idx) => (
                         <li key={idx} className="flex gap-3 text-gray-600 items-start">
                           <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                           {rule}
                         </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* CỘT PHẢI: FORM ĐẶT PHÒNG STICKY (30%) */}
            <div className="lg:w-1/3 relative hidden lg:block">
              <div className="sticky top-[180px] bg-white p-7 rounded-[32px] border border-gray-200 shadow-2xl shadow-[#2C1E15]/5">
                
                <div className="flex items-end gap-1.5 mb-6">
                  <span className="text-3xl font-black text-[#2C1E15] tracking-tight">{homestay.pricePerNight.toLocaleString('vi-VN')}đ</span>
                  <span className="text-sm text-gray-500 font-medium mb-1.5">/ đêm</span>
                </div>

                {/* Box Chọn ngày & Khách */}
                <div className="border-2 border-gray-200 rounded-2xl overflow-hidden mb-6">
                  <div className="flex border-b-2 border-gray-200 divide-x-2 divide-gray-200">
                    <div className="w-1/2 p-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-800 mb-1">Nhận phòng</label>
                      <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent text-[13px] outline-none font-mono cursor-pointer absolute inset-0 opacity-0" />
                      <div className="text-[13px] font-mono text-gray-600">{checkIn ? formatDmy(checkIn) : "Chọn ngày"}</div>
                    </div>
                    <div className="w-1/2 p-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-800 mb-1">Trả phòng</label>
                      <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent text-[13px] outline-none font-mono cursor-pointer absolute inset-0 opacity-0" />
                      <div className="text-[13px] font-mono text-gray-600">{checkOut ? formatDmy(checkOut) : "Chọn ngày"}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-gray-800 mb-1">Số khách</label>
                    <select value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full bg-transparent text-[13px] outline-none cursor-pointer font-bold text-gray-700">
                      {[1,2,3,4,5,6].map(num => (
                        <option key={num} value={num}>{num} khách</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button className="w-full py-4 bg-[#2C3E2B] text-white rounded-2xl font-bold text-base shadow-lg shadow-[#2C3E2B]/20 hover:bg-opacity-90 hover:scale-[1.02] transition-all active:scale-[0.98] cursor-pointer border-none">
                  Đặt phòng ngay
                </button>

                <p className="text-center text-xs text-gray-500 mt-4 font-medium">Bạn sẽ không bị trừ tiền ngay lúc này</p>

                {/* Tính toán giá minh bạch */}
                <div className="mt-6 space-y-3.5 text-sm text-gray-600 border-t border-gray-100 pt-5">
                  <div className="flex justify-between items-center">
                    <span className="underline decoration-gray-300 underline-offset-2">1.250.000đ x 2 đêm</span>
                    <span className="font-medium text-gray-800">2.500.000đ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="underline decoration-gray-300 underline-offset-2">Phí dọn dẹp</span>
                    <span className="font-medium text-gray-800">150.000đ</span>
                  </div>
                  <div className="flex justify-between font-black text-lg text-[#2C1E15] pt-4 border-t border-gray-200 mt-2">
                    <span>Tổng tiền</span>
                    <span>2.650.000đ</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </UserLayout>
  );
}