export default function ProfileSidebar({ currentView, setCurrentView, setIsEditing, userInfo }) {
  return (
    <aside className="lg:col-span-1 space-y-4 sticky top-24 text-left">
      <button onClick={() => setCurrentView('dashboard')} className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer">
        ⬅️ Quay lại tổng quan
      </button>
      
      <div className="bg-white p-4 rounded-2xl border border-[#6E473B]/10 shadow-sm flex items-center space-x-3">
        <div className="w-12 h-12 bg-[#2C3E2B] text-white rounded-full flex items-center justify-center text-lg font-bold shadow-inner overflow-hidden shrink-0">
          {userInfo.avatar ? <img src={userInfo.avatar} alt="Avatar" className="w-full h-full object-cover" /> : userInfo.name.charAt(0)}
        </div>
        <h3 className="font-classic text-sm font-bold text-[#2C1E15] truncate">{userInfo.name}</h3>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-[#6E473B]/10 shadow-sm flex flex-col space-y-1 text-sm font-bold">
        {[
          { id: 'info', label: '👤 Thông tin cá nhân' },
          { id: 'bookings', label: '🧳 Đơn đặt phòng của bạn' },
          { id: 'payment', label: '💳 Phương thức thanh toán' },
          { id: 'transactions', label: '📊 Giao dịch thanh toán' },
          { id: 'schedule', label: '🗺️ Tự tạo lịch trình riêng' },
          { id: 'reviews', label: '💬 Đánh giá của tôi' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => { setCurrentView(tab.id); if(tab.id === 'info') setIsEditing(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl transition cursor-pointer ${currentView === tab.id ? 'bg-[#2C3E2B] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </aside>
  );
}