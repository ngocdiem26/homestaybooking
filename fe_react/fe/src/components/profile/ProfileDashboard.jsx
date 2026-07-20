import CustomerTierOverview, { CustomerTierSummary, useCustomerTierData } from './CustomerTierOverview';

function MenuCard({ title, items }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="border-b border-gray-100 pb-3 text-base font-black text-[#2C1E15]">{title}</h3>
      <div className="mt-3 space-y-1 text-sm font-bold">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="group flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-gray-700 transition hover:bg-[#F4F1EA] hover:text-[#2C3E2B]"
          >
            <span>{item.label}</span>
            <span className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#6E473B]">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProfileDashboard({ userInfo, fileInputRef, handleAvatarChange, setCurrentView, setIsEditing, mySchedulesCount }) {
  const { tier, tiers, isLoading, errorMessage } = useCustomerTierData();

  const menuGroups = [
    {
      title: 'Quản lý tài khoản',
      items: [
        { label: 'Thông tin cá nhân', onClick: () => { setCurrentView('info'); setIsEditing(false); } },
        { label: 'Đơn đặt phòng của bạn', onClick: () => setCurrentView('bookings') },
      ],
    },
    {
      title: 'Thông tin thanh toán',
      items: [
        { label: 'Phương thức thanh toán', onClick: () => setCurrentView('payment') },
        { label: 'Giao dịch của bạn', onClick: () => setCurrentView('transactions') },
      ],
    },
    {
      title: 'Hoạt động du lịch',
      items: [
        { label: 'Tự tạo lịch trình riêng (' + mySchedulesCount + ')', onClick: () => setCurrentView('schedule') },
        { label: 'Đánh giá của tôi', onClick: () => setCurrentView('reviews') },
      ],
    },
  ];

  return (
    <div className="space-y-10 text-left animate-fade-in">
      <section className="relative overflow-hidden rounded-b-[32px] bg-[#202c3c] px-6 pb-10 pt-10 text-white shadow-lg md:px-12 md:pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(240,183,122,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.12),transparent_30%)]" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 md:h-16 md:w-16">
              <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-[#2C3E2B] text-xl font-black shadow-xl">
                {userInfo.avatar ? <img src={userInfo.avatar} alt="Avatar" className="h-full w-full object-cover" /> : userInfo.name.charAt(0)}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="absolute -bottom-1 -right-1 rounded-full border-2 border-[#202c3c] bg-[#6E473B] px-2 py-1 text-[10px] font-black text-white shadow-md transition hover:scale-105"
              >
                Ảnh
              </button>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-[#F0B77A]">Tài khoản Cozygo</p>
              <h1 className="mt-1 font-serif text-2xl font-black md:text-3xl">Chào, {userInfo.name}</h1>
              <p className="mt-1 max-w-2xl text-xs font-semibold leading-5 text-gray-300 md:text-sm">
                Quản lý hồ sơ, hành trình lưu trú và quyền lợi thành viên của bạn tại Cozygo.
              </p>
            </div>
          </div>

          <div className="mt-7">
            <CustomerTierSummary tier={tier} userInfo={userInfo} isLoading={isLoading} errorMessage={errorMessage} />
          </div>
        </div>
      </section>

      <CustomerTierOverview tiers={tiers} isLoading={isLoading} errorMessage={errorMessage} />

      <section className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {menuGroups.map((group) => <MenuCard key={group.title} title={group.title} items={group.items} />)}
        </div>
      </section>
    </div>
  );
}
