// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { HiOutlineCash, HiOutlineChartBar, HiOutlineCheckCircle, HiOutlineRefresh, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
// import AdminLayout from '../../layouts/AdminLayout';
// import ManagementBackButton from '../../components/common/ManagementBackButton';
// import ManagementHeaderRow from '../../components/common/ManagementHeaderRow';
// import Pagination from '../../components/common/Pagination';
// import PrettySelect from '../../components/common/PrettySelect';
// import CalendarDateField from '../../components/common/CalendarDateField';
// import { adminRevenueService } from '../../services/adminRevenueService';
// import { maintenanceFeeService } from '../../services/maintenanceFeeService';
// import { platformFeeService } from '../../services/platformFeeService';
// import { formatCurrency, formatDate } from '../../utils/formatters';

// const now = new Date();

// function asInputDate(date) {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// }
// const startOfMonth = asInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
// const today = asInputDate(now);
// const allFromDate = '1970-01-01';
// const daysAgo = (days) => {
//   const date = new Date(now);
//   date.setDate(date.getDate() - days);
//   return asInputDate(date);
// };
// const datePresets = [
//   { value: 'ALL', label: 'Tất cả', fromDate: allFromDate, toDate: today },
//   { value: 'TODAY', label: 'Hôm nay', fromDate: today, toDate: today },
//   { value: 'THIS_MONTH', label: 'Tháng này', fromDate: startOfMonth, toDate: today },
//   { value: 'LAST_30_DAYS', label: '30 ngày', fromDate: daysAgo(29), toDate: today },
//   { value: 'LAST_90_DAYS', label: '90 ngày', fromDate: daysAgo(89), toDate: today },
//   { value: 'CUSTOM', label: 'Tùy chỉnh ngày' },
// ];
// const tabs = ['Tổng quan', 'Hoa hồng booking', 'Phí duy trì host', 'Cấu hình phí'];
// const commissionOptions = [{ value: '', label: 'Tất cả' }, { value: 'PENDING', label: 'Chưa hoàn thành' }, { value: 'RECOGNIZED', label: 'Đã ghi nhận doanh thu' }, { value: 'CANCELLED', label: 'Không tính doanh thu' }];
// const paymentOptions = [{ value: '', label: 'Tất cả' }, { value: 'VNPAY', label: 'Thanh toán online' }, { value: 'PAY_AT_PROPERTY', label: 'Thanh toán tại homestay' }];
// const maintenanceOptions = [{ value: '', label: 'Tất cả' }, { value: 'PENDING', label: 'Chưa thanh toán' }, { value: 'PAID', label: 'Đã thanh toán' }, { value: 'OVERDUE', label: 'Quá hạn' }, { value: 'WAIVED', label: 'Được miễn' }, { value: 'CANCELLED', label: 'Đã hủy' }];
// const commissionLabels = { PENDING: 'Chưa hoàn thành', RECOGNIZED: 'Đã ghi nhận doanh thu', CANCELLED: 'Không tính doanh thu' };
// const maintenanceLabels = { PENDING: 'Chưa thanh toán', PAID: 'Đã thanh toán', OVERDUE: 'Quá hạn', WAIVED: 'Được miễn', CANCELLED: 'Đã hủy' };
// function money(value) { return formatCurrency(value || 0); }
// function count(value) { return Number(value || 0).toLocaleString('vi-VN'); }
// function compactMoney(value) {
//   const amount = Number(value || 0);
//   if (!Number.isFinite(amount) || amount === 0) return '0 đ';
//   if (amount >= 1000000000) return `${(amount / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`;
//   if (amount >= 1000000) return `${(amount / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
//   if (amount >= 1000) return `${(amount / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} nghìn`;
//   return `${amount.toLocaleString('vi-VN')} đ`;
// }
// function chartNumber(value) {
//   const number = Number(value || 0);
//   return Number.isFinite(number) ? number : 0;
// }

// function countRangeDays(fromDate, toDate) {
//   if (!fromDate || !toDate) return 0;

//   const fromParts = fromDate.split('-').map(Number);
//   const toParts = toDate.split('-').map(Number);

//   if (fromParts.length !== 3 || toParts.length !== 3) return 0;

//   const start = Date.UTC(fromParts[0], fromParts[1] - 1, fromParts[2]);
//   const end = Date.UTC(toParts[0], toParts[1] - 1, toParts[2]);

//   if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
//   return Math.floor((end - start) / 86400000) + 1;
// }

// function resolveGroupBy(filters) {
//   const days = countRangeDays(filters.fromDate, filters.toDate);

//   if (filters.groupBy === 'MONTH') return 'MONTH';

//   if (filters.groupBy === 'DAY') {
//     return days > 366 ? 'MONTH' : 'DAY';
//   }

//   return days > 62 ? 'MONTH' : 'DAY';
// }

// function hasValidDateRange(fromDate, toDate) {
//   return Boolean(fromDate && toDate && toDate >= fromDate);
// }

// function getNiceAxisMaximum(value) {
//   const number = Number(value || 0);
//   if (!Number.isFinite(number) || number <= 0) return 1;

//   const padded = number * 1.15;
//   const magnitude = 10 ** Math.floor(Math.log10(padded));
//   const normalized = padded / magnitude;

//   if (normalized <= 1) return magnitude;
//   if (normalized <= 2) return 2 * magnitude;
//   if (normalized <= 5) return 5 * magnitude;
//   return 10 * magnitude;
// }

// function getNiceBookingMaximum(value) {
//   const number = Math.max(0, Math.ceil(Number(value || 0)));
//   if (number <= 4) return 4;
//   return getNiceAxisMaximum(number);
// }

// function formatChartPeriod(period, groupBy) {
//   if (!period) return '';

//   const parts = String(period).split('-');
//   if (groupBy === 'MONTH' && parts.length >= 2) {
//     return `${parts[1]}/${parts[0]}`;
//   }

//   if (parts.length >= 3) {
//     return `${parts[2]}/${parts[1]}`;
//   }

//   return period;
// }
// function payLabel(value) {
//   const normalized = String(value || '').toUpperCase();
//   if (normalized.includes('VNPAY') || normalized === 'ONLINE') return 'Thanh toán online';
//   if (normalized.includes('PROPERTY') || normalized.includes('CASH') || normalized.includes('ONSITE')) return 'Thanh toán tại homestay';
//   return value || '--';
// }

// function deferLoad(task) {
//   const timer = window.setTimeout(() => { void task(); }, 0);
//   return () => window.clearTimeout(timer);
// }

// /*
//  * Backend doanh thu hiện nhận hostId và homestayId dạng số.
//  * Vì giao diện đang hiển thị mã dạng HMS-006, ta cho phép admin
//  * nhập cả ID thật hoặc mã hiển thị rồi chuyển về ID trước khi gọi API.
//  *
//  * Host/User hỗ trợ:
//  *   6, 006, USR-006, USER-006, HOST-006
//  *
//  * Homestay hỗ trợ:
//  *   7, 007, HMS-007, HOME-007, HOMESTAY-007
//  */
// function parseEntityIdentifier(value, type) {
//   const rawValue = String(value ?? '').trim();

//   if (!rawValue) {
//     return '';
//   }

//   if (/^[0-9]+$/.test(rawValue)) {
//     const id = Number(rawValue);
//     return Number.isInteger(id) && id > 0
//       ? String(id)
//       : null;
//   }

//   const normalized = rawValue
//     .toUpperCase()
//     .replace(/\s+/g, '');

//   const prefixPattern = type === 'HOST'
//     ? '(?:USR|USER|HOST)'
//     : '(?:HMS|HOME|HOMESTAY)';

//   const match = normalized.match(
//     new RegExp(`^${prefixPattern}[-_]?0*([1-9][0-9]*)$`),
//   );

//   return match ? String(Number(match[1])) : null;
// }

// function formatAppliedEntityLabel(rawValue, id, type) {
//   if (!id) return '';

//   const raw = String(rawValue || '').trim();

//   if (!raw || raw === String(id)) {
//     return type === 'HOST'
//       ? `User ID #${id}`
//       : `Homestay ID #${id}`;
//   }

//   return `${raw} → ID #${id}`;
// }

// function generateMaintenanceTransactionReference(item) {
//   const now = new Date();

//   const year = now.getFullYear();

//   const month = String(
//     now.getMonth() + 1,
//   ).padStart(2, '0');

//   const maintenanceFeeId = String(
//     item?.maintenanceFeeId || 0,
//   ).padStart(6, '0');

//   return `DEMO-${year}${month}-${maintenanceFeeId}`;
// }

// export default function AdminRevenue() {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState(tabs[0]);
//   const [filters, setFilters] = useState({ datePreset: 'ALL', fromDate: allFromDate, toDate: today, hostId: '', homestayId: '', keyword: '', commissionStatus: '', paymentMethod: '', groupBy: 'AUTO' });
//   const [appliedEntityFilters, setAppliedEntityFilters] = useState({ hostId: '', homestayId: '', hostInput: '', homestayInput: '' });
//   const [feeFilters, setFeeFilters] = useState({ datePreset: 'ALL', fromDate: allFromDate, toDate: today, hostId: '', paymentStatus: '' });
//   const [appliedFeeHost, setAppliedFeeHost] = useState({ hostId: '', hostInput: '' });
//   const [globalSummary, setGlobalSummary] = useState({});
//   const [summary, setSummary] = useState({});
//   const [maintenanceSummary, setMaintenanceSummary] = useState({});
//   const [chart, setChart] = useState([]);
//   const [topHosts, setTopHosts] = useState([]);
//   const [topHomestays, setTopHomestays] = useState([]);
//   const [commissions, setCommissions] = useState({ content: [], totalPages: 0, totalElements: 0 });
//   const [fees, setFees] = useState({ content: [], totalPages: 0, totalElements: 0 });
//   const [feeSetting, setFeeSetting] = useState(null);
//   const [feeForm, setFeeForm] = useState({ settingName: 'Phí mặc định Cozygo', commissionRate: 10, monthlyMaintenanceFee: 99000, freeTrialDays: 30, gracePeriodDays: 3, effectiveFrom: today });
//   const [commissionPage, setCommissionPage] = useState(1);
//   const [feePage, setFeePage] = useState(1);
//   const [detail, setDetail] = useState(null);
//   const [busy, setBusy] = useState(false);
//   const [headerBusy, setHeaderBusy] = useState(false);
//   const [error, setError] = useState('');

//   const baseParams = useMemo(
//     () => ({
//       fromDate: filters.fromDate,
//       toDate: filters.toDate,
//       hostId: appliedEntityFilters.hostId,
//       homestayId: appliedEntityFilters.homestayId,
//     }),
//     [
//       filters.fromDate,
//       filters.toDate,
//       appliedEntityFilters.hostId,
//       appliedEntityFilters.homestayId,
//     ],
//   );

//   const resolvedGroupBy = useMemo(
//     () => resolveGroupBy(filters),
//     [filters.fromDate, filters.toDate, filters.groupBy],
//   );

//   const loadGlobalSummary = useCallback(async () => {
//     await Promise.resolve();

//     setHeaderBusy(true);

//     try {
//       const data = await adminRevenueService.getSummary({
//         fromDate: allFromDate,
//         toDate: today,
//       });

//       setGlobalSummary(data || {});
//     } catch (err) {
//       setError(err.message || 'Không tải được tổng doanh thu toàn sàn.');
//     } finally {
//       setHeaderBusy(false);
//     }
//   }, []);

//   const loadOverview = useCallback(async () => {
//     await Promise.resolve();

//     if (!hasValidDateRange(baseParams.fromDate, baseParams.toDate)) {
//       setError('Ngày kết thúc không được trước ngày bắt đầu.');
//       return;
//     }

//     setBusy(true);
//     setError('');

//     try {
//       const [s, c, h, homes] = await Promise.all([
//         adminRevenueService.getSummary(baseParams),
//         adminRevenueService.getChart({ ...baseParams, groupBy: resolvedGroupBy }),
//         adminRevenueService.getTopHosts(baseParams),
//         adminRevenueService.getTopHomestays(baseParams),
//       ]);

//       setSummary(s || {});
//       setChart(c || []);
//       setTopHosts(h || []);
//       setTopHomestays(homes || []);
//     } catch (err) {
//       setError(err.message || 'Không tải được thống kê doanh thu.');
//     } finally {
//       setBusy(false);
//     }
//   }, [baseParams, resolvedGroupBy]);

//   const loadCommissions = useCallback(async () => {
//     await Promise.resolve();

//     if (!hasValidDateRange(baseParams.fromDate, baseParams.toDate)) {
//       setError('Ngày kết thúc không được trước ngày bắt đầu.');
//       return;
//     }

//     setBusy(true);
//     setError('');

//     try {
//       const data = await adminRevenueService.getCommissions({
//         ...baseParams,
//         keyword: filters.keyword,
//         commissionStatus: filters.commissionStatus,
//         paymentMethod: filters.paymentMethod,
//         page: commissionPage - 1,
//         size: 10,
//       });
//       setCommissions(data || { content: [], totalPages: 0, totalElements: 0 });
//     } catch (err) {
//       setError(err.message || 'Không tải được hoa hồng booking.');
//     } finally {
//       setBusy(false);
//     }
//   }, [baseParams, commissionPage, filters.commissionStatus, filters.keyword, filters.paymentMethod]);

//   const loadFees = useCallback(async () => {
//     await Promise.resolve();

//     if (!hasValidDateRange(feeFilters.fromDate, feeFilters.toDate)) {
//       setError('Ngày kết thúc không được trước ngày bắt đầu.');
//       return;
//     }

//     setBusy(true);
//     setError('');

//     try {
//       const params = {
//         fromDate: feeFilters.fromDate,
//         toDate: feeFilters.toDate,
//         hostId: appliedFeeHost.hostId,
//         paymentStatus: feeFilters.paymentStatus,
//         page: feePage - 1,
//         size: 10,
//       };

//       const [feeData, feeSummary] = await Promise.all([
//         maintenanceFeeService.list(params),
//         adminRevenueService.getSummary({
//           fromDate: feeFilters.fromDate,
//           toDate: feeFilters.toDate,
//           hostId: appliedFeeHost.hostId,
//         }),
//       ]);

//       setFees(feeData || { content: [], totalPages: 0, totalElements: 0 });
//       setMaintenanceSummary(feeSummary || {});
//     } catch (err) {
//       setError(err.message || 'Không tải được phí duy trì host.');
//     } finally {
//       setBusy(false);
//     }
//   }, [appliedFeeHost.hostId, feeFilters.fromDate, feeFilters.paymentStatus, feeFilters.toDate, feePage]);

//   const loadFeeSetting = useCallback(async () => {
//     await Promise.resolve();
//     setBusy(true); setError('');
//     try {
//       const current = await platformFeeService.getCurrent();
//       setFeeSetting(current || null);
//       if (current) setFeeForm({ settingName: current.settingName || '', commissionRate: current.commissionRate ?? 10, monthlyMaintenanceFee: current.monthlyMaintenanceFee ?? 0, freeTrialDays: current.freeTrialDays ?? 0, gracePeriodDays: current.gracePeriodDays ?? 0, effectiveFrom: current.effectiveFrom || today });
//     } catch (err) { setError(err.message || 'Không tải được cấu hình phí.'); }
//     finally { setBusy(false); }
//   }, []);

