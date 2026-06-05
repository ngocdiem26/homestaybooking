// import { useState, useRef } from 'react';
// import UserLayout from '../../layout/UserLayout';

// export default function Profile() {
//   const fileInputRef = useRef(null);
//   const [currentView, setCurrentView] = useState('dashboard');

//   // STATE POPUP XEM CHI TIẾT ĐƠN ĐẶT PHÒNG
//   const [selectedBooking, setSelectedBooking] = useState(null);

//   // STATE THÔNG TIN CÁ NHÂN
//   const [isEditing, setIsEditing] = useState(false);
//   const [userInfo, setUserInfo] = useState({
//     name: "Thạch Thị Ngọc Diểm",
//     email: "ngocdiem.ctump@gmail.com",
//     phone: "0912 345 678",
//     dob: "2004-03-15",
//     gender: "female",
//     address: "Ninh Kiều, Cần Thơ",
//     avatar: null 
//   });
//   const [tempInfo, setTempInfo] = useState({ ...userInfo });

//   // STATE QUẢN LÝ ĐƠN ĐẶT PHÒNG (BỔ SUNG THEO YÊU CẦU)
//   const [bookings, setBookings] = useState([
//     { id: "CZG-8892", homestay: "Mộc Lâm Đồi Bungalow", location: "Đà Lạt", checkIn: "2026-06-12", checkOut: "2026-06-15", price: "2,400,000đ", status: "confirmed", guests: "2 Người lớn", roomType: "Căn gỗ thông nguyên căn biệt lập" },
//     { id: "CZG-9374", homestay: "Cozy Miệt Vườn Homestay", location: "Cần Thơ", checkIn: "2026-04-02", checkOut: "2026-04-04", price: "1,200,000đ", status: "completed", guests: "2 Người lớn", roomType: "Phòng đôi view bến sông lộng gió" },
//     { id: "CZG-1102", homestay: "Sapa Sương Mờ Chòi Gỗ", location: "Sapa", checkIn: "2026-01-10", checkOut: "2026-01-12", price: "3,500,000đ", status: "cancelled", guests: "4 Người lớn", roomType: "Bungalow mái tranh view ruộng bậc thang" }
//   ]);
//   const [bookingFilter, setBookingFilter] = useState('all');

//   // STATE QUẢN LÝ GIAO DỊCH THANH TOÁN (BỔ SUNG THEO YÊU CẦU)
//   const [transactions] = useState([
//     { id: "TXN-5517", bookingId: "CZG-8892", date: "2026-06-05", amount: "2,400,000đ", method: "Visa (Ending 8892)", status: "Thành công" },
//     { id: "TXN-1926", bookingId: "CZG-9374", date: "2026-03-28", amount: "1,200,000đ", method: "Ví Điện Tử", status: "Thành công" },
//     { id: "TXN-0012", bookingId: "CZG-1102", date: "2026-01-02", amount: "3,500,000đ", method: "Thẻ nội địa", status: "Đã hoàn tiền" }
//   ]);

//   // STATE PHƯƠNG THỨC THANH TOÁN
//   const [cards, setCards] = useState([
//     { id: 1, type: "Visa", number: "**** **** **** 8892", expiry: "12/29", holder: "THACH THI NGOC DIEM" }
//   ]);
//   const [showAddCard, setShowAddCard] = useState(false);
//   const [newCard, setNewCard] = useState({ number: '', expiry: '', holder: '', type: 'Visa' });

//   // STATE TỰ TẠO LỊCH TRÌNH CÁ NHÂN
//   const [mySchedules, setMySchedules] = useState([
//     {
//       id: 1,
//       name: "Chuyến trốn nắng Đà Lạt cùng gia đình",
//       items: [
//         { time: "05:00", location: "Săn mây đỉnh đồi ngoại ô", note: "Mang theo áo khoác dày vì nhiệt độ sáng sớm khá lạnh." },
//         { time: "18:00", location: "Tiệc nướng BBQ củi than tại homestay", note: "Đã đặt trước chủ nhà chuẩn bị khoai lùi." }
//       ]
//     }
//   ]);
//   const [scheduleName, setScheduleName] = useState('');
//   const [scheduleItems, setScheduleItems] = useState([{ time: '', location: '', note: '' }]);

//   // STATE ĐÁNH GIÁ CỦA TÔI (BỔ SUNG THEO YÊU CẦU)
//   const [reviews] = useState([
//     { id: 1, homestay: "Cozy Miệt Vườn Homestay", date: "2026-04-05", rating: 5, comment: "Chủ nhà siêu nhiệt tình, trải nghiệm tát mương bắt cá lóc đồng cực kỳ vui nhộn. Đồ ăn miền Tây nấu rất chuẩn vị dã ngoại!" }
//   ]);

//   // LOGIC XỬ LÝ HỦY ĐƠN ĐẶT PHÒNG
//   const handleCancelBooking = (id) => {
//     if (window.confirm("Bạn có chắc chắn muốn hủy đơn đặt phòng này không? Hành động này tuân theo chính sách hoàn tiền của Cozygo.")) {
//       setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
//       setSelectedBooking(null);
//       alert("Hủy đơn đặt phòng thành công! Số tiền hoàn lại sẽ được đối soát vào thẻ liên kết của bạn.");
//     }
//   };

