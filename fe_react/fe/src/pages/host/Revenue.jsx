// import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   HiOutlineCash,
//   HiOutlineCalendar,
//   HiOutlineChartBar,
//   HiOutlineCheckCircle,
//   HiOutlineClock,
//   HiOutlineHome,
//   HiOutlineRefresh,
//   HiOutlineSearch,
//   HiOutlineX,
// } from 'react-icons/hi';
// import HostLayout from '../../layouts/HostLayout';
// import Pagination from '../../components/common/Pagination';
// import ManagementBackButton from '../../components/common/ManagementBackButton';
// import ManagementHeaderRow from '../../components/common/ManagementHeaderRow';
// import CalendarDateField from '../../components/common/CalendarDateField';
// import { getHostRevenue, getHostRevenueBookings, getHostMaintenanceHistory } from '../../services/hostRevenueService';
// import { getHostHomestays } from '../../services/hostHomestayService';
// import { formatCurrency, formatDate } from '../../utils/formatters';

// const now = new Date();
// const pad = (value) => String(value).padStart(2, '0');
// const asInputDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
// const today = asInputDate(now);
// const allFromDate = '1970-01-01';
// const startOfMonth = asInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
// const startOfYear = asInputDate(new Date(now.getFullYear(), 0, 1));
// const daysAgo = (days) => {
//   const date = new Date(now);
//   date.setDate(date.getDate() - days);
//   return asInputDate(date);
// };

// const defaultFilters = {
//   datePreset: 'ALL',
//   fromDate: allFromDate,
//   toDate: today,
//   homestayId: '',
//   homestaySearch: '',
// };

// const datePresets = [
//   { value: 'ALL', label: 'Táº¥t cáº£', fromDate: allFromDate, toDate: today },
//   { value: 'TODAY', label: 'HĂ´m nay', fromDate: today, toDate: today },
//   { value: 'THIS_MONTH', label: 'ThĂ¡ng nĂ y', fromDate: startOfMonth, toDate: today },
//   { value: 'LAST_30_DAYS', label: '30 ngĂ y', fromDate: daysAgo(29), toDate: today },
//   { value: 'LAST_90_DAYS', label: '90 ngĂ y', fromDate: daysAgo(89), toDate: today },
//   { value: 'THIS_YEAR', label: 'NÄƒm nay', fromDate: startOfYear, toDate: today },
//   { value: 'CUSTOM', label: 'TĂ¹y chá»‰nh ngĂ y' },
// ];


// const statusLabels = {
//   PENDING: 'ÄĂ£ Ä‘áº·t',
//   RECOGNIZED: 'ÄĂ£ ghi nháº­n',
//   PAID_OUT: 'ÄĂ£ ghi nháº­n',
//   CANCELLED: 'ÄĂ£ há»§y',
//   PAID: 'ÄĂ£ thanh toĂ¡n',
//   OVERDUE: 'QuĂ¡ háº¡n',
//   WAIVED: 'Miá»…n phĂ­',
// };

// const maintenanceStatusLabels = {
//   PENDING: 'ChÆ°a thanh toĂ¡n',
//   PAID: 'ÄĂ£ thanh toĂ¡n',
//   OVERDUE: 'QuĂ¡ háº¡n',
//   WAIVED: 'Miá»…n phĂ­',
//   CANCELLED: 'ÄĂ£ há»§y',
// };

// function money(value) {
//   return formatCurrency(value || 0);
// }

// function number(value) {
//   return Number(value || 0).toLocaleString('vi-VN');
// }

// function compactMoney(value) {
//   const amount = Number(value || 0);
//   if (!Number.isFinite(amount) || amount === 0) return '0 Ä‘';
//   if (amount >= 1000000000) return `${(amount / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tá»·`;
//   if (amount >= 1000000) return `${(amount / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
//   if (amount >= 1000) return `${(amount / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} nghĂ¬n`;
//   return `${amount.toLocaleString('vi-VN')} Ä‘`;
// }

// function chartNumber(value) {
//   const parsed = Number(value || 0);
//   return Number.isFinite(parsed) ? parsed : 0;
// }

// function deferLoad(task) {
//   const timer = window.setTimeout(() => { void task(); }, 0);
//   return () => window.clearTimeout(timer);
// }

// export default function Revenue() {
//   const navigate = useNavigate();
//   const [filters, setFilters] = useState(defaultFilters);
//   const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
//   const [summary, setSummary] = useState(null);
//   const [bookings, setBookings] = useState({ content: [], totalPages: 0, totalElements: 0 });
//   const [fees, setFees] = useState([]);
//   const [homestays, setHomestays] = useState([]);
//   const [homestaysLoading, setHomestaysLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const summaryParams = useMemo(() => ({
//     fromDate: appliedFilters.fromDate,
//     toDate: appliedFilters.toDate,
//     groupBy: 'day',
//     homestayId: appliedFilters.homestayId,
//   }), [appliedFilters.fromDate, appliedFilters.homestayId, appliedFilters.toDate]);

//   const bookingParams = useMemo(() => ({
//     fromDate: appliedFilters.fromDate,
//     toDate: appliedFilters.toDate,
//     homestayId: appliedFilters.homestayId,
//     page: page - 1,
//     size: 10,
//   }), [appliedFilters.fromDate, appliedFilters.homestayId, appliedFilters.toDate, page]);

//   const loadSummary = useCallback(async () => {
//     const data = await getHostRevenue(summaryParams);
//     setSummary(data || null);
//   }, [summaryParams]);

//   const loadBookings = useCallback(async () => {
//     const data = await getHostRevenueBookings(bookingParams);
//     setBookings(data || { content: [], totalPages: 0, totalElements: 0 });
//   }, [bookingParams]);

//   const loadFees =
//     useCallback(async () => {
//       const selectedYear =
//         appliedFilters.datePreset ===
//         'ALL'
//           ? now.getFullYear()
//           : Number(
//               (
//                 appliedFilters.fromDate ||
//                 today
//               ).slice(0, 4),
//             ) ||
//             now.getFullYear();

//       const data =
//         await getHostMaintenanceHistory({
//           year: selectedYear,
//           page: 0,
//           size: 6,
//         });

//       setFees(
//         Array.isArray(data)
//           ? data
//           : [],
//       );
//     }, [
//       appliedFilters.datePreset,
//       appliedFilters.fromDate,
//     ]);

//   const loadHomestayOptions = useCallback(async () => {
//     setHomestaysLoading(true);
//     try {
//       const data = await getHostHomestays();
//       setHomestays(Array.isArray(data) ? data : []);
//     } catch {
//       setHomestays([]);
//     } finally {
//       setHomestaysLoading(false);
//     }
//   }, []);

//   const loadAll = useCallback(async () => {
//     setLoading(true);
//     setError('');
//     try {
//       await Promise.all([loadSummary(), loadBookings(), loadFees()]);
//     } catch (err) {
//       setError(err.message || 'KhĂ´ng táº£i Ä‘Æ°á»£c dá»¯ liá»‡u doanh thu cá»§a chá»§ homestay.');
//     } finally {
//       setLoading(false);
//     }
//   }, [loadBookings, loadFees, loadSummary]);

//   useEffect(() => deferLoad(loadAll), [loadAll]);
//   useEffect(() => deferLoad(loadHomestayOptions), [loadHomestayOptions]);

//   const updateFilter = (field, value) => {
//     setFilters((current) => {
//       const nextFilters = {
//         ...current,
//         [field]: value,
//         datePreset:
//           ['fromDate', 'toDate'].includes(field)
//             ? 'CUSTOM'
//             : current.datePreset,
//       };

//       if (
//         field === 'fromDate' ||
//         field === 'toDate'
//       ) {
//         setPage(1);

//         setAppliedFilters(
//           (currentApplied) => ({
//             ...currentApplied,
//             fromDate:
//               nextFilters.fromDate,
//             toDate:
//               nextFilters.toDate,
//             datePreset: 'CUSTOM',
//           }),
//         );
//       }

//       return nextFilters;
//     });
//   };

// const selectPreset = (preset) => {
//   if (preset.value === 'CUSTOM') {
//     setFilters((current) => ({
//       ...current,
//       datePreset: 'CUSTOM',
//     }));

//     return;
//   }

//   const nextFilters = {
//     ...filters,
//     datePreset: preset.value,
//     fromDate:
//       preset.fromDate || filters.fromDate,
//     toDate:
//       preset.toDate || filters.toDate,
//   };

//   setPage(1);
//   setFilters(nextFilters);

//   setAppliedFilters((current) => ({
//     ...current,
//     datePreset: nextFilters.datePreset,
//     fromDate: nextFilters.fromDate,
//     toDate: nextFilters.toDate,
//   }));
// };

