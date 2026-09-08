
// import { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import {
//   HiOutlineHome,
//   HiOutlineChevronDown,
//   HiOutlineChevronRight,
//   HiOutlineCheckCircle,
//   HiOutlineClock,
//   HiOutlineXCircle,
//   HiOutlineBan,
//   HiOutlineX,
//   HiOutlineCash,
//   HiOutlineCalendar,
//   HiOutlineUsers,
//   HiOutlineClipboardList,
//   HiOutlineCube,

//   HiOutlineStar,
// } from 'react-icons/hi';
// import HostLayout from '../../layouts/HostLayout';
// import ModalPortal from '../../components/common/ModalPortal';
// import Pagination from '../../components/common/Pagination';
// import ManagementBackButton from '../../components/common/ManagementBackButton';
// import ManagementHeaderRow from '../../components/common/ManagementHeaderRow';
// import ManagementToolbar from '../../components/common/ManagementToolbar';
// import { isWithinDateFilter } from '../../utils/dateFilter';
// import { confirmHostBookingPayment, getHostBookings, updateHostBookingStatus } from '../../services/bookingService';

// const MOCK_BOOKINGS = [];

// const STATUS_CONFIG = {
//   'Chờ duyệt': { bg: '#FEF9EE', text: '#B45309', border: '#FCD34D', icon: HiOutlineClock },
//   'Đã xác nhận': { bg: '#EFF6FF', text: '#1D4ED8', border: '#93C5FD', icon: HiOutlineCheckCircle },
//   'Hoàn thành': { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7', icon: HiOutlineCheckCircle },
//   'Đã hủy': { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', icon: HiOutlineXCircle },
//   'Bị chặn': { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB', icon: HiOutlineBan },
// };

// const PAYMENT_STATUS_CONFIG = {
//   'Đã thanh toán': { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7' },
//   'Chờ thanh toán': { bg: '#FEF9EE', text: '#B45309', border: '#FCD34D' },
//   'Hoàn tiền': { bg: '#EFF6FF', text: '#1D4ED8', border: '#93C5FD' },
// };

// const PAGE_SIZE = 5;

// function fmt(n) { return new Intl.NumberFormat('vi-VN').format(Number(n || 0)) + ' đ'; }

// function formatDate(value) {
//   if (!value) return '';
//   return new Date(value + 'T00:00:00').toLocaleDateString('vi-VN');
// }

// function formatDateTime(value) {
//   if (!value) return '';
//   return new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
// }

// function isPastCheckInDate(value) {
//   if (!value) return false;
//   const checkIn = new Date(value + 'T00:00:00');
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   return checkIn < today;
// }

// function mapHostStatus(status) {
//   const normalized = String(status || '').toUpperCase();
//   if (normalized === 'CONFIRMED') return 'Đã xác nhận';
//   if (normalized === 'COMPLETED') return 'Hoàn thành';
//   if (['CANCELLED', 'EXPIRED', 'NO_SHOW'].includes(normalized)) return 'Đã hủy';
//   return 'Chờ duyệt';
// }

// function mapPaymentStatus(status) {
//   const normalized = String(status || '').toUpperCase();
//   if (normalized === 'PAID') return 'Đã thanh toán';
//   if (['REFUNDED', 'FAILED'].includes(normalized)) return 'Hoàn tiền';
//   return 'Chờ thanh toán';
// }

// function mapPaymentMethod(method) {
//   const normalized = String(method || '').toUpperCase();
//   if (normalized === 'VNPAY') return 'VNPay';
//   if (normalized === 'PAY_AT_PROPERTY') return 'Thanh toán tại chỗ';
//   return method || 'Chưa chọn';
// }

// function toBackendStatus(label) {
//   if (label === 'Đã xác nhận') return 'CONFIRMED';
//   if (label === 'Hoàn thành') return 'COMPLETED';
//   if (label === 'Đã hủy') return 'CANCELLED';
//   return 'PAYMENT_PENDING';
// }

// function getDisplayHostStatus(apiBooking) {
//   const bookingStatus = String(apiBooking.bookingStatus || '').toUpperCase();
//   if (['CANCELLED', 'EXPIRED', 'NO_SHOW'].includes(bookingStatus)) return 'Đã hủy';
//   if (String(apiBooking.paymentStatus || '').toUpperCase() === 'PAID') {
//     return isPastCheckInDate(apiBooking.checkInDate) ? 'Hoàn thành' : 'Đã xác nhận';
//   }
//   return mapHostStatus(apiBooking.bookingStatus);
// }

// function canConfirmPayment(booking) {
//   return booking?.paymentMethod === 'Thanh toán tại chỗ' && booking?.paymentStatus === 'Chờ thanh toán' && ['Đã xác nhận', 'Hoàn thành'].includes(booking?.status);
// }

// function mapHostBooking(apiBooking) {
//   const services = (apiBooking.services || []).map((service) => ({
//     name: service.serviceName,
//     unitPrice: Number(service.unitPrice || 0),
//     qty: Number(service.quantity || 1),
//     total: Number(service.totalPrice || 0),
//   }));

//   return {
//     id: apiBooking.bookingCode || ('#' + apiBooking.bookingId),
//     bookingId: apiBooking.bookingId,
//     homestay: apiBooking.homestayName || 'Homestay',
//     homestayId: apiBooking.homestayCode || ('HMS-' + apiBooking.homeId),
//     checkin: formatDate(apiBooking.checkInDate),
//     checkout: formatDate(apiBooking.checkOutDate),
//     guests: Number(apiBooking.numberOfGuest || 1),
//     status: getDisplayHostStatus(apiBooking),
//     paymentMethod: mapPaymentMethod(apiBooking.paymentMethod),
//     paymentStatus: mapPaymentStatus(apiBooking.paymentStatus),
//     createdAt: formatDateTime(apiBooking.createdAt),
//     note: apiBooking.note || '',
//     roomPrice: Number(apiBooking.roomTotal || 0),
//     discount: Number(apiBooking.discountAmount || 0),
//     totalPrice: Number(apiBooking.totalPrice || 0),
//     services,
//   };
// }

// // ─── Shared UI ─────────────────────────────────────────────────────────────
// const brand = { dark:'#1C2B2B', forest:'#2C3E2B', terra:'#8B4A2F', cream:'#F4F1EA', warm:'#6E473B' };

// const tableColumns = '44px minmax(180px, 1.1fr) 140px minmax(125px, .7fr) 175px 160px minmax(300px, 1fr)';

// function StatusBadge({ status, small }) {
//   const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Chờ duyệt'];
//   const Icon = cfg.icon;
//   return (
//     <span className={`inline-flex items-center gap-1 font-semibold border rounded-full ${small ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'}`}
//       style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
//       <Icon size={small ? 10 : 12} />{status}
//     </span>
//   );
// }

