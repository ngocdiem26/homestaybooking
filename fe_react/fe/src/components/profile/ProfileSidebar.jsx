import { HiArrowLeft } from 'react-icons/hi2';

export default function ProfileSidebar({ currentView, setCurrentView, setIsEditing }) {
  const tabs = [
    { id: 'info', label: 'Thông tin cá nhân' },
    { id: 'bookings', label: 'Đơn đặt phòng của bạn' },
    { id: 'complaints', label: 'Khiếu nại của tôi' },
    { id: 'payment', label: 'Phương thức thanh toán' },
    { id: 'transactions', label: 'Giao dịch thanh toán' },
    { id: 'schedule', label: 'Tạo lịch trình chuyến đi' },
    { id: 'reviews', label: 'Đánh giá của tôi' },
  ];

  return (
    <aside className="sticky top-24 space-y-4 text-left lg:col-span-1">
      <button
        type="button"
        onClick={() => setCurrentView('dashboard')}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-[#2C3E2B]"
      >
        <HiArrowLeft className="h-5 w-5" />
        Quay lại tổng quan
      </button>

      <nav className="rounded-2xl border border-[#6E473B]/10 bg-white p-3 shadow-sm">
        <div className="border-b border-gray-100 px-3 pb-3 pt-1">
          <h3 className="mt-1 font-classic text-lg font-black text-[#2C1E15]">Quản lý cá nhân</h3>
        </div>

        <div className="mt-2 flex flex-col space-y-1 text-sm font-bold">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setCurrentView(tab.id);
                if (tab.id === 'info') setIsEditing(false);
              }}
              className={`w-full cursor-pointer rounded-xl px-4 py-3 text-left transition ${currentView === tab.id ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:bg-[#F8F6F0] hover:text-[#2C3E2B]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}