//   const handleAvatarChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setUserInfo(prev => ({ ...prev, avatar: imageUrl }));
//       setTempInfo(prev => ({ ...prev, avatar: imageUrl }));
//     }
//   };

//   const handleSaveInfo = (e) => {
//     e.preventDefault();
//     setUserInfo({ ...tempInfo });
//     setIsEditing(false);
//     alert("Cập nhật thông tin cá nhân thành công!");
//   };

//   const handleAddCard = (e) => {
//     e.preventDefault();
//     const maskedNumber = `**** **** **** ${newCard.number.slice(-4)}`;
//     setCards([...cards, { id: Date.now(), type: newCard.type, number: maskedNumber, expiry: newCard.expiry, holder: newCard.holder.toUpperCase() }]);
//     setShowAddCard(false);
//     setNewCard({ number: '', expiry: '', holder: '', type: 'Visa' });
//     alert("Liên kết thẻ thành công!");
//   };

//   const handleCreateSchedule = (e) => {
//     e.preventDefault();
//     if (!scheduleName) return alert("Vui lòng nhập tên lịch trình!");
//     setMySchedules([...mySchedules, { id: Date.now(), name: scheduleName, items: scheduleItems.filter(item => item.time && item.location) }]);
//     setScheduleName('');
//     setScheduleItems([{ time: '', location: '', note: '' }]);
//     alert("Tạo lịch trình cá nhân thành công!");
//   };

//    const handleItemChange = (index, field, value) => {
//     const updated = [...scheduleItems];
//     updated[index][field] = value;
//     setScheduleItems(updated);
//   };
//     const handleAddField = () => {
//     setScheduleItems([...scheduleItems, { time: '', location: '', note: '' }]);
//   };

//   return (
//     <UserLayout>
//       <div className="bg-[#F4F1EA] min-h-screen text-[#23150d] animate-fade-in text-left pb-24">
        
//         {/* ==========================================================================
//             CẤP 1: GIAO DIỆN DASHBOARD TỔNG QUAN (MÔ PHỎNG THEO image_9ad441.png)
//             ========================================================================== */}
//         {currentView === 'dashboard' && (
//           <div className="space-y-10">
//             {/* Banner xanh đậm chào đón */}
//             <section className="bg-[#202c3c] text-white pt-14 pb-20 px-6 md:px-12 relative overflow-hidden">
//               <div className="max-w-6xl mx-auto flex items-center space-x-6 relative z-10">
//                 <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0">
//                   <div className="w-full h-full bg-[#2C3E2B] rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/20 overflow-hidden shadow-xl">
//                     {userInfo.avatar ? <img src={userInfo.avatar} alt="Avatar" className="w-full h-full object-cover" /> : userInfo.name.charAt(0)}
//                   </div>
//                   <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-[#6E473B] text-white p-2 rounded-full border-2 border-[#202c3c] text-xs shadow-md hover:scale-105 transition cursor-pointer">📸</button>
//                   <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
//                 </div>
//                 <div className="space-y-1">
//                   <h1 className="font-classic text-2xl md:text-3xl font-bold font-serif">Chào, {userInfo.name}</h1>
//                   <p className="text-xs md:text-sm text-gray-300 font-medium">Cài đặt tài khoản và quản lý hành trình du lịch Mộc Lâm Cozygo của bạn</p>
//                 </div>
//               </div>
//             </section>

//             {/* Vùng Grid danh mục quản lý cốt lõi cấu trúc theo ảnh image_9ad05c.png */}
//             <section className="max-w-6xl mx-auto px-4 md:px-8">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
//                 {/* Khối 1: Quản lý tài khoản */}
//                 <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
//                   <h3 className="text-base font-bold text-[#2C1E15] border-b border-gray-100 pb-2">Quản lý tài khoản</h3>
//                   <div className="space-y-1 text-sm font-semibold">
//                     <button onClick={() => { setCurrentView('info'); setIsEditing(false); }} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F1EA]/50 text-gray-700 transition group"><span>👤 Thông tin cá nhân</span><span className="text-gray-400 group-hover:text-[#6E473B]">❯</span></button>
//                     <button onClick={() => setCurrentView('bookings')} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F1EA]/50 text-gray-700 transition group"><span>🧳 Đơn đặt phòng của bạn</span><span className="text-gray-400 group-hover:text-[#6E473B]">❯</span></button>
//                   </div>
//                 </div>

//                 {/* Khối 2: Thông tin thanh toán */}
//                 <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
//                   <h3 className="text-base font-bold text-[#2C1E15] border-b border-gray-100 pb-2">Thông tin thanh toán</h3>
//                   <div className="space-y-1 text-sm font-semibold">
//                     <button onClick={() => setCurrentView('payment')} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F1EA]/50 text-gray-700 transition group"><span>💳 Phương thức thanh toán</span><span className="text-gray-400 group-hover:text-[#6E473B]">❯</span></button>
//                     <button onClick={() => setCurrentView('transactions')} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F1EA]/50 text-gray-700 transition group"><span>📊 Giao dịch của bạn</span><span className="text-gray-400 group-hover:text-[#6E473B]">❯</span></button>
//                   </div>
//                 </div>