//   const applyFilters = () => {
//     const typedHomestay = String(
//       filters.homestaySearch || '',
//     )
//       .trim()
//       .toLowerCase();

//     const matchedHomestay =
//       filters.homestayId
//         ? null
//         : homestays.find((item) => {
//             const haystack = [
//               item.id,
//               item.homeId,
//               item.name,
//               item.city,
//               item.province,
//             ].map((field) =>
//               String(field || '')
//                 .toLowerCase(),
//             );

//             return (
//               haystack.some(
//                 (field) =>
//                   field === typedHomestay,
//               ) ||
//               (
//                 typedHomestay &&
//                 haystack.some(
//                   (field) =>
//                     field.includes(
//                       typedHomestay,
//                     ),
//                 )
//               )
//             );
//           });

//     const resolvedHomestayId =
//       filters.homestayId ||
//       matchedHomestay?.homeId ||
//       matchedHomestay?.id ||
//       '';

//     const nextSearch =
//       matchedHomestay
//         ? `${
//             matchedHomestay.id ??
//             matchedHomestay.homeId
//           } Â· ${matchedHomestay.name}`
//         : filters.homestaySearch;

//     setPage(1);

//     setFilters((current) => ({
//       ...current,
//       homestayId:
//         resolvedHomestayId,
//       homestaySearch: nextSearch,
//     }));

//     setAppliedFilters(
//       (current) => ({
//         ...current,
//         homestayId:
//           resolvedHomestayId,
//         homestaySearch: nextSearch,
//       }),
//     );
//   };


//   const revenueChange = useMemo(() => {
//     const rows = summary?.trends || [];
//     if (rows.length < 2) return null;
//     const first = chartNumber(rows[0].revenue);
//     const last = chartNumber(rows[rows.length - 1].revenue);
//     if (first <= 0) return last > 0 ? 100 : 0;
//     return Math.round(((last - first) / first) * 100);
//   }, [summary?.trends]);

//   const bookingsList = bookings.content || [];
//   const chartRows = summary?.trends || [];
//   const topHomestays = summary?.homestays || [];
//   const bestDay = chartRows.reduce((best, item) => (chartNumber(item.revenue) > chartNumber(best?.revenue) ? item : best), null);
//   const bestHomestay = topHomestays[0];