// function PaymentBadge({ status }) {
//   const cfg = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG['Chờ thanh toán'];
//   return (
//     <span className="inline-flex items-center gap-1 text-[11px] font-semibold border rounded-full px-2 py-0.5"
//       style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
//       {status}
//     </span>
//   );
// }

// // ─── Main component ────────────────────────────────────────────────────────
// export default function HostBookings() {
//   const navigate = useNavigate();
//   const [bookings, setBookings] = useState(MOCK_BOOKINGS);
//   const [loading, setLoading] = useState(false);
//   const [loadError, setLoadError] = useState('');
//   const [search, setSearch] = useState('');
//   const [filterStatus, setFilterStatus] = useState('Tất cả');
//   const [filterPayment, setFilterPayment] = useState('Tất cả');
//   const [filterHomestay, setFilterHomestay] = useState('Tất cả');
//   const [dateFilter, setDateFilter] = useState('all');
//   const [dateFrom, setDateFrom] = useState('');
//   const [dateTo, setDateTo] = useState('');
//   const [expandedId, setExpandedId] = useState(null);
//   const [detailId, setDetailId] = useState(null);
//   const [page, setPage] = useState(1);

//   useEffect(() => {
//     let isMounted = true;

//     async function loadBookings() {
//       try {
//         setLoading(true);
//         setLoadError('');
//         const data = await getHostBookings();
//         if (isMounted) setBookings(data.map(mapHostBooking));
//       } catch (error) {
//         if (isMounted) setLoadError(error.message || 'Không tải được danh sách đơn đặt phòng');
//       } finally {
//         if (isMounted) setLoading(false);
//       }
//     }

//     loadBookings();
//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   const homestayOptions = ['Tất cả', ...Array.from(new Set(bookings.map(b => b.homestay)))];

//   const filtered = useMemo(() => {
//     const kw = search.trim().toLowerCase();
//     return bookings.filter(b =>
//       (!kw || b.id.toLowerCase().includes(kw) || b.homestay.toLowerCase().includes(kw))
//       && (filterStatus === 'Tất cả' || b.status === filterStatus)
//       && (filterPayment === 'Tất cả' || b.paymentStatus === filterPayment)
//       && (filterHomestay === 'Tất cả' || b.homestay === filterHomestay)
//       && isWithinDateFilter(b.createdAt, dateFilter, dateFrom, dateTo)
//     );
//   }, [bookings, search, filterStatus, filterPayment, filterHomestay, dateFilter, dateFrom, dateTo]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
//   const detailBooking = bookings.find(b => b.id === detailId) || null;

//   const updateStatus = async (id, status) => {
//     const target = bookings.find((booking) => booking.id === id || booking.bookingId === id);
//     if (!target) return;

//     try {
//       const updated = await updateHostBookingStatus(target.bookingId, toBackendStatus(status));
//       setBookings((current) => current.map((booking) => booking.bookingId === updated.bookingId ? mapHostBooking(updated) : booking));
//       if (detailBooking?.id === id) setDetailId(null);
//     } catch (error) {
//       alert(error.message || 'Không cập nhật được trạng thái đơn đặt phòng');
//     }
//   };

//   const confirmPayment = async (id) => {
//     const target = bookings.find((booking) => booking.id === id || booking.bookingId === id);
//     if (!target || !canConfirmPayment(target)) return;
//     if (!window.confirm('Xác nhận khách đã thanh toán tại chỗ cho đơn này?')) return;

//     try {
//       const updated = await confirmHostBookingPayment(target.bookingId);
//       setBookings((current) => current.map((booking) => booking.bookingId === updated.bookingId ? mapHostBooking(updated) : booking));
//       if (detailBooking?.id === id) setDetailId(null);
//     } catch (error) {
//       alert(error.message || 'Không xác nhận được thanh toán');
//     }
//   };

//   const stats = {
//     total: bookings.length,
//     pending: bookings.filter(b => b.status === 'Chờ duyệt').length,
//     done: bookings.filter(b => b.status === 'Hoàn thành').length,
//     revenue: bookings.filter(b => b.paymentStatus === 'Đã thanh toán').reduce((s, b) => s + b.totalPrice, 0),
//   };

//   return (
//     <HostLayout>
//       <div className="animate-fade-in text-sm">
//         <ManagementHeaderRow backButton={<ManagementBackButton onClick={() => navigate('/host')} />}>
//           {/* ── Page header ── */}
//         <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//           <div>
//             <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: brand.warm }}>Bảng điều khiển</p>
//             <h2 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: '#2C1E15' }}>Quản lý đơn đặt phòng</h2>
//             <p className="text-xs text-gray-400 mt-1">
//               Theo dõi và cập nhật trạng thái tất cả các đơn đặt homestay của bạn.
//               <span className="ml-2 font-semibold" style={{ color: brand.warm }}>{bookings.length} đơn tổng • {stats.pending} chờ duyệt</span>
//             </p>
//           </div>
//           {/* Stats chips */}
//           <div className="flex gap-3 flex-wrap">
//             {[
//               { label: 'Chờ duyệt', value: stats.pending, color: '#B45309', bg: '#FEF9EE', border: '#FCD34D' },
//               { label: 'Hoàn thành', value: stats.done, color: '#065F46', bg: '#ECFDF5', border: '#6EE7B7' },
//               { label: 'Doanh thu', value: fmt(stats.revenue), color: brand.forest, bg: '#F0FDF4', border: '#86EFAC' },
//             ].map(s => (
//               <div key={s.label} className="rounded-xl px-4 py-2.5 border text-center min-w-[100px]" style={{ background: s.bg, borderColor: s.border }}>
//                 <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#9CA3AF' }}>{s.label}</p>
//                 <p className="font-bold text-base" style={{ color: s.color }}>{s.value}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//         </ManagementHeaderRow>

//         <ManagementToolbar
//           className="mb-4"
//           filters={[
//             {
//               label: 'Trạng thái',
//               value: filterStatus,
//               onChange: (value) => { setFilterStatus(value); setPage(1); },
//               options: [
//                 { value: 'Tất cả', label: 'Tất cả' },
//                 { value: 'Chờ duyệt', label: 'Chờ duyệt' },
//                 { value: 'Đã xác nhận', label: 'Đã xác nhận' },
//                 { value: 'Hoàn thành', label: 'Hoàn thành' },
//                 { value: 'Đã hủy', label: 'Đã hủy' },
//               ],
//             },
//             {
//               label: 'Thanh toán',
//               value: filterPayment,
//               onChange: (value) => { setFilterPayment(value); setPage(1); },
//               options: [
//                 { value: 'Tất cả', label: 'Tất cả' },
//                 { value: 'Đã thanh toán', label: 'Đã thanh toán' },
//                 { value: 'Chờ thanh toán', label: 'Chờ thanh toán' },
//                 { value: 'Hoàn tiền', label: 'Hoàn tiền' },
//               ],
//             },
//             {
//               label: 'Homestay',
//               value: filterHomestay,
//               onChange: (value) => { setFilterHomestay(value); setPage(1); },
//               options: homestayOptions,
//             },
//           ]}
//           dateFilter={dateFilter}
//           onDateFilterChange={(value) => { setDateFilter(value); setPage(1); }}
//           dateFrom={dateFrom}
//           dateTo={dateTo}
//           onDateFromChange={(value) => { setDateFrom(value); setPage(1); }}
//           onDateToChange={(value) => { setDateTo(value); setPage(1); }}
//           searchValue={search}
//           onSearchChange={(value) => { setSearch(value); setPage(1); }}
//           searchPlaceholder="Tìm mã đơn, tên homestay..."
//           onReset={() => {
//             setSearch('');
//             setFilterStatus('Tất cả');
//             setFilterPayment('Tất cả');
//             setFilterHomestay('Tất cả');
//             setDateFilter('all');
//             setDateFrom('');
//             setDateTo('');
//             setPage(1);
//           }}
//         />