//                 {/* Khối 3: Hoạt động du lịch */}
//                 <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
//                   <h3 className="text-base font-bold text-[#2C1E15] border-b border-gray-100 pb-2">Hoạt động du lịch</h3>
//                   <div className="space-y-1 text-sm font-semibold">
//                     <button onClick={() => setCurrentView('schedule')} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F1EA]/50 text-gray-700 transition group"><span>🗺️ Tự tạo lịch trình riêng</span><span className="text-gray-400 group-hover:text-[#6E473B]">❯</span></button>
//                     <button onClick={() => setCurrentView('reviews')} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F1EA]/50 text-gray-700 transition group"><span>💬 Đánh giá của tôi</span><span className="text-gray-400 group-hover:text-[#6E473B]">❯</span></button>
//                   </div>
//                 </div>

//               </div>
//             </section>
//           </div>
//         )}

//         {/* ==========================================================================
//             CẤP 2: GIAO DIỆN PHÂN HỆ CHI TIẾT DẠNG LIST CHUYÊN SÂU (THEO image_9ad8b8.png)
//             ========================================================================== */}
//         {currentView !== 'dashboard' && (
//           <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8 pt-10 items-start">
            
//             {/* THANH ĐIỀU HƯỚNG LIST MENU BÊN TRÁI */}
//             <aside className="lg:col-span-1 space-y-4 sticky top-24">
//               <button onClick={() => setCurrentView('dashboard')} className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition flex items-center justify-center gap-2">⬅️ Quay lại tổng quan</button>
              
//               <div className="bg-white p-4 rounded-2xl border border-[#6E473B]/10 shadow-sm flex flex-col space-y-1 text-sm font-bold">
//                 <button onClick={() => { setCurrentView('info'); setIsEditing(false); }} className={`w-full text-left px-4 py-2.5 rounded-xl transition ${currentView === 'info' ? 'bg-[#2C3E2B] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>👤 Thông tin cá nhân</button>
//                 <button onClick={() => setCurrentView('bookings')} className={`w-full text-left px-4 py-2.5 rounded-xl transition ${currentView === 'bookings' ? 'bg-[#2C3E2B] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>🧳 Đơn đặt phòng của bạn</button>
//                 <button onClick={() => setCurrentView('payment')} className={`w-full text-left px-4 py-2.5 rounded-xl transition ${currentView === 'payment' ? 'bg-[#2C3E2B] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>💳 Phương thức thanh toán</button>
//                 <button onClick={() => setCurrentView('transactions')} className={`w-full text-left px-4 py-2.5 rounded-xl transition ${currentView === 'transactions' ? 'bg-[#2C3E2B] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>📊 Giao dịch thanh toán</button>
//                 <button onClick={() => setCurrentView('schedule')} className={`w-full text-left px-4 py-2.5 rounded-xl transition ${currentView === 'schedule' ? 'bg-[#2C3E2B] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>🗺️ Tự tạo lịch trình riêng</button>
//                 <button onClick={() => setCurrentView('reviews')} className={`w-full text-left px-4 py-2.5 rounded-xl transition ${currentView === 'reviews' ? 'bg-[#2C3E2B] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>💬 Đánh giá của tôi</button>
//               </div>
//             </aside>

//             {/* VÙNG KHUNG HIỂN THỊ NỘI DUNG CHI TIẾT */}
//             <main className="lg:col-span-3 bg-white p-6 md:p-8 rounded-3xl border border-[#6E473B]/10 shadow-sm min-h-[520px]">
              
//               {/* CHỨC NĂNG 1: THÔNG TIN CÁ NHÂN */}
//               {currentView === 'info' && (
//                 <div className="space-y-6 animate-fade-in">
//                   <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
//                     <div>
//                       <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Hồ sơ cá nhân</h2>
//                       <p className="text-xs text-gray-400 font-medium">Quản lý và cập nhật thông tin liên hệ của bạn</p>
//                     </div>
//                     {!isEditing && (
//                       <button onClick={() => { setTempInfo({ ...userInfo }); setIsEditing(true); }} className="text-xs bg-[#6E473B] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#57362c] transition shadow-sm">✏️ Chỉnh sửa</button>
//                     )}
//                   </div>
//                   <form onSubmit={handleSaveInfo} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm font-bold text-gray-600">
//                     <div className="space-y-1"><label>Họ và tên</label><input type="text" disabled={!isEditing} value={tempInfo.name} onChange={(e) => setTempInfo({...tempInfo, name: e.target.value})} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base text-gray-800 focus:outline-none" /></div>
//                     <div className="space-y-1"><label>Địa chỉ Email</label><input type="email" disabled={!isEditing} value={tempInfo.email} onChange={(e) => setTempInfo({...tempInfo, email: e.target.value})} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base text-gray-800 focus:outline-none" /></div>
//                     <div className="space-y-1"><label>Số điện thoại</label><input type="tel" disabled={!isEditing} value={tempInfo.phone} onChange={(e) => setTempInfo({...tempInfo, phone: e.target.value})} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base text-gray-800 focus:outline-none" /></div>
//                     <div className="space-y-1"><label>Ngày sinh</label><input type="date" disabled={!isEditing} value={tempInfo.dob} onChange={(e) => setTempInfo({...tempInfo, dob: e.target.value})} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base text-gray-500 focus:outline-none" /></div>
//                     <div className="space-y-1"><label>Giới tính</label><select disabled={!isEditing} value={tempInfo.gender} onChange={(e) => setTempInfo({...tempInfo, gender: e.target.value})} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base text-gray-800 focus:outline-none"><option value="male">Nam</option><option value="female">Nữ</option></select></div>
//                     <div className="space-y-1 sm:col-span-2"><label>Địa chỉ thường trú</label><input type="text" disabled={!isEditing} value={tempInfo.address} onChange={(e) => setTempInfo({...tempInfo, address: e.target.value})} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base text-gray-800 focus:outline-none" /></div>
//                     {isEditing && (
//                       <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
//                         <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-100 text-gray-500 px-5 py-2.5 rounded-xl hover:bg-gray-200 font-bold">Hủy</button>
//                         <button type="submit" className="bg-[#2C3E2B] text-white px-6 py-2.5 rounded-xl hover:bg-[#1f2d20] shadow-md font-bold">Lưu thông tin</button>
//                       </div>
//                     )}
//                   </form>
//                 </div>
//               )}

