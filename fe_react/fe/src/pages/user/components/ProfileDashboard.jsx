export default function ProfileDashboard({ userInfo, fileInputRef, handleAvatarChange, setCurrentView, setIsEditing, mySchedulesCount }) {
  return (
    <div className="space-y-10 animate-fade-in text-left">
      {/* Banner chào đón phong cách Booking */}
      <section className="bg-[#202c3c] text-white pt-14 pb-20 px-6 md:px-12 relative overflow-hidden rounded-b-[32px]">
        <div className="max-w-6xl mx-auto flex items-center space-x-6 relative z-10">
          <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0">
            <div className="w-full h-full bg-[#2C3E2B] rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/20 overflow-hidden shadow-xl">
              {userInfo.avatar ? <img src={userInfo.avatar} alt="Avatar" className="w-full h-full object-cover" /> : userInfo.name.charAt(0)}
            </div>
            <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-[#6E473B] text-white p-2 rounded-full border-2 border-[#202c3c] text-xs shadow-md hover:scale-105 transition cursor-pointer">📸</button>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
          </div>
          <div className="space-y-1">
            <h1 className="font-classic text-2xl md:text-3xl font-bold font-serif">Chào, {userInfo.name}</h1>
            <p className="text-xs md:text-sm text-gray-300 font-medium">Cài đặt tài khoản và quản lý hành trình du lịch Mộc Lâm Cozygo của bạn</p>
          </div>
        </div>
      </section>

      {/* Grid Menu lưới điều khiển */}
      <section className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
            <h3 className="text-base font-bold text-[#2C1E15] border-b border-gray-100 pb-2">Quản lý tài khoản</h3>
            <div className="space-y-1 text-sm font-semibold">
              <button onClick={() => { setCurrentView('info'); setIsEditing(false); }} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F1EA]/50 text-gray-700 transition group"><span>👤 Thông tin cá nhân</span><span className="text-gray-400 group-hover:text-[#6E473B]">❯</span></button>
              <button onClick={() => setCurrentView('bookings')} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F1EA]/50 text-gray-700 transition group"><span>🧳 Đơn đặt phòng của bạn</span><span className="text-gray-400 group-hover:text-[#6E473B]">❯</span></button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
            <h3 className="text-base font-bold text-[#2C1E15] border-b border-gray-100 pb-2">Thông tin thanh toán</h3>
            <div className="space-y-1 text-sm font-semibold">
              <button onClick={() => setCurrentView('payment')} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F1EA]/50 text-gray-700 transition group"><span>💳 Phương thức thanh toán</span><span className="text-gray-400 group-hover:text-[#6E473B]">❯</span></button>
              <button onClick={() => setCurrentView('transactions')} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F1EA]/50 text-gray-700 transition group"><span>📊 Giao dịch của bạn</span><span className="text-gray-400 group-hover:text-[#6E473B]">❯</span></button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
            <h3 className="text-base font-bold text-[#2C1E15] border-b border-gray-100 pb-2">Hoạt động du lịch</h3>
            <div className="space-y-1 text-sm font-semibold">
              <button onClick={() => setCurrentView('schedule')} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F1EA]/50 text-gray-700 transition group"><span>🗺️ Tự tạo lịch trình riêng ({mySchedulesCount})</span><span className="text-gray-400 group-hover:text-[#6E473B]">❯</span></button>
              <button onClick={() => setCurrentView('reviews')} className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F4F1EA]/50 text-gray-700 transition group"><span>💬 Đánh giá của tôi</span><span className="text-gray-400 group-hover:text-[#6E473B]">❯</span></button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}