// import { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Logo from '../components/common/Logo';
// import { useAuth } from '../hooks/useAuth';
// import { maintenanceFeeService } from '../services/maintenanceFeeService';

// export default function HostLayout({ children, currentTab, contentClassName = '' }) {
//   const navigate = useNavigate();
//   const { logout, user } = useAuth();
//   const headerActionsRef = useRef(null);
//   const [isHostMenuOpen, setIsHostMenuOpen] = useState(false);
//   const [isNotificationOpen, setIsNotificationOpen] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [isAccountPanelOpen, setIsAccountPanelOpen] = useState(false);
//   const [hostProfile, setHostProfile] = useState({
//     fullName: user?.fullName || 'Diễm Ngọc',
//     email: user?.email || 'host@cozygo.vn',
//     phoneNumber: user?.phoneNumber || '0336675388',
//     address: user?.address || 'Ninh Kiều, Cần Thơ',
//     avatar: user?.avatar || '',
//   });
//   const [draftProfile, setDraftProfile] = useState(hostProfile);

//   const displayName = hostProfile.fullName || hostProfile.email || 'Chủ homestay';
//   const avatarLabel = displayName.trim().charAt(0).toUpperCase();
//   const notificationCount = notifications.length;

//   useEffect(() => {
//     let mounted = true;
//     maintenanceFeeService.hostNotifications()
//       .then((data) => { if (mounted) setNotifications(Array.isArray(data) ? data : []); })
//       .catch(() => { if (mounted) setNotifications([]); });
//     return () => { mounted = false; };
//   }, []);

//   useEffect(() => {
//     const handlePointerDown = (event) => {
//       if (!headerActionsRef.current?.contains(event.target)) {
//         setIsHostMenuOpen(false);
//         setIsNotificationOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handlePointerDown);
//     return () => document.removeEventListener('mousedown', handlePointerDown);
//   }, []);

//   const updateAvatar = (file) => {
//     if (!file || !file.type.startsWith('image/')) return;
//     const imageUrl = URL.createObjectURL(file);
//     updateDraftProfile('avatar', imageUrl);
//   };

//   const handleLogout = () => {
//     logout();
//     setIsHostMenuOpen(false);
//     navigate('/');
//   };

//   const openAccountPanel = () => {
//     setDraftProfile(hostProfile);
//     setIsHostMenuOpen(false);
//     setIsNotificationOpen(false);
//     setIsAccountPanelOpen(true);
//   };

//   const updateDraftProfile = (field, value) => {
//     setDraftProfile((current) => ({ ...current, [field]: value }));
//   };

//   const saveProfile = (event) => {
//     event.preventDefault();
//     setHostProfile(draftProfile);
//     setIsAccountPanelOpen(false);
//   };

//   return (
//     <div className="bg-[#F4F1EA] min-h-screen flex flex-col justify-between text-[#23150d] font-sans antialiased text-left selection:bg-[#2C3E2B]/10">
//       <header className="bg-[#202c3c] text-white shadow-md sticky top-0 z-50 w-full">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
//           <div className="flex items-center space-x-3 shrink-0">
//             <Logo />
//             <div className="border-l border-white/20 pl-3 text-left">
//               <h1 className="font-serif font-bold text-lg md:text-xl tracking-wide leading-tight text-white">
//                 Host Dashboard
//               </h1>
//               <p className="text-[10px] text-gray-400 font-mono">Hệ thống quản lý đối tác chủ nhà Cozygo</p>
//             </div>
//           </div>

//           <div ref={headerActionsRef} className="relative flex items-center gap-3">
//             <div className="relative">
//               <button
//                 aria-label="Thông báo phí duy trì"
//                 className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#F4F1EA] transition hover:bg-white/10"
//                 onClick={() => {
//                   setIsNotificationOpen((current) => !current);
//                   setIsHostMenuOpen(false);
//                 }}
//                 type="button"
//               >
//                 <i className="fa-regular fa-bell text-lg"></i>
//                 {notificationCount > 0 && (
//                   <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[10px] font-black text-white shadow">
//                     {notificationCount > 9 ? '9+' : notificationCount}
//                   </span>
//                 )}
//               </button>