//               {/* CHỨC NĂNG 2: ĐƠN ĐẶT PHÒNG CỦA BẠN (HỦY ĐƠN / LỊCH SỬ / PHÂN LOẠI) */}
//               {currentView === 'bookings' && (
//                 <div className="space-y-6 animate-fade-in">
//                   <div className="border-b border-gray-100 pb-3">
//                     <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Quản lý đơn đặt phòng</h2>
//                     <p className="text-xs text-gray-400 font-medium">Xem lịch sử, quản lý các chuyến đi và xử lý hủy đơn đặt chỗ của bạn</p>
//                   </div>

//                   {/* Thanh Tab bộ lọc đơn đặt phòng */}
//                   <div className="flex bg-[#23150d]/5 p-1 rounded-xl text-xs font-bold border w-fit">
//                     <button onClick={() => setBookingFilter('all')} className={`px-4 py-2 rounded-lg transition ${bookingFilter === 'all' ? 'bg-[#2C3E2B] text-white shadow' : 'text-gray-500'}`}>Tất cả</button>
//                     <button onClick={() => setBookingFilter('confirmed')} className={`px-4 py-2 rounded-lg transition ${bookingFilter === 'confirmed' ? 'bg-[#2C3E2B] text-white shadow' : 'text-gray-500'}`}>Sắp đi</button>
//                     <button onClick={() => setBookingFilter('completed')} className={`px-4 py-2 rounded-lg transition ${bookingFilter === 'completed' ? 'bg-[#2C3E2B] text-white shadow' : 'text-gray-500'}`}>Lịch sử đơn</button>
//                     <button onClick={() => setBookingFilter('cancelled')} className={`px-4 py-2 rounded-lg transition ${bookingFilter === 'cancelled' ? 'bg-[#2C3E2B] text-white shadow' : 'text-gray-500'}`}>Đơn đã hủy</button>
//                   </div>