//   return (
//     <HostLayout>
//       <div className="mx-auto max-w-7xl space-y-5 text-left text-sm text-gray-700">
//         <ManagementHeaderRow backButton={<ManagementBackButton onClick={() => navigate('/host')} />}>
//           <section className="overflow-hidden rounded-3xl border border-[#223047]/10 bg-white shadow-sm">
//             <div className="grid gap-0 lg:grid-cols-[1.4fr_0.9fr]">
//               <div className="bg-[#202c3c] p-6 text-white lg:p-7">
//                 <p className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-200">Host Revenue</p>
//                 <h1 className="mt-2 font-serif text-4xl font-bold">Quáº£n lĂ½ doanh thu</h1>
//                 <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/72">
//                   Theo dĂµi doanh thu thá»±c nháº­n cá»§a chá»§ homestay, sá»‘ Ä‘Æ¡n Ä‘Ă£ thanh toĂ¡n, phĂ­ hoa há»“ng Ä‘Ă£ kháº¥u trá»« vĂ  hiá»‡u quáº£ tá»«ng homestay theo thá»i gian.
//                 </p>
//                 <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-black">
//                   <span className="rounded-full bg-white/10 px-3 py-1.5 text-white/80">{formatDate(appliedFilters.fromDate)} - {formatDate(appliedFilters.toDate)}</span>
//                   <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-emerald-100">{number(summary?.completedBookingCount)} Ä‘Æ¡n hoĂ n thĂ nh</span>
//                   <span className="rounded-full bg-amber-400/15 px-3 py-1.5 text-amber-100">{number(summary?.occupancyNights)} Ä‘Ăªm lÆ°u trĂº</span>
//                 </div>
//               </div>
//               <div className="bg-gradient-to-br from-[#6C483A] via-[#8A5A44] to-[#FF9800] p-6 text-white lg:p-7">
//                 <div className="rounded-3xl bg-white/12 p-5 shadow-inner shadow-black/10 backdrop-blur">
//                   <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Tá»•ng doanh thu thá»±c nháº­n</p>
//                   <p className="mt-2 text-4xl font-black tracking-tight">{money(summary?.totalHostRevenue)}</p>
//                   <p className="mt-1 text-xs font-bold text-emerald-100">{revenueChange === null ? 'So sĂ¡nh khi cĂ³ tá»« 2 má»‘c dá»¯ liá»‡u' : `${revenueChange >= 0 ? 'TÄƒng' : 'Giáº£m'} ${Math.abs(revenueChange)}% so vá»›i má»‘c Ä‘áº§u ká»³`}</p>
//                   <div className="mt-4 grid gap-3 sm:grid-cols-2">
//                     <MiniMetric label="Doanh thu phĂ²ng" value={money(summary?.roomRevenue)} />
//                     <MiniMetric label="Dá»‹ch vá»¥ thĂªm" value={money(summary?.serviceRevenue)} />
//                     <MiniMetric label="Hoa há»“ng Ä‘Ă£ trá»«" value={money(summary?.commissionDeducted)} />
//                     <MiniMetric label="Giáº£m giĂ¡" value={money(summary?.discountTotal)} />
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {summary?.canReceiveBooking === false && (
//               <div className="border-t border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600">
//                 TĂ i khoáº£n chá»§ homestay Ä‘ang quĂ¡ háº¡n phĂ­ duy trĂ¬. CĂ¡c homestay táº¡m thá»i khĂ´ng nháº­n booking má»›i.
//               </div>
//             )}
//           </section>
//         </ManagementHeaderRow>

//         {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-600">{error}</div>}
//         {loading && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 font-bold text-amber-700">Äang táº£i dá»¯ liá»‡u doanh thu...</div>}

//         <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
//           <div className="flex flex-wrap items-center gap-2">
//             <span className="mr-1 text-xs font-black uppercase text-gray-500">Khoáº£ng thá»i gian:</span>
//             {datePresets.map((preset) => (
//               <button
//                 key={preset.value}
//                 type="button"
//                 onClick={() => selectPreset(preset)}
//                 className={(filters.datePreset === preset.value ? 'bg-[#2C3E2B] text-white shadow-md shadow-[#2C3E2B]/20' : 'bg-[#F4F1EA] text-gray-600 hover:bg-white hover:shadow-sm') + ' rounded-xl px-4 py-2 text-xs font-black transition'}
//               >
//                 {preset.label}
//               </button>
//             ))}
//           </div>
//           <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_2fr_auto]">
//             <Field label="Tá»« ngĂ y" type="date" value={filters.fromDate} onChange={(value) => updateFilter('fromDate', value)} />
//             <Field label="Äáº¿n ngĂ y" type="date" value={filters.toDate} onChange={(value) => updateFilter('toDate', value)} />
//             <HomestayFilter
//               label="Lá»c homestay"
//               value={filters.homestayId}
//               searchValue={filters.homestaySearch}
//               options={homestays}
//               loading={homestaysLoading}
//               onSearchChange={(value) => setFilters((current) => ({ ...current, homestaySearch: value, homestayId: '' }))}
//              onSelect={(homestay) =>
//                 setFilters((current) => ({
//                   ...current,

//                   homestayId:
//                     homestay?.homeId ??
//                     homestay?.id ??
//                     '',

//                   homestaySearch:
//                     homestay
//                       ? `${
//                           homestay.id ??
//                           homestay.homeId
//                         } Â· ${homestay.name}`
//                       : '',
//                 }))
//               }
//             />
//             <div className="flex items-end gap-2">
//               <button onClick={applyFilters} className="h-11 rounded-xl bg-[#2C3E2B] px-5 text-xs font-black text-white shadow-md" type="button">Ăp dá»¥ng</button>
//               <button onClick={loadAll} className="h-11 rounded-xl bg-[#FF9800] px-4 text-xs font-black text-white shadow-md" type="button" title="LĂ m má»›i"><HiOutlineRefresh /></button>
//             </div>
//           </div>
//         </section>

//         <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
//           <Metric tone="emerald" icon={HiOutlineCash} title="Doanh thu thá»±c nháº­n" value={money(summary?.totalHostRevenue)} note="Sau khi trá»« hoa há»“ng Cozygo" />
//           <Metric tone="blue" icon={HiOutlineHome} title="Doanh thu phĂ²ng" value={money(summary?.roomRevenue)} note="Tiá»n phĂ²ng Ä‘Ă£ thanh toĂ¡n" />
//           <Metric tone="amber" icon={HiOutlineCash} title="Dá»‹ch vá»¥ thĂªm" value={money(summary?.serviceRevenue)} note="Dá»‹ch vá»¥ khĂ¡ch Ä‘Ă£ chá»n" />
//           <Metric tone="rose" icon={HiOutlineX} title="ÄĂ£ giáº£m giĂ¡" value={money(summary?.discountTotal)} note="Æ¯u Ä‘Ă£i Ă¡p dá»¥ng" />
//           <Metric tone="violet" icon={HiOutlineChartBar} title="GiĂ¡ trá»‹ TB/Ä‘Æ¡n" value={money(summary?.averageOrderValue)} note="Trung bĂ¬nh má»—i booking" />
//           <Metric tone="green" icon={HiOutlineCheckCircle} title="ÄÆ¡n ghi nháº­n" value={number(summary?.completedBookingCount)} note="ÄĂ£ Ä‘áº·t hoáº·c Ä‘Ă£ thanh toĂ¡n" />
//           <Metric tone="slate" icon={HiOutlineClock} title="ÄÆ¡n Ä‘Ă£ Ä‘áº·t" value={number(summary?.pendingBookingCount)} note="ÄĂ£ tĂ­nh vĂ o doanh thu dá»± kiáº¿n" />
//           <Metric tone="orange" icon={HiOutlineCalendar} title="ÄĂªm Ä‘Ă£ bĂ¡n" value={number(summary?.occupancyNights)} note="Tá»•ng sá»‘ Ä‘Ăªm lÆ°u trĂº" />
//         </div>

//         <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
//           <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
//             <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//               <div>
//                 <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#B66A3C]">Biá»ƒu Ä‘á»“ tá»•ng há»£p</p>
//                 <h2 className="mt-1 font-serif text-2xl font-bold text-[#2C1E15]">Doanh thu vĂ  sá»‘ Ä‘Æ¡n theo ngĂ y</h2>
//                 <p className="text-sm font-semibold text-gray-500">Cá»™t xanh lĂ  doanh thu thá»±c nháº­n, Ä‘Æ°á»ng vĂ ng thá»ƒ hiá»‡n sá»‘ Ä‘Æ¡n Ä‘Ă£ thanh toĂ¡n trong cĂ¹ng ká»³.</p>
//               </div>
//             </div>
//             <HostRevenueChart data={chartRows} />
//           </section>

//           <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
//             <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#B66A3C]">PhĂ¢n tĂ­ch nhanh</p>
//             <h2 className="mt-1 font-serif text-2xl font-bold text-[#2C1E15]">Äiá»ƒm Ä‘Ă¡ng chĂº Ă½</h2>
//             <div className="mt-4 space-y-3">
//               <Insight title="Ká»³ doanh thu cao nháº¥t" value={bestDay?.period || '--'} sub={bestDay ? money(bestDay.revenue) : 'ChÆ°a cĂ³ dá»¯ liá»‡u'} tone="bg-emerald-50 text-emerald-700" />
//               <Insight title="Homestay dáº«n Ä‘áº§u" value={bestHomestay?.homestayName || '--'} sub={bestHomestay ? money(bestHomestay.revenue || bestHomestay.hostReceivableAmount) : 'ChÆ°a cĂ³ dá»¯ liá»‡u'} tone="bg-amber-50 text-amber-700" />
//               <Insight title="ÄÆ¡n Ä‘Ă£ há»§y" value={number(summary?.cancelledBookingCount)} sub="KhĂ´ng cá»™ng vĂ o doanh thu" tone="bg-rose-50 text-rose-700" />
//               <Insight title="PhĂ­ duy trĂ¬ hiá»‡n táº¡i" value={money(summary?.currentMaintenanceFee)} sub={`Háº¡n: ${formatDate(summary?.maintenanceDueDate) || '--'}`} tone="bg-blue-50 text-blue-700" />
//             </div>
//           </section>
//         </div>

//         <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
//             <div>
//               <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B66A3C]">Hiá»‡u quáº£ homestay</p>
//               <h2 className="font-serif text-2xl font-bold text-[#2C1E15]">Doanh thu theo tá»«ng homestay</h2>
//             </div>
//           </div>
//           <div className="mt-4 grid gap-3 lg:grid-cols-3">
//             {topHomestays.length ? topHomestays.slice(0, 6).map((item) => <HomestayRevenueCard key={item.homeId} item={item} />) : <Empty text="ChÆ°a cĂ³ dá»¯ liá»‡u homestay trong khoáº£ng thá»i gian nĂ y." />}
//           </div>
//         </section>

//         <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
//           <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B66A3C]">Chi tiáº¿t booking</p>
//               <h2 className="font-serif text-2xl font-bold text-[#2C1E15]">Doanh thu booking</h2>
//             </div>
//             <p className="text-xs font-bold text-gray-400">Hiá»ƒn thá»‹ {bookingsList.length}/{bookings.totalElements || 0} Ä‘Æ¡n</p>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1060px] text-left text-xs">
//               <thead className="bg-gray-50 text-gray-500">
//                 <tr>{['MĂ£ booking', 'Homestay', 'KhĂ¡ch hĂ ng', 'NgĂ y lÆ°u trĂº', 'Tiá»n booking', 'Giáº£m', 'Hoa há»“ng', 'Host nháº­n', 'Tráº¡ng thĂ¡i'].map((head) => <th key={head} className="px-4 py-3 font-black uppercase">{head}</th>)}</tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {bookingsList.map((item) => (
//                   <tr key={item.commissionId || item.bookingId} className="font-semibold text-gray-700 hover:bg-[#FFFDF9]">
//                     <td className="px-4 py-3 font-mono font-black text-gray-800">{item.bookingCode}</td>
//                     <td className="px-4 py-3 font-black text-[#2C1E15]">{item.homestayName}</td>
//                     <td className="px-4 py-3">{item.customerName}</td>
//                     <td className="px-4 py-3">{formatDate(item.checkInDate)} - {formatDate(item.checkOutDate)}</td>
//                     <td className="px-4 py-3 font-black text-gray-800">{money(item.bookingAmount || item.totalPrice)}</td>
//                     <td className="px-4 py-3 text-rose-600">{money(item.discountAmount || 0)}</td>
//                     <td className="px-4 py-3 text-[#B66A3C]">{money(item.commissionAmount || 0)}</td>
//                     <td className="px-4 py-3 font-black text-[#2C3E2B]">{money(item.hostReceivableAmount || item.totalPrice)}</td>
//                     <td className="px-4 py-3"><StatusBadge value={item.commissionStatus || item.bookingStatus || item.paymentStatus} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           {!bookingsList.length && <div className="p-5"><Empty text="ChÆ°a cĂ³ booking phĂ¹ há»£p vá»›i bá»™ lá»c." /></div>}
//           <Pagination currentPage={page} totalPages={bookings.totalPages || 0} setCurrentPage={setPage} totalItems={bookings.totalElements || 0} indexOfFirstItem={(page - 1) * 10} indexOfLastItem={(page - 1) * 10 + bookingsList.length} itemName="booking" />
//         </section>

//         <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
//             <div>
//               <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B66A3C]">PhĂ­ duy trĂ¬</p>
//               <h2 className="font-serif text-2xl font-bold text-[#2C1E15]">Lá»‹ch sá»­ phĂ­ duy trĂ¬ host</h2>
//             </div>
//           </div>
//           <div className="mt-4 grid gap-3 md:grid-cols-3">
//             {fees.length ? fees.map((fee) => <MaintenanceCard key={fee.maintenanceFeeId} fee={fee} />) : <Empty text="ChÆ°a cĂ³ phĂ­ duy trĂ¬." />}
//           </div>
//         </section>
//       </div>
//     </HostLayout>
//   );
// }

// function HomestayFilter({ label, value, searchValue, options, loading, onSearchChange, onSelect }) {
//   const wrapperRef = useRef(null);
//   const [open, setOpen] = useState(false);
//   const getHomestayId = (item) => item?.homeId ?? item?.id ?? '';
//   const selected = (
//     options || []
//   ).find(
//     (item) =>
//       String(getHomestayId(item)) ===
//       String(value),
//   );
//   const query = searchValue || (selected ? `${getHomestayId(selected)} Â· ${selected.name}` : '');
//   const normalizedQuery = String(searchValue || '').trim().toLowerCase();
//   const filteredOptions = normalizedQuery
//     ? (options || []).filter((item) => [getHomestayId(item), item.name, item.city, item.province].some((field) => String(field || '').toLowerCase().includes(normalizedQuery)))
//     : (options || []);

//   useEffect(() => {
//     if (!open) return undefined;
//     const closeOnOutside = (event) => {
//       if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
//     };
//     document.addEventListener('mousedown', closeOnOutside);
//     return () => document.removeEventListener('mousedown', closeOnOutside);
//   }, [open]);

//   return (
//     <label ref={wrapperRef} className="relative space-y-1">
//       <span className="text-[11px] font-black uppercase text-gray-500">{label}</span>
//       <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 shadow-sm focus-within:ring-2 focus-within:ring-[#2C3E2B]/15">
//         <HiOutlineSearch className="text-gray-400" />
//         <input
//           value={query}
//           onFocus={() => setOpen(true)}
//           onChange={(event) => { onSearchChange(event.target.value); setOpen(true); }}
//           placeholder="GĂµ mĂ£ hoáº·c chá»n homestay..."
//           className="w-full bg-transparent text-xs font-bold outline-none"
//         />
//       </div>
//       {open && (
//         <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 text-xs font-bold shadow-xl shadow-black/10">
//           <button
//             type="button"
//             onMouseDown={(event) => { event.preventDefault(); onSelect(null); setOpen(false); }}
//             className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-gray-600 hover:bg-[#F7F2EA]"
//           >
//             <span>Táº¥t cáº£ homestay</span>
//           </button>
//           {loading && <div className="px-3 py-2 text-gray-400">Äang táº£i danh sĂ¡ch...</div>}
//           {!loading && !filteredOptions.length && <div className="px-3 py-2 text-gray-400">KhĂ´ng tĂ¬m tháº¥y homestay phĂ¹ há»£p.</div>}
//           {!loading && filteredOptions.map((item) => (
//             <button
//               key={getHomestayId(item)}
//               type="button"
//               onMouseDown={(event) => { event.preventDefault(); onSelect(item); setOpen(false); }}
//               className={(String(getHomestayId(item)) === String(value) ? 'bg-[#2C3E2B] text-white' : 'text-gray-700 hover:bg-[#F7F2EA]') + ' flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition'}
//             >
//               <span className="min-w-0 truncate">{item.name}</span>
//               <span className="shrink-0 font-mono text-[11px] opacity-70">{getHomestayId(item)}</span>
//             </button>
//           ))}
//         </div>
//       )}
//     </label>
//   );
// }
// function Field({ label, value, onChange, type = 'text' }) {
//   if (type === 'date') {
//     return <CalendarDateField label={label} value={value} onChange={onChange} />;
//   }

//   return (
//     <label className="space-y-1">
//       <span className="text-[11px] font-black uppercase text-gray-500">{label}</span>
//       <input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold outline-none shadow-sm transition hover:border-[#D8B48A] focus:border-[#7A5547] focus:ring-2 focus:ring-[#7A5547]/10" />
//     </label>
//   );
// }

// function MiniMetric({ label, value }) {
//   return <div className="rounded-2xl bg-white/14 px-4 py-3"><p className="text-[11px] font-black uppercase text-white/60">{label}</p><p className="mt-1 text-sm font-black text-white">{value}</p></div>;
// }

// const metricTones = {
//   emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
//   blue: 'border-blue-100 bg-blue-50 text-blue-700',
//   amber: 'border-amber-100 bg-amber-50 text-amber-700',
//   rose: 'border-rose-100 bg-rose-50 text-rose-700',
//   violet: 'border-violet-100 bg-violet-50 text-violet-700',
//   green: 'border-green-100 bg-green-50 text-green-700',
//   slate: 'border-slate-100 bg-slate-50 text-slate-700',
//   orange: 'border-orange-100 bg-orange-50 text-orange-700',
// };

// function Metric({ title, value, note, icon: Icon, tone = 'emerald' }) {
//   return (
//     <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
//       <div className="flex items-start justify-between gap-3">
//         <div>
//           <p className="text-[11px] font-black uppercase text-gray-500">{title}</p>
//           <p className="mt-2 text-2xl font-black text-[#2C1E15]">{value}</p>
//         </div>
//         <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${metricTones[tone] || metricTones.emerald}`}><Icon /></span>
//       </div>
//       <p className="mt-2 text-xs font-semibold text-gray-400">{note}</p>
//     </div>
//   );
// }

// function HostRevenueChart({ data }) {
//   const rows = (data || []).map((item) => ({ period: item.period, revenue: chartNumber(item.revenue), bookings: chartNumber(item.bookingCount) }));
//   if (!rows.length) return <Empty text="ChÆ°a cĂ³ dá»¯ liá»‡u biá»ƒu Ä‘á»“ trong khoáº£ng thá»i gian nĂ y." />;

//   const width = 920;
//   const height = 320;
//   const padding = { left: 62, right: 52, top: 36, bottom: 44 };
//   const plotWidth = width - padding.left - padding.right;
//   const plotHeight = height - padding.top - padding.bottom;
//   const baseline = height - padding.bottom;
//   const maxRevenue = Math.max(...rows.map((item) => item.revenue), 1);
//   const maxBookings = Math.max(...rows.map((item) => item.bookings), 1);
//   const step = rows.length > 1 ? plotWidth / (rows.length - 1) : plotWidth;
//   const barWidth = Math.max(18, Math.min(46, plotWidth / Math.max(rows.length * 2.3, 1)));
//   const points = rows.map((item, index) => {
//     const x = rows.length > 1 ? padding.left + index * step : padding.left + plotWidth / 2;
//     const revenueHeight = item.revenue > 0 ? Math.max(10, (item.revenue / maxRevenue) * plotHeight) : 0;
//     const orderY = baseline - (item.bookings / maxBookings) * plotHeight;
//     return { ...item, x, revenueY: baseline - revenueHeight, revenueHeight, orderY };
//   });
//   const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.orderY}`).join(' ');
//   const ticks = [1, 0.75, 0.5, 0.25, 0];

//   return (
//     <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-[#FFF8EC] p-3">
//       <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[760px] text-[11px] font-bold">
//         <defs>
//           <linearGradient id="hostRevenueLineFill" x1="0" x2="0" y1="0" y2="1">
//             <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
//             <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
//           </linearGradient>
//           <linearGradient id="hostRevenueBarFill" x1="0" x2="0" y1="0" y2="1">
//             <stop offset="0%" stopColor="#2C3E2B" />
//             <stop offset="100%" stopColor="#0F2A1C" />
//           </linearGradient>
//         </defs>
//         {ticks.map((tick) => {
//           const y = padding.top + (1 - tick) * plotHeight;
//           return <g key={tick}><line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#E8E2D8" strokeDasharray="6 8" /><text x={padding.left - 14} y={y + 4} textAnchor="end" fill="#9CA3AF">{compactMoney(maxRevenue * tick)}</text></g>;
//         })}
//         <text x={padding.left} y={18} fill="#64748B">Doanh thu</text>
//         <text x={width - padding.right} y={18} textAnchor="end" fill="#B66A3C">Sá»‘ Ä‘Æ¡n tá»‘i Ä‘a: {number(maxBookings)}</text>
//         {points.map((point) => (
//           <g key={point.period}>
//             <rect x={point.x - barWidth / 2} y={point.revenueY} width={barWidth} height={point.revenueHeight} rx="12" fill="url(#hostRevenueBarFill)"><title>{point.period}: {money(point.revenue)} Â· {number(point.bookings)} Ä‘Æ¡n</title></rect>
//             <text x={point.x} y={height - 14} textAnchor="middle" fill="#94A3B8">{String(point.period || '').slice(5) || point.period}</text>
//           </g>
//         ))}
//         {points.length > 1 && <path d={`${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`} fill="url(#hostRevenueLineFill)" />}
//         {points.length > 1 && <path d={linePath} fill="none" stroke="#E9A22D" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />}
//         {points.map((point) => <circle key={`${point.period}-dot`} cx={point.x} cy={point.orderY} r="6" fill="#fff" stroke="#E9A22D" strokeWidth="3.6"><title>{number(point.bookings)} Ä‘Æ¡n</title></circle>)}
//       </svg>
//       <div className="mt-2 flex flex-wrap gap-3 text-xs font-black text-gray-500">
//         <Legend color="bg-[#2C3E2B]" label="Doanh thu" />
//         <Legend color="bg-[#F59E0B]" label="Sá»‘ Ä‘Æ¡n" />
//       </div>
//     </div>
//   );
// }

// function Legend({ color, label }) {
//   return <span className="inline-flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${color}`} />{label}</span>;
// }

// function Insight({ title, value, sub, tone }) {
//   return <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"><p className="text-[11px] font-black uppercase text-gray-400">{title}</p><p className="mt-1 truncate text-lg font-black text-[#2C1E15]">{value}</p><span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black ${tone}`}>{sub}</span></div>;
// }

// function HomestayRevenueCard({ item }) {
//   return (
//     <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-[#F8F6F1] p-4 shadow-sm">
//       <div className="flex items-start justify-between gap-3">
//         <div className="min-w-0">
//           <h3 className="truncate font-serif text-lg font-bold text-[#2C1E15]">{item.homestayName}</h3>
//           <p className="text-xs font-bold text-gray-400">{item.province || '--'} Â· {number(item.completedCount)} Ä‘Æ¡n hoĂ n thĂ nh</p>
//         </div>
//         <span className="rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">â˜… {Number(item.averageRating || 0).toFixed(1)}</span>
//       </div>
//       <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold">
//         <InfoPill label="Doanh thu" value={money(item.revenue || item.hostReceivableAmount)} tone="text-[#2C3E2B]" />
//         <InfoPill label="Tiá»n phĂ²ng" value={money(item.roomRevenue)} tone="text-blue-700" />
//         <InfoPill label="Dá»‹ch vá»¥" value={money(item.serviceRevenue)} tone="text-amber-700" />
//         <InfoPill label="Hoa há»“ng" value={money(item.commissionAmount)} tone="text-[#B66A3C]" />
//       </div>
//     </div>
//   );
// }

// function InfoPill({ label, value, tone }) {
//   return <div className="rounded-xl bg-white px-3 py-2"><p className="text-[10px] uppercase text-gray-400">{label}</p><p className={`mt-1 font-black ${tone}`}>{value}</p></div>;
// }

// function MaintenanceCard({ fee }) {
//   return (
//     <div className="rounded-2xl border border-gray-200 bg-[#F8F6F1] p-4">
//       <div className="flex items-start justify-between gap-3">
//         <div>
//           <p className="text-xs font-black text-gray-500">ThĂ¡ng {fee.billingMonth}/{fee.billingYear}</p>
//           <p className="mt-1 text-xl font-black text-[#2C3E2B]">{money(fee.feeAmount)}</p>
//         </div>
//         <StatusBadge value={fee.paymentStatus} labels={maintenanceStatusLabels} />
//       </div>
//       <p className="mt-2 text-xs font-bold text-gray-500">Ká»³: {formatDate(fee.periodStart)} - {formatDate(fee.periodEnd)}</p>
//       <p className="text-xs font-bold text-gray-500">Háº¡n thanh toĂ¡n: {formatDate(fee.dueDate)}</p>
//     </div>
//   );
// }

// function StatusBadge({ value, labels = statusLabels }) {
//   const normalized = String(value || '').toUpperCase();
//   const tone = normalized === 'RECOGNIZED' || normalized === 'PAID' || normalized === 'COMPLETED'
//     ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
//     : normalized === 'PENDING'
//       ? 'bg-amber-50 text-amber-700 border-amber-200'
//       : normalized === 'CANCELLED' || normalized === 'OVERDUE'
//         ? 'bg-rose-50 text-rose-700 border-rose-200'
//         : 'bg-gray-100 text-gray-600 border-gray-200';
//   return <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${tone}`}>{labels[normalized] || value || '--'}</span>;
// }

// function Empty({ text }) {
//   return <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm font-bold text-gray-400">{text}</div>;
// }

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCash,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineHome,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineX,
} from 'react-icons/hi';
import HostLayout from '../../layouts/HostLayout';
import Pagination from '../../components/common/Pagination';
import ManagementBackButton from '../../components/common/ManagementBackButton';
import ManagementHeaderRow from '../../components/common/ManagementHeaderRow';
import CalendarDateField from '../../components/common/CalendarDateField';
import { getHostRevenue, getHostRevenueBookings, getHostMaintenanceHistory } from '../../services/hostRevenueService';
import { getHostHomestays } from '../../services/hostHomestayService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const now = new Date();
const pad = (value) => String(value).padStart(2, '0');
const asInputDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const today = asInputDate(now);
const allFromDate = '1970-01-01';
const startOfMonth = asInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
const startOfYear = asInputDate(new Date(now.getFullYear(), 0, 1));
const daysAgo = (days) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return asInputDate(date);
};