//         {/* ── Main area: table + side panel ── */}
//         {loadError && <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{loadError}</div>}
//         {loading && <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-gray-400 border border-gray-200">Đang tải đơn đặt phòng...</div>}

//         <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>

//           {/* Table */}
//           <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
//             {/* Table header */}
//             <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: tableColumns, background:'#F9F8F6' }}>
//               {['', 'Mã đơn', 'Trạng thái', 'Tổng tiền', 'Thời gian tạo', 'Thanh toán', 'Thao tác'].map((h, i) => (
//                 <div key={i} className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-800">{h}</div>
//               ))}
//             </div>

//             {paginated.length === 0 && (
//               <div className="py-16 text-center">
//                 <HiOutlineClipboardList size={36} className="mx-auto mb-3 opacity-30 text-gray-400"/>
//                 <p className="text-sm text-gray-400 italic">Không có đơn nào phù hợp.</p>
//               </div>
//             )}

//             {paginated.map((b) => {
//               const expanded = expandedId === b.id;
//               const isDetail = detailId === b.id;
//               return (
//                 <div key={b.id} className={`border-b border-gray-100 last:border-b-0 transition-colors ${isDetail ? 'bg-[#F4F1EA]/60' : 'hover:bg-gray-50/50'}`}>
//                   {/* Main row */}
//                   <div className="grid items-center" style={{ gridTemplateColumns: tableColumns }}>
//                     {/* Expand toggle */}
//                     <div className="px-3 py-3.5 flex items-center justify-center">
//                       <button onClick={()=>setExpandedId(expanded ? null : b.id)} className="w-6 h-6 rounded-lg flex items-center justify-center transition hover:bg-gray-100" style={{ color:'#9CA3AF' }}>
//                         {expanded ? <HiOutlineChevronDown size={14}/> : <HiOutlineChevronRight size={14}/>}
//                       </button>
//                     </div>

//                     {/* ID */}
//                     <div className="px-3 py-3.5 min-w-0">
//                       <p className="font-bold text-[13px] leading-snug break-all" style={{ color: brand.terra }}>{b.id}</p>
//                       <p className="text-[11px] text-gray-400 mt-0.5 truncate">{b.homestay}</p>
//                     </div>

//                     {/* Status */}
//                     <div className="px-2 py-3.5">
//                       <StatusBadge status={b.status}/>
//                     </div>

//                     {/* Total */}
//                     <div className="px-2 py-3.5">
//                       <span className="font-bold text-[13px]" style={{ color:'#2C1E15' }}>{fmt(b.totalPrice)}</span>
//                     </div>

//                     {/* Created */}
//                     <div className="px-2 py-3.5">
//                       <p className="text-xs leading-snug text-gray-500 font-medium whitespace-normal">{b.createdAt}</p>
//                     </div>

//                     {/* Payment */}
//                     <div className="px-2 py-3.5">
//                       <PaymentBadge status={b.paymentStatus}/>
//                       <p className="text-[11px] text-gray-400 mt-0.5">{b.paymentMethod}</p>
//                     </div>

//                     {/* Actions */}
//                     <div className="px-3 py-3.5 flex items-center gap-1.5 justify-end flex-wrap xl:flex-nowrap">
//                       <button
//                         onClick={()=>setDetailId(b.id)}
//                         className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition border"
//                         style={isDetail
//                           ? { background: brand.forest, color:'#fff', borderColor: brand.forest }
//                           : { background:'#F4F1EA', color: brand.warm, borderColor:'#E5DDD4' }
//                         }
//                       >
//                         <HiOutlineClipboardList size={13}/>Chi tiết
//                       </button>
//                       {canConfirmPayment(b) && (
//                         <button onClick={()=>confirmPayment(b.id)} className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border transition" style={{ background:'#F0FDF4', color:'#166534', borderColor:'#86EFAC' }}>
//                           <HiOutlineCash size={13}/> Đã thanh toán
//                         </button>
//                       )}
//                       {b.status === 'Chờ duyệt' && (
//                         <>
//                           <button onClick={()=>updateStatus(b.id,'Đã xác nhận')} className="h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border transition" style={{ background:'#ECFDF5', color:'#065F46', borderColor:'#6EE7B7' }}>
//                             Duyệt
//                           </button>
//                           <button onClick={()=>updateStatus(b.id,'Đã hủy')} className="h-8 px-2 rounded-lg text-xs font-semibold inline-flex items-center border transition" style={{ background:'#FEF2F2', color:'#991B1B', borderColor:'#FECACA' }}>
//                             Hủy
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   </div>

//                   {/* Expanded mini-detail */}
//                   {expanded && (
//                     <div className="mx-4 mb-3 rounded-xl border p-4 grid grid-cols-2 md:grid-cols-4 gap-3" style={{ background:'#FDFCF9', borderColor:'#EDE9E1' }}>
//                       {[
//                         { label:'Check-in', value: b.checkin, icon: HiOutlineCalendar },
//                         { label:'Check-out', value: b.checkout, icon: HiOutlineCalendar },
//                         { label:'Số khách', value: `${b.guests} khách`, icon: HiOutlineUsers },
//                         { label:'Homestay', value: b.homestay, icon: HiOutlineHome },
//                       ].map(({ label, value, icon: Icon }) => (
//                         <div key={label}>
//                           <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
//                           <p className="text-sm font-bold flex items-center gap-1.5" style={{ color:'#2C1E15' }}>
//                             <Icon size={12} style={{ color: brand.terra }}/>{value}
//                           </p>
//                         </div>
//                       ))}
//                       {b.note && (
//                         <div className="col-span-full mt-1 text-xs text-gray-500 italic">
//                           Ghi chú: "{b.note}"
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}

//             <Pagination
//               currentPage={page}
//               totalPages={totalPages}
//               setCurrentPage={setPage}
//               totalItems={filtered.length}
//               indexOfFirstItem={(page - 1) * PAGE_SIZE}
//               indexOfLastItem={page * PAGE_SIZE}
//               itemName="đơn đặt"
//             />
//           </div>

//           {/* ── Slide-in detail modal ── */}
//           {detailBooking && (
//             <ModalPortal
//               className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-sm flex justify-end animate-fade-in text-left text-sm"
//               onBackdropClick={() => setDetailId(null)}
//             >
//               <div
//                 className="ml-auto h-full w-full max-w-[420px] bg-white shadow-2xl border-l border-gray-200 overflow-hidden animate-slide-in-from-right flex flex-col"
            
//                 onClick={(event) => event.stopPropagation()}
//               >
//               {/* Panel header */}
//               <div className="relative px-5 py-4 pl-16" style={{ background: brand.dark }}>
//                 <button
//                   onClick={()=>setDetailId(null)}
//                   className="absolute left-4 top-4 w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-white/15 shrink-0"
//                   style={{ color:'#fff', border:'1px solid rgba(255,255,255,0.18)', background:'rgba(255,255,255,0.08)' }}
//                   aria-label="Đóng chi tiết đơn"
//                 >
//                   <HiOutlineX size={18}/>
//                 </button>
//                 <div>
//                   <p className="text-xs font-bold uppercase tracking-[0.18em] mb-1 text-white/75">Chi tiết đơn đặt</p>
//                   <h3 className="text-2xl text-white">{detailBooking.id}</h3>
//                   <p className="text-base font-bold mt-1 text-white">{detailBooking.homestay}</p>
//                 </div>
//               </div>

//               {/* Status strip */}
//               <div className="px-5 py-2.5 flex items-center justify-between gap-2" style={{ background:'#FDFCF9', borderBottom:'1px solid #EDE9E1' }}>
//                 <StatusBadge status={detailBooking.status}/>
//                 <PaymentBadge status={detailBooking.paymentStatus}/>
//               </div>

//               <div className="p-5 space-y-4 flex-1 min-h-0 overflow-y-auto">

//                 {/* Date & meta */}
//                 <div className="rounded-xl p-3 space-y-2" style={{ background: brand.cream, border:'1px solid #EDE9E1' }}>
//                   {[
//                     ['Check-in', detailBooking.checkin, HiOutlineCalendar],
//                     ['Check-out', detailBooking.checkout, HiOutlineCalendar],
//                     ['Số khách', `${detailBooking.guests} khách`, HiOutlineUsers],
//                     ['Tạo lúc', detailBooking.createdAt, HiOutlineClock],
//                   ].map(([lbl, val, Icon]) => (
//                     <div key={lbl} className="flex items-center justify-between text-xs">
//                       <span className="text-gray-500 font-medium flex items-center gap-1.5"><Icon size={12} style={{ color: brand.terra }}/>{lbl}</span>
//                       <span className="font-bold" style={{ color:'#2C1E15' }}>{val}</span>
//                     </div>
//                   ))}
//                   {detailBooking.note && (
//                     <div className="pt-2 border-t border-[#EDE9E1]">
//                       <p className="text-[11px] text-gray-800 uppercase tracking-wide mb-0.5">Ghi chú</p>
//                       <p className="text-xs italic text-gray-800">"{detailBooking.note}"</p>
//                     </div>
//                   )}
//                 </div>
//                 {/* Services breakdown */}
//                 {detailBooking.services.length > 0 && (
//                   <div>
//                     <p className="text-[11px] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color:'#9CA3AF' }}>
//                       <HiOutlineCube size={13}/> Dịch vụ đi kèm
//                     </p>
//                     <div className="space-y-2">
//                       {detailBooking.services.map((svc, i) => (
//                         <div key={i} className="rounded-xl border border-gray-200 px-4 py-2.5 bg-white">
//                           <div className="flex justify-between items-start">
//                             <div>
//                               <p className="text-xs font-bold" style={{ color:'#2C1E15' }}>{svc.name}</p>
//                               <p className="text-[11px] text-gray-400 mt-0.5">Giá / đơn vị: {fmt(svc.unitPrice)}</p>
//                             </div>
//                             <div className="text-right">
//                               <p className="text-[10px] text-gray-400">x{svc.qty}</p>
//                               <p className="text-xs font-bold" style={{ color: brand.terra }}>{fmt(svc.total)}</p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//                 {/* Price breakdown */}
//                 <div>
//                   <p className="text-[11px] font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color:'#9CA3AF' }}>
//                     <HiOutlineCash size={13}/> Bảng giá
//                   </p>
//                   <div className="rounded-xl overflow-hidden border border-gray-200">
//                     <div className="divide-y divide-gray-100">
//                       <PriceRow label="Tiền phòng" value={fmt(detailBooking.roomPrice)} />
//                       {detailBooking.services.length > 0 && (
//                         <PriceRow label="Dịch vụ thêm" value={fmt(detailBooking.services.reduce((s,sv)=>s+sv.total,0))} />
//                       )}
//                       {detailBooking.discount > 0 && (
//                         <PriceRow label="Giảm giá" value={`- ${fmt(detailBooking.discount)}`} accent />
//                       )}
//                     </div>
//                     <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: brand.dark }}>
//                       <span className="text-xs font-bold text-white">Tổng cộng</span>
//                       <span className="font-bold text-sm text-white">{fmt(detailBooking.totalPrice)}</span>
//                     </div>
//                   </div>
//                 </div>

                

//                 {/* Payment info */}
//                 <div className="rounded-xl border p-3 space-y-2" style={{ background:'#FDFCF9', borderColor:'#EDE9E1' }}>
//                   <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color:'#9CA3AF' }}>Thanh toán</p>
//                   <div className="flex items-center justify-between text-xs">
//                     <span className="text-gray-500">Phương thức</span>
//                     <span className="font-bold" style={{ color:'#2C1E15' }}>{detailBooking.paymentMethod}</span>
//                   </div>
//                   <div className="flex items-center justify-between text-xs">
//                     <span className="text-gray-500">Trạng thái</span>
//                     <PaymentBadge status={detailBooking.paymentStatus}/>
//                   </div>
//                 </div>

//                 {/* Action buttons */}
//                 <div className="space-y-2 pt-1">
//                   {canConfirmPayment(detailBooking) && (
//                     <button onClick={()=>confirmPayment(detailBooking.id)} className="w-full h-10 rounded-xl text-xs font-semibold text-white shadow transition hover:opacity-90 active:scale-95 inline-flex items-center justify-center gap-1.5" style={{ background:'#166534' }}>
//                       <HiOutlineCash size={14}/> Đã thanh toán tại chỗ
//                     </button>
//                   )}
//                   {detailBooking.status === 'Chờ duyệt' && (
//                     <div className="grid grid-cols-2 gap-2">
//                       <button onClick={()=>updateStatus(detailBooking.id,'Đã xác nhận')} className="h-10 rounded-xl text-xs font-semibold text-white shadow transition hover:opacity-90 active:scale-95 inline-flex items-center justify-center gap-1.5" style={{ background: brand.forest }}>
//                         <HiOutlineCheckCircle size={14}/> Xác nhận
//                       </button>
//                       <button onClick={()=>updateStatus(detailBooking.id,'Đã hủy')} className="h-10 rounded-xl text-xs font-semibold border transition hover:bg-red-50 active:scale-95 inline-flex items-center justify-center gap-1.5" style={{ color:'#991B1B', borderColor:'#FECACA', background:'#FEF2F2' }}>
//                         <HiOutlineXCircle size={14}/> Hủy đơn
//                       </button>
//                     </div>
//                   )}
//                   {detailBooking.status === 'Đã xác nhận' && (
//                     <button onClick={()=>updateStatus(detailBooking.id,'Hoàn thành')} className="w-full h-10 rounded-xl text-xs font-semibold text-white shadow transition hover:opacity-90 active:scale-95 inline-flex items-center justify-center gap-1.5" style={{ background: brand.forest }}>
//                       <HiOutlineStar size={14}/> Đánh dấu hoàn thành
//                     </button>
//                   )}
//                 </div>
//               </div>
//               </div>
//             </ModalPortal>
//           )}
//         </div>
//       </div>
//     </HostLayout>
//   );
// }

// function PriceRow({ label, value, accent }) {
//   return (
//     <div className="px-4 py-2 flex items-center justify-between bg-white">
//       <span className="text-xs text-gray-500 font-medium">{label}</span>
//       <span className={`text-xs font-bold ${accent ? 'text-emerald-600' : ''}`} style={!accent ? { color:'#2C1E15' } : undefined}>
//         {value}
//       </span>
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  HiOutlineHome,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineBan,
  HiOutlineX,
  HiOutlineCash,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineCube,

  HiOutlineStar,
} from 'react-icons/hi';
import HostLayout from '../../layouts/HostLayout';
import ModalPortal from '../../components/common/ModalPortal';
import Pagination from '../../components/common/Pagination';
import ManagementBackButton from '../../components/common/ManagementBackButton';
import ManagementHeaderRow from '../../components/common/ManagementHeaderRow';
import ManagementToolbar from '../../components/common/ManagementToolbar';
import { isWithinDateFilter } from '../../utils/dateFilter';
import { confirmHostBookingPayment, getHostBookings, updateHostBookingStatus } from '../../services/bookingService';

const MOCK_BOOKINGS = [];

const STATUS_CONFIG = {
  'Chờ duyệt': { bg: '#FEF9EE', text: '#B45309', border: '#FCD34D', icon: HiOutlineClock },
  'Đã xác nhận': { bg: '#EFF6FF', text: '#1D4ED8', border: '#93C5FD', icon: HiOutlineCheckCircle },
  'Hoàn thành': { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7', icon: HiOutlineCheckCircle },
  'Đã hủy': { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', icon: HiOutlineXCircle },
  'Bị chặn': { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB', icon: HiOutlineBan },
};

const PAYMENT_STATUS_CONFIG = {
  'Đã thanh toán': { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7' },
  'Chờ thanh toán': { bg: '#FEF9EE', text: '#B45309', border: '#FCD34D' },
  'Hoàn tiền': { bg: '#EFF6FF', text: '#1D4ED8', border: '#93C5FD' },
};

const PAGE_SIZE = 5;

function fmt(n) { return new Intl.NumberFormat('vi-VN').format(Number(n || 0)) + ' đ'; }

function formatDate(value) {
  if (!value) return '';
  return new Date(value + 'T00:00:00').toLocaleDateString('vi-VN');
}

function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function isPastCheckInDate(value) {
  if (!value) return false;
  const checkIn = new Date(value + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkIn < today;
}

function mapHostStatus(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'CONFIRMED') return 'Đã xác nhận';
  if (normalized === 'COMPLETED') return 'Hoàn thành';
  if (['CANCELLED', 'EXPIRED', 'NO_SHOW'].includes(normalized)) return 'Đã hủy';
  return 'Chờ duyệt';
}

function mapPaymentStatus(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'PAID') return 'Đã thanh toán';
  if (['REFUNDED', 'FAILED'].includes(normalized)) return 'Hoàn tiền';
  return 'Chờ thanh toán';
}

function mapPaymentMethod(method) {
  const normalized = String(method || '').toUpperCase();
  if (normalized === 'VNPAY') return 'VNPay';
  if (normalized === 'PAY_AT_PROPERTY') return 'Thanh toán tại chỗ';
  return method || 'Chưa chọn';
}

function toBackendStatus(label) {
  if (label === 'Đã xác nhận') return 'CONFIRMED';
  if (label === 'Hoàn thành') return 'COMPLETED';
  if (label === 'Đã hủy') return 'CANCELLED';
  return 'PAYMENT_PENDING';
}

function getDisplayHostStatus(apiBooking) {
  const bookingStatus = String(apiBooking.bookingStatus || '').toUpperCase();
  if (['CANCELLED', 'EXPIRED', 'NO_SHOW'].includes(bookingStatus)) return 'Đã hủy';
  if (String(apiBooking.paymentStatus || '').toUpperCase() === 'PAID') {
    return isPastCheckInDate(apiBooking.checkInDate) ? 'Hoàn thành' : 'Đã xác nhận';
  }
  return mapHostStatus(apiBooking.bookingStatus);
}

function canConfirmPayment(booking) {
  return booking?.paymentMethod === 'Thanh toán tại chỗ' && booking?.paymentStatus === 'Chờ thanh toán' && ['Đã xác nhận', 'Hoàn thành'].includes(booking?.status);
}

function mapHostBooking(apiBooking) {
  const services = (apiBooking.services || []).map((service) => ({
    name: service.serviceName,
    unitPrice: Number(service.unitPrice || 0),
    qty: Number(service.quantity || 1),
    total: Number(service.totalPrice || 0),
  }));

  return {
    id: apiBooking.bookingCode || ('#' + apiBooking.bookingId),
    bookingId: apiBooking.bookingId,
    homestay: apiBooking.homestayName || 'Homestay',
    homestayId: apiBooking.homestayCode || ('HMS-' + apiBooking.homeId),
    checkin: formatDate(apiBooking.checkInDate),
    checkout: formatDate(apiBooking.checkOutDate),
    guests: Number(apiBooking.numberOfGuest || 1),
    status: getDisplayHostStatus(apiBooking),
    paymentMethod: mapPaymentMethod(apiBooking.paymentMethod),
    paymentStatus: mapPaymentStatus(apiBooking.paymentStatus),
    createdAt: formatDateTime(apiBooking.createdAt),
    note: apiBooking.note || '',
    roomPrice: Number(apiBooking.roomTotal || 0),
    discount: Number(apiBooking.discountAmount || 0),
    totalPrice: Number(apiBooking.totalPrice || 0),
    services,
  };
}

// ─── Shared UI ─────────────────────────────────────────────────────────────
const brand = { dark:'#1C2B2B', forest:'#2C3E2B', terra:'#8B4A2F', cream:'#F4F1EA', warm:'#6E473B' };

const tableColumns = '44px minmax(180px, 1.1fr) 140px minmax(125px, .7fr) 175px 160px minmax(300px, 1fr)';

function StatusBadge({ status, small }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Chờ duyệt'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 font-black border rounded-full ${small ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
      <Icon size={small ? 10 : 12} />{status}
    </span>
  );
}

function PaymentBadge({ status }) {
  const cfg = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG['Chờ thanh toán'];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-black border rounded-full px-2.5 py-0.5"
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
      {status}
    </span>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function HostBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [filterPayment, setFilterPayment] = useState('Tất cả');
  const [filterHomestay, setFilterHomestay] = useState('Tất cả');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadBookings() {
      try {
        setLoading(true);
        setLoadError('');
        const data = await getHostBookings();
        if (isMounted) setBookings(data.map(mapHostBooking));
      } catch (error) {
        if (isMounted) setLoadError(error.message || 'Không tải được danh sách đơn đặt phòng');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBookings();
    return () => {
      isMounted = false;
    };
  }, []);

  const homestayOptions = ['Tất cả', ...Array.from(new Set(bookings.map(b => b.homestay)))];

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return bookings.filter(b =>
      (!kw || b.id.toLowerCase().includes(kw) || b.homestay.toLowerCase().includes(kw))
      && (filterStatus === 'Tất cả' || b.status === filterStatus)
      && (filterPayment === 'Tất cả' || b.paymentStatus === filterPayment)
      && (filterHomestay === 'Tất cả' || b.homestay === filterHomestay)
      && isWithinDateFilter(b.createdAt, dateFilter, dateFrom, dateTo)
    );
  }, [bookings, search, filterStatus, filterPayment, filterHomestay, dateFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const detailBooking = bookings.find(b => b.id === detailId) || null;

  const updateStatus = async (id, status) => {
    const target = bookings.find((booking) => booking.id === id || booking.bookingId === id);
    if (!target) return;

    try {
      const updated = await updateHostBookingStatus(target.bookingId, toBackendStatus(status));
      setBookings((current) => current.map((booking) => booking.bookingId === updated.bookingId ? mapHostBooking(updated) : booking));
      if (detailBooking?.id === id) setDetailId(null);
    } catch (error) {
      alert(error.message || 'Không cập nhật được trạng thái đơn đặt phòng');
    }
  };

  const confirmPayment = async (id) => {
    const target = bookings.find((booking) => booking.id === id || booking.bookingId === id);
    if (!target || !canConfirmPayment(target)) return;
    if (!window.confirm('Xác nhận khách đã thanh toán tại chỗ cho đơn này?')) return;

    try {
      const updated = await confirmHostBookingPayment(target.bookingId);
      setBookings((current) => current.map((booking) => booking.bookingId === updated.bookingId ? mapHostBooking(updated) : booking));
      if (detailBooking?.id === id) setDetailId(null);
    } catch (error) {
      alert(error.message || 'Không xác nhận được thanh toán');
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'Chờ duyệt').length,
    done: bookings.filter(b => b.status === 'Hoàn thành').length,
    revenue: bookings.filter(b => b.paymentStatus === 'Đã thanh toán').reduce((s, b) => s + b.totalPrice, 0),
  };

  return (
    <HostLayout>
      <div className="animate-fade-in text-sm text-[#1F2937]">
        <ManagementHeaderRow backButton={<ManagementBackButton onClick={() => navigate('/host')} />}>
          {/* ── Page header ── */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-5 mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] mb-1.5" style={{ color: '#B86A3C' }}>Bảng điều khiển</p>
            <h2 className="font-classic text-3xl md:text-[34px] font-black leading-none tracking-tight" style={{ color: '#2C1E15' }}>Quản lý đơn đặt phòng</h2>
            <p className="text-sm font-medium text-[#64748B] mt-1.5">
              Theo dõi và cập nhật trạng thái tất cả các đơn đặt homestay của bạn.
              <span className="ml-2 font-black" style={{ color: '#6E473B' }}>{bookings.length} đơn tổng • {stats.pending} chờ duyệt</span>
            </p>
          </div>
          {/* Stats chips */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Chờ duyệt', value: stats.pending, color: '#B45309', bg: '#FEF9EE', border: '#FCD34D' },
              { label: 'Hoàn thành', value: stats.done, color: '#065F46', bg: '#ECFDF5', border: '#6EE7B7' },
              { label: 'Doanh thu', value: fmt(stats.revenue), color: brand.forest, bg: '#F0FDF4', border: '#86EFAC' },
            ].map(s => (
              <div key={s.label} className="rounded-xl px-4 py-2.5 border text-center min-w-[100px]" style={{ background: s.bg, borderColor: s.border }}>
                <p className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: '#94A3B8' }}>{s.label}</p>
                <p className="font-black text-lg" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
        </ManagementHeaderRow>

        <ManagementToolbar
          className="mb-4"
          filters={[
            {
              label: 'Trạng thái',
              value: filterStatus,
              onChange: (value) => { setFilterStatus(value); setPage(1); },
              options: [
                { value: 'Tất cả', label: 'Tất cả' },
                { value: 'Chờ duyệt', label: 'Chờ duyệt' },
                { value: 'Đã xác nhận', label: 'Đã xác nhận' },
                { value: 'Hoàn thành', label: 'Hoàn thành' },
                { value: 'Đã hủy', label: 'Đã hủy' },
              ],
            },
            {
              label: 'Thanh toán',
              value: filterPayment,
              onChange: (value) => { setFilterPayment(value); setPage(1); },
              options: [
                { value: 'Tất cả', label: 'Tất cả' },
                { value: 'Đã thanh toán', label: 'Đã thanh toán' },
                { value: 'Chờ thanh toán', label: 'Chờ thanh toán' },
                { value: 'Hoàn tiền', label: 'Hoàn tiền' },
              ],
            },
            {
              label: 'Homestay',
              value: filterHomestay,
              onChange: (value) => { setFilterHomestay(value); setPage(1); },
              options: homestayOptions,
            },
          ]}
          dateFilter={dateFilter}
          onDateFilterChange={(value) => { setDateFilter(value); setPage(1); }}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={(value) => { setDateFrom(value); setPage(1); }}
          onDateToChange={(value) => { setDateTo(value); setPage(1); }}
          searchValue={search}
          onSearchChange={(value) => { setSearch(value); setPage(1); }}
          searchPlaceholder="Tìm mã đơn, tên homestay..."
          onReset={() => {
            setSearch('');
            setFilterStatus('Tất cả');
            setFilterPayment('Tất cả');
            setFilterHomestay('Tất cả');
            setDateFilter('all');
            setDateFrom('');
            setDateTo('');
            setPage(1);
          }}
        />

        {/* ── Main area: table + side panel ── */}
        {loadError && <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{loadError}</div>}
        {loading && <div className="mb-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-gray-400 border border-gray-200">Đang tải đơn đặt phòng...</div>}

        <div className="flex gap-4" style={{ alignItems: 'flex-start' }}>

          {/* Table */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: tableColumns, background:'#F9F8F6' }}>
              {['', 'Mã đơn', 'Trạng thái', 'Tổng tiền', 'Thời gian tạo', 'Thanh toán', 'Thao tác'].map((h, i) => (
                <div key={i} className="px-3 py-3.5 text-sm font-black uppercase tracking-wide text-[#475569]">{h}</div>
              ))}
            </div>

            {paginated.length === 0 && (
              <div className="py-16 text-center">
                <HiOutlineClipboardList size={36} className="mx-auto mb-3 opacity-30 text-gray-400"/>
                <p className="text-sm font-semibold text-[#94A3B8] italic">Không có đơn nào phù hợp.</p>
              </div>
            )}

            {paginated.map((b) => {
              const expanded = expandedId === b.id;
              const isDetail = detailId === b.id;
              return (
                <div key={b.id} className={`border-b border-gray-100 last:border-b-0 transition-colors ${isDetail ? 'bg-[#F4F1EA]/60' : 'hover:bg-gray-50/50'}`}>
                  {/* Main row */}
                  <div className="grid items-center" style={{ gridTemplateColumns: tableColumns }}>
                    {/* Expand toggle */}
                    <div className="px-3 py-3.5 flex items-center justify-center">
                      <button onClick={()=>setExpandedId(expanded ? null : b.id)} className="w-6 h-6 rounded-lg flex items-center justify-center transition hover:bg-gray-100" style={{ color:'#9CA3AF' }}>
                        {expanded ? <HiOutlineChevronDown size={14}/> : <HiOutlineChevronRight size={14}/>}
                      </button>
                    </div>

                    {/* ID */}
                    <div className="px-3 py-3.5 min-w-0">
                      <p className="font-black text-[15px] leading-snug break-all" style={{ color: '#8B4A2F' }}>{b.id}</p>
                      <p className="text-xs font-semibold text-[#94A3B8] mt-1 truncate">{b.homestay}</p>
                    </div>

                    {/* Status */}
                    <div className="px-2 py-3.5">
                      <StatusBadge status={b.status}/>
                    </div>

                    {/* Total */}
                    <div className="px-2 py-3.5">
                      <span className="font-black text-[15px]" style={{ color:'#2C1E15' }}>{fmt(b.totalPrice)}</span>
                    </div>

                    {/* Created */}
                    <div className="px-2 py-3.5">
                      <p className="text-sm leading-snug text-[#64748B] font-semibold whitespace-normal">{b.createdAt}</p>
                    </div>

                    {/* Payment */}
                    <div className="px-2 py-3.5">
                      <PaymentBadge status={b.paymentStatus}/>
                      <p className="text-xs font-semibold text-[#94A3B8] mt-1">{b.paymentMethod}</p>
                    </div>

                    {/* Actions */}
                    <div className="px-3 py-3.5 flex items-center gap-1.5 justify-end flex-wrap xl:flex-nowrap">
                      <button
                        onClick={()=>setDetailId(b.id)}
                        className="h-9 px-3.5 rounded-lg text-sm font-black inline-flex items-center gap-1.5 transition border"
                        style={isDetail
                          ? { background: brand.forest, color:'#fff', borderColor: brand.forest }
                          : { background:'#F4F1EA', color: brand.warm, borderColor:'#E5DDD4' }
                        }
                      >
                        <HiOutlineClipboardList size={13}/>Chi tiết
                      </button>
                      {canConfirmPayment(b) && (
                        <button onClick={()=>confirmPayment(b.id)} className="h-9 px-3.5 rounded-lg text-sm font-black inline-flex items-center gap-1 border transition" style={{ background:'#F0FDF4', color:'#166534', borderColor:'#86EFAC' }}>
                          <HiOutlineCash size={13}/> Đã thanh toán
                        </button>
                      )}
                      {b.status === 'Chờ duyệt' && (
                        <>
                          <button onClick={()=>updateStatus(b.id,'Đã xác nhận')} className="h-9 px-3.5 rounded-lg text-sm font-black inline-flex items-center gap-1 border transition" style={{ background:'#ECFDF5', color:'#065F46', borderColor:'#6EE7B7' }}>
                            Duyệt
                          </button>
                          <button onClick={()=>updateStatus(b.id,'Đã hủy')} className="h-9 px-3 rounded-lg text-sm font-black inline-flex items-center border transition" style={{ background:'#FEF2F2', color:'#991B1B', borderColor:'#FECACA' }}>
                            Hủy
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded mini-detail */}
                  {expanded && (
                    <div className="mx-4 mb-3 rounded-xl border p-4 grid grid-cols-2 md:grid-cols-4 gap-3" style={{ background:'#FDFCF9', borderColor:'#EDE9E1' }}>
                      {[
                        { label:'Check-in', value: b.checkin, icon: HiOutlineCalendar },
                        { label:'Check-out', value: b.checkout, icon: HiOutlineCalendar },
                        { label:'Số khách', value: `${b.guests} khách`, icon: HiOutlineUsers },
                        { label:'Homestay', value: b.homestay, icon: HiOutlineHome },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label}>
                          <p className="text-xs font-black uppercase tracking-wide text-[#94A3B8] mb-1">{label}</p>
                          <p className="text-sm font-black flex items-center gap-1.5" style={{ color:'#2C1E15' }}>
                            <Icon size={12} style={{ color: brand.terra }}/>{value}
                          </p>
                        </div>
                      ))}
                      {b.note && (
                        <div className="col-span-full mt-1 text-sm font-medium text-[#64748B] italic">
                          Ghi chú: "{b.note}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              setCurrentPage={setPage}
              totalItems={filtered.length}
              indexOfFirstItem={(page - 1) * PAGE_SIZE}
              indexOfLastItem={page * PAGE_SIZE}
              itemName="đơn đặt"
            />
          </div>

          {/* ── Slide-in detail modal ── */}
          {detailBooking && (
            <ModalPortal
              className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-sm flex justify-end animate-fade-in text-left text-sm"
              onBackdropClick={() => setDetailId(null)}
            >
              <div
                className="ml-auto h-full w-full max-w-[420px] bg-white shadow-2xl border-l border-gray-200 overflow-hidden animate-slide-in-from-right flex flex-col"
            
                onClick={(event) => event.stopPropagation()}
              >
              {/* Panel header */}
              <div className="relative px-5 py-4 pl-16" style={{ background: brand.dark }}>
                <button
                  onClick={()=>setDetailId(null)}
                  className="absolute left-4 top-4 w-9 h-9 rounded-full flex items-center justify-center transition hover:bg-white/15 shrink-0"
                  style={{ color:'#fff', border:'1px solid rgba(255,255,255,0.18)', background:'rgba(255,255,255,0.08)' }}
                  aria-label="Đóng chi tiết đơn"
                >
                  <HiOutlineX size={18}/>
                </button>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] mb-1 text-white/75">Chi tiết đơn đặt</p>
                  <h3 className="font-classic text-2xl font-black text-white">{detailBooking.id}</h3>
                  <p className="text-base font-black mt-1 text-white">{detailBooking.homestay}</p>
                </div>
              </div>

              {/* Status strip */}
              <div className="px-5 py-2.5 flex items-center justify-between gap-2" style={{ background:'#FDFCF9', borderBottom:'1px solid #EDE9E1' }}>
                <StatusBadge status={detailBooking.status}/>
                <PaymentBadge status={detailBooking.paymentStatus}/>
              </div>

              <div className="p-5 space-y-4 flex-1 min-h-0 overflow-y-auto">

                {/* Date & meta */}
                <div className="rounded-xl p-3 space-y-2" style={{ background: brand.cream, border:'1px solid #EDE9E1' }}>
                  {[
                    ['Check-in', detailBooking.checkin, HiOutlineCalendar],
                    ['Check-out', detailBooking.checkout, HiOutlineCalendar],
                    ['Số khách', `${detailBooking.guests} khách`, HiOutlineUsers],
                    ['Tạo lúc', detailBooking.createdAt, HiOutlineClock],
                  ].map(([lbl, val, Icon]) => (
                    <div key={lbl} className="flex items-center justify-between text-xs">
                      <span className="text-[#64748B] font-semibold flex items-center gap-1.5"><Icon size={12} style={{ color: brand.terra }}/>{lbl}</span>
                      <span className="font-black" style={{ color:'#2C1E15' }}>{val}</span>
                    </div>
                  ))}
                  {detailBooking.note && (
                    <div className="pt-2 border-t border-[#EDE9E1]">
                      <p className="text-xs font-black text-[#475569] uppercase tracking-wide mb-0.5">Ghi chú</p>
                      <p className="text-sm font-medium italic text-[#334155]">"{detailBooking.note}"</p>
                    </div>
                  )}
                </div>
                {/* Services breakdown */}
                {detailBooking.services.length > 0 && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color:'#64748B' }}>
                      <HiOutlineCube size={13}/> Dịch vụ đi kèm
                    </p>
                    <div className="space-y-2">
                      {detailBooking.services.map((svc, i) => (
                        <div key={i} className="rounded-xl border border-gray-200 px-4 py-2.5 bg-white">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-black" style={{ color:'#2C1E15' }}>{svc.name}</p>
                              <p className="text-xs font-semibold text-[#94A3B8] mt-1">Giá / đơn vị: {fmt(svc.unitPrice)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-semibold text-[#94A3B8]">x{svc.qty}</p>
                              <p className="text-sm font-black" style={{ color: brand.terra }}>{fmt(svc.total)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Price breakdown */}
                <div>
                  <p className="text-xs font-black uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color:'#64748B' }}>
                    <HiOutlineCash size={13}/> Bảng giá
                  </p>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <div className="divide-y divide-gray-100">
                      <PriceRow label="Tiền phòng" value={fmt(detailBooking.roomPrice)} />
                      {detailBooking.services.length > 0 && (
                        <PriceRow label="Dịch vụ thêm" value={fmt(detailBooking.services.reduce((s,sv)=>s+sv.total,0))} />
                      )}
                      {detailBooking.discount > 0 && (
                        <PriceRow label="Giảm giá" value={`- ${fmt(detailBooking.discount)}`} accent />
                      )}
                    </div>
                    <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: brand.dark }}>
                      <span className="text-sm font-black text-white">Tổng cộng</span>
                      <span className="font-black text-base text-white">{fmt(detailBooking.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                

                {/* Payment info */}
                <div className="rounded-xl border p-3 space-y-2" style={{ background:'#FDFCF9', borderColor:'#EDE9E1' }}>
                  <p className="text-xs font-black uppercase tracking-wide" style={{ color:'#64748B' }}>Thanh toán</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#64748B]">Phương thức</span>
                    <span className="font-black" style={{ color:'#2C1E15' }}>{detailBooking.paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Trạng thái</span>
                    <PaymentBadge status={detailBooking.paymentStatus}/>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-2 pt-1">
                  {canConfirmPayment(detailBooking) && (
                    <button onClick={()=>confirmPayment(detailBooking.id)} className="w-full h-10 rounded-xl text-sm font-black text-white shadow transition hover:opacity-90 active:scale-95 inline-flex items-center justify-center gap-1.5" style={{ background:'#166534' }}>
                      <HiOutlineCash size={14}/> Đã thanh toán tại chỗ
                    </button>
                  )}
                  {detailBooking.status === 'Chờ duyệt' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={()=>updateStatus(detailBooking.id,'Đã xác nhận')} className="h-10 rounded-xl text-sm font-black text-white shadow transition hover:opacity-90 active:scale-95 inline-flex items-center justify-center gap-1.5" style={{ background: brand.forest }}>
                        <HiOutlineCheckCircle size={14}/> Xác nhận
                      </button>
                      <button onClick={()=>updateStatus(detailBooking.id,'Đã hủy')} className="h-10 rounded-xl text-sm font-black border transition hover:bg-red-50 active:scale-95 inline-flex items-center justify-center gap-1.5" style={{ color:'#991B1B', borderColor:'#FECACA', background:'#FEF2F2' }}>
                        <HiOutlineXCircle size={14}/> Hủy đơn
                      </button>
                    </div>
                  )}
                  {detailBooking.status === 'Đã xác nhận' && (
                    <button onClick={()=>updateStatus(detailBooking.id,'Hoàn thành')} className="w-full h-10 rounded-xl text-sm font-black text-white shadow transition hover:opacity-90 active:scale-95 inline-flex items-center justify-center gap-1.5" style={{ background: brand.forest }}>
                      <HiOutlineStar size={14}/> Đánh dấu hoàn thành
                    </button>
                  )}
                </div>
              </div>
              </div>
            </ModalPortal>
          )}
        </div>
      </div>
    </HostLayout>
  );
}

function PriceRow({ label, value, accent }) {
  return (
    <div className="px-4 py-2 flex items-center justify-between bg-white">
      <span className="text-sm text-[#64748B] font-semibold">{label}</span>
      <span className={`text-sm font-black ${accent ? 'text-emerald-600' : ''}`} style={!accent ? { color:'#2C1E15' } : undefined}>
        {value}
      </span>
    </div>
  );
}