//                   {/* Danh sách đơn đặt phòng */}
//                   <div className="space-y-4">
//                     {bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter).map(book => (
//                       <div key={book.id} className="border border-gray-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:shadow-md transition">
//                         <div className="space-y-1">
//                           <div className="flex items-center gap-2">
//                             <span className="font-mono font-bold text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{book.id}</span>
//                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${book.status === 'confirmed' ? 'bg-green-100 text-green-700' : book.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
//                               {book.status === 'confirmed' ? 'Sắp diễn ra' : book.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
//                             </span>
//                           </div>
//                           <h4 className="text-base font-extrabold text-[#2C1E15]">{book.homestay}</h4>
//                           <p className="text-xs text-gray-500 font-semibold">📍 Vùng miền: {book.location} | 🗓️ Thời gian: {book.checkIn} đến {book.checkOut}</p>
//                         </div>
//                         <div className="flex items-center gap-2 sm:self-center">
//                           <button onClick={() => setSelectedBooking(book)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition">Xem chi tiết</button>
//                           {book.status === 'confirmed' && (
//                             <button onClick={() => handleCancelBooking(book.id)} className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2.5 rounded-xl transition">Hủy đặt phòng</button>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* CHỨC NĂNG 3: PHƯƠNG THỨC THANH TOÁN */}
//               {currentView === 'payment' && (
//                 <div className="space-y-6 animate-fade-in">
//                   <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
//                     <div>
//                       <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Thẻ thanh toán bảo mật</h2>
//                       <p className="text-xs text-gray-400 font-medium">Liên kết thẻ tín dụng giúp thực hiện đặt phòng cấp tốc</p>
//                     </div>
//                     <button onClick={() => setShowAddCard(!showAddCard)} className="text-xs bg-[#2C3E2B] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#1f2d20] transition shadow-sm">{showAddCard ? "✖ Hủy" : "➕ Thêm thẻ"}</button>
//                   </div>
//                   {showAddCard && (
//                     <form onSubmit={handleAddCard} className="bg-[#F4F1EA]/50 p-5 rounded-2xl border border-[#6E473B]/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-bold text-gray-600 animate-fade-in">
//                       <div className="space-y-1"><label>Loại thẻ</label><select value={newCard.type} onChange={(e) => setNewCard({...newCard, type: e.target.value})} className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-base focus:outline-none"><option value="Visa">💳 Visa</option><option value="Mastercard">💳 Mastercard</option></select></div>
//                       <div className="space-y-1 sm:col-span-2"><label>Số thẻ (16 số) *</label><input type="text" required maxLength="16" placeholder="4321 0000 1111 2222" value={newCard.number} onChange={(e) => setNewCard({...newCard, number: e.target.value})} className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-base focus:outline-none" /></div>
//                       <div className="space-y-1 sm:col-span-2"><label>Tên chủ thẻ *</label><input type="text" required placeholder="THACH THI NGOC DIEM" value={newCard.holder} onChange={(e) => setNewCard({...newCard, holder: e.target.value})} className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-base focus:outline-none" /></div>
//                       <div className="space-y-1"><label>Hạn dùng *</label><input type="text" required maxLength="5" placeholder="MM/YY" value={newCard.expiry} onChange={(e) => setNewCard({...newCard, expiry: e.target.value})} className="w-full bg-white border border-gray-200 px-3 py-2.5 rounded-xl text-base text-center focus:outline-none" /></div>
//                       <button type="submit" className="sm:col-span-3 mt-2 bg-[#6E473B] text-white py-3 rounded-xl hover:bg-[#57362c] w-full font-bold shadow-md">💾 Xác nhận liên kết thẻ</button>
//                     </form>
//                   )}
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//                     {cards.map(card => (
//                       <div key={card.id} className="bg-gradient-to-br from-[#202c3c] to-[#121a24] text-[#F4F1EA] p-6 rounded-2xl shadow-xl relative overflow-hidden h-44 flex flex-col justify-between border border-white/5">
//                         <div className="flex justify-between items-center"><span className="text-xs font-mono tracking-widest bg-white/10 px-2 py-0.5 rounded uppercase">{card.type}</span><span className="text-xl">📡</span></div>
//                         <div className="text-base font-mono tracking-widest my-2 text-center">{card.number}</div>
//                         <div className="flex justify-between items-end text-[10px] font-mono">
//                           <div><p className="opacity-50 text-[8px]">CARD HOLDER</p><p className="font-bold text-xs">{card.holder}</p></div>
//                           <div><p className="opacity-50 text-[8px]">EXPIRES</p><p className="font-bold text-xs">{card.expiry}</p></div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* CHỨC NĂNG 4: QUẢN LÝ LỊCH SỬ GIAO DỊCH (BỔ SUNG THEO YÊU CẦU) */}
//               {currentView === 'transactions' && (
//                 <div className="space-y-6 animate-fade-in">
//                   <div className="border-b border-gray-100 pb-3">
//                     <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Lịch sử giao dịch thanh toán</h2>
//                     <p className="text-xs text-gray-400 font-medium">Theo dõi hóa đơn tài chính và sao kê hoàn tiền đối soát từ hệ thống</p>
//                   </div>
//                   <div className="overflow-x-auto rounded-xl border border-gray-200">
//                     <table className="w-full text-left border-collapse text-xs md:text-sm font-medium">
//                       <thead>
//                         <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
//                           <th className="p-3">Mã giao dịch</th>
//                           <th className="p-3">Mã đơn đặt</th>
//                           <th className="p-3">Ngày thanh toán</th>
//                           <th className="p-3">Số tiền</th>
//                           <th className="p-3">Phương thức</th>
//                           <th className="p-3">Trạng thái</th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-100 text-gray-700 font-semibold">
//                         {transactions.map(txn => (
//                           <tr key={txn.id} className="hover:bg-gray-50/50">
//                             <td className="p-3 font-mono">{txn.id}</td>
//                             <td className="p-3 font-mono text-gray-500">{txn.bookingId}</td>
//                             <td className="p-3">{txn.date}</td>
//                             <td className="p-3 text-[#2C3E2B] font-bold">{txn.amount}</td>
//                             <td className="p-3 text-gray-500">{txn.method}</td>
//                             <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${txn.status === 'Thành công' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{txn.status}</span></td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}