//               {isNotificationOpen && (
//                 <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white text-[#23150d] shadow-2xl z-50">
//                   <div className="border-b border-gray-100 px-4 py-3">
//                     <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B66A3C]">Thông báo</p>
//                     <p className="mt-1 text-sm font-black text-[#2C1E15]">Phí duy trì host</p>
//                   </div>
//                   <div className="max-h-80 overflow-y-auto p-2">
//                     {notifications.length ? notifications.map((item) => <HostNotificationItem key={item.maintenanceFeeId} item={item} />) : (
//                       <div className="rounded-xl bg-[#F8F6F1] px-4 py-6 text-center text-xs font-bold text-gray-500">
//                         Chưa có thông báo phí duy trì.
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="relative">
//               <button
//                 className="flex items-center gap-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 pl-1.5 pr-4 py-1.5 transition text-left"
//                 onClick={() => {
//                   setIsHostMenuOpen((current) => !current);
//                   setIsNotificationOpen(false);
//                 }}
//                 type="button"
//               >
//                 <HostAvatar avatar={hostProfile.avatar} label={avatarLabel} size="sm" />
//                 <span className="hidden sm:block max-w-[170px]">
//                   <span className="block truncate text-sm font-black text-[#F4F1EA]">{displayName}</span>
//                   <span className="block truncate text-[10px] font-mono text-amber-200/80">Chủ homestay</span>
//                 </span>
//                 <i className={(isHostMenuOpen ? 'rotate-180 ' : '') + 'fa-solid fa-chevron-down text-[10px] text-[#F4F1EA]/60 transition'}></i>
//               </button>

//               {isHostMenuOpen && (
//                 <div className="absolute right-0 mt-3 w-52 rounded-xl bg-white text-[#23150d] border border-gray-200 shadow-2xl overflow-hidden z-50">
//                   <button
//                     className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left hover:bg-[#F4F1EA] transition"
//                     onClick={openAccountPanel}
//                     type="button"
//                   >
//                     <i className="fa-regular fa-user text-[#6E473B]"></i>
//                     Tài khoản
//                   </button>
//                   <button
//                     className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left text-red-600 hover:bg-red-50 transition"
//                     onClick={handleLogout}
//                     type="button"
//                   >
//                     <i className="fa-solid fa-right-from-bracket"></i>
//                     Đăng xuất
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="flex-grow px-4 py-4 sm:px-6 lg:px-8 w-full z-10 relative">
//         <div className={`${currentTab === 'dashboard' ? 'mx-auto max-w-7xl' : 'w-full max-w-none'} ${contentClassName}`}>{children}</div>
//       </main>

//       <footer className="bg-white border-t border-gray-200 py-4 text-center flex-shrink-0 w-full z-10">
//         <div className="max-w-7xl mx-auto px-4 text-[11px] text-gray-400 font-medium italic flex flex-col sm:flex-row items-center justify-between gap-1">
//           <span>© 2026 Cozygo Host Hub - Kênh quản lý vận hành Homestay nguyên căn</span>
//           <span className="text-[#6E473B]">Hệ thống bảo mật dữ liệu đối tác Cozygo</span>
//         </div>
//       </footer>

//       {isAccountPanelOpen && (
//         <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex justify-end">
//           <form
//             className="h-full w-full max-w-md bg-white shadow-2xl border-l border-gray-200 animate-slide-in-right flex flex-col"
//             onSubmit={saveProfile}
//           >
//             <div className="px-6 py-5 bg-[#202c3c] text-white flex items-start justify-between gap-4">
//               <div>
//                 <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#d9b18f]">Hồ sơ chủ homestay</p>
//                 <h2 className="font-serif text-2xl font-bold mt-1">Thông tin tài khoản</h2>
//                 <p className="text-xs text-gray-300 mt-1">Cập nhật thông tin liên hệ hiển thị trong khu vực quản lý.</p>
//               </div>
//               <button
//                 className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
//                 onClick={() => setIsAccountPanelOpen(false)}
//                 type="button"
//               >
//                 <i className="fa-solid fa-xmark"></i>
//               </button>
//             </div>

//             <div className="p-6 space-y-5 flex-1 overflow-y-auto">
//               <div className="flex items-center gap-4 rounded-2xl bg-[#F4F1EA] border border-gray-200 p-4">
//                 <label className="relative shrink-0 cursor-pointer group" title="Đổi ảnh đại diện">
//                   <HostAvatar avatar={draftProfile.avatar} label={avatarLabel} size="lg" />
//                   <span className="absolute inset-x-0 bottom-0 h-7 rounded-b-full bg-black/55 text-white flex items-center justify-center text-[11px] opacity-0 group-hover:opacity-100 transition">
//                     <i className="fa-solid fa-camera"></i>
//                   </span>
//                   <input
//                     accept="image/*"
//                     className="hidden"
//                     onChange={(event) => {
//                       updateAvatar(event.target.files?.[0]);
//                       event.target.value = '';
//                     }}
//                     type="file"
//                   />
//                 </label>
//                 <div className="min-w-0">
//                   <p className="text-lg font-black text-[#2C1E15] truncate">{draftProfile.fullName || displayName}</p>
//                   <p className="text-xs font-bold text-gray-400">Chủ homestay</p>
//                   <p className="mt-1 text-[11px] font-semibold text-[#6E473B]">Bấm vào ảnh để thay avatar</p>
//                 </div>
//               </div>

//               <HostProfileField label="Họ tên" value={draftProfile.fullName} onChange={(value) => updateDraftProfile('fullName', value)} />
//               <HostProfileField label="Email" type="email" value={draftProfile.email} onChange={(value) => updateDraftProfile('email', value)} />
//               <HostProfileField label="Số điện thoại" value={draftProfile.phoneNumber} onChange={(value) => updateDraftProfile('phoneNumber', value)} />
//               <HostProfileField label="Địa chỉ" value={draftProfile.address} onChange={(value) => updateDraftProfile('address', value)} />
//             </div>

//             <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
//               <button
//                 className="px-5 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 text-xs font-bold shadow-sm hover:bg-gray-50 transition"
//                 onClick={() => setIsAccountPanelOpen(false)}
//                 type="button"
//               >
//                 Hủy
//               </button>
//               <button className="px-6 h-11 rounded-xl bg-[#2C3E2B] hover:bg-[#223123] text-white text-xs font-bold shadow transition" type="submit">
//                 Lưu thông tin
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }

// function HostNotificationItem({ item }) {
//   const overdue = item.notificationType === 'OVERDUE' || item.paymentStatus === 'OVERDUE';
//   return (
//     <div className={(overdue ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800') + ' mb-2 rounded-xl border border-current/10 p-3'}>
//       <div className="flex items-start gap-3">
//         <span className={(overdue ? 'bg-red-100' : 'bg-amber-100') + ' flex h-9 w-9 shrink-0 items-center justify-center rounded-full'}>
//           <i className={overdue ? 'fa-solid fa-triangle-exclamation' : 'fa-regular fa-clock'}></i>
//         </span>
//         <div className="min-w-0">
//           <p className="text-sm font-black">{item.title}</p>
//           <p className="mt-1 text-xs font-semibold leading-relaxed text-gray-600">{item.message}</p>
//           <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-gray-400">Hạn: {formatNoticeDate(item.dueDate)}</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// function formatNoticeDate(value) {
//   if (!value) return '--';
//   const date = new Date(value);
//   return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
// }

// function HostProfileField({ label, onChange, type = 'text', value }) {
//   return (
//     <label className="block space-y-2">
//       <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">{label}</span>
//       <input
//         className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 outline-none transition focus:border-[#2C3E2B] focus:ring-4 focus:ring-[#2C3E2B]/10"
//         onChange={(event) => onChange(event.target.value)}
//         type={type}
//         value={value}
//       />
//     </label>
//   );
// }

// function HostAvatar({ avatar, label, size = 'sm' }) {
//   const sizeClass = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm';

//   return (
//     <span className={sizeClass + ' rounded-full bg-[#6E473B] text-white flex items-center justify-center font-black uppercase shadow overflow-hidden shrink-0'}>
//       {avatar ? <img alt="Avatar host" className="w-full h-full object-cover" src={avatar} /> : label}
//     </span>
//   );
// }
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { useAuth } from '../hooks/useAuth';
import { maintenanceFeeService } from '../services/maintenanceFeeService';