//   useEffect(() => deferLoad(loadGlobalSummary), [loadGlobalSummary]);

//   useEffect(() => {
//     if (activeTab !== tabs[0]) return undefined;
//     return deferLoad(loadOverview);
//   }, [activeTab, loadOverview]);

//   useEffect(() => {
//     if (activeTab !== tabs[1]) return undefined;
//     return deferLoad(loadCommissions);
//   }, [activeTab, loadCommissions]);

//   useEffect(() => {
//     if (activeTab !== tabs[2]) return undefined;
//     return deferLoad(loadFees);
//   }, [activeTab, loadFees]);

//   useEffect(() => {
//     if (activeTab !== tabs[3]) return undefined;
//     return deferLoad(loadFeeSetting);
//   }, [activeTab, loadFeeSetting]);

//   const refreshActiveTab = () => (
//     activeTab === tabs[0]
//       ? loadOverview()
//       : activeTab === tabs[1]
//         ? loadCommissions()
//         : activeTab === tabs[2]
//           ? loadFees()
//           : loadFeeSetting()
//   );

//   const refresh = () => Promise.all([
//     loadGlobalSummary(),
//     refreshActiveTab(),
//   ]);

//   const applyEntityFilters = () => {
//     const hostInput = String(filters.hostId || '').trim();
//     const homestayInput = String(filters.homestayId || '').trim();

//     const hostId = parseEntityIdentifier(hostInput, 'HOST');
//     const homestayId = parseEntityIdentifier(homestayInput, 'HOMESTAY');

//     if (hostInput && hostId === null) {
//       setError(
//         'Người dùng/Host không hợp lệ. Hãy nhập ID số hoặc mã dạng USR-006 / USER-006 / HOST-006.',
//       );
//       return;
//     }

//     if (homestayInput && homestayId === null) {
//       setError(
//         'Homestay không hợp lệ. Hãy nhập ID số hoặc mã dạng HMS-006 / HOME-006 / HOMESTAY-006.',
//       );
//       return;
//     }

//     setError('');
//     setCommissionPage(1);

//     setAppliedEntityFilters({
//       hostId,
//       homestayId,
//       hostInput,
//       homestayInput,
//     });
//   };

//   const resetEntityFilters = () => {
//     setError('');
//     setCommissionPage(1);

//     setFilters((current) => ({
//       ...current,
//       hostId: '',
//       homestayId: '',
//     }));

//     setAppliedEntityFilters({
//       hostId: '',
//       homestayId: '',
//       hostInput: '',
//       homestayInput: '',
//     });
//   };

//   const applyFeeHostFilter = () => {
//     const hostInput = String(feeFilters.hostId || '').trim();
//     const hostId = parseEntityIdentifier(hostInput, 'HOST');

//     if (hostInput && hostId === null) {
//       setError(
//         'Người dùng/Host không hợp lệ. Hãy nhập ID số hoặc mã dạng USR-006 / USER-006 / HOST-006.',
//       );
//       return;
//     }

//     setError('');
//     setFeePage(1);
//     setAppliedFeeHost({ hostId, hostInput });
//   };

//   const resetFeeHostFilter = () => {
//     setError('');
//     setFeePage(1);

//     setFeeFilters((current) => ({
//       ...current,
//       hostId: '',
//     }));

//     setAppliedFeeHost({
//       hostId: '',
//       hostInput: '',
//     });
//   };

//   const saveFee = async (event) => {
//     event.preventDefault();
//     const payload = { ...feeForm, commissionRate: Number(feeForm.commissionRate), monthlyMaintenanceFee: Number(feeForm.monthlyMaintenanceFee), freeTrialDays: Number(feeForm.freeTrialDays), gracePeriodDays: Number(feeForm.gracePeriodDays) };
//     if (payload.commissionRate < 0 || payload.commissionRate > 100) return setError('Tỷ lệ hoa hồng phải từ 0 đến 100.');
//     if (payload.monthlyMaintenanceFee < 0 || payload.freeTrialDays < 0 || payload.gracePeriodDays < 0) return setError('Phí và số ngày không được âm.');
//     if (!window.confirm('Lưu cấu hình phí mới? Các booking đã ghi nhận vẫn giữ tỷ lệ cũ.')) return;
//     await platformFeeService.updateCurrent(payload);
//     loadFeeSetting();
//   };

// const markPaid = async (item) => {
//   const suggestedReference =
//     generateMaintenanceTransactionReference(
//       item,
//     );

//   const transactionReference =
//     window.prompt(
//       'Nhập mã giao dịch',
//       suggestedReference,
//     );

//   if (!transactionReference?.trim()) {
//     return;
//   }

//   await maintenanceFeeService.markPaid(
//     item.maintenanceFeeId,
//     {
//       paymentMethod: 'BANK_TRANSFER',

//       transactionReference:
//         transactionReference.trim(),

//       adminNote:
//         'Admin xác nhận đã nhận phí',
//     },
//   );

//   await Promise.all([
//     loadFees(),
//     loadGlobalSummary(),
//   ]);
// };


//   return (
//     <AdminLayout>
//       <div className="space-y-5 text-left text-sm text-gray-700">
// <ManagementHeaderRow backButton={<ManagementBackButton onClick={() => navigate('/admin')} />}>
//   <section className="relative overflow-hidden rounded-3xl border border-[#D8B48A]/15 bg-gradient-to-br from-[#0B131F] via-[#111A28] to-[#0A0F17] text-white shadow-2xl">
    
//     {/* Vệt sáng Gradient chìm hỗ trợ chuyển màu mượt mà */}
//     <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#8A5A44]/15 blur-3xl pointer-events-none" />
//     <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#2C3E2B]/20 blur-3xl pointer-events-none" />
//     <div className="absolute top-1/2 left-1/3 h-64 w-64 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

//     <div className="relative z-10 grid gap-8 p-6 md:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      
//       {/* CỘT TRÁI: TIÊU ĐỀ & THANH TABS */}
//       <div className="space-y-6 text-left">
//         <div className="space-y-2.5">
//           <div className="inline-flex items-center gap-2 rounded-full border border-[#D8B48A]/30 bg-[#D8B48A]/10 px-3.5 py-1 backdrop-blur-md">
//             <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
//             <span className="text-[10px] font-black uppercase tracking-widest text-[#F3E5D8]">
//               Cozygo Financial Management
//             </span>
//           </div>

//           <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#F8F6F1]">
//             Quản Lý Doanh Thu
//           </h1>

//           <p className="max-w-2xl text-xs md:text-sm font-medium leading-relaxed text-[#D2C8BD]">
//             Doanh thu Cozygo được hợp nhất từ hoa hồng booking hoàn thành và phí duy trì dịch vụ host. Hệ thống cập nhật tự động giúp theo dõi sức khỏe tài chính toàn sàn nhanh chóng.
//           </p>
//         </div>

//         {/* THANH TABS CHUYỂN ĐỔI - NÚT ACTIVE MÀU CAM NÂU ĐẤT GIỮ NGUYÊN */}
//         <div className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl shadow-inner">
//           {tabs.map((tab) => {
//             const isActive = activeTab === tab;
//             return (
//               <button
//                 key={tab}
//                 type="button"
//                 onClick={() => setActiveTab(tab)}
//                 className={`rounded-xl px-4 py-2 text-xs font-black transition-all duration-300 ${
//                   isActive
//                     ? 'bg-gradient-to-r from-[#D8B48A] to-[#B66A3C] text-[#1E2E23] shadow-lg shadow-black/30 scale-[1.02]'
//                     : 'text-[#E5DFD5] hover:bg-white/10 hover:text-white'
//                 }`}
//               >
//                 {tab}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* CỘT PHẢI: GIỮ NGUYÊN NỀN VÀ MÀU NÂU ẤM CỦA KHỐI THỐNG KÊ */}
//       <div className="rounded-3xl border border-[#D8B48A]/20 bg-gradient-to-b from-white/10 to-white/5 p-5 md:p-6 backdrop-blur-2xl shadow-2xl space-y-4 text-left">
        
//         {/* TỔNG DOANH THU - CARD NÂU ĐẤT ẤM ÁP GIỮ NGUYÊN */}
//         <div className="relative overflow-hidden rounded-2xl border border-[#D8B48A]/40 bg-gradient-to-r from-[#7A5547] via-[#8A5A44] to-[#5C3D31] p-5 shadow-xl">
//           <div className="relative z-10 flex items-center justify-between gap-4">
//             <div>
//               <p className="text-[10px] font-black uppercase tracking-widest text-[#F3E5D8]">
//                 Tổng doanh thu toàn sàn
//               </p>
//               <p className="mt-1 text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-sm">
//                 {headerBusy ? 'Đang tải...' : money(globalSummary.totalPlatformRevenue)}
//               </p>
//               <p className="mt-1 text-[11px] font-bold text-amber-200/90">
//                 Hoa hồng booking + Phí duy trì đã thanh toán · Không đổi theo tab hoặc bộ lọc
//               </p>
//             </div>

//             <button
//               onClick={refresh}
//               type="button"
//               disabled={headerBusy || busy}
//               className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/15 text-white shadow-md backdrop-blur-md transition-all hover:bg-white/30 hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-60"
//               title="Làm mới dữ liệu toàn trang"
//             >
//               <HiOutlineRefresh className={`text-xl ${headerBusy || busy ? 'animate-spin' : ''}`} />
//             </button>
//           </div>
//         </div>

//         {/* 4 Ô CHỈ SỐ MINI */}
//         <div className="grid grid-cols-2 gap-2.5">
//           <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition hover:bg-white/10">
//             <p className="text-[10px] font-black uppercase tracking-wider text-[#D8B48A]">Hoa hồng</p>
//             <p className="mt-1 text-base font-black text-white">
//               {headerBusy ? '--' : money(globalSummary.commissionRevenue)}
//             </p>
//           </div>

//           <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition hover:bg-white/10">
//             <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Phí duy trì</p>
//             <p className="mt-1 text-base font-black text-white">
//               {headerBusy ? '--' : money(globalSummary.maintenanceRevenue)}
//             </p>
//           </div>

//           <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition hover:bg-white/10">
//             <p className="text-[10px] font-black uppercase tracking-wider text-gray-300">Đơn hoàn thành</p>
//             <p className="mt-1 text-base font-black text-white">
//               {headerBusy ? '--' : count(globalSummary.completedBookingCount)}
//             </p>
//           </div>

//           <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition hover:bg-white/10">
//             <p className="text-[10px] font-black uppercase tracking-wider text-rose-300">Đơn đã hủy</p>
//             <p className="mt-1 text-base font-black text-rose-200">
//               {headerBusy ? '--' : count(globalSummary.cancelledBookingCount)}
//             </p>
//           </div>
//         </div>

//       </div>

//     </div>
//   </section>
// </ManagementHeaderRow>

//         {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-600">{error}</div>}
//         {busy && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-bold text-amber-700">Đang tải dữ liệu...</div>}
//         {activeTab !== tabs[2] && activeTab !== tabs[3] && (
//           <RevenueFilter
//             filters={filters}
//             setFilters={setFilters}
//             appliedEntityFilters={appliedEntityFilters}
//             onApplyEntity={applyEntityFilters}
//             onResetEntity={resetEntityFilters}
//             showAdvanced={activeTab === tabs[1]}
//           />
//         )}
//         {activeTab === tabs[0] && (
//           <Overview
//             summary={summary}
//             chart={chart}
//             topHosts={topHosts}
//             topHomestays={topHomestays}
//             groupBy={filters.groupBy}
//             resolvedGroupBy={resolvedGroupBy}
//             homestayId={appliedEntityFilters.homestayId}
//             setFilters={setFilters}
//           />
//         )}
//         {activeTab === tabs[1] && <Commissions data={commissions} page={commissionPage} setPage={setCommissionPage} onOpen={setDetail} />}
//         {activeTab === tabs[2] && (
//           <Maintenance
//             fees={fees}
//             page={feePage}
//             setPage={setFeePage}
//             filters={feeFilters}
//             setFilters={setFeeFilters}
//             appliedHost={appliedFeeHost}
//             onApplyHost={applyFeeHostFilter}
//             onResetHost={resetFeeHostFilter}
//             onPaid={markPaid}
//             summary={maintenanceSummary}
//           />
//         )}
//         {activeTab === tabs[3] && <FeeSetting current={feeSetting} form={feeForm} setForm={setFeeForm} onSubmit={saveFee} />}
//         {detail && <CommissionModal item={detail} onClose={() => setDetail(null)} />}
//       </div>
//     </AdminLayout>
//   );
// }

// function RevenueFilter({
//   filters,
//   setFilters,
//   appliedEntityFilters,
//   showAdvanced,
//   onApplyEntity,
//   onResetEntity,
// }) {
//   const update = (field, value) => {
//     setFilters((current) => ({
//       ...current,
//       [field]: value,
//       datePreset: ['fromDate', 'toDate'].includes(field) ? 'CUSTOM' : current.datePreset,
//     }));
//   };

//   const selectPreset = (preset) => {
//     if (preset.value === 'CUSTOM') {
//       setFilters((current) => ({ ...current, datePreset: 'CUSTOM' }));
//       return;
//     }

//     setFilters((current) => ({
//       ...current,
//       datePreset: preset.value,
//       fromDate: preset.fromDate || current.fromDate,
//       toDate: preset.toDate || current.toDate,
//     }));
//   };

//   const hasAppliedEntityFilter = Boolean(
//     appliedEntityFilters?.hostId || appliedEntityFilters?.homestayId,
//   );

//   return (
//     <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
//       <div>
//         <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">
//           Khoảng thời gian thống kê
//         </p>
//         <p className="mt-1 text-xs font-semibold text-gray-400">
//           Chọn mốc thời gian hoặc đổi ngày, dữ liệu sẽ tự động cập nhật.
//         </p>

//         <div className="mt-3 flex flex-wrap gap-2">
//           {datePresets.map((preset) => (
//             <button
//               key={preset.value}
//               type="button"
//               onClick={() => selectPreset(preset)}
//               className={[
//                 filters.datePreset === preset.value
//                   ? 'bg-[#2C3E2B] text-white shadow-md'
//                   : 'bg-[#F4F1EA] text-gray-600 hover:bg-white',
//                 'rounded-xl px-4 py-2 text-xs font-black transition',
//               ].join(' ')}
//             >
//               {preset.label}
//             </button>
//           ))}
//         </div>

//         <div className="mt-3 grid max-w-2xl gap-3 md:grid-cols-2">
//           <Field
//             label="Từ ngày"
//             type="date"
//             value={filters.fromDate}
//             onChange={(value) => update('fromDate', value)}
//           />
//           <Field
//             label="Đến ngày"
//             type="date"
//             value={filters.toDate}
//             onChange={(value) => update('toDate', value)}
//           />
//         </div>
//       </div>

//       <div className="mt-5 rounded-2xl border border-[#6E473B]/10 bg-[#F8F6F1] p-4">
//         <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
//           <div>
//             <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#6E473B]">
//               Lọc theo Host hoặc Homestay
//             </p>
//             <p className="mt-1 text-xs font-semibold text-gray-400">
//               Mỗi ô hỗ trợ nhập ID số hoặc mã hiển thị của Người dùng/Host và Homestay.
//             </p>
//           </div>

//           {hasAppliedEntityFilter && (
//             <span className="mt-2 w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700 sm:mt-0">
//               Đang lọc
//               {appliedEntityFilters.hostId
//                 ? ` ${formatAppliedEntityLabel(
//                     appliedEntityFilters.hostInput,
//                     appliedEntityFilters.hostId,
//                     'HOST',
//                   )}`
//                 : ''}
//               {appliedEntityFilters.homestayId
//                 ? ` · ${formatAppliedEntityLabel(
//                     appliedEntityFilters.homestayInput,
//                     appliedEntityFilters.homestayId,
//                     'HOMESTAY',
//                   )}`
//                 : ''}
//             </span>
//           )}
//         </div>

//         <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
//           <Field
//             label="Người dùng / Host"
//             value={filters.hostId}
//             placeholder="VD: 6 hoặc USR-006 / HOST-006"
//             onChange={(value) => update('hostId', value)}
//           />
//           <Field
//             label="Homestay"
//             value={filters.homestayId}
//             placeholder="VD: 7 hoặc HMS-007"
//             onChange={(value) => update('homestayId', value)}
//           />

//           <div className="flex gap-2">
//             <button
//               type="button"
//               onClick={onApplyEntity}
//               className="h-11 rounded-xl bg-[#2C3E2B] px-5 text-xs font-black text-white shadow-md transition hover:bg-[#1f2f20]"
//             >
//               Áp dụng
//             </button>
//             <button
//               type="button"
//               onClick={onResetEntity}
//               className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-xs font-black text-gray-600 shadow-sm transition hover:border-[#D8B48A] hover:text-[#6E473B]"
//             >
//               Đặt lại
//             </button>
//           </div>
//         </div>
//       </div>

//       {showAdvanced && (
//         <div className="mt-4 border-t border-gray-100 pt-4">
//           <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">
//             Bộ lọc danh sách hoa hồng
//           </p>
//           <p className="mt-1 text-xs font-semibold text-gray-400">
//             Phương thức, trạng thái và từ khóa được áp dụng tự động.
//           </p>

//           <div className="mt-3 grid gap-3 md:grid-cols-2">
//             <SelectField
//               label="Phương thức"
//               value={filters.paymentMethod}
//               onChange={(value) => update('paymentMethod', value)}
//               options={paymentOptions}
//             />
//             <SelectField
//               label="Trạng thái"
//               value={filters.commissionStatus}
//               onChange={(value) => update('commissionStatus', value)}
//               options={commissionOptions}
//             />
//           </div>

//           <div className="mt-3 flex h-11 items-center gap-2 rounded-xl border border-gray-200 px-3 shadow-sm">
//             <HiOutlineSearch className="text-gray-400" />
//             <input
//               value={filters.keyword}
//               onChange={(event) => update('keyword', event.target.value)}
//               className="w-full bg-transparent text-xs font-bold outline-none"
//               placeholder="Tìm booking, khách hàng, host, homestay"
//             />
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }

// function Overview({
//   summary,
//   chart,
//   topHosts,
//   topHomestays,
//   groupBy,
//   resolvedGroupBy,
//   homestayId,
//   setFilters,
// }) {
//   const cards = [
//     { title: 'Tổng giá trị booking hoàn thành', value: money(summary.completedBookingValue), Icon: HiOutlineCash, tone: 'blue', note: 'Tổng tiền booking làm cơ sở tính hoa hồng' },
//     { title: 'Booking hoàn thành', value: count(summary.completedBookingCount), Icon: HiOutlineCheckCircle, tone: 'emerald', note: 'Đơn đã ghi nhận doanh thu' },
//     { title: 'Doanh thu hoa hồng', value: money(summary.commissionRevenue), Icon: HiOutlineCash, tone: 'amber', note: 'Phần Cozygo nhận từ booking' },
//     {
//       title: 'Doanh thu phí duy trì',
//       value: money(summary.maintenanceRevenue),
//       Icon: HiOutlineCash,
//       tone: 'violet',
//       note: homestayId ? 'Không phân bổ phí duy trì host cho từng homestay' : 'Chỉ tính host đã thanh toán',
//     },
//     {
//       title: homestayId ? 'Tổng doanh thu của homestay' : 'Tổng doanh thu toàn sàn',
//       value: money(summary.totalPlatformRevenue),
//       Icon: HiOutlineChartBar,
//       tone: 'green',
//       highlight: true,
//       note: homestayId ? 'Chỉ gồm hoa hồng booking của homestay' : 'Hoa hồng + phí duy trì',
//     },
//     { title: 'Booking đã hủy', value: count(summary.cancelledBookingCount), Icon: HiOutlineX, tone: 'rose', note: 'Không cộng vào doanh thu' },
//     { title: 'Host đã đóng phí duy trì', value: count(summary.paidMaintenanceHostCount), Icon: HiOutlineCheckCircle, tone: 'teal', note: homestayId ? 'Không áp dụng khi lọc từng homestay' : 'Số host thanh toán trong kỳ' },
//     { title: 'Hoa hồng trung bình', value: money(summary.averageCommission), Icon: HiOutlineCash, tone: 'orange', note: 'Trung bình mỗi booking' },
//   ];

//   const autoForcedToMonth = groupBy === 'DAY' && resolvedGroupBy === 'MONTH';

//   return (
//     <div className="space-y-5">
//       <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
//         {cards.map((item) => <Metric key={item.title} {...item} />)}
//       </div>

//       <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
//         <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
//           <div>
//             <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B66A3C]">
//               Biểu đồ tổng hợp
//             </p>
//             <h3 className="mt-1 font-serif text-2xl font-bold text-[#2C1E15]">
//               Doanh thu & số đơn theo {resolvedGroupBy === 'MONTH' ? 'tháng' : 'ngày'}
//             </h3>
//             <p className="text-sm font-semibold text-gray-500">
//               Cột xanh biểu thị doanh thu, đường vàng biểu thị số booking hoàn thành trong cùng kỳ.
//             </p>
//             {homestayId && (
//               <p className="mt-1 text-xs font-bold text-amber-700">
//                 Khi lọc Homestay, biểu đồ chỉ tính hoa hồng booking và không cộng phí duy trì của Host.
//               </p>
//             )}
//             {autoForcedToMonth && (
//               <p className="mt-1 text-xs font-bold text-amber-700">
//                 Khoảng thời gian trên 366 ngày được tự động chuyển sang theo tháng để biểu đồ dễ đọc.
//               </p>
//             )}
//           </div>

//           <PrettySelect
//             value={groupBy}
//             onChange={(value) => setFilters((current) => ({ ...current, groupBy: value }))}
//             options={[
//               { value: 'AUTO', label: 'Tự động' },
//               { value: 'DAY', label: 'Theo ngày' },
//               { value: 'MONTH', label: 'Theo tháng' },
//             ]}
//           />
//         </div>

//         <RevenueChart data={chart} groupBy={resolvedGroupBy} />
//       </section>

//       <div className="grid gap-5 lg:grid-cols-2">
//         <TopList title="Top 5 host tạo nhiều doanh thu hoa hồng nhất" items={topHosts} tone="host" />
//         <TopList title="Top 5 homestay tạo nhiều doanh thu hoa hồng nhất" items={topHomestays} tone="home" />
//       </div>
//     </div>
//   );
// }

// function RevenueChart({ data, groupBy }) {
//   if (!data?.length) {
//     return <Empty text="Chưa có dữ liệu biểu đồ trong khoảng thời gian này." />;
//   }

//   const rows = data.map((item) => ({
//     period: item.period,
//     revenue: chartNumber(item.totalPlatformRevenue),
//     bookings: chartNumber(item.completedBookingCount ?? item.bookingCount),
//   }));

//   const rawMaxRevenue = Math.max(...rows.map((item) => item.revenue), 0);
//   const rawMaxBookings = Math.max(...rows.map((item) => item.bookings), 0);
//   const maxRevenue = getNiceAxisMaximum(rawMaxRevenue);
//   const maxBookings = getNiceBookingMaximum(rawMaxBookings);

//   const columnCount = rows.length;
//   const slotWidth = columnCount === 1
//     ? 300
//     : columnCount <= 5
//       ? 170
//       : columnCount <= 12
//         ? 110
//         : columnCount <= 24
//           ? 76
//           : columnCount <= 60
//             ? 56
//             : 42;

//   const height = columnCount <= 3 ? 330 : 360;
//   const padding = { top: 52, right: 96, bottom: 62, left: 96 };
//   const width = Math.max(
//     720,
//     padding.left + padding.right + Math.max(columnCount, 1) * slotWidth,
//   );
//   const plotWidth = width - padding.left - padding.right;
//   const plotHeight = height - padding.top - padding.bottom;
//   const baseline = padding.top + plotHeight;

//   const xFor = (index) => {
//     if (columnCount === 1) return padding.left + plotWidth / 2;
//     return padding.left + (plotWidth / columnCount) * (index + 0.5);
//   };

//   const barWidth = columnCount === 1
//     ? 96
//     : columnCount <= 5
//       ? 66
//       : columnCount <= 12
//         ? 46
//         : columnCount <= 24
//           ? 28
//           : columnCount <= 60
//             ? 22
//             : 16;

//   const points = rows.map((item, index) => {
//     const x = xFor(index);
//     const revenueHeight = item.revenue > 0
//       ? Math.max(6, (item.revenue / maxRevenue) * plotHeight)
//       : 0;
//     const orderY = baseline - (item.bookings / maxBookings) * plotHeight;

//     return {
//       ...item,
//       x,
//       revenueY: baseline - revenueHeight,
//       revenueHeight,
//       orderY,
//     };
//   });

//   const linePath = points
//     .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.orderY}`)
//     .join(' ');

//   const axisTicks = [1, 0.75, 0.5, 0.25, 0];
//   const labelInterval = Math.max(1, Math.ceil(points.length / 12));
//   const hasMultiplePoints = points.length > 1;

//   return (
//     <div className="mt-5 overflow-x-auto rounded-2xl bg-[#F8F6F1] p-4 pb-2">
//       <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs font-black text-gray-600">
//         <span>{groupBy === 'MONTH' ? 'Tăng trưởng theo tháng' : 'Tăng trưởng theo ngày'}</span>
//         <div className="flex flex-wrap gap-2">
//           <Legend color="bg-[#2C3E2B]" label="Doanh thu" />
//           <Legend color="bg-[#FF9800]" label="Số đơn" />
//         </div>
//       </div>

//       <svg
//         viewBox={`0 0 ${width} ${height}`}
//         className="text-[11px] font-black"
//         style={{ minWidth: `${width}px`, width: '100%' }}
//       >
//         <defs>
//           <linearGradient id="adminRevenueLineFill" x1="0" x2="0" y1="0" y2="1">
//             <stop offset="0%" stopColor="#FF9800" stopOpacity="0.24" />
//             <stop offset="100%" stopColor="#FF9800" stopOpacity="0.02" />
//           </linearGradient>
//           <linearGradient id="adminRevenueBarFill" x1="0" x2="0" y1="0" y2="1">
//             <stop offset="0%" stopColor="#315239" />
//             <stop offset="100%" stopColor="#1F3525" />
//           </linearGradient>
//         </defs>

//         {axisTicks.map((tick) => {
//           const y = padding.top + plotHeight * (1 - tick);
//           return (
//             <g key={tick}>
//               <line
//                 x1={padding.left}
//                 x2={width - padding.right}
//                 y1={y}
//                 y2={y}
//                 stroke="#E5E0D8"
//                 strokeDasharray="5 6"
//               />
//               <text
//                 x={padding.left - 14}
//                 y={y + 4}
//                 textAnchor="end"
//                 fill="#9CA3AF"
//               >
//                 {compactMoney(maxRevenue * tick)}
//               </text>
//               <text
//                 x={width - padding.right + 14}
//                 y={y + 4}
//                 textAnchor="start"
//                 fill="#B66A3C"
//               >
//                 {Math.round(maxBookings * tick)} đơn
//               </text>
//             </g>
//           );
//         })}

//         <text x={padding.left} y={24} fill="#596579">Doanh thu</text>
//         <text x={width - padding.right} y={24} textAnchor="end" fill="#B66A3C">
//           Số booking
//         </text>

//         {points.map((point) => (
//           <g key={`bar-${point.period}`}>
//             <rect
//               x={point.x - barWidth / 2}
//               y={point.revenueY}
//               width={barWidth}
//               height={point.revenueHeight}
//               rx={Math.min(12, barWidth / 3)}
//               fill="url(#adminRevenueBarFill)"
//             >
//               <title>
//                 {point.period}: {money(point.revenue)} · {count(point.bookings)} đơn
//               </title>
//             </rect>
//           </g>
//         ))}

//         {hasMultiplePoints && (
//           <>
//             <path
//               d={`${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`}
//               fill="url(#adminRevenueLineFill)"
//             />
//             <path
//               d={linePath}
//               fill="none"
//               stroke="#FF9800"
//               strokeWidth="4"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </>
//         )}

//         {points.map((point) => (
//           <g key={`point-${point.period}`}>
//             <circle
//               cx={point.x}
//               cy={point.orderY}
//               r="7"
//               fill="#FF9800"
//               stroke="white"
//               strokeWidth="4"
//             />
//             <title>{point.period}: {count(point.bookings)} đơn</title>
//           </g>
//         ))}

//         {points.length === 1 && (
//           <>
//             <text
//               x={points[0].x}
//               y={Math.max(38, points[0].revenueY - 12)}
//               textAnchor="middle"
//               fill="#2C3E2B"
//             >
//               {compactMoney(points[0].revenue)}
//             </text>
//             <text
//               x={points[0].x}
//               y={Math.max(48, points[0].orderY - 26)}
//               textAnchor="middle"
//               fill="#B66A3C"
//             >
//               {count(points[0].bookings)} đơn
//             </text>
//           </>
//         )}

//         {points.map((point, index) => {
//           const shouldShow = index % labelInterval === 0 || index === points.length - 1;
//           if (!shouldShow) return null;

//           return (
//             <text
//               key={`label-${point.period}`}
//               x={point.x}
//               y={height - 20}
//               textAnchor="middle"
//               fill="#9CA3AF"
//             >
//               {formatChartPeriod(point.period, groupBy)}
//             </text>
//           );
//         })}
//       </svg>
//     </div>
//   );
// }

// function Commissions({ data, page, setPage, onOpen }) {
//   const items = data?.content || [];
//   if (!items.length) return <Empty text="Chưa có hoa hồng booking trong bộ lọc này." />;
//   return <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left text-xs"><thead className="bg-gray-50 text-gray-500"><tr>{['Mã booking', 'Khách hàng', 'Host', 'Homestay', 'Phương thức thanh toán', 'Ngày hoàn thành', 'Giá trị booking', 'Tỷ lệ hoa hồng', 'Doanh thu hoa hồng', 'Trạng thái'].map((head) => <th key={head} className="px-4 py-3 font-black uppercase">{head}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{items.map((item) => <tr key={item.commissionId} onClick={() => onOpen(item)} className="cursor-pointer font-semibold text-gray-700 hover:bg-[#F8F6F1]"><td className="px-4 py-3 font-mono font-black">{item.bookingCode}</td><td className="px-4 py-3">{item.customerName || '--'}</td><td className="px-4 py-3">{item.hostName || '--'}</td><td className="px-4 py-3">{item.homestayName || '--'}</td><td className="px-4 py-3">{payLabel(item.paymentMethod || item.paymentStatus)}</td><td className="px-4 py-3">{formatDate(item.completedAt || item.recognizedAt || item.calculatedAt)}</td><td className="px-4 py-3">{money(item.bookingAmount)}</td><td className="px-4 py-3">{item.commissionRate || 0}%</td><td className="px-4 py-3 font-black text-[#B66A3C]">{money(item.commissionAmount)}</td><td className="px-4 py-3"><Badge value={item.commissionStatus} labels={commissionLabels} /></td></tr>)}</tbody></table></div><Pagination currentPage={page} totalPages={data?.totalPages || 0} setCurrentPage={setPage} totalItems={data?.totalElements || 0} indexOfFirstItem={(page - 1) * 10} indexOfLastItem={(page - 1) * 10 + items.length} itemName="hoa hồng" /></section>;
// }

// function Maintenance({
//   fees,
//   page,
//   setPage,
//   filters,
//   setFilters,
//   appliedHost,
//   onApplyHost,
//   onResetHost,
//   onPaid,
//   summary,
// }) {
//   const items = fees?.content || [];

//   const update = (field, value) => {
//     setFilters((current) => ({
//       ...current,
//       [field]: value,
//       datePreset: ['fromDate', 'toDate'].includes(field) ? 'CUSTOM' : current.datePreset,
//     }));
//   };

//   const selectPreset = (preset) => {
//     if (preset.value === 'CUSTOM') {
//       setFilters((current) => ({ ...current, datePreset: 'CUSTOM' }));
//       return;
//     }

//     setFilters((current) => ({
//       ...current,
//       datePreset: preset.value,
//       fromDate: preset.fromDate || current.fromDate,
//       toDate: preset.toDate || current.toDate,
//     }));
//     setPage(1);
//   };

//   return (
//     <div className="space-y-5">
//       <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
//         <div>
//           <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">
//             Khoảng thời gian và trạng thái
//           </p>
//           <p className="mt-1 text-xs font-semibold text-gray-400">
//             Ngày và trạng thái được áp dụng tự động.
//           </p>

//           <div className="mt-3 flex flex-wrap gap-2">
//             {datePresets.map((preset) => (
//               <button
//                 key={preset.value}
//                 type="button"
//                 onClick={() => selectPreset(preset)}
//                 className={[
//                   filters.datePreset === preset.value
//                     ? 'bg-[#2C3E2B] text-white shadow-md'
//                     : 'bg-[#F4F1EA] text-gray-600 hover:bg-white',
//                   'rounded-xl px-4 py-2 text-xs font-black transition',
//                 ].join(' ')}
//               >
//                 {preset.label}
//               </button>
//             ))}
//           </div>

//           <div className="mt-3 grid gap-3 md:grid-cols-3">
//             <Field
//               label="Từ ngày"
//               type="date"
//               value={filters.fromDate}
//               onChange={(value) => update('fromDate', value)}
//             />
//             <Field
//               label="Đến ngày"
//               type="date"
//               value={filters.toDate}
//               onChange={(value) => update('toDate', value)}
//             />
//             <SelectField
//               label="Trạng thái"
//               value={filters.paymentStatus}
//               onChange={(value) => update('paymentStatus', value)}
//               options={maintenanceOptions}
//             />
//           </div>
//         </div>

//         <div className="mt-5 rounded-2xl border border-[#6E473B]/10 bg-[#F8F6F1] p-4">
//           <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
//             <div>
//               <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#6E473B]">
//                 Lọc theo Host
//               </p>
//               <p className="mt-1 text-xs font-semibold text-gray-400">
//                 Có thể nhập ID người dùng hoặc mã User/Host; nút Áp dụng và Đặt lại chỉ tác động đến bộ lọc này.
//               </p>
//             </div>
//             {appliedHost?.hostId && (
//               <span className="mt-2 w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700 sm:mt-0">
//                 Đang lọc {formatAppliedEntityLabel(
//                   appliedHost.hostInput,
//                   appliedHost.hostId,
//                   'HOST',
//                 )}
//               </span>
//             )}
//           </div>

//           <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
//             <Field
//               label="Người dùng / Host"
//               value={filters.hostId}
//               placeholder="VD: 6 hoặc USR-006 / HOST-006"
//               onChange={(value) => update('hostId', value)}
//             />
//             <div className="flex gap-2">
//               <button
//                 type="button"
//                 onClick={onApplyHost}
//                 className="h-11 rounded-xl bg-[#2C3E2B] px-5 text-xs font-black text-white shadow-md"
//               >
//                 Áp dụng
//               </button>
//               <button
//                 type="button"
//                 onClick={onResetHost}
//                 className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-xs font-black text-gray-600 shadow-sm"
//               >
//                 Đặt lại
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       <div className="grid gap-3 md:grid-cols-5">
//         <Metric title="Tổng phí cần thu" value={money(Number(summary.pendingMaintenanceAmount || 0) + Number(summary.overdueMaintenanceAmount || 0))} Icon={HiOutlineCash} />
//         <Metric title="Đã thanh toán" value={money(summary.maintenanceRevenue)} Icon={HiOutlineCheckCircle} highlight />
//         <Metric title="Chưa thanh toán" value={money(summary.pendingMaintenanceAmount)} Icon={HiOutlineCash} />
//         <Metric title="Quá hạn" value={money(summary.overdueMaintenanceAmount)} Icon={HiOutlineX} />
//         <Metric title="Host đã thanh toán" value={count(summary.paidMaintenanceHostCount)} Icon={HiOutlineCheckCircle} />
//       </div>

//       {!items.length ? (
//         <Empty text="Chưa có phí duy trì trong bộ lọc này." />
//       ) : (
//         <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1180px] text-left text-xs">
//               <thead className="bg-gray-50 text-gray-500">
//                 <tr>
//                   {['Host', 'Tháng áp dụng', 'Khoảng thời gian', 'Số tiền', 'Hạn thanh toán', 'Ngày thanh toán', 'Trạng thái', 'Phương thức', 'Mã giao dịch', 'Thao tác'].map((head) => (
//                     <th key={head} className="px-4 py-3 font-black uppercase">{head}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {items.map((item) => (
//                   <tr key={item.maintenanceFeeId} className="font-semibold text-gray-700">
//                     <td className="px-4 py-3">{item.hostName || `Host #${item.hostId}`}</td>
//                     <td className="px-4 py-3">{item.billingMonth}/{item.billingYear}</td>
//                     <td className="px-4 py-3">{formatDate(item.periodStart)} - {formatDate(item.periodEnd)}</td>
//                     <td className="px-4 py-3 font-black text-[#B66A3C]">{money(item.feeAmount)}</td>
//                     <td className="px-4 py-3">{formatDate(item.dueDate)}</td>
//                     <td className="px-4 py-3">{formatDate(item.paidAt)}</td>
//                     <td className="px-4 py-3"><Badge value={item.paymentStatus} labels={maintenanceLabels} /></td>
//                     <td className="px-4 py-3">{item.paymentMethod || '--'}</td>
//                     <td className="px-4 py-3 font-mono">{item.transactionReference || '--'}</td>
//                     <td className="px-4 py-3">
//                       {['PENDING', 'OVERDUE'].includes(item.paymentStatus) ? (
//                         <button
//                           onClick={() => onPaid(item)}
//                           className="rounded-lg bg-[#2C3E2B] px-3 py-2 font-black text-white"
//                           type="button"
//                         >
//                           Xác nhận
//                         </button>
//                       ) : (
//                         <span className="text-[11px] font-black text-gray-400">--</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <Pagination
//             currentPage={page}
//             totalPages={fees?.totalPages || 0}
//             setCurrentPage={setPage}
//             totalItems={fees?.totalElements || 0}
//             indexOfFirstItem={(page - 1) * 10}
//             indexOfLastItem={(page - 1) * 10 + items.length}
//             itemName="phí duy trì"
//           />
//         </section>
//       )}
//     </div>
//   );
// }

// function FeeSetting({ current, form, setForm, onSubmit }) {
//   const update = (field, value) => setForm((state) => ({ ...state, [field]: value }));
//   return <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-700">Thay đổi tỷ lệ chỉ áp dụng theo cấu hình có hiệu lực. Các booking đã ghi nhận vẫn giữ tỷ lệ hoa hồng đã chốt.</div>{current && <div className="mt-4 grid gap-3 md:grid-cols-4"><Metric title="Hoa hồng hiện tại" value={`${current.commissionRate || 0}%`} Icon={HiOutlineCash} /><Metric title="Phí duy trì tháng" value={money(current.monthlyMaintenanceFee)} Icon={HiOutlineCash} /><Metric title="Dùng thử" value={`${current.freeTrialDays || 0} ngày`} Icon={HiOutlineCheckCircle} /><Metric title="Gia hạn" value={`${current.gracePeriodDays || 0} ngày`} Icon={HiOutlineRefresh} /></div>}<form onSubmit={onSubmit} className="mt-5 grid gap-3 md:grid-cols-3"><Field label="Tên cấu hình" value={form.settingName} onChange={(value) => update('settingName', value)} /><Field label="Tỷ lệ hoa hồng (%)" type="number" value={form.commissionRate} onChange={(value) => update('commissionRate', value)} /><Field label="Phí duy trì tháng" type="number" value={form.monthlyMaintenanceFee} onChange={(value) => update('monthlyMaintenanceFee', value)} /><Field label="Số ngày dùng thử" type="number" value={form.freeTrialDays} onChange={(value) => update('freeTrialDays', value)} /><Field label="Số ngày gia hạn" type="number" value={form.gracePeriodDays} onChange={(value) => update('gracePeriodDays', value)} /><Field label="Ngày bắt đầu áp dụng" type="date" value={form.effectiveFrom} onChange={(value) => update('effectiveFrom', value)} /><button className="h-11 rounded-xl bg-[#2C3E2B] text-xs font-black text-white shadow-md md:col-span-3" type="submit">Lưu cấu hình phí</button></form></section>;
// }

// function CommissionModal({ item, onClose }) {
//   return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><section className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3"><h3 className="font-serif text-xl font-bold text-[#2C1E15]">Chi tiết hoa hồng booking</h3><button onClick={onClose} className="rounded-full bg-gray-100 p-2 text-gray-600" type="button"><HiOutlineX /></button></div><div className="space-y-4"><div className="rounded-xl bg-[#F8F6F1] p-4"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#B66A3C]">Công thức doanh thu Cozygo</p><p className="mt-2 text-xl font-black text-[#2C1E15]">{money(item.bookingAmount)} × {item.commissionRate || 0}% = {money(item.commissionAmount)}</p></div><div className="grid gap-3 md:grid-cols-2">{[['Mã booking', item.bookingCode], ['Khách hàng', item.customerName], ['Host', item.hostName], ['Homestay', item.homestayName], ['Phương thức', payLabel(item.paymentMethod || item.paymentStatus)], ['Trạng thái booking', item.bookingStatus], ['Ngày hoàn thành', formatDate(item.completedAt || item.recognizedAt || item.calculatedAt)], ['Trạng thái hoa hồng', commissionLabels[item.commissionStatus] || item.commissionStatus]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#F8F6F1] p-3"><p className="text-[11px] font-black uppercase text-gray-400">{label}</p><p className="mt-1 font-bold text-gray-800">{value || '--'}</p></div>)}</div></div></section></div>;
// }


// const metricTones = {
//   emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
//   blue: 'border-blue-100 bg-blue-50 text-blue-700',
//   amber: 'border-amber-100 bg-amber-50 text-amber-700',
//   violet: 'border-violet-100 bg-violet-50 text-violet-700',
//   green: 'border-green-100 bg-green-50 text-green-700',
//   rose: 'border-rose-100 bg-rose-50 text-rose-700',
//   teal: 'border-teal-100 bg-teal-50 text-teal-700',
//   orange: 'border-orange-100 bg-orange-50 text-orange-700',
// };

// function Metric({ title, value, Icon, highlight, tone = 'emerald', note }) {
//   return (
//     <div className={(highlight ? 'border-[#2C3E2B] bg-[#F8F6F1]' : 'border-gray-200 bg-white') + ' rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md'}>
//       <div className="flex items-start justify-between gap-3">
//         <div className="min-w-0">
//           <p className="text-[11px] font-black uppercase text-gray-500">{title}</p>
//           <p className={(highlight ? 'text-[#2C3E2B]' : 'text-[#2C1E15]') + ' mt-2 text-2xl font-black'}>{value}</p>
//         </div>
//         <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${metricTones[tone] || metricTones.emerald}`}><Icon /></span>
//       </div>
//       {note && <p className="mt-2 text-xs font-semibold text-gray-400">{note}</p>}
//     </div>
//   );
// }

// function TopList({ title, items, tone = 'host' }) {
//   const badgeClass = tone === 'host' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100';
//   return <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"><h3 className="font-serif text-xl font-bold text-[#2C1E15]">{title}</h3><div className="mt-4 space-y-2">{items?.length ? items.map((item, index) => <div key={item.id || item.name} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-[#F8F6F1] p-3 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"><div className="flex min-w-0 items-center gap-3"><span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-black ${badgeClass}`}>#{index + 1}</span><div className="min-w-0"><p className="truncate font-black text-gray-800">{item.name}</p><p className="text-xs font-semibold text-gray-500">{item.subLabel || '--'} · {item.bookingCount || 0} booking</p></div></div><p className="shrink-0 font-black text-[#2C3E2B]">{money(item.commissionRevenue)}</p></div>) : <Empty text="Chưa có dữ liệu." />}</div></section>;
// }

// function Field({
//   label,
//   value,
//   onChange,
//   type = 'text',
//   placeholder = '',
// }) {
//   if (type === 'date') {
//     return (
//       <CalendarDateField
//         label={label}
//         value={value}
//         onChange={onChange}
//       />
//     );
//   }

//   return (
//     <label className="space-y-1">
//       <span className="text-[11px] font-black uppercase text-gray-500">
//         {label}
//       </span>
//       <input
//         type={type}
//         value={value ?? ''}
//         placeholder={placeholder}
//         onChange={(event) => onChange(event.target.value)}
//         autoComplete="off"
//         className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold outline-none shadow-sm transition placeholder:font-semibold placeholder:text-gray-300 hover:border-[#D8B48A] focus:border-[#7A5547] focus:ring-2 focus:ring-[#7A5547]/10"
//       />
//     </label>
//   );
// }

// function SelectField({ label, value, onChange, options }) {
//   return <label className="space-y-1"><span className="text-[11px] font-black uppercase text-gray-500">{label}</span><PrettySelect value={value ?? ''} onChange={onChange} options={options} className="w-full" minWidth="min-w-full" /></label>;
// }

// function Badge({ value, labels }) {
//   const normalized = value || '--';
//   const tone = normalized === 'RECOGNIZED' || normalized === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : normalized === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200';
//   return <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${tone}`}>{labels?.[normalized] || normalized}</span>;
// }


// function Legend({ color, label }) {
//   return <span className="inline-flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${color}`} />{label}</span>;
// }

// function Empty({ text }) {
//   return <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm font-bold text-gray-400">{text}</div>;
// }
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCash, HiOutlineChartBar, HiOutlineCheckCircle, HiOutlineRefresh, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import AdminLayout from '../../layouts/AdminLayout';
import ManagementBackButton from '../../components/common/ManagementBackButton';
import ManagementHeaderRow from '../../components/common/ManagementHeaderRow';
import Pagination from '../../components/common/Pagination';
import PrettySelect from '../../components/common/PrettySelect';
import CalendarDateField from '../../components/common/CalendarDateField';
import { adminRevenueService } from '../../services/adminRevenueService';
import { maintenanceFeeService } from '../../services/maintenanceFeeService';
import { platformFeeService } from '../../services/platformFeeService';
import { formatCurrency, formatDate } from '../../utils/formatters';

const now = new Date();

function asInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
const startOfMonth = asInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
const today = asInputDate(now);
const allFromDate = '1970-01-01';
const daysAgo = (days) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return asInputDate(date);
};
const datePresets = [
  { value: 'ALL', label: 'Tất cả', fromDate: allFromDate, toDate: today },
  { value: 'TODAY', label: 'Hôm nay', fromDate: today, toDate: today },
  { value: 'THIS_MONTH', label: 'Tháng này', fromDate: startOfMonth, toDate: today },
  { value: 'LAST_30_DAYS', label: '30 ngày', fromDate: daysAgo(29), toDate: today },
  { value: 'LAST_90_DAYS', label: '90 ngày', fromDate: daysAgo(89), toDate: today },
  { value: 'CUSTOM', label: 'Tùy chỉnh ngày' },
];
const tabs = ['Tổng quan', 'Hoa hồng booking', 'Phí duy trì host', 'Cấu hình phí'];
const commissionOptions = [{ value: '', label: 'Tất cả' }, { value: 'PENDING', label: 'Chưa hoàn thành' }, { value: 'RECOGNIZED', label: 'Đã ghi nhận doanh thu' }, { value: 'CANCELLED', label: 'Không tính doanh thu' }];
const paymentOptions = [{ value: '', label: 'Tất cả' }, { value: 'VNPAY', label: 'Thanh toán online' }, { value: 'PAY_AT_PROPERTY', label: 'Thanh toán tại homestay' }];
const maintenanceOptions = [{ value: '', label: 'Tất cả' }, { value: 'PENDING', label: 'Chưa thanh toán' }, { value: 'PAID', label: 'Đã thanh toán' }, { value: 'OVERDUE', label: 'Quá hạn' }, { value: 'WAIVED', label: 'Được miễn' }, { value: 'CANCELLED', label: 'Đã hủy' }];
const commissionLabels = { PENDING: 'Chưa hoàn thành', RECOGNIZED: 'Đã ghi nhận doanh thu', CANCELLED: 'Không tính doanh thu' };
const maintenanceLabels = { PENDING: 'Chưa thanh toán', PAID: 'Đã thanh toán', OVERDUE: 'Quá hạn', WAIVED: 'Được miễn', CANCELLED: 'Đã hủy' };
function money(value) { return formatCurrency(value || 0); }
function count(value) { return Number(value || 0).toLocaleString('vi-VN'); }
function compactMoney(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount === 0) return '0 đ';
  if (amount >= 1000000000) return `${(amount / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`;
  if (amount >= 1000000) return `${(amount / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
  if (amount >= 1000) return `${(amount / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} nghìn`;
  return `${amount.toLocaleString('vi-VN')} đ`;
}
function chartNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function countRangeDays(fromDate, toDate) {
  if (!fromDate || !toDate) return 0;

  const fromParts = fromDate.split('-').map(Number);
  const toParts = toDate.split('-').map(Number);

  if (fromParts.length !== 3 || toParts.length !== 3) return 0;

  const start = Date.UTC(fromParts[0], fromParts[1] - 1, fromParts[2]);
  const end = Date.UTC(toParts[0], toParts[1] - 1, toParts[2]);

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
  return Math.floor((end - start) / 86400000) + 1;
}

function resolveGroupBy(filters) {
  const days = countRangeDays(filters.fromDate, filters.toDate);

  if (filters.groupBy === 'MONTH') return 'MONTH';

  if (filters.groupBy === 'DAY') {
    return days > 366 ? 'MONTH' : 'DAY';
  }

  return days > 62 ? 'MONTH' : 'DAY';
}

function hasValidDateRange(fromDate, toDate) {
  return Boolean(fromDate && toDate && toDate >= fromDate);
}

function getNiceAxisMaximum(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return 1;

  const padded = number * 1.15;
  const magnitude = 10 ** Math.floor(Math.log10(padded));
  const normalized = padded / magnitude;

  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

function getNiceBookingMaximum(value) {
  const number = Math.max(0, Math.ceil(Number(value || 0)));
  if (number <= 4) return 4;
  return getNiceAxisMaximum(number);
}

function formatChartPeriod(period, groupBy) {
  if (!period) return '';

  const parts = String(period).split('-');
  if (groupBy === 'MONTH' && parts.length >= 2) {
    return `${parts[1]}/${parts[0]}`;
  }

  if (parts.length >= 3) {
    return `${parts[2]}/${parts[1]}`;
  }

  return period;
}
function payLabel(value) {
  const normalized = String(value || '').toUpperCase();
  if (normalized.includes('VNPAY') || normalized === 'ONLINE') return 'Thanh toán online';
  if (normalized.includes('PROPERTY') || normalized.includes('CASH') || normalized.includes('ONSITE')) return 'Thanh toán tại homestay';
  return value || '--';
}

function deferLoad(task) {
  const timer = window.setTimeout(() => { void task(); }, 0);
  return () => window.clearTimeout(timer);
}

/*
 * Backend doanh thu hiện nhận hostId và homestayId dạng số.
 * Vì giao diện đang hiển thị mã dạng HMS-006, ta cho phép admin
 * nhập cả ID thật hoặc mã hiển thị rồi chuyển về ID trước khi gọi API.
 *
 * Host/User hỗ trợ:
 *   6, 006, USR-006, USER-006, HOST-006
 *
 * Homestay hỗ trợ:
 *   7, 007, HMS-007, HOME-007, HOMESTAY-007
 */
function parseEntityIdentifier(value, type) {
  const rawValue = String(value ?? '').trim();

  if (!rawValue) {
    return '';
  }

  if (/^[0-9]+$/.test(rawValue)) {
    const id = Number(rawValue);
    return Number.isInteger(id) && id > 0
      ? String(id)
      : null;
  }

  const normalized = rawValue
    .toUpperCase()
    .replace(/\s+/g, '');

  const prefixPattern = type === 'HOST'
    ? '(?:USR|USER|HOST)'
    : '(?:HMS|HOME|HOMESTAY)';

  const match = normalized.match(
    new RegExp(`^${prefixPattern}[-_]?0*([1-9][0-9]*)$`),
  );

  return match ? String(Number(match[1])) : null;
}

// function formatAppliedEntityLabel(rawValue, id, type) {
//   if (!id) return '';

//   const raw = String(rawValue || '').trim();

//   if (!raw || raw === String(id)) {
//     return type === 'HOST'
//       ? `User ID #${id}`
//       : `Homestay ID #${id}`;
//   }

//   return `${raw} → ID #${id}`;
// }

function formatHostCode(id) {
  return id ? `USR-${Number(id)}` : '';
}

function formatHomestayCode(id) {
  return id
    ? `HMS-${String(Number(id)).padStart(3, '0')}`
    : '';
}

function generateMaintenanceTransactionReference(item) {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, '0');

  const maintenanceFeeId = String(
    item?.maintenanceFeeId || 0,
  ).padStart(6, '0');

  return `DEMO-${year}${month}-${maintenanceFeeId}`;
}

export default function AdminRevenue() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [filters, setFilters] = useState({ datePreset: 'ALL', fromDate: allFromDate, toDate: today, hostId: '', homestayId: '', keyword: '', commissionStatus: '', paymentMethod: '', groupBy: 'AUTO' });
  const [appliedEntityFilters, setAppliedEntityFilters] = useState({ hostId: '', homestayId: '', hostInput: '', homestayInput: '', hostName: '', homestayName: '' });
  const [feeFilters, setFeeFilters] = useState({ datePreset: 'ALL', fromDate: allFromDate, toDate: today, hostId: '', paymentStatus: '' });
  const [appliedFeeHost, setAppliedFeeHost] = useState({ hostId: '', hostInput: '', hostName: '' });
  const [globalSummary, setGlobalSummary] = useState({});
  const [summary, setSummary] = useState({});
  const [maintenanceSummary, setMaintenanceSummary] = useState({});
  const [chart, setChart] = useState([]);
  const [topHosts, setTopHosts] = useState([]);
  const [topHomestays, setTopHomestays] = useState([]);
  const [commissions, setCommissions] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [fees, setFees] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [feeSetting, setFeeSetting] = useState(null);
  const [feeForm, setFeeForm] = useState({ settingName: 'Phí mặc định Cozygo', commissionRate: 10, monthlyMaintenanceFee: 99000, freeTrialDays: 30, gracePeriodDays: 3, effectiveFrom: today });
  const [commissionPage, setCommissionPage] = useState(1);
  const [feePage, setFeePage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [headerBusy, setHeaderBusy] = useState(false);
  const [error, setError] = useState('');

  const baseParams = useMemo(
    () => ({
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      hostId: appliedEntityFilters.hostId,
      homestayId: appliedEntityFilters.homestayId,
    }),
    [
      filters.fromDate,
      filters.toDate,
      appliedEntityFilters.hostId,
      appliedEntityFilters.homestayId,
    ],
  );

  const resolvedGroupBy = useMemo(
    () => resolveGroupBy(filters),
    [filters.fromDate, filters.toDate, filters.groupBy],
  );

  const loadGlobalSummary = useCallback(async () => {
    await Promise.resolve();

    setHeaderBusy(true);

    try {
      const data = await adminRevenueService.getSummary({
        fromDate: allFromDate,
        toDate: today,
      });

      setGlobalSummary(data || {});
    } catch (err) {
      setError(err.message || 'Không tải được tổng doanh thu toàn sàn.');
    } finally {
      setHeaderBusy(false);
    }
  }, []);

  const loadOverview = useCallback(async () => {
    await Promise.resolve();

    if (!hasValidDateRange(baseParams.fromDate, baseParams.toDate)) {
      setError('Ngày kết thúc không được trước ngày bắt đầu.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const [s, c, h, homes] = await Promise.all([
        adminRevenueService.getSummary(baseParams),
        adminRevenueService.getChart({ ...baseParams, groupBy: resolvedGroupBy }),
        adminRevenueService.getTopHosts(baseParams),
        adminRevenueService.getTopHomestays(baseParams),
      ]);

      setSummary(s || {});
      setChart(c || []);
      setTopHosts(h || []);
      setTopHomestays(homes || []);

      setAppliedEntityFilters((current) => {
        const matchedHost = current.hostId
          ? (h || []).find(
              (item) => String(item.id) === String(current.hostId),
            )
          : null;

        const matchedHomestay = current.homestayId
          ? (homes || []).find(
              (item) => String(item.id) === String(current.homestayId),
            )
          : null;

        return {
          ...current,
          hostName: current.hostId
            ? matchedHost?.name || current.hostName
            : '',
          homestayName: current.homestayId
            ? matchedHomestay?.name || current.homestayName
            : '',
        };
      });
    } catch (err) {
      setError(err.message || 'Không tải được thống kê doanh thu.');
    } finally {
      setBusy(false);
    }
  }, [baseParams, resolvedGroupBy]);

  const loadCommissions = useCallback(async () => {
    await Promise.resolve();

    if (!hasValidDateRange(baseParams.fromDate, baseParams.toDate)) {
      setError('Ngày kết thúc không được trước ngày bắt đầu.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const data = await adminRevenueService.getCommissions({
        ...baseParams,
        keyword: filters.keyword,
        commissionStatus: filters.commissionStatus,
        paymentMethod: filters.paymentMethod,
        page: commissionPage - 1,
        size: 10,
      });
      const safeData =
        data || {
          content: [],
          totalPages: 0,
          totalElements: 0,
        };

      setCommissions(safeData);

      const firstCommission = safeData.content?.[0];

      if (firstCommission) {
        setAppliedEntityFilters((current) => ({
          ...current,
          hostName: current.hostId
            ? firstCommission.hostName || current.hostName
            : '',
          homestayName: current.homestayId
            ? firstCommission.homestayName || current.homestayName
            : '',
        }));
      }
    } catch (err) {
      setError(err.message || 'Không tải được hoa hồng booking.');
    } finally {
      setBusy(false);
    }
  }, [baseParams, commissionPage, filters.commissionStatus, filters.keyword, filters.paymentMethod]);

  const loadFees = useCallback(async () => {
    await Promise.resolve();

    if (!hasValidDateRange(feeFilters.fromDate, feeFilters.toDate)) {
      setError('Ngày kết thúc không được trước ngày bắt đầu.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const params = {
        fromDate: feeFilters.fromDate,
        toDate: feeFilters.toDate,
        hostId: appliedFeeHost.hostId,
        paymentStatus: feeFilters.paymentStatus,
        page: feePage - 1,
        size: 10,
      };

      const [feeData, feeSummary] = await Promise.all([
        maintenanceFeeService.list(params),
        adminRevenueService.getSummary({
          fromDate: feeFilters.fromDate,
          toDate: feeFilters.toDate,
          hostId: appliedFeeHost.hostId,
        }),
      ]);

      const safeFeeData =
        feeData || {
          content: [],
          totalPages: 0,
          totalElements: 0,
        };

      setFees(safeFeeData);
      setMaintenanceSummary(feeSummary || {});

      const firstFee = safeFeeData.content?.[0];

      if (firstFee && appliedFeeHost.hostId) {
        setAppliedFeeHost((current) => ({
          ...current,
          hostName:
            firstFee.hostName ||
            current.hostName,
        }));
      }
    } catch (err) {
      setError(err.message || 'Không tải được phí duy trì host.');
    } finally {
      setBusy(false);
    }
  }, [appliedFeeHost.hostId, feeFilters.fromDate, feeFilters.paymentStatus, feeFilters.toDate, feePage]);

  const loadFeeSetting = useCallback(async () => {
    await Promise.resolve();
    setBusy(true); setError('');
    try {
      const current = await platformFeeService.getCurrent();
      setFeeSetting(current || null);
      if (current) setFeeForm({ settingName: current.settingName || '', commissionRate: current.commissionRate ?? 10, monthlyMaintenanceFee: current.monthlyMaintenanceFee ?? 0, freeTrialDays: current.freeTrialDays ?? 0, gracePeriodDays: current.gracePeriodDays ?? 0, effectiveFrom: current.effectiveFrom || today });
    } catch (err) { setError(err.message || 'Không tải được cấu hình phí.'); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => deferLoad(loadGlobalSummary), [loadGlobalSummary]);

  useEffect(() => {
    if (activeTab !== tabs[0]) return undefined;
    return deferLoad(loadOverview);
  }, [activeTab, loadOverview]);

  useEffect(() => {
    if (activeTab !== tabs[1]) return undefined;
    return deferLoad(loadCommissions);
  }, [activeTab, loadCommissions]);

  useEffect(() => {
    if (activeTab !== tabs[2]) return undefined;
    return deferLoad(loadFees);
  }, [activeTab, loadFees]);

  useEffect(() => {
    if (activeTab !== tabs[3]) return undefined;
    return deferLoad(loadFeeSetting);
  }, [activeTab, loadFeeSetting]);

  const refreshActiveTab = () => (
    activeTab === tabs[0]
      ? loadOverview()
      : activeTab === tabs[1]
        ? loadCommissions()
        : activeTab === tabs[2]
          ? loadFees()
          : loadFeeSetting()
  );

  const refresh = () => Promise.all([
    loadGlobalSummary(),
    refreshActiveTab(),
  ]);

  const applyEntityFilters = () => {
    const hostInput = String(filters.hostId || '').trim();
    const homestayInput = String(filters.homestayId || '').trim();

    const hostId = parseEntityIdentifier(hostInput, 'HOST');
    const homestayId = parseEntityIdentifier(homestayInput, 'HOMESTAY');

    if (hostInput && hostId === null) {
      setError(
        'Người dùng/Host không hợp lệ. Hãy nhập ID số hoặc mã dạng USR-006 / USER-006 / HOST-006.',
      );
      return;
    }

    if (homestayInput && homestayId === null) {
      setError(
        'Homestay không hợp lệ. Hãy nhập ID số hoặc mã dạng HMS-006 / HOME-006 / HOMESTAY-006.',
      );
      return;
    }

    setError('');
    setCommissionPage(1);

    setAppliedEntityFilters({
      hostId,
      homestayId,
      hostInput,
      homestayInput,
      hostName: '',
      homestayName: '',
    });
  };

  const resetEntityFilters = () => {
    setError('');
    setCommissionPage(1);

    setFilters((current) => ({
      ...current,
      hostId: '',
      homestayId: '',
    }));

    setAppliedEntityFilters({
      hostId: '',
      homestayId: '',
      hostInput: '',
      homestayInput: '',
      hostName: '',
      homestayName: '',
    });
  };

  const applyFeeHostFilter = () => {
    const hostInput = String(feeFilters.hostId || '').trim();
    const hostId = parseEntityIdentifier(hostInput, 'HOST');

    if (hostInput && hostId === null) {
      setError(
        'Người dùng/Host không hợp lệ. Hãy nhập ID số hoặc mã dạng USR-006 / USER-006 / HOST-006.',
      );
      return;
    }

    setError('');
    setFeePage(1);
    setAppliedFeeHost({ hostId, hostInput, hostName: '' });
  };

  const resetFeeHostFilter = () => {
    setError('');
    setFeePage(1);

    setFeeFilters((current) => ({
      ...current,
      hostId: '',
    }));

    setAppliedFeeHost({
      hostId: '',
      hostInput: '',
      hostName: '',
    });
  };

  const saveFee = async (event) => {
    event.preventDefault();
    const payload = { ...feeForm, commissionRate: Number(feeForm.commissionRate), monthlyMaintenanceFee: Number(feeForm.monthlyMaintenanceFee), freeTrialDays: Number(feeForm.freeTrialDays), gracePeriodDays: Number(feeForm.gracePeriodDays) };
    if (payload.commissionRate < 0 || payload.commissionRate > 100) return setError('Tỷ lệ hoa hồng phải từ 0 đến 100.');
    if (payload.monthlyMaintenanceFee < 0 || payload.freeTrialDays < 0 || payload.gracePeriodDays < 0) return setError('Phí và số ngày không được âm.');
    if (!window.confirm('Lưu cấu hình phí mới? Các booking đã ghi nhận vẫn giữ tỷ lệ cũ.')) return;
    await platformFeeService.updateCurrent(payload);
    loadFeeSetting();
  };

const markPaid = async (item) => {
  const suggestedReference =
    generateMaintenanceTransactionReference(
      item,
    );

  const transactionReference =
    window.prompt(
      'Nhập mã giao dịch',
      suggestedReference,
    );

  if (!transactionReference?.trim()) {
    return;
  }

  await maintenanceFeeService.markPaid(
    item.maintenanceFeeId,
    {
      paymentMethod: 'BANK_TRANSFER',

      transactionReference:
        transactionReference.trim(),

      adminNote:
        'Admin xác nhận đã nhận phí',
    },
  );

  await Promise.all([
    loadFees(),
    loadGlobalSummary(),
  ]);
};


  return (
    <AdminLayout>
      <div className="space-y-5 text-left text-sm text-gray-700">
<ManagementHeaderRow backButton={<ManagementBackButton onClick={() => navigate('/admin')} />}>
  <section className="relative overflow-hidden rounded-3xl border border-[#D8B48A]/15 bg-gradient-to-br from-[#0f1725] via-[#304b68] to-[#4d6794] text-white shadow-2xl">
    
    {/* Vệt sáng Gradient chìm hỗ trợ chuyển màu mượt mà */}
    <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#8A5A44]/15 blur-3xl pointer-events-none" />
    <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#2C3E2B]/20 blur-3xl pointer-events-none" />
    <div className="absolute top-1/2 left-1/3 h-64 w-64 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

    <div className="relative z-10 grid gap-8 p-6 md:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      
      {/* CỘT TRÁI: TIÊU ĐỀ & THANH TABS */}
      <div className="space-y-6 text-left">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D8B48A]/30 bg-[#D8B48A]/10 px-3.5 py-1 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F3E5D8]">
              Cozygo Financial Management
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-[#F8F6F1]">
            Quản lý doanh thu
          </h1>

          <p className="max-w-2xl text-xs md:text-sm font-medium leading-relaxed text-[#D2C8BD]">
            Doanh thu Cozygo được hợp nhất từ hoa hồng booking hoàn thành và phí duy trì dịch vụ host. Hệ thống cập nhật tự động giúp theo dõi sức khỏe tài chính toàn sàn nhanh chóng.
          </p>
        </div>

        {/* THANH TABS CHUYỂN ĐỔI - NÚT ACTIVE MÀU CAM NÂU ĐẤT GIỮ NGUYÊN */}
        <div className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl shadow-inner">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-4 py-2 text-xs font-black transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D8B48A] to-[#B66A3C] text-[#1E2E23] shadow-lg shadow-black/30 scale-[1.02]'
                    : 'text-[#E5DFD5] hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* CỘT PHẢI: GIỮ NGUYÊN NỀN VÀ MÀU NÂU ẤM CỦA KHỐI THỐNG KÊ */}
      <div className="rounded-3xl border border-[#D8B48A]/20 bg-gradient-to-b from-white/10 to-white/5 p-5 md:p-6 backdrop-blur-2xl shadow-2xl space-y-4 text-left">
        
        {/* TỔNG DOANH THU - CARD NÂU ĐẤT ẤM ÁP GIỮ NGUYÊN */}
        <div className="relative overflow-hidden rounded-2xl border border-[#F3E5D8]/55 bg-gradient-to-r from-[#FFF7ED] via-[#F8E6D2] to-[#E8B980] p-5 text-[#2C1E15] shadow-xl">
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#7A5547]">
                Tổng doanh thu toàn sàn
              </p>
              <p className="mt-1 text-3xl md:text-4xl font-black tracking-tight text-[#172333]">
                {headerBusy ? 'Đang tải...' : money(globalSummary.totalPlatformRevenue)}
              </p>
              <p className="mt-1 text-[11px] font-bold text-[#7A5547]">
                Hoa hồng booking + Phí duy trì đã thanh toán · Không đổi theo tab hoặc bộ lọc
              </p>
            </div>

            <button
              onClick={refresh}
              type="button"
              disabled={headerBusy || busy}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#7A5547]/20 bg-white/85 text-[#6C483A] shadow-md backdrop-blur-md transition-all hover:bg-white hover:scale-105 active:scale-95 disabled:cursor-wait disabled:opacity-60"
              title="Làm mới dữ liệu toàn trang"
            >
              <HiOutlineRefresh className={`text-xl ${headerBusy || busy ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Ô CHỈ SỐ MINI */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-white/20 bg-white/95 p-3.5 text-[#2C1E15] shadow-sm backdrop-blur-md transition hover:bg-white hover:-translate-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#D8B48A]">Hoa hồng</p>
            <p className="mt-1 text-base font-black">
              {headerBusy ? '--' : money(globalSummary.commissionRevenue)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/95 p-3.5 text-[#2C1E15] shadow-sm backdrop-blur-md transition hover:bg-white hover:-translate-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Phí duy trì</p>
            <p className="mt-1 text-base font-black">
              {headerBusy ? '--' : money(globalSummary.maintenanceRevenue)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/95 p-3.5 text-[#2C1E15] shadow-sm backdrop-blur-md transition hover:bg-white hover:-translate-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-500">Đơn hoàn thành</p>
            <p className="mt-1 text-base font-black">
              {headerBusy ? '--' : count(globalSummary.completedBookingCount)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/95 p-3.5 text-[#2C1E15] shadow-sm backdrop-blur-md transition hover:bg-white hover:-translate-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-wider text-rose-600">Đơn đã hủy</p>
            <p className="mt-1 text-base font-black text-rose-700">
              {headerBusy ? '--' : count(globalSummary.cancelledBookingCount)}
            </p>
          </div>
        </div>

      </div>

    </div>
  </section>
</ManagementHeaderRow>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-600">{error}</div>}
        {busy && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-bold text-amber-700">Đang tải dữ liệu...</div>}
        {activeTab !== tabs[2] && activeTab !== tabs[3] && (
          <RevenueFilter
            filters={filters}
            setFilters={setFilters}
            appliedEntityFilters={appliedEntityFilters}
            onApplyEntity={applyEntityFilters}
            onResetEntity={resetEntityFilters}
            showAdvanced={activeTab === tabs[1]}
          />
        )}
        {activeTab === tabs[0] && (
          <Overview
            summary={summary}
            chart={chart}
            topHosts={topHosts}
            topHomestays={topHomestays}
            groupBy={filters.groupBy}
            resolvedGroupBy={resolvedGroupBy}
            homestayId={appliedEntityFilters.homestayId}
            setFilters={setFilters}
          />
        )}
        {activeTab === tabs[1] && <Commissions data={commissions} page={commissionPage} setPage={setCommissionPage} onOpen={setDetail} />}
        {activeTab === tabs[2] && (
          <Maintenance
            fees={fees}
            page={feePage}
            setPage={setFeePage}
            filters={feeFilters}
            setFilters={setFeeFilters}
            appliedHost={appliedFeeHost}
            onApplyHost={applyFeeHostFilter}
            onResetHost={resetFeeHostFilter}
            onPaid={markPaid}
            summary={maintenanceSummary}
          />
        )}
        {activeTab === tabs[3] && <FeeSetting current={feeSetting} form={feeForm} setForm={setFeeForm} onSubmit={saveFee} />}
        {detail && <CommissionModal item={detail} onClose={() => setDetail(null)} />}
      </div>
    </AdminLayout>
  );
}

function RevenueFilter({
  filters,
  setFilters,
  appliedEntityFilters,
  showAdvanced,
  onApplyEntity,
  onResetEntity,
}) {
  const update = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
      datePreset: ['fromDate', 'toDate'].includes(field) ? 'CUSTOM' : current.datePreset,
    }));
  };

  const selectPreset = (preset) => {
    if (preset.value === 'CUSTOM') {
      setFilters((current) => ({ ...current, datePreset: 'CUSTOM' }));
      return;
    }

    setFilters((current) => ({
      ...current,
      datePreset: preset.value,
      fromDate: preset.fromDate || current.fromDate,
      toDate: preset.toDate || current.toDate,
    }));
  };

  const hasAppliedEntityFilter = Boolean(
    appliedEntityFilters?.hostId || appliedEntityFilters?.homestayId,
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">
          Khoảng thời gian thống kê
        </p>
        <p className="mt-1 text-xs font-semibold text-gray-400">
          Chọn mốc thời gian hoặc đổi ngày, dữ liệu sẽ tự động cập nhật.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {datePresets.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => selectPreset(preset)}
              className={[
                filters.datePreset === preset.value
                  ? 'bg-[#2C3E2B] text-white shadow-md'
                  : 'bg-[#F4F1EA] text-gray-600 hover:bg-white',
                'rounded-xl px-4 py-2 text-xs font-black transition',
              ].join(' ')}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="mt-3 grid max-w-2xl gap-3 md:grid-cols-2">
          <Field
            label="Từ ngày"
            type="date"
            value={filters.fromDate}
            onChange={(value) => update('fromDate', value)}
          />
          <Field
            label="Đến ngày"
            type="date"
            value={filters.toDate}
            onChange={(value) => update('toDate', value)}
          />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#6E473B]/10 bg-[#F8F6F1] p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#6E473B]">
              Lọc theo Host hoặc Homestay
            </p>
            <p className="mt-1 text-xs font-semibold text-gray-400">
              Mỗi ô hỗ trợ nhập ID số hoặc mã hiển thị của Người dùng/Host và Homestay.
            </p>
          </div>

          {hasAppliedEntityFilter && (
            <div className="mt-2 flex flex-wrap justify-end gap-2 sm:mt-0">
              {appliedEntityFilters.hostId && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700 shadow-sm">
                  <span className="text-emerald-500">Host:</span>
                  <span>
                    {appliedEntityFilters.hostName ||
                      'Đang xác định tên...'}
                  </span>
                  <span className="text-emerald-500">·</span>
                  <span className="font-mono">
                    {formatHostCode(
                      appliedEntityFilters.hostId,
                    )}
                  </span>
                </span>
              )}

              {appliedEntityFilters.homestayId && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-black text-blue-700 shadow-sm">
                  <span className="text-blue-500">Homestay:</span>
                  <span>
                    {appliedEntityFilters.homestayName ||
                      'Đang xác định tên...'}
                  </span>
                  <span className="text-blue-500">·</span>
                  <span className="font-mono">
                    {formatHomestayCode(
                      appliedEntityFilters.homestayId,
                    )}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
          <Field
            label="Người dùng / Host"
            value={filters.hostId}
            placeholder="VD: 6 hoặc USR-006 / HOST-006"
            onChange={(value) => update('hostId', value)}
          />
          <Field
            label="Homestay"
            value={filters.homestayId}
            placeholder="VD: 7 hoặc HMS-007"
            onChange={(value) => update('homestayId', value)}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onApplyEntity}
              className="h-11 rounded-xl bg-[#2C3E2B] px-5 text-xs font-black text-white shadow-md transition hover:bg-[#1f2f20]"
            >
              Áp dụng
            </button>
            <button
              type="button"
              onClick={onResetEntity}
              className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-xs font-black text-gray-600 shadow-sm transition hover:border-[#D8B48A] hover:text-[#6E473B]"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">
            Bộ lọc danh sách hoa hồng
          </p>
          <p className="mt-1 text-xs font-semibold text-gray-400">
            Phương thức, trạng thái và từ khóa được áp dụng tự động.
          </p>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <SelectField
              label="Phương thức"
              value={filters.paymentMethod}
              onChange={(value) => update('paymentMethod', value)}
              options={paymentOptions}
            />
            <SelectField
              label="Trạng thái"
              value={filters.commissionStatus}
              onChange={(value) => update('commissionStatus', value)}
              options={commissionOptions}
            />
          </div>

          <div className="mt-3 flex h-11 items-center gap-2 rounded-xl border border-gray-200 px-3 shadow-sm">
            <HiOutlineSearch className="text-gray-400" />
            <input
              value={filters.keyword}
              onChange={(event) => update('keyword', event.target.value)}
              className="w-full bg-transparent text-xs font-bold outline-none"
              placeholder="Tìm booking, khách hàng, host, homestay"
            />
          </div>
        </div>
      )}
    </section>
  );
}

function Overview({
  summary,
  chart,
  topHosts,
  topHomestays,
  groupBy,
  resolvedGroupBy,
  homestayId,
  setFilters,
}) {
  const cards = [
    { title: 'Tổng giá trị booking hoàn thành', value: money(summary.completedBookingValue), Icon: HiOutlineCash, tone: 'blue', note: 'Tổng tiền booking làm cơ sở tính hoa hồng' },
    { title: 'Booking hoàn thành', value: count(summary.completedBookingCount), Icon: HiOutlineCheckCircle, tone: 'emerald', note: 'Đơn đã ghi nhận doanh thu' },
    { title: 'Doanh thu hoa hồng', value: money(summary.commissionRevenue), Icon: HiOutlineCash, tone: 'amber', note: 'Phần Cozygo nhận từ booking' },
    {
      title: 'Doanh thu phí duy trì',
      value: money(summary.maintenanceRevenue),
      Icon: HiOutlineCash,
      tone: 'violet',
      note: homestayId ? 'Không phân bổ phí duy trì host cho từng homestay' : 'Chỉ tính host đã thanh toán',
    },
    {
      title: homestayId ? 'Tổng doanh thu của homestay' : 'Tổng doanh thu toàn sàn',
      value: money(summary.totalPlatformRevenue),
      Icon: HiOutlineChartBar,
      tone: 'green',
      highlight: true,
      note: homestayId ? 'Chỉ gồm hoa hồng booking của homestay' : 'Hoa hồng + phí duy trì',
    },
    { title: 'Booking đã hủy', value: count(summary.cancelledBookingCount), Icon: HiOutlineX, tone: 'rose', note: 'Không cộng vào doanh thu' },
    { title: 'Host đã đóng phí duy trì', value: count(summary.paidMaintenanceHostCount), Icon: HiOutlineCheckCircle, tone: 'teal', note: homestayId ? 'Không áp dụng khi lọc từng homestay' : 'Số host thanh toán trong kỳ' },
    { title: 'Hoa hồng trung bình', value: money(summary.averageCommission), Icon: HiOutlineCash, tone: 'orange', note: 'Trung bình mỗi booking' },
  ];

  const autoForcedToMonth = groupBy === 'DAY' && resolvedGroupBy === 'MONTH';
  const chartRows = chart || [];
  const firstRevenuePoint = chartRows.find((item) => chartNumber(item.totalPlatformRevenue) > 0);
  const lastRevenuePoint = [...chartRows].reverse().find((item) => chartNumber(item.totalPlatformRevenue) > 0);
  const growthPercent = firstRevenuePoint && lastRevenuePoint && chartNumber(firstRevenuePoint.totalPlatformRevenue) > 0
    ? Math.round(((chartNumber(lastRevenuePoint.totalPlatformRevenue) - chartNumber(firstRevenuePoint.totalPlatformRevenue)) / chartNumber(firstRevenuePoint.totalPlatformRevenue)) * 100)
    : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => <Metric key={item.title} {...item} />)}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.9fr]">
        <section className="rounded-[28px] border border-[#E7DDD1] bg-white p-5 shadow-[0_18px_45px_-35px_rgba(44,30,21,0.55)] transition duration-200 hover:shadow-[0_24px_55px_-38px_rgba(44,30,21,0.65)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B66A3C]">
                Biểu đồ tăng trưởng
              </p>
              <h3 className="mt-1 font-serif text-2xl font-bold text-[#2C1E15]">
                Doanh thu & số đơn theo {resolvedGroupBy === 'MONTH' ? 'tháng' : 'ngày'}
              </h3>
              {growthPercent !== null && (
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${growthPercent >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {growthPercent >= 0 ? 'Tăng' : 'Giảm'} {Math.abs(growthPercent)}% so với mốc đầu kỳ
                </span>
              )}
              <p className="mt-2 text-sm font-semibold text-gray-500">
                Cột xanh là doanh thu, đường cam là số booking hoàn thành trong cùng kỳ.
              </p>
              {homestayId && (
                <p className="mt-1 text-xs font-bold text-amber-700">
                  Khi lọc Homestay, biểu đồ chỉ tính hoa hồng booking và không cộng phí duy trì của Host.
                </p>
              )}
              {autoForcedToMonth && (
                <p className="mt-1 text-xs font-bold text-amber-700">
                  Khoảng thời gian trên 366 ngày được tự động chuyển sang theo tháng để biểu đồ dễ đọc.
                </p>
              )}
            </div>

            <PrettySelect
              value={groupBy}
              onChange={(value) => setFilters((current) => ({ ...current, groupBy: value }))}
              options={[
                { value: 'AUTO', label: 'Tự động' },
                { value: 'DAY', label: 'Theo ngày' },
                { value: 'MONTH', label: 'Theo tháng' },
              ]}
            />
          </div>

          <RevenueChart data={chart} groupBy={resolvedGroupBy} />
        </section>

        <RevenueComposition summary={summary} homestayId={homestayId} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <TopList title="Top 5 host tạo nhiều doanh thu hoa hồng nhất" items={topHosts} tone="host" />
        <TopList title="Top 5 homestay tạo nhiều doanh thu hoa hồng nhất" items={topHomestays} tone="home" />
      </div>
    </div>
  );
}

function RevenueComposition({ summary, homestayId }) {
  const commissionRevenue = chartNumber(summary.commissionRevenue);
  const maintenanceRevenue = homestayId ? 0 : chartNumber(summary.maintenanceRevenue);
  const totalRevenue = chartNumber(summary.totalPlatformRevenue);
  const commissionPercent = totalRevenue > 0 ? Math.round((commissionRevenue / totalRevenue) * 100) : 0;
  const maintenancePercent = totalRevenue > 0 ? Math.max(0, 100 - commissionPercent) : 0;
  const donutBackground = totalRevenue > 0
    ? `conic-gradient(#2C3E2B 0 ${commissionPercent}%, #E9A22D ${commissionPercent}% 100%)`
    : 'conic-gradient(#E7DDD1 0 100%)';

  return (
    <section className="rounded-[28px] border border-[#E7DDD1] bg-white p-5 shadow-[0_18px_45px_-35px_rgba(44,30,21,0.55)]">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B66A3C]">
        Biểu đồ thống kê
      </p>
      <h3 className="mt-1 font-serif text-2xl font-bold text-[#2C1E15]">Cơ cấu doanh thu</h3>
      <p className="mt-2 text-sm font-semibold text-gray-500">
        Tỉ trọng đóng góp của từng nguồn thu trong tổng doanh thu kỳ này.
      </p>

      <div className="mx-auto mt-6 flex h-48 w-48 items-center justify-center rounded-full p-7 shadow-inner" style={{ background: donutBackground }}>
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(231,221,209,0.7)]">
          <p className="text-xl font-black text-[#2C1E15]">{money(totalRevenue)}</p>
          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">Tổng doanh thu</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <CompositionRow color="bg-[#2C3E2B]" label="Hoa hồng booking" percent={commissionPercent} value={money(commissionRevenue)} />
        <CompositionRow
          color="bg-[#E9A22D]"
          label={homestayId ? 'Phí duy trì không phân bổ' : 'Phí duy trì host'}
          percent={maintenancePercent}
          value={money(maintenanceRevenue)}
        />
      </div>
    </section>
  );
}

function CompositionRow({ color, label, percent, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#F4F1EA] px-4 py-3">
      <span className="inline-flex min-w-0 items-center gap-3">
        <span className={`h-3.5 w-3.5 shrink-0 rounded ${color}`} />
        <span className="truncate text-sm font-black text-[#2C1E15]">{label}</span>
      </span>
      <span className="shrink-0 text-sm font-black text-[#6C483A]">{percent}% · {value}</span>
    </div>
  );
}

function RevenueChart({ data, groupBy }) {
  if (!data?.length) {
    return <Empty text="Chưa có dữ liệu biểu đồ trong khoảng thời gian này." />;
  }

  const rows = data.map((item) => ({
    period: item.period,
    revenue: chartNumber(item.totalPlatformRevenue),
    bookings: chartNumber(item.completedBookingCount ?? item.bookingCount),
  }));

  const rawMaxRevenue = Math.max(...rows.map((item) => item.revenue), 0);
  const rawMaxBookings = Math.max(...rows.map((item) => item.bookings), 0);
  const maxRevenue = getNiceAxisMaximum(rawMaxRevenue);
  const maxBookings = getNiceBookingMaximum(rawMaxBookings);

  const columnCount = rows.length;
  const slotWidth = columnCount === 1
    ? 210
    : columnCount <= 5
      ? 118
      : columnCount <= 12
        ? 78
        : columnCount <= 24
          ? 56
          : columnCount <= 60
            ? 42
            : 34;

  const height = columnCount <= 3 ? 250 : 285;
  const padding = { top: 34, right: 70, bottom: 48, left: 72 };
  const width = Math.max(
    560,
    padding.left + padding.right + Math.max(columnCount, 1) * slotWidth,
  );
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const baseline = padding.top + plotHeight;

  const xFor = (index) => {
    if (columnCount === 1) return padding.left + plotWidth / 2;
    return padding.left + (plotWidth / columnCount) * (index + 0.5);
  };

  const barWidth = columnCount === 1
    ? 64
    : columnCount <= 5
      ? 46
      : columnCount <= 12
        ? 32
        : columnCount <= 24
          ? 22
          : columnCount <= 60
            ? 18
            : 14;

  const points = rows.map((item, index) => {
    const x = xFor(index);
    const revenueHeight = item.revenue > 0
      ? Math.max(6, (item.revenue / maxRevenue) * plotHeight)
      : 0;
    const orderY = baseline - (item.bookings / maxBookings) * plotHeight;

    return {
      ...item,
      x,
      revenueY: baseline - revenueHeight,
      revenueHeight,
      orderY,
    };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.orderY}`)
    .join(' ');

  const axisTicks = [1, 0.75, 0.5, 0.25, 0];
  const labelInterval = Math.max(1, Math.ceil(points.length / 12));
  const hasMultiplePoints = points.length > 1;

  return (
    <div className="mt-5 overflow-x-auto rounded-[24px] border border-[#EFE6DA] bg-white p-4 pb-2 shadow-inner shadow-[#6C483A]/5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs font-black text-gray-600">
        <span>{groupBy === 'MONTH' ? 'Tăng trưởng theo tháng' : 'Tăng trưởng theo ngày'}</span>
        <div className="flex flex-wrap gap-2">
          <Legend color="bg-[#2C3E2B]" label="Doanh thu" />
          <Legend color="bg-[#FF9800]" label="Số đơn" />
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="text-[11px] font-black"
        style={{ minWidth: `${width}px`, width: '100%' }}
      >
        <defs>
          <linearGradient id="adminRevenueLineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#E9A22D" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#E9A22D" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="adminRevenueBarFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5D7D63" />
            <stop offset="100%" stopColor="#243F2B" />
          </linearGradient>
          <filter id="adminRevenueBarShadow" x="-30%" y="-20%" width="160%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#1F3525" floodOpacity="0.18" />
          </filter>
        </defs>

        <rect
          x={padding.left}
          y={padding.top}
          width={plotWidth}
          height={plotHeight}
          rx="20"
          fill="#FFFCF7"
        />

        {axisTicks.map((tick) => {
          const y = padding.top + plotHeight * (1 - tick);
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#E5E0D8"
                strokeDasharray="5 6"
              />
              <text
                x={padding.left - 14}
                y={y + 4}
                textAnchor="end"
                fill="#9CA3AF"
              >
                {compactMoney(maxRevenue * tick)}
              </text>
              <text
                x={width - padding.right + 14}
                y={y + 4}
                textAnchor="start"
                fill="#B66A3C"
              >
                {Math.round(maxBookings * tick)} đơn
              </text>
            </g>
          );
        })}

        <text x={padding.left} y={24} fill="#596579">Doanh thu</text>
        <text x={width - padding.right} y={24} textAnchor="end" fill="#B66A3C">
          Số booking
        </text>

        {points.map((point) => (
          <g key={`bar-${point.period}`}>
            <rect
              x={point.x - barWidth / 2}
              y={point.revenueY}
              width={barWidth}
              height={point.revenueHeight}
              rx={Math.min(12, barWidth / 3)}
              fill="url(#adminRevenueBarFill)"
              filter="url(#adminRevenueBarShadow)"
            >
              <title>
                {point.period}: {money(point.revenue)} · {count(point.bookings)} đơn
              </title>
            </rect>
          </g>
        ))}

        {hasMultiplePoints && (
          <>
            <path
              d={`${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`}
              fill="url(#adminRevenueLineFill)"
            />
            <path
              d={linePath}
              fill="none"
              stroke="#FF9800"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {points.map((point) => (
          <g key={`point-${point.period}`}>
            <circle
              cx={point.x}
              cy={point.orderY}
              r="6.5"
              fill="white"
              stroke="#E9A22D"
              strokeWidth="3.8"
            />
            <title>{point.period}: {count(point.bookings)} đơn</title>
          </g>
        ))}

        {points.length === 1 && (
          <>
            <text
              x={points[0].x}
              y={Math.max(38, points[0].revenueY - 12)}
              textAnchor="middle"
              fill="#2C3E2B"
            >
              {compactMoney(points[0].revenue)}
            </text>
            <text
              x={points[0].x}
              y={Math.max(48, points[0].orderY - 26)}
              textAnchor="middle"
              fill="#B66A3C"
            >
              {count(points[0].bookings)} đơn
            </text>
          </>
        )}

        {points.map((point, index) => {
          const shouldShow = index % labelInterval === 0 || index === points.length - 1;
          if (!shouldShow) return null;

          return (
            <text
              key={`label-${point.period}`}
              x={point.x}
              y={height - 20}
              textAnchor="middle"
              fill="#9CA3AF"
            >
              {formatChartPeriod(point.period, groupBy)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function Commissions({ data, page, setPage, onOpen }) {
  const items = data?.content || [];
  if (!items.length) return <Empty text="Chưa có hoa hồng booking trong bộ lọc này." />;
  return <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left text-xs"><thead className="bg-gray-50 text-gray-500"><tr>{['Mã booking', 'Khách hàng', 'Host', 'Homestay', 'Phương thức thanh toán', 'Ngày hoàn thành', 'Giá trị booking', 'Tỷ lệ hoa hồng', 'Doanh thu hoa hồng', 'Trạng thái'].map((head) => <th key={head} className="px-4 py-3 font-black uppercase">{head}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{items.map((item) => <tr key={item.commissionId} onClick={() => onOpen(item)} className="cursor-pointer font-semibold text-gray-700 hover:bg-[#F8F6F1]"><td className="px-4 py-3 font-mono font-black">{item.bookingCode}</td><td className="px-4 py-3">{item.customerName || '--'}</td><td className="px-4 py-3">{item.hostName || '--'}</td><td className="px-4 py-3">{item.homestayName || '--'}</td><td className="px-4 py-3">{payLabel(item.paymentMethod || item.paymentStatus)}</td><td className="px-4 py-3">{formatDate(item.completedAt || item.recognizedAt || item.calculatedAt)}</td><td className="px-4 py-3">{money(item.bookingAmount)}</td><td className="px-4 py-3">{item.commissionRate || 0}%</td><td className="px-4 py-3 font-black text-[#B66A3C]">{money(item.commissionAmount)}</td><td className="px-4 py-3"><Badge value={item.commissionStatus} labels={commissionLabels} /></td></tr>)}</tbody></table></div><Pagination currentPage={page} totalPages={data?.totalPages || 0} setCurrentPage={setPage} totalItems={data?.totalElements || 0} indexOfFirstItem={(page - 1) * 10} indexOfLastItem={(page - 1) * 10 + items.length} itemName="hoa hồng" /></section>;
}

function Maintenance({
  fees,
  page,
  setPage,
  filters,
  setFilters,
  appliedHost,
  onApplyHost,
  onResetHost,
  onPaid,
  summary,
}) {
  const items = fees?.content || [];

  const update = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
      datePreset: ['fromDate', 'toDate'].includes(field) ? 'CUSTOM' : current.datePreset,
    }));
  };

  const selectPreset = (preset) => {
    if (preset.value === 'CUSTOM') {
      setFilters((current) => ({ ...current, datePreset: 'CUSTOM' }));
      return;
    }

    setFilters((current) => ({
      ...current,
      datePreset: preset.value,
      fromDate: preset.fromDate || current.fromDate,
      toDate: preset.toDate || current.toDate,
    }));
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-500">
            Khoảng thời gian và trạng thái
          </p>
          <p className="mt-1 text-xs font-semibold text-gray-400">
            Ngày và trạng thái được áp dụng tự động.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {datePresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => selectPreset(preset)}
                className={[
                  filters.datePreset === preset.value
                    ? 'bg-[#2C3E2B] text-white shadow-md'
                    : 'bg-[#F4F1EA] text-gray-600 hover:bg-white',
                  'rounded-xl px-4 py-2 text-xs font-black transition',
                ].join(' ')}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <Field
              label="Từ ngày"
              type="date"
              value={filters.fromDate}
              onChange={(value) => update('fromDate', value)}
            />
            <Field
              label="Đến ngày"
              type="date"
              value={filters.toDate}
              onChange={(value) => update('toDate', value)}
            />
            <SelectField
              label="Trạng thái"
              value={filters.paymentStatus}
              onChange={(value) => update('paymentStatus', value)}
              options={maintenanceOptions}
            />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[#6E473B]/10 bg-[#F8F6F1] p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#6E473B]">
                Lọc theo Host
              </p>
              <p className="mt-1 text-xs font-semibold text-gray-400">
                Có thể nhập ID người dùng hoặc mã User/Host; nút Áp dụng và Đặt lại chỉ tác động đến bộ lọc này.
              </p>
            </div>
            {appliedHost?.hostId && (
              <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700 shadow-sm sm:mt-0">
                <span className="text-emerald-500">Host:</span>
                <span>
                  {appliedHost.hostName ||
                    'Đang xác định tên...'}
                </span>
                <span className="text-emerald-500">·</span>
                <span className="font-mono">
                  {formatHostCode(appliedHost.hostId)}
                </span>
              </span>
            )}
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <Field
              label="Người dùng / Host"
              value={filters.hostId}
              placeholder="VD: 6 hoặc USR-006 / HOST-006"
              onChange={(value) => update('hostId', value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onApplyHost}
                className="h-11 rounded-xl bg-[#2C3E2B] px-5 text-xs font-black text-white shadow-md"
              >
                Áp dụng
              </button>
              <button
                type="button"
                onClick={onResetHost}
                className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-xs font-black text-gray-600 shadow-sm"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-5">
        <Metric title="Tổng phí cần thu" value={money(Number(summary.pendingMaintenanceAmount || 0) + Number(summary.overdueMaintenanceAmount || 0))} Icon={HiOutlineCash} />
        <Metric title="Đã thanh toán" value={money(summary.maintenanceRevenue)} Icon={HiOutlineCheckCircle} highlight />
        <Metric title="Chưa thanh toán" value={money(summary.pendingMaintenanceAmount)} Icon={HiOutlineCash} />
        <Metric title="Quá hạn" value={money(summary.overdueMaintenanceAmount)} Icon={HiOutlineX} />
        <Metric title="Host đã thanh toán" value={count(summary.paidMaintenanceHostCount)} Icon={HiOutlineCheckCircle} />
      </div>

      {!items.length ? (
        <Empty text="Chưa có phí duy trì trong bộ lọc này." />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-xs">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  {['Host', 'Tháng áp dụng', 'Khoảng thời gian', 'Số tiền', 'Hạn thanh toán', 'Ngày thanh toán', 'Trạng thái', 'Phương thức', 'Mã giao dịch', 'Thao tác'].map((head) => (
                    <th key={head} className="px-4 py-3 font-black uppercase">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.maintenanceFeeId} className="font-semibold text-gray-700">
                    <td className="px-4 py-3">{item.hostName || `Host #${item.hostId}`}</td>
                    <td className="px-4 py-3">{item.billingMonth}/{item.billingYear}</td>
                    <td className="px-4 py-3">{formatDate(item.periodStart)} - {formatDate(item.periodEnd)}</td>
                    <td className="px-4 py-3 font-black text-[#B66A3C]">{money(item.feeAmount)}</td>
                    <td className="px-4 py-3">{formatDate(item.dueDate)}</td>
                    <td className="px-4 py-3">{formatDate(item.paidAt)}</td>
                    <td className="px-4 py-3"><Badge value={item.paymentStatus} labels={maintenanceLabels} /></td>
                    <td className="px-4 py-3">{item.paymentMethod || '--'}</td>
                    <td className="px-4 py-3 font-mono">{item.transactionReference || '--'}</td>
                    <td className="px-4 py-3">
                      {['PENDING', 'OVERDUE'].includes(item.paymentStatus) ? (
                        <button
                          onClick={() => onPaid(item)}
                          className="rounded-lg bg-[#2C3E2B] px-3 py-2 font-black text-white"
                          type="button"
                        >
                          Xác nhận
                        </button>
                      ) : (
                        <span className="text-[11px] font-black text-gray-400">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalPages={fees?.totalPages || 0}
            setCurrentPage={setPage}
            totalItems={fees?.totalElements || 0}
            indexOfFirstItem={(page - 1) * 10}
            indexOfLastItem={(page - 1) * 10 + items.length}
            itemName="phí duy trì"
          />
        </section>
      )}
    </div>
  );
}

function FeeSetting({ current, form, setForm, onSubmit }) {
  const update = (field, value) => setForm((state) => ({ ...state, [field]: value }));
  return <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-700">Thay đổi tỷ lệ chỉ áp dụng theo cấu hình có hiệu lực. Các booking đã ghi nhận vẫn giữ tỷ lệ hoa hồng đã chốt.</div>{current && <div className="mt-4 grid gap-3 md:grid-cols-4"><Metric title="Hoa hồng hiện tại" value={`${current.commissionRate || 0}%`} Icon={HiOutlineCash} /><Metric title="Phí duy trì tháng" value={money(current.monthlyMaintenanceFee)} Icon={HiOutlineCash} /><Metric title="Dùng thử" value={`${current.freeTrialDays || 0} ngày`} Icon={HiOutlineCheckCircle} /><Metric title="Gia hạn" value={`${current.gracePeriodDays || 0} ngày`} Icon={HiOutlineRefresh} /></div>}<form onSubmit={onSubmit} className="mt-5 grid gap-3 md:grid-cols-3"><Field label="Tên cấu hình" value={form.settingName} onChange={(value) => update('settingName', value)} /><Field label="Tỷ lệ hoa hồng (%)" type="number" value={form.commissionRate} onChange={(value) => update('commissionRate', value)} /><Field label="Phí duy trì tháng" type="number" value={form.monthlyMaintenanceFee} onChange={(value) => update('monthlyMaintenanceFee', value)} /><Field label="Số ngày dùng thử" type="number" value={form.freeTrialDays} onChange={(value) => update('freeTrialDays', value)} /><Field label="Số ngày gia hạn" type="number" value={form.gracePeriodDays} onChange={(value) => update('gracePeriodDays', value)} /><Field label="Ngày bắt đầu áp dụng" type="date" value={form.effectiveFrom} onChange={(value) => update('effectiveFrom', value)} /><button className="h-11 rounded-xl bg-[#2C3E2B] text-xs font-black text-white shadow-md md:col-span-3" type="submit">Lưu cấu hình phí</button></form></section>;
}

function CommissionModal({ item, onClose }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><section className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3"><h3 className="font-serif text-xl font-bold text-[#2C1E15]">Chi tiết hoa hồng booking</h3><button onClick={onClose} className="rounded-full bg-gray-100 p-2 text-gray-600" type="button"><HiOutlineX /></button></div><div className="space-y-4"><div className="rounded-xl bg-[#F8F6F1] p-4"><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#B66A3C]">Công thức doanh thu Cozygo</p><p className="mt-2 text-xl font-black text-[#2C1E15]">{money(item.bookingAmount)} × {item.commissionRate || 0}% = {money(item.commissionAmount)}</p></div><div className="grid gap-3 md:grid-cols-2">{[['Mã booking', item.bookingCode], ['Khách hàng', item.customerName], ['Host', item.hostName], ['Homestay', item.homestayName], ['Phương thức', payLabel(item.paymentMethod || item.paymentStatus)], ['Trạng thái booking', item.bookingStatus], ['Ngày hoàn thành', formatDate(item.completedAt || item.recognizedAt || item.calculatedAt)], ['Trạng thái hoa hồng', commissionLabels[item.commissionStatus] || item.commissionStatus]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#F8F6F1] p-3"><p className="text-[11px] font-black uppercase text-gray-400">{label}</p><p className="mt-1 font-bold text-gray-800">{value || '--'}</p></div>)}</div></div></section></div>;
}


const metricTones = {
  emerald: { icon: 'border-emerald-100 bg-emerald-50 text-emerald-700', accent: 'bg-emerald-500', glow: 'shadow-emerald-900/10' },
  blue: { icon: 'border-blue-100 bg-blue-50 text-blue-700', accent: 'bg-blue-500', glow: 'shadow-blue-900/10' },
  amber: { icon: 'border-amber-100 bg-amber-50 text-amber-700', accent: 'bg-amber-500', glow: 'shadow-amber-900/10' },
  violet: { icon: 'border-violet-100 bg-violet-50 text-violet-700', accent: 'bg-violet-500', glow: 'shadow-violet-900/10' },
  green: { icon: 'border-green-100 bg-green-50 text-green-700', accent: 'bg-[#2C3E2B]', glow: 'shadow-green-900/10' },
  rose: { icon: 'border-rose-100 bg-rose-50 text-rose-700', accent: 'bg-rose-500', glow: 'shadow-rose-900/10' },
  teal: { icon: 'border-teal-100 bg-teal-50 text-teal-700', accent: 'bg-teal-500', glow: 'shadow-teal-900/10' },
  orange: { icon: 'border-orange-100 bg-orange-50 text-orange-700', accent: 'bg-orange-500', glow: 'shadow-orange-900/10' },
};

function Metric({ title, value, Icon, highlight, tone = 'emerald', note }) {
  const palette = metricTones[tone] || metricTones.emerald;

  return (
    <div className={`group relative overflow-hidden rounded-[22px] border bg-white p-4 shadow-sm ${palette.glow} transition duration-200 hover:-translate-y-1 hover:border-[#D8CABE] hover:shadow-xl ${highlight ? 'border-[#B9906E]' : 'border-gray-200'}`}>
      <span className={`absolute inset-x-0 top-0 h-1 ${palette.accent}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.04em] text-gray-500">{title}</p>
          <p className={(highlight ? 'text-[#2C3E2B]' : 'text-[#2C1E15]') + ' mt-2 text-[26px] font-black leading-none'}>{value}</p>
        </div>
        <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-lg transition duration-200 group-hover:scale-105 ${palette.icon}`}><Icon /></span>
      </div>
      {note && <p className="mt-3 line-clamp-2 text-xs font-semibold leading-5 text-gray-400">{note}</p>}
    </div>
  );
}

function TopList({ title, items, tone = 'host' }) {
  const badgeClass = tone === 'host' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100';
  return <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm"><h3 className="font-serif text-xl font-bold text-[#2C1E15]">{title}</h3><div className="mt-4 space-y-2">{items?.length ? items.map((item, index) => <div key={item.id || item.name} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-[#F8F6F1] p-3 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"><div className="flex min-w-0 items-center gap-3"><span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-black ${badgeClass}`}>#{index + 1}</span><div className="min-w-0"><p className="truncate font-black text-gray-800">{item.name}</p><p className="text-xs font-semibold text-gray-500">{item.subLabel || '--'} · {item.bookingCount || 0} booking</p></div></div><p className="shrink-0 font-black text-[#2C3E2B]">{money(item.commissionRevenue)}</p></div>) : <Empty text="Chưa có dữ liệu." />}</div></section>;
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
}) {
  if (type === 'date') {
    return (
      <CalendarDateField
        label={label}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <label className="space-y-1">
      <span className="text-[11px] font-black uppercase text-gray-500">
        {label}
      </span>
      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold outline-none shadow-sm transition placeholder:font-semibold placeholder:text-gray-300 hover:border-[#D8B48A] focus:border-[#7A5547] focus:ring-2 focus:ring-[#7A5547]/10"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return <label className="space-y-1"><span className="text-[11px] font-black uppercase text-gray-500">{label}</span><PrettySelect value={value ?? ''} onChange={onChange} options={options} className="w-full" minWidth="min-w-full" /></label>;
}

function Badge({ value, labels }) {
  const normalized = value || '--';
  const tone = normalized === 'RECOGNIZED' || normalized === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : normalized === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200';
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${tone}`}>{labels?.[normalized] || normalized}</span>;
}


function Legend({ color, label }) {
  return <span className="inline-flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${color}`} />{label}</span>;
}

function Empty({ text }) {
  return <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm font-bold text-gray-400">{text}</div>;
}