//               {/* CHỨC NĂNG 5: TỰ TẠO LỊCH TRÌNH CÁ NHÂN */}
//               {currentView === 'schedule' && (
//                 <div className="space-y-8 animate-fade-in">
//                   <div className="border-b border-gray-100 pb-3">
//                     <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Tự thiết kế lịch trình cá nhân</h2>
//                     <p className="text-xs text-gray-400 font-medium">Lên ý tưởng thời gian, địa điểm cho chuyến đi tự túc sắp tới của bạn</p>
//                   </div>
//                   <form onSubmit={handleCreateSchedule} className="bg-[#F4F1EA]/40 p-5 rounded-2xl border border-[#6E473B]/10 space-y-4 text-sm font-bold text-gray-600">
//                     <div className="space-y-1"><label>1. Tên hành trình chuyến đi *</label><input type="text" required placeholder="Ví dụ: Cần Thơ gạo trắng nước trong 3 ngày 2 đêm" value={scheduleName} onChange={(e) => setScheduleName(e.target.value)} className="w-full bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-medium text-base focus:outline-none" /></div>
//                     <div className="space-y-3">
//                       <label>2. Các mốc thời gian & Điểm đến cụ thể:</label>
//                       {scheduleItems?.map((item, idx) => (
//                         <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
//                           <input type="time" required value={item.time} onChange={(e) => handleItemChange(idx, 'time', e.target.value)} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-2 py-2 rounded-lg text-base focus:outline-none" />
//                           <input type="text" required placeholder="📍 Đi đâu?" value={item.location} onChange={(e) => handleItemChange(idx, 'location', e.target.value)} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-3 py-2 rounded-lg text-sm sm:col-span-2 focus:outline-none" />
//                           <input type="text" placeholder="Ghi chú..." value={item.note} onChange={(e) => handleItemChange(idx, 'note', e.target.value)} className="w-full bg-[#F4F1EA]/30 border border-gray-200 px-3 py-2 rounded-lg text-sm focus:outline-none" />
//                         </div>
//                       ))}
//                     </div>
//                     <div className="flex gap-3">
//                       <button type="button" onClick={handleAddField} className="bg-white border border-[#2C3E2B] text-[#2C3E2B] px-4 py-2 rounded-xl hover:bg-gray-50 font-bold">➕ Thêm điểm đến</button>
//                       <button type="submit" className="bg-[#2C3E2B] text-white px-6 py-2.5 rounded-xl hover:bg-[#1f2d20] flex-grow font-bold">🚀 Lưu lịch trình</button>
//                     </div>
//                   </form>
//                   <div className="space-y-6">
//                     <h4 className="font-classic font-bold text-sm text-[#2C1E15] border-l-4 border-[#6E473B] pl-2">Sổ tay lịch trình của bạn</h4>
//                     {mySchedules.map(sch => (
//                       <div key={sch.id} className="bg-[#F4F1EA]/30 p-5 rounded-2xl border border-gray-200 space-y-4">
//                         <h5 className="font-bold text-xs text-[#6E473B] uppercase tracking-wider">📋 {sch.name}</h5>
//                         <div className="border-l-2 border-[#2C3E2B]/20 ml-3 space-y-4 text-sm font-medium">
//                           {sch.items.map((item, i) => (
//                             <div key={i} className="relative pl-5">
//                               <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-white border border-[#2C3E2B]"></div>
//                               <p className="font-mono text-[11px] font-bold text-[#2C3E2B] bg-[#2C3E2B]/5 px-1.5 py-0.5 rounded w-fit inline-block mr-2">{item.time}</p>
//                               <span className="font-bold text-gray-800">{item.location}</span>
//                               {item.note && <p className="text-[11px] text-gray-400 italic mt-0.5">↳ Ghi chú: {item.note}</p>}
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* CHỨC NĂNG 6: ĐÁNH GIÁ CỦA TÔI (BỔ SUNG THEO YÊU CẦU) */}
//               {currentView === 'reviews' && (
//                 <div className="space-y-6 animate-fade-in">
//                   <div className="border-b border-gray-100 pb-3">
//                     <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Đánh giá phản hồi của tôi</h2>
//                     <p className="text-xs text-gray-400 font-medium">Lưu trữ các nhận xét, đóng góp ý kiến bạn đã gửi lại cho các khu nghỉ dưỡng</p>
//                   </div>
//                   <div className="space-y-4">
//                     {reviews.map(rev => (
//                       <div key={rev.id} className="p-5 border border-gray-200/80 rounded-2xl bg-white space-y-2">
//                         <div className="flex justify-between items-center">
//                           <h4 className="text-sm font-bold text-[#2C1E15]">{rev.homestay}</h4>
//                           <span className="text-xs text-gray-400 font-medium">{rev.date}</span>
//                         </div>
//                         <div className="text-amber-500 text-xs font-serif">{"★".repeat(rev.rating)}</div>
//                         <p className="text-xs text-gray-600 leading-relaxed font-semibold font-serif italic bg-gray-50 p-3 rounded-xl border border-gray-100">"{rev.comment}"</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//             </main>
//           </div>
//         )}

//         {/* ==========================================================================
//             POPUP WINDOW MODAL: XEM CHI TIẾT ĐƠN ĐẶT PHÒNG (GLASSMORPHISM EFFECT)
//             ========================================================================== */}
//         {selectedBooking && (
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
//             <div className="bg-[#F4F1EA] max-w-lg w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative text-sm font-semibold">
//               <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg">✖</button>
//               <h3 className="font-classic text-lg font-bold text-[#2C1E15] border-b border-gray-200 pb-2 flex items-center gap-2">🔍 Chi tiết đơn đặt phòng</h3>
//               <div className="space-y-2 text-gray-600">
//                 <p><span className="text-gray-400">Mã đặt chỗ:</span> <span className="font-mono font-bold text-gray-800">{selectedBooking.id}</span></p>
//                 <p><span className="text-gray-400">Tên homestay:</span> <span className="text-gray-800 font-bold">{selectedBooking.homestay}</span></p>
//                 <p><span className="text-gray-400">Loại phòng nghỉ:</span> <span className="text-gray-800 font-medium">{selectedBooking.roomType}</span></p>
//                 <p><span className="text-gray-400">Số lượng khách:</span> <span className="text-gray-800 font-medium">{selectedBooking.guests}</span></p>
//                 <p><span className="text-gray-400">Ngày nhận phòng:</span> <span className="text-gray-800 font-bold">{selectedBooking.checkIn}</span></p>
//                 <p><span className="text-gray-400">Ngày trả phòng:</span> <span className="text-gray-800 font-bold">{selectedBooking.checkOut}</span></p>
//                 <div className="pt-2 border-t border-gray-200/60 flex justify-between text-base font-bold">
//                   <span className="text-gray-700">Tổng chi phí:</span>
//                   <span className="text-[#2C3E2B]">{selectedBooking.price}</span>
//                 </div>
//               </div>
//               {selectedBooking.status === 'confirmed' && (
//                 <button onClick={() => handleCancelBooking(selectedBooking.id)} className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition shadow-md">🚨 Tiến hành yêu cầu hủy đơn đặt phòng</button>
//               )}
//             </div>
//           </div>
//         )}