export default function HostLayout({ children, currentTab, contentClassName = '' }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const headerActionsRef = useRef(null);
  const [isHostMenuOpen, setIsHostMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isAccountPanelOpen, setIsAccountPanelOpen] = useState(false);
  const [hostProfile, setHostProfile] = useState({
    fullName: user?.fullName || 'Diễm Ngọc',
    email: user?.email || 'host@cozygo.vn',
    phoneNumber: user?.phoneNumber || '0336675388',
    address: user?.address || 'Ninh Kiều, Cần Thơ',
    avatar: user?.avatar || '',
  });
  const [draftProfile, setDraftProfile] = useState(hostProfile);

  const displayName = hostProfile.fullName || hostProfile.email || 'Chủ homestay';
  const avatarLabel = displayName.trim().charAt(0).toUpperCase();
  const notificationCount = notifications.length;

  useEffect(() => {
    let mounted = true;
    maintenanceFeeService.hostNotifications()
      .then((data) => { if (mounted) setNotifications(Array.isArray(data) ? data : []); })
      .catch(() => { if (mounted) setNotifications([]); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!headerActionsRef.current?.contains(event.target)) {
        setIsHostMenuOpen(false);
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const updateAvatar = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const imageUrl = URL.createObjectURL(file);
    updateDraftProfile('avatar', imageUrl);
  };

  const handleLogout = () => {
    logout();
    setIsHostMenuOpen(false);
    navigate('/');
  };

  const openAccountPanel = () => {
    setDraftProfile(hostProfile);
    setIsHostMenuOpen(false);
    setIsNotificationOpen(false);
    setIsAccountPanelOpen(true);
  };

  const updateDraftProfile = (field, value) => {
    setDraftProfile((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = (event) => {
    event.preventDefault();
    setHostProfile(draftProfile);
    setIsAccountPanelOpen(false);
  };

  return (
    <div className="bg-[#F4F1EA] min-h-[100dvh] flex flex-col text-[#23150d] font-sans antialiased text-left selection:bg-[#2C3E2B]/10">
      <header className="bg-[#202c3c] text-white shadow-md sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 shrink-0">
            <Logo />
            <div className="border-l border-white/20 pl-3 text-left">
              <h1 className="font-serif font-bold text-lg md:text-xl tracking-wide leading-tight text-white">
                Host Dashboard
              </h1>
              <p className="text-[10px] text-gray-400 font-mono">Hệ thống quản lý đối tác chủ nhà Cozygo</p>
            </div>
          </div>

          <div ref={headerActionsRef} className="relative flex items-center gap-3">
            <div className="relative">
              <button
                aria-label="Thông báo phí duy trì"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#F4F1EA] transition hover:bg-white/10"
                onClick={() => {
                  setIsNotificationOpen((current) => !current);
                  setIsHostMenuOpen(false);
                }}
                type="button"
              >
                <i className="fa-regular fa-bell text-lg"></i>
                {notificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[10px] font-black text-white shadow">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white text-[#23150d] shadow-2xl z-50">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B66A3C]">Thông báo</p>
                    <p className="mt-1 text-sm font-black text-[#2C1E15]">Phí duy trì host</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length ? notifications.map((item) => <HostNotificationItem key={item.maintenanceFeeId} item={item} />) : (
                      <div className="rounded-xl bg-[#F8F6F1] px-4 py-6 text-center text-xs font-bold text-gray-500">
                        Chưa có thông báo phí duy trì.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className="flex items-center gap-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 pl-1.5 pr-4 py-1.5 transition text-left"
                onClick={() => {
                  setIsHostMenuOpen((current) => !current);
                  setIsNotificationOpen(false);
                }}
                type="button"
              >
                <HostAvatar avatar={hostProfile.avatar} label={avatarLabel} size="sm" />
                <span className="hidden sm:block max-w-[170px]">
                  <span className="block truncate text-sm font-black text-[#F4F1EA]">{displayName}</span>
                  <span className="block truncate text-[10px] font-mono text-amber-200/80">Chủ homestay</span>
                </span>
                <i className={(isHostMenuOpen ? 'rotate-180 ' : '') + 'fa-solid fa-chevron-down text-[10px] text-[#F4F1EA]/60 transition'}></i>
              </button>

              {isHostMenuOpen && (
                <div className="absolute right-0 mt-3 w-52 rounded-xl bg-white text-[#23150d] border border-gray-200 shadow-2xl overflow-hidden z-50">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left hover:bg-[#F4F1EA] transition"
                    onClick={openAccountPanel}
                    type="button"
                  >
                    <i className="fa-regular fa-user text-[#6E473B]"></i>
                    Tài khoản
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left text-red-600 hover:bg-red-50 transition"
                    onClick={handleLogout}
                    type="button"
                  >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 px-4 py-4 sm:px-6 lg:px-8 w-full z-10 relative">
        <div className={`${currentTab === 'dashboard' ? 'mx-auto max-w-7xl' : 'w-full max-w-none'} ${contentClassName}`}>{children}</div>
      </main>

      <footer className="mt-auto shrink-0 bg-white border-t border-gray-200 py-4 text-center w-full z-10">
        <div className="max-w-7xl mx-auto px-4 text-[11px] text-gray-400 font-medium italic flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>© 2026 Cozygo Host Hub - Kênh quản lý vận hành Homestay nguyên căn</span>
          <span className="text-[#6E473B]">Hệ thống bảo mật dữ liệu đối tác Cozygo</span>
        </div>
      </footer>

      {isAccountPanelOpen && (
        <div className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm flex justify-end">
          <form
            className="h-full w-full max-w-md bg-white shadow-2xl border-l border-gray-200 animate-slide-in-right flex flex-col"
            onSubmit={saveProfile}
          >
            <div className="px-6 py-5 bg-[#202c3c] text-white flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#d9b18f]">Hồ sơ chủ homestay</p>
                <h2 className="font-serif text-2xl font-bold mt-1">Thông tin tài khoản</h2>
                <p className="text-xs text-gray-300 mt-1">Cập nhật thông tin liên hệ hiển thị trong khu vực quản lý.</p>
              </div>
              <button
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                onClick={() => setIsAccountPanelOpen(false)}
                type="button"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
              <div className="flex items-center gap-4 rounded-2xl bg-[#F4F1EA] border border-gray-200 p-4">
                <label className="relative shrink-0 cursor-pointer group" title="Đổi ảnh đại diện">
                  <HostAvatar avatar={draftProfile.avatar} label={avatarLabel} size="lg" />
                  <span className="absolute inset-x-0 bottom-0 h-7 rounded-b-full bg-black/55 text-white flex items-center justify-center text-[11px] opacity-0 group-hover:opacity-100 transition">
                    <i className="fa-solid fa-camera"></i>
                  </span>
                  <input
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      updateAvatar(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                    type="file"
                  />
                </label>
                <div className="min-w-0">
                  <p className="text-lg font-black text-[#2C1E15] truncate">{draftProfile.fullName || displayName}</p>
                  <p className="text-xs font-bold text-gray-400">Chủ homestay</p>
                  <p className="mt-1 text-[11px] font-semibold text-[#6E473B]">Bấm vào ảnh để thay avatar</p>
                </div>
              </div>

              <HostProfileField label="Họ tên" value={draftProfile.fullName} onChange={(value) => updateDraftProfile('fullName', value)} />
              <HostProfileField label="Email" type="email" value={draftProfile.email} onChange={(value) => updateDraftProfile('email', value)} />
              <HostProfileField label="Số điện thoại" value={draftProfile.phoneNumber} onChange={(value) => updateDraftProfile('phoneNumber', value)} />
              <HostProfileField label="Địa chỉ" value={draftProfile.address} onChange={(value) => updateDraftProfile('address', value)} />
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-5 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 text-xs font-bold shadow-sm hover:bg-gray-50 transition"
                onClick={() => setIsAccountPanelOpen(false)}
                type="button"
              >
                Hủy
              </button>
              <button className="px-6 h-11 rounded-xl bg-[#2C3E2B] hover:bg-[#223123] text-white text-xs font-bold shadow transition" type="submit">
                Lưu thông tin
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function HostNotificationItem({ item }) {
  const overdue = item.notificationType === 'OVERDUE' || item.paymentStatus === 'OVERDUE';
  return (
    <div className={(overdue ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800') + ' mb-2 rounded-xl border border-current/10 p-3'}>
      <div className="flex items-start gap-3">
        <span className={(overdue ? 'bg-red-100' : 'bg-amber-100') + ' flex h-9 w-9 shrink-0 items-center justify-center rounded-full'}>
          <i className={overdue ? 'fa-solid fa-triangle-exclamation' : 'fa-regular fa-clock'}></i>
        </span>
        <div className="min-w-0">
          <p className="text-sm font-black">{item.title}</p>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-gray-600">{item.message}</p>
          <p className="mt-2 text-[11px] font-black uppercase tracking-wide text-gray-400">Hạn: {formatNoticeDate(item.dueDate)}</p>
        </div>
      </div>
    </div>
  );
}

function formatNoticeDate(value) {
  if (!value) return '--';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
}

function HostProfileField({ label, onChange, type = 'text', value }) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-black text-gray-500 uppercase tracking-wide">{label}</span>
      <input
        className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 outline-none transition focus:border-[#2C3E2B] focus:ring-4 focus:ring-[#2C3E2B]/10"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function HostAvatar({ avatar, label, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm';

  return (
    <span className={sizeClass + ' rounded-full bg-[#6E473B] text-white flex items-center justify-center font-black uppercase shadow overflow-hidden shrink-0'}>
      {avatar ? <img alt="Avatar host" className="w-full h-full object-cover" src={avatar} /> : label}
    </span>
  );
}