const defaultFilters = {
  datePreset: 'ALL',
  fromDate: allFromDate,
  toDate: today,
  homestayId: '',
  homestaySearch: '',
};

const datePresets = [
  { value: 'ALL', label: 'Tất cả', fromDate: allFromDate, toDate: today },
  { value: 'TODAY', label: 'Hôm nay', fromDate: today, toDate: today },
  { value: 'THIS_MONTH', label: 'Tháng này', fromDate: startOfMonth, toDate: today },
  { value: 'LAST_30_DAYS', label: '30 ngày', fromDate: daysAgo(29), toDate: today },
  { value: 'LAST_90_DAYS', label: '90 ngày', fromDate: daysAgo(89), toDate: today },
  { value: 'THIS_YEAR', label: 'Năm nay', fromDate: startOfYear, toDate: today },
  { value: 'CUSTOM', label: 'Tùy chỉnh ngày' },
];


const statusLabels = {
  PENDING: 'Đã đặt',
  RECOGNIZED: 'Đã ghi nhận',
  PAID_OUT: 'Đã ghi nhận',
  CANCELLED: 'Đã hủy',
  PAID: 'Đã thanh toán',
  OVERDUE: 'Quá hạn',
  WAIVED: 'Miễn phí',
};

const maintenanceStatusLabels = {
  PENDING: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  OVERDUE: 'Quá hạn',
  WAIVED: 'Miễn phí',
  CANCELLED: 'Đã hủy',
};

function money(value) {
  return formatCurrency(value || 0);
}

function number(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function compactMoney(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount === 0) return '0 đ';
  if (amount >= 1000000000) return `${(amount / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`;
  if (amount >= 1000000) return `${(amount / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
  if (amount >= 1000) return `${(amount / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} nghìn`;
  return `${amount.toLocaleString('vi-VN')} đ`;
}

function chartNumber(value) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getGroupBy(fromDate, toDate) {
  if (!fromDate || !toDate) return 'month';

  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return 'month';
  }

  const diffInDays = Math.ceil(
    (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
  );

  return diffInDays <= 31 ? 'day' : 'month';
}

function getHomestayId(item) {
  return item?.homeId ?? item?.id ?? '';
}

function deferLoad(task) {
  const timer = window.setTimeout(() => { void task(); }, 0);
  return () => window.clearTimeout(timer);
}

export default function Revenue() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [fees, setFees] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [homestaysLoading, setHomestaysLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const summaryParams = useMemo(() => ({
    fromDate: appliedFilters.fromDate,
    toDate: appliedFilters.toDate,
    groupBy: getGroupBy(appliedFilters.fromDate, appliedFilters.toDate),
    homestayId: appliedFilters.homestayId,
  }), [
    appliedFilters.fromDate,
    appliedFilters.homestayId,
    appliedFilters.toDate,
  ]);

  const bookingParams = useMemo(() => ({
    fromDate: appliedFilters.fromDate,
    toDate: appliedFilters.toDate,
    homestayId: appliedFilters.homestayId,
    page: page - 1,
    size: 10,
  }), [appliedFilters.fromDate, appliedFilters.homestayId, appliedFilters.toDate, page]);

  const loadSummary = useCallback(async () => {
    const data = await getHostRevenue(summaryParams);
    setSummary(data || null);
  }, [summaryParams]);

  const loadBookings = useCallback(async () => {
    const data = await getHostRevenueBookings(bookingParams);
    setBookings(data || { content: [], totalPages: 0, totalElements: 0 });
  }, [bookingParams]);

  const loadFees =
    useCallback(async () => {
      const selectedYear =
        appliedFilters.datePreset ===
        'ALL'
          ? now.getFullYear()
          : Number(
              (
                appliedFilters.fromDate ||
                today
              ).slice(0, 4),
            ) ||
            now.getFullYear();

      const data =
        await getHostMaintenanceHistory({
          year: selectedYear,
          page: 0,
          size: 6,
        });

      setFees(
        Array.isArray(data)
          ? data
          : [],
      );
    }, [
      appliedFilters.datePreset,
      appliedFilters.fromDate,
    ]);
    
  const loadHomestayOptions = useCallback(async () => {
    setHomestaysLoading(true);
    try {
      const data = await getHostHomestays();
      setHomestays(Array.isArray(data) ? data : []);
    } catch {
      setHomestays([]);
    } finally {
      setHomestaysLoading(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadSummary(), loadBookings(), loadFees()]);
    } catch (err) {
      setError(err.message || 'Không tải được dữ liệu doanh thu của chủ homestay.');
    } finally {
      setLoading(false);
    }
  }, [loadBookings, loadFees, loadSummary]);

  useEffect(() => deferLoad(loadAll), [loadAll]);
  useEffect(() => deferLoad(loadHomestayOptions), [loadHomestayOptions]);

  const updateFilter = (field, value) => {
    const isDateField = field === 'fromDate' || field === 'toDate';

    const nextFilters = {
      ...filters,
      [field]: value,
      datePreset: isDateField ? 'CUSTOM' : filters.datePreset,
    };

    setFilters(nextFilters);

    if (isDateField) {
      setPage(1);
      setAppliedFilters((current) => ({
        ...current,
        fromDate: nextFilters.fromDate,
        toDate: nextFilters.toDate,
        datePreset: 'CUSTOM',
      }));
    }
  };

const selectPreset = (preset) => {
  if (preset.value === 'CUSTOM') {
    setFilters((current) => ({
      ...current,
      datePreset: 'CUSTOM',
    }));

    return;
  }

  const nextFilters = {
    ...filters,
    datePreset: preset.value,
    fromDate:
      preset.fromDate || filters.fromDate,
    toDate:
      preset.toDate || filters.toDate,
  };

  setPage(1);
  setFilters(nextFilters);

  setAppliedFilters((current) => ({
    ...current,
    datePreset: nextFilters.datePreset,
    fromDate: nextFilters.fromDate,
    toDate: nextFilters.toDate,
  }));
};

  const applyFilters = () => {
    const typedHomestay = String(
      filters.homestaySearch || '',
    )
      .trim()
      .toLowerCase();

    const matchedHomestay =
      filters.homestayId
        ? null
        : homestays.find((item) => {
            const haystack = [
              item.id,
              item.homeId,
              item.name,
              item.city,
              item.province,
            ].map((field) =>
              String(field || '')
                .toLowerCase(),
            );

            return (
              haystack.some(
                (field) =>
                  field === typedHomestay,
              ) ||
              (
                typedHomestay &&
                haystack.some(
                  (field) =>
                    field.includes(
                      typedHomestay,
                    ),
                )
              )
            );
          });

    const resolvedHomestayId =
      filters.homestayId || getHomestayId(matchedHomestay);

    const nextSearch =
      matchedHomestay
        ? `${
            matchedHomestay.id ??
            matchedHomestay.homeId
          } · ${matchedHomestay.name}`
        : filters.homestaySearch;

    setPage(1);

    setFilters((current) => ({
      ...current,
      homestayId:
        resolvedHomestayId,
      homestaySearch: nextSearch,
    }));

    setAppliedFilters(
      (current) => ({
        ...current,
        homestayId:
          resolvedHomestayId,
        homestaySearch: nextSearch,
      }),
    );
  };


  const revenueChange = useMemo(() => {
    const rows = summary?.trends || [];
    if (rows.length < 2) return null;
    const first = chartNumber(rows[0].revenue);
    const last = chartNumber(rows[rows.length - 1].revenue);
    if (first <= 0) return last > 0 ? 100 : 0;
    return Math.round(((last - first) / first) * 100);
  }, [summary?.trends]);

  const bookingsList = bookings.content || [];
  const chartRows = summary?.trends || [];
  const topHomestays = summary?.homestays || [];
  const bestDay = chartRows.reduce((best, item) => (chartNumber(item.revenue) > chartNumber(best?.revenue) ? item : best), null);
  const bestHomestay = topHomestays[0];

  return (
    <HostLayout>
      <div className="mx-auto max-w-7xl space-y-5 text-left text-sm text-gray-700">
        <ManagementHeaderRow backButton={<ManagementBackButton onClick={() => navigate('/host')} />}>
          <section className="overflow-hidden rounded-3xl border border-[#223047]/10 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="bg-[#202c3c] p-6 text-white lg:p-7">
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-200">Host Revenue</p>
                <h1 className="mt-2 font-serif text-4xl font-bold">Quản lý doanh thu</h1>
                <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/72">
                  Theo dõi doanh thu thực nhận của chủ homestay, số đơn đã thanh toán, phí hoa hồng đã khấu trừ và hiệu quả từng homestay theo thời gian.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-black">
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-white/80">{formatDate(appliedFilters.fromDate)} - {formatDate(appliedFilters.toDate)}</span>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-emerald-100">{number(summary?.completedBookingCount)} đơn ghi nhận</span>
                  <span className="rounded-full bg-amber-400/15 px-3 py-1.5 text-amber-100">{number(summary?.occupancyNights)} đêm lưu trú</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#6C483A] via-[#8A5A44] to-[#FF9800] p-6 text-white lg:p-7">
                <div className="rounded-3xl bg-white/12 p-5 shadow-inner shadow-black/10 backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Tổng doanh thu thực nhận</p>
                  <p className="mt-2 text-4xl font-black tracking-tight">{money(summary?.totalHostRevenue)}</p>
                  <p className="mt-1 text-xs font-bold text-emerald-100">{revenueChange === null ? 'So sánh khi có từ 2 mốc dữ liệu' : `${revenueChange >= 0 ? 'Tăng' : 'Giảm'} ${Math.abs(revenueChange)}% so với mốc đầu kỳ`}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MiniMetric label="Doanh thu phòng" value={money(summary?.roomRevenue)} />
                    <MiniMetric label="Dịch vụ thêm" value={money(summary?.serviceRevenue)} />
                    <MiniMetric label="Hoa hồng đã trừ" value={money(summary?.commissionDeducted)} />
                    <MiniMetric label="Giảm giá" value={money(summary?.discountTotal)} />
                  </div>
                </div>
              </div>
            </div>
            {summary?.canReceiveBooking === false && (
              <div className="border-t border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600">
                Tài khoản chủ homestay đang quá hạn phí duy trì. Các homestay tạm thời không nhận booking mới.
              </div>
            )}
          </section>
        </ManagementHeaderRow>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-600">{error}</div>}
        {loading && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 font-bold text-amber-700">Đang tải dữ liệu doanh thu...</div>}

        <section className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-black uppercase text-gray-500">Khoảng thời gian:</span>
            {datePresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => selectPreset(preset)}
                className={(filters.datePreset === preset.value ? 'bg-[#2C3E2B] text-white shadow-md shadow-[#2C3E2B]/20' : 'bg-[#F4F1EA] text-gray-600 hover:bg-white hover:shadow-sm') + ' rounded-xl px-4 py-2 text-xs font-black transition'}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_2fr_auto]">
            <Field label="Từ ngày" type="date" value={filters.fromDate} onChange={(value) => updateFilter('fromDate', value)} />
            <Field label="Đến ngày" type="date" value={filters.toDate} onChange={(value) => updateFilter('toDate', value)} />
            <HomestayFilter
              label="Lọc homestay"
              value={filters.homestayId}
              searchValue={filters.homestaySearch}
              options={homestays}
              loading={homestaysLoading}
              onSearchChange={(value) => setFilters((current) => ({ ...current, homestaySearch: value, homestayId: '' }))}
             onSelect={(homestay) =>
                setFilters((current) => ({
                  ...current,

                  homestayId: getHomestayId(homestay),

                  homestaySearch:
                    homestay
                      ? `${
                          homestay.id ??
                          homestay.homeId
                        } · ${homestay.name}`
                      : '',
                }))
              }
            />
            <div className="flex items-end gap-2">
              <button onClick={applyFilters} className="h-11 rounded-xl bg-[#2C3E2B] px-5 text-xs font-black text-white shadow-md" type="button">Áp dụng</button>
              <button onClick={loadAll} className="h-11 rounded-xl bg-[#FF9800] px-4 text-xs font-black text-white shadow-md" type="button" title="Làm mới"><HiOutlineRefresh /></button>
            </div>
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Metric tone="emerald" icon={HiOutlineCash} title="Doanh thu thực nhận" value={money(summary?.totalHostRevenue)} note="Sau khi trừ hoa hồng Cozygo" />
          <Metric tone="blue" icon={HiOutlineHome} title="Doanh thu phòng" value={money(summary?.roomRevenue)} note="Tiền phòng đã thanh toán" />
          <Metric tone="amber" icon={HiOutlineCash} title="Dịch vụ thêm" value={money(summary?.serviceRevenue)} note="Dịch vụ khách đã chọn" />
          <Metric tone="rose" icon={HiOutlineX} title="Đã giảm giá" value={money(summary?.discountTotal)} note="Ưu đãi áp dụng" />
          <Metric tone="violet" icon={HiOutlineChartBar} title="Giá trị TB/đơn" value={money(summary?.averageOrderValue)} note="Trung bình mỗi booking" />
          <Metric tone="green" icon={HiOutlineCheckCircle} title="Đơn ghi nhận" value={number(summary?.completedBookingCount)} note="Đã đặt hoặc đã thanh toán" />
          <Metric tone="slate" icon={HiOutlineClock} title="Đơn đã đặt" value={number(summary?.pendingBookingCount)} note="Đã tính vào doanh thu dự kiến" />
          <Metric tone="orange" icon={HiOutlineCalendar} title="Đêm đã bán" value={number(summary?.occupancyNights)} note="Tổng số đêm lưu trú" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
          <section className="rounded-[28px] border border-[#E7DDD1] bg-white p-5 shadow-[0_18px_45px_-35px_rgba(44,30,21,0.55)] transition duration-200 hover:shadow-[0_24px_55px_-38px_rgba(44,30,21,0.65)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#B66A3C]">Biểu đồ tăng trưởng</p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-[#2C1E15]">
                  Doanh thu và số đơn theo {summaryParams.groupBy === 'day' ? 'ngày' : 'tháng'}
                </h2>
                <p className="text-sm font-semibold text-gray-500">
                  Cột xanh là doanh thu thực nhận, đường cam là số đơn đã thanh toán trong cùng kỳ.
                </p>
              </div>
            </div>
            <HostRevenueChart data={chartRows} />
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#B66A3C]">Phân tích nhanh</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-[#2C1E15]">Điểm đáng chú ý</h2>
            <div className="mt-4 space-y-3">
              <Insight title="Kỳ doanh thu cao nhất" value={bestDay?.period || '--'} sub={bestDay ? money(bestDay.revenue) : 'Chưa có dữ liệu'} tone="bg-emerald-50 text-emerald-700" />
              <Insight title="Homestay dẫn đầu" value={bestHomestay?.homestayName || '--'} sub={bestHomestay ? money(bestHomestay.revenue || bestHomestay.hostReceivableAmount) : 'Chưa có dữ liệu'} tone="bg-amber-50 text-amber-700" />
              <Insight title="Đơn đã hủy" value={number(summary?.cancelledBookingCount)} sub="Không cộng vào doanh thu" tone="bg-rose-50 text-rose-700" />
              <Insight title="Phí duy trì hiện tại" value={money(summary?.currentMaintenanceFee)} sub={`Hạn: ${formatDate(summary?.maintenanceDueDate) || '--'}`} tone="bg-blue-50 text-blue-700" />
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B66A3C]">Hiệu quả homestay</p>
              <h2 className="font-serif text-2xl font-bold text-[#2C1E15]">Doanh thu theo từng homestay</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {topHomestays.length ? topHomestays.slice(0, 6).map((item) => <HomestayRevenueCard key={item.homeId} item={item} />) : <Empty text="Chưa có dữ liệu homestay trong khoảng thời gian này." />}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B66A3C]">Chi tiết booking</p>
              <h2 className="font-serif text-2xl font-bold text-[#2C1E15]">Doanh thu booking</h2>
            </div>
            <p className="text-xs font-bold text-gray-400">Hiển thị {bookingsList.length}/{bookings.totalElements || 0} đơn</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] text-left text-xs">
              <thead className="bg-gray-50 text-gray-500">
                <tr>{['Mã booking', 'Homestay', 'Khách hàng', 'Ngày lưu trú', 'Tiền booking', 'Giảm', 'Hoa hồng', 'Host nhận', 'Trạng thái'].map((head) => <th key={head} className="px-4 py-3 font-black uppercase">{head}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookingsList.map((item) => (
                  <tr key={item.commissionId || item.bookingId} className="font-semibold text-gray-700 hover:bg-[#FFFDF9]">
                    <td className="px-4 py-3 font-mono font-black text-gray-800">{item.bookingCode}</td>
                    <td className="px-4 py-3 font-black text-[#2C1E15]">{item.homestayName}</td>
                    <td className="px-4 py-3">{item.customerName}</td>
                    <td className="px-4 py-3">{formatDate(item.checkInDate)} - {formatDate(item.checkOutDate)}</td>
                    <td className="px-4 py-3 font-black text-gray-800">{money(item.bookingAmount || item.totalPrice)}</td>
                    <td className="px-4 py-3 text-rose-600">{money(item.discountAmount || 0)}</td>
                    <td className="px-4 py-3 text-[#B66A3C]">{money(item.commissionAmount || 0)}</td>
                    <td className="px-4 py-3 font-black text-[#2C3E2B]">{money(item.hostReceivableAmount || item.totalPrice)}</td>
                    <td className="px-4 py-3"><StatusBadge value={item.commissionStatus || item.bookingStatus || item.paymentStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!bookingsList.length && <div className="p-5"><Empty text="Chưa có booking phù hợp với bộ lọc." /></div>}
          <Pagination currentPage={page} totalPages={bookings.totalPages || 0} setCurrentPage={setPage} totalItems={bookings.totalElements || 0} indexOfFirstItem={(page - 1) * 10} indexOfLastItem={(page - 1) * 10 + bookingsList.length} itemName="booking" />
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B66A3C]">Phí duy trì</p>
              <h2 className="font-serif text-2xl font-bold text-[#2C1E15]">Lịch sử phí duy trì host</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {fees.length ? fees.map((fee) => <MaintenanceCard key={fee.maintenanceFeeId} fee={fee} />) : <Empty text="Chưa có phí duy trì." />}
          </div>
        </section>
      </div>
    </HostLayout>
  );
}

function HomestayFilter({ label, value, searchValue, options, loading, onSearchChange, onSelect }) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const selected = (
    options || []
  ).find(
    (item) =>
      String(getHomestayId(item)) ===
      String(value),
  );
  const query = searchValue || (selected ? `${getHomestayId(selected)} · ${selected.name}` : '');
  const normalizedQuery = String(searchValue || '').trim().toLowerCase();
  const filteredOptions = normalizedQuery
    ? (options || []).filter((item) => [getHomestayId(item), item.name, item.city, item.province].some((field) => String(field || '').toLowerCase().includes(normalizedQuery)))
    : (options || []);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, [open]);

  return (
    <label ref={wrapperRef} className="relative space-y-1">
      <span className="text-[11px] font-black uppercase text-gray-500">{label}</span>
      <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 shadow-sm focus-within:ring-2 focus-within:ring-[#2C3E2B]/15">
        <HiOutlineSearch className="text-gray-400" />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => { onSearchChange(event.target.value); setOpen(true); }}
          placeholder="Gõ mã hoặc chọn homestay..."
          className="w-full bg-transparent text-xs font-bold outline-none"
        />
      </div>
      {open && (
        <div className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 text-xs font-bold shadow-xl shadow-black/10">
          <button
            type="button"
            onMouseDown={(event) => { event.preventDefault(); onSelect(null); setOpen(false); }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-gray-600 hover:bg-[#F7F2EA]"
          >
            <span>Tất cả homestay</span>
          </button>
          {loading && <div className="px-3 py-2 text-gray-400">Đang tải danh sách...</div>}
          {!loading && !filteredOptions.length && <div className="px-3 py-2 text-gray-400">Không tìm thấy homestay phù hợp.</div>}
          {!loading && filteredOptions.map((item) => (
            <button
              key={getHomestayId(item)}
              type="button"
              onMouseDown={(event) => { event.preventDefault(); onSelect(item); setOpen(false); }}
              className={(String(getHomestayId(item)) === String(value) ? 'bg-[#2C3E2B] text-white' : 'text-gray-700 hover:bg-[#F7F2EA]') + ' flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition'}
            >
              <span className="min-w-0 truncate">{item.name}</span>
              <span className="shrink-0 font-mono text-[11px] opacity-70">{getHomestayId(item)}</span>
            </button>
          ))}
        </div>
      )}
    </label>
  );
}
function Field({ label, value, onChange, type = 'text' }) {
  if (type === 'date') {
    return <CalendarDateField label={label} value={value} onChange={onChange} />;
  }

  return (
    <label className="space-y-1">
      <span className="text-[11px] font-black uppercase text-gray-500">{label}</span>
      <input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold outline-none shadow-sm transition hover:border-[#D8B48A] focus:border-[#7A5547] focus:ring-2 focus:ring-[#7A5547]/10" />
    </label>
  );
}

function MiniMetric({ label, value }) {
  return <div className="rounded-2xl bg-white/14 px-4 py-3"><p className="text-[11px] font-black uppercase text-white/60">{label}</p><p className="mt-1 text-sm font-black text-white">{value}</p></div>;
}

const metricTones = {
  emerald: { icon: 'border-emerald-100 bg-emerald-50 text-emerald-700', accent: 'bg-emerald-500', glow: 'shadow-emerald-900/10' },
  blue: { icon: 'border-blue-100 bg-blue-50 text-blue-700', accent: 'bg-blue-500', glow: 'shadow-blue-900/10' },
  amber: { icon: 'border-amber-100 bg-amber-50 text-amber-700', accent: 'bg-amber-500', glow: 'shadow-amber-900/10' },
  rose: { icon: 'border-rose-100 bg-rose-50 text-rose-700', accent: 'bg-rose-500', glow: 'shadow-rose-900/10' },
  violet: { icon: 'border-violet-100 bg-violet-50 text-violet-700', accent: 'bg-violet-500', glow: 'shadow-violet-900/10' },
  green: { icon: 'border-green-100 bg-green-50 text-green-700', accent: 'bg-[#2C3E2B]', glow: 'shadow-green-900/10' },
  slate: { icon: 'border-slate-100 bg-slate-50 text-slate-700', accent: 'bg-slate-500', glow: 'shadow-slate-900/10' },
  orange: { icon: 'border-orange-100 bg-orange-50 text-orange-700', accent: 'bg-orange-500', glow: 'shadow-orange-900/10' },
};

function Metric({ title, value, note, icon: Icon, tone = 'emerald' }) {
  const palette = metricTones[tone] || metricTones.emerald;

  return (
    <div className={`group relative overflow-hidden rounded-[22px] border border-gray-200 bg-white p-4 shadow-sm ${palette.glow} transition duration-200 hover:-translate-y-1 hover:border-[#D8CABE] hover:shadow-xl`}>
      <span className={`absolute inset-x-0 top-0 h-1 ${palette.accent}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.04em] text-gray-500">{title}</p>
          <p className="mt-2 text-[26px] font-black leading-none text-[#2C1E15]">{value}</p>
        </div>
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border text-lg transition duration-200 group-hover:scale-105 ${palette.icon}`}><Icon /></span>
      </div>
      <p className="mt-3 line-clamp-2 text-xs font-semibold leading-5 text-gray-400">{note}</p>
    </div>
  );
}

function HostRevenueChart({ data }) {
  const rows = (data || []).map((item) => ({ period: item.period, revenue: chartNumber(item.revenue), bookings: chartNumber(item.bookingCount) }));
  if (!rows.length) return <Empty text="Chưa có dữ liệu biểu đồ trong khoảng thời gian này." />;

  const width = 780;
  const height = 285;
  const padding = { left: 62, right: 56, top: 34, bottom: 42 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const baseline = height - padding.bottom;
  const maxRevenue = Math.max(...rows.map((item) => item.revenue), 1);
  const maxBookings = Math.max(...rows.map((item) => item.bookings), 1);
  const step = rows.length > 1 ? plotWidth / (rows.length - 1) : plotWidth;
  const barWidth = Math.max(16, Math.min(40, plotWidth / Math.max(rows.length * 2.45, 1)));
  const points = rows.map((item, index) => {
    const x = rows.length > 1 ? padding.left + index * step : padding.left + plotWidth / 2;
    const revenueHeight = item.revenue > 0 ? Math.max(10, (item.revenue / maxRevenue) * plotHeight) : 0;
    const orderY = baseline - (item.bookings / maxBookings) * plotHeight;
    return { ...item, x, revenueY: baseline - revenueHeight, revenueHeight, orderY };
  });
  const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.orderY}`).join(' ');
  const ticks = [1, 0.75, 0.5, 0.25, 0];

  return (
    <div className="mt-4 overflow-x-auto rounded-[24px] border border-[#EFE6DA] bg-white p-4 pb-2 shadow-inner shadow-[#6C483A]/5">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[700px] text-[11px] font-bold">
        <defs>
          <linearGradient id="hostRevenueLineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#E9A22D" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#E9A22D" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="hostRevenueBarFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5D7D63" />
            <stop offset="100%" stopColor="#243F2B" />
          </linearGradient>
        </defs>
        <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} rx="20" fill="#FFFCF7" />
        {ticks.map((tick) => {
          const y = padding.top + (1 - tick) * plotHeight;
          return <g key={tick}><line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#E8E2D8" strokeDasharray="6 8" /><text x={padding.left - 14} y={y + 4} textAnchor="end" fill="#9CA3AF">{compactMoney(maxRevenue * tick)}</text></g>;
        })}
        <text x={padding.left} y={18} fill="#64748B">Doanh thu</text>
        <text x={width - padding.right} y={18} textAnchor="end" fill="#B66A3C">Số đơn tối đa: {number(maxBookings)}</text>
        {points.map((point) => (
          <g key={point.period}>
            <rect x={point.x - barWidth / 2} y={point.revenueY} width={barWidth} height={point.revenueHeight} rx="12" fill="url(#hostRevenueBarFill)"><title>{point.period}: {money(point.revenue)} · {number(point.bookings)} đơn</title></rect>
            <text x={point.x} y={height - 14} textAnchor="middle" fill="#94A3B8">{String(point.period || '').slice(5) || point.period}</text>
          </g>
        ))}
        {points.length > 1 && <path d={`${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`} fill="url(#hostRevenueLineFill)" />}
        {points.length > 1 && <path d={linePath} fill="none" stroke="#E9A22D" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />}
        {points.map((point) => <circle key={`${point.period}-dot`} cx={point.x} cy={point.orderY} r="6" fill="#fff" stroke="#E9A22D" strokeWidth="3.6"><title>{number(point.bookings)} đơn</title></circle>)}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-xs font-black text-gray-500">
        <Legend color="bg-[#2C3E2B]" label="Doanh thu" />
        <Legend color="bg-[#F59E0B]" label="Số đơn" />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return <span className="inline-flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${color}`} />{label}</span>;
}

function Insight({ title, value, sub, tone }) {
  return <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"><p className="text-[11px] font-black uppercase text-gray-400">{title}</p><p className="mt-1 truncate text-lg font-black text-[#2C1E15]">{value}</p><span className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-black ${tone}`}>{sub}</span></div>;
}

function HomestayRevenueCard({ item }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-[#F8F6F1] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg font-bold text-[#2C1E15]">{item.homestayName}</h3>
          <p className="text-xs font-bold text-gray-400">{item.province || '--'} · {number(item.completedCount)} đơn hoàn thành</p>
        </div>
        <span className="rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">★ {Number(item.averageRating || 0).toFixed(1)}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold">
        <InfoPill label="Doanh thu" value={money(item.revenue || item.hostReceivableAmount)} tone="text-[#2C3E2B]" />
        <InfoPill label="Tiền phòng" value={money(item.roomRevenue)} tone="text-blue-700" />
        <InfoPill label="Dịch vụ" value={money(item.serviceRevenue)} tone="text-amber-700" />
        <InfoPill label="Hoa hồng" value={money(item.commissionAmount)} tone="text-[#B66A3C]" />
      </div>
    </div>
  );
}

function InfoPill({ label, value, tone }) {
  return <div className="rounded-xl bg-white px-3 py-2"><p className="text-[10px] uppercase text-gray-400">{label}</p><p className={`mt-1 font-black ${tone}`}>{value}</p></div>;
}

function MaintenanceCard({ fee }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-[#F8F6F1] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-gray-500">Tháng {fee.billingMonth}/{fee.billingYear}</p>
          <p className="mt-1 text-xl font-black text-[#2C3E2B]">{money(fee.feeAmount)}</p>
        </div>
        <StatusBadge value={fee.paymentStatus} labels={maintenanceStatusLabels} />
      </div>
      <p className="mt-2 text-xs font-bold text-gray-500">Kỳ: {formatDate(fee.periodStart)} - {formatDate(fee.periodEnd)}</p>
      <p className="text-xs font-bold text-gray-500">Hạn thanh toán: {formatDate(fee.dueDate)}</p>
    </div>
  );
}

function StatusBadge({ value, labels = statusLabels }) {
  const normalized = String(value || '').toUpperCase();
  const tone = normalized === 'RECOGNIZED' || normalized === 'PAID' || normalized === 'COMPLETED'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : normalized === 'PENDING'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : normalized === 'CANCELLED' || normalized === 'OVERDUE'
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : 'bg-gray-100 text-gray-600 border-gray-200';
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${tone}`}>{labels[normalized] || value || '--'}</span>;
}

function Empty({ text }) {
  return <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm font-bold text-gray-400">{text}</div>;
}