//       </div>
//     </UserLayout>
//   );
// }
import { useState, useRef } from 'react';
import UserLayout from '../../layout/UserLayout';

// Import toàn bộ các mảnh ghép component vừa bóc tách
import ProfileDashboard from './components/ProfileDashboard';
import ProfileSidebar from './components/ProfileSidebar';
import AccountInfo from './components/AccountInfo';
import BookingManager from './components/BookingManager';
import PaymentManager from './components/PaymentManager';
import TransactionHistory from './components/TransactionHistory';
import CustomSchedule from './components/CustomSchedule';
import ReviewManager from './components/ReviewManager';

export default function Profile() {
  const fileInputRef = useRef(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedBooking, setSelectedBooking] = useState(null);

  // STATE NGUỒN DỮ LIỆU GỐC (GIỮ NGUYÊN HOÀN TOÀN)
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "Thạch Thị Ngọc Diểm",
    email: "ngocdiem.ctump@gmail.com",
    phone: "0912 345 678",
    dob: "2004-03-15",
    gender: "female",
    address: "Ninh Kiều, Cần Thơ",
    avatar: null 
  });
  const [tempInfo, setTempInfo] = useState({ ...userInfo });

  const [bookings, setBookings] = useState([
    { id: "CZG-8892", homestay: "Mộc Lâm Đồi Bungalow", location: "Đà Lạt", checkIn: "2026-06-12", checkOut: "2026-06-15", price: "2,400,000đ", status: "confirmed", guests: "2 Người lớn", roomType: "Căn gỗ thông nguyên căn biệt lập" },
    { id: "CZG-9374", homestay: "Cozy Miệt Vườn Homestay", location: "Cần Thơ", checkIn: "2026-04-02", checkOut: "2026-04-04", price: "1,200,000đ", status: "completed", guests: "2 Người lớn", roomType: "Phòng đôi view bến sông lộng gió" },
    { id: "CZG-1102", homestay: "Sapa Sương Mờ Chòi Gỗ", location: "Sapa", checkIn: "2026-01-10", checkOut: "2026-01-12", price: "3,500,000đ", status: "cancelled", guests: "4 Người lớn", roomType: "Bungalow mái tranh view ruộng bậc thang" }
  ]);
  const [bookingFilter, setBookingFilter] = useState('all');

  const [transactions] = useState([
    { id: "TXN-5517", bookingId: "CZG-8892", date: "2026-06-05", amount: "2,400,000đ", method: "Visa (Ending 8892)", status: "Thành công" },
    { id: "TXN-1926", bookingId: "CZG-9374", date: "2026-03-28", amount: "1,200,000đ", method: "Ví Điện Tử", status: "Thành công" },
    { id: "TXN-0012", bookingId: "CZG-1102", date: "2026-01-02", amount: "3,500,000đ", method: "Thẻ nội địa", status: "Đã hoàn tiền" }
  ]);

  const [cards, setCards] = useState([
    { id: 1, type: "Visa", number: "**** **** **** 8892", expiry: "12/29", holder: "THACH THI NGOC DIEM" }
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', holder: '', type: 'Visa' });

  const [mySchedules, setMySchedules] = useState([
    {
      id: 1,
      name: "Chuyến trốn nắng Đà Lạt cùng gia đình",
      items: [
        { time: "05:00", location: "Săn mây đỉnh đồi ngoại ô", note: "Mang theo áo khoác dày vì nhiệt độ sáng sớm khá lạnh." },
        { time: "18:00", location: "Tiệc nướng BBQ củi than tại homestay", note: "Đã đặt trước chủ nhà chuẩn bị khoai lùi." }
      ]
    }
  ]);
  const [scheduleName, setScheduleName] = useState('');
  
  // KHẮC PHỤC DỨT ĐIỂM TRANG TRẮNG: Luôn mồi sẵn 1 object cấu trúc chuỗi trống rỗng cho mảng input ban đầu
  const [scheduleItems, setScheduleItems] = useState([{ time: '', location: '', note: '' }]);

  const [reviews] = useState([
    { id: 1, homestay: "Cozy Miệt Vườn Homestay", date: "2026-04-05", rating: 5, comment: "Chủ nhà siêu nhiệt tình, trải nghiệm tát mương bắt cá lóc đồng cực kỳ vui nhộn. Đồ ăn miền Tây nấu rất chuẩn vị dã ngoại!" }
  ]);

  // LOGIC ĐIỀU PHỐI (HANDLERS)
  const handleCancelBooking = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn đặt phòng này không? Hành động này tuân theo chính sách hoàn tiền của Cozygo.")) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      setSelectedBooking(null);
      alert("Hủy đơn đặt phòng thành công!");
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserInfo(prev => ({ ...prev, avatar: imageUrl }));
      setTempInfo(prev => ({ ...prev, avatar: imageUrl }));
    }
  };

  const handleSaveInfo = (e) => {
    e.preventDefault();
    setUserInfo({ ...tempInfo });
    setIsEditing(false);
    alert("Cập nhật thông tin thành công!");
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    const maskedNumber = `**** **** **** ${newCard.number.slice(-4)}`;
    setCards([...cards, { id: Date.now(), type: newCard.type, number: maskedNumber, expiry: newCard.expiry, holder: newCard.holder.toUpperCase() }]);
    setShowAddCard(false);
    setNewCard({ number: '', expiry: '', holder: '', type: 'Visa' });
  };

  const handleCreateSchedule = (e) => {
    e.preventDefault();
    if (!scheduleName) return alert("Vui lòng nhập tên lịch trình!");
    setMySchedules([...mySchedules, { id: Date.now(), name: scheduleName, items: scheduleItems.filter(item => item.time && item.location) }]);
    setScheduleName('');
    setScheduleItems([{ time: '', location: '', note: '' }]);
    alert("Tạo lịch trình thành công!");
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...scheduleItems];
    updated[index][field] = value;
    setScheduleItems(updated);
  };

  const handleAddField = () => {
    setScheduleItems([...scheduleItems, { time: '', location: '', note: '' }]);
  };

  return (
    <UserLayout>
      <div className="bg-[#F4F1EA] min-h-screen text-[#23150d] animate-fade-in text-left pb-24">
        
        {/* VIEW 1: TRANG DASHBOARD TỔNG QUAN */}
        {currentView === 'dashboard' && (
          <ProfileDashboard 
            userInfo={userInfo} fileInputRef={fileInputRef} handleAvatarChange={handleAvatarChange}
            setCurrentView={setCurrentView} setIsEditing={setIsEditing} mySchedulesCount={mySchedules.length}
          />
        )}

        {/* VIEW 2: TRANG CHI TIẾT PHÂN HỆ DẠNG LIST */}
        {currentView !== 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8 pt-10 items-start">
            
            <ProfileSidebar currentView={currentView} setCurrentView={setCurrentView} setIsEditing={setIsEditing} userInfo={userInfo} />

            <main className="lg:col-span-3 bg-white p-6 md:p-8 rounded-3xl border border-[#6E473B]/10 shadow-sm min-h-[520px]">
              {currentView === 'info' && <AccountInfo isEditing={isEditing} setIsEditing={setIsEditing} tempInfo={tempInfo} setTempInfo={setTempInfo} handleSaveInfo={handleSaveInfo} />}
              {currentView === 'bookings' && <BookingManager bookings={bookings} bookingFilter={bookingFilter} setBookingFilter={setBookingFilter} setSelectedBooking={setSelectedBooking} handleCancelBooking={handleCancelBooking} />}
              {currentView === 'payment' && <PaymentManager cards={cards} showAddCard={showAddCard} setShowAddCard={setShowAddCard} newCard={newCard} setNewCard={setNewCard} handleAddCard={handleAddCard} />}
              {currentView === 'transactions' && <TransactionHistory transactions={transactions} />}
              {currentView === 'schedule' && <CustomSchedule scheduleName={scheduleName} setScheduleName={setScheduleName} scheduleItems={scheduleItems} handleItemChange={handleItemChange} handleAddField={handleAddField} handleCreateSchedule={handleCreateSchedule} mySchedules={mySchedules} />}
              {currentView === 'reviews' && <ReviewManager reviews={reviews} />}
            </main>
          </div>
        )}

        {/* POPUP DETAIL MODAL (GIỮ NGUYÊN) */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-[#F4F1EA] max-w-lg w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative text-sm font-semibold">
              <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg">✖</button>
              <h3 className="font-classic text-lg font-bold text-[#2C1E15] border-b border-gray-200 pb-2 flex items-center gap-2">🔍 Chi tiết đơn đặt phòng</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="text-gray-400">Mã đặt chỗ:</span> <span className="font-mono font-bold text-gray-800">{selectedBooking.id}</span></p>
                <p><span className="text-gray-400">Tên homestay:</span> <span className="text-gray-800 font-bold">{selectedBooking.homestay}</span></p>
                <p><span className="text-gray-400">Loại phòng nghỉ:</span> <span className="text-gray-800 font-medium">{selectedBooking.roomType}</span></p>
                <p><span className="text-gray-400">Số lượng khách:</span> <span className="text-gray-800 font-medium">{selectedBooking.guests}</span></p>
                <p><span className="text-gray-400">Ngày nhận phòng:</span> <span className="text-gray-800 font-bold">{selectedBooking.checkIn}</span></p>
                <p><span className="text-gray-400">Ngày trả phòng:</span> <span className="text-gray-800 font-bold">{selectedBooking.checkOut}</span></p>
                <div className="pt-2 border-t border-gray-200/60 flex justify-between text-base font-bold"><span className="text-gray-700">Tổng chi phí:</span><span className="text-[#2C3E2B]">{selectedBooking.price}</span></div>
              </div>
              {selectedBooking.status === 'confirmed' && <button onClick={() => handleCancelBooking(selectedBooking.id)} className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition shadow-md">🚨 Tiến hành yêu cầu hủy đơn đặt phòng</button>}
            </div>
          </div>
        )}

      </div>
    </UserLayout>
  );
}