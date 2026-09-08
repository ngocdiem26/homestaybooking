// import { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { HiCheckCircle, HiEye, HiEyeSlash, HiShieldExclamation, HiStar, HiTrash, HiXMark } from 'react-icons/hi2';
// import AdminLayout from '../../layouts/AdminLayout';
// import Pagination from '../../components/common/Pagination';
// import ManagementBackButton from '../../components/common/ManagementBackButton';
// import ManagementHeaderRow from '../../components/common/ManagementHeaderRow';
// import ManagementToolbar from '../../components/common/ManagementToolbar';
// import { isWithinDateFilter } from '../../utils/dateFilter';
// import { deleteAdminReview, getAdminReviewCounts, getAdminReviewLogs, getAdminReviews, hideReview, keepReviewVisible, rejectReview, restoreReview } from '../../services/reviewService';

// const ITEMS_PER_PAGE = 6;
// const TABS = [
//   ['ALL', 'Tất cả', 'all'],
//   ['NEED_REVIEW', 'Cần xem xét', 'needReview'],
//   ['AI_HIDDEN', 'AI đã ẩn', 'aiHidden'],
//   ['VISIBLE', 'Đang hiển thị', 'visible'],
//   ['RESOLVED', 'Đã xử lý', 'resolved'],
//   ['REJECTED', 'Từ chối', 'rejected'],
// ];

// function formatDateTime(value) {
//   if (!value) return '';
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return String(value);
//   return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
// }

// function statusLabel(review) {
//   if (review.reviewStatus === 'HIDDEN') return 'AI/Admin đang ẩn';
//   if (review.reviewStatus === 'REJECTED') return 'Đã từ chối';
//   if (review.adminReviewStatus === 'PENDING') return 'Cần admin xem xét';
//   if (review.adminReviewStatus === 'RESOLVED') return 'Đã xử lý';
//   return 'Đang hiển thị';
// }

// function scorePercent(value) {
//   return Math.round(Number(value || 0) * 100) + '%';
// }

// function ReviewStars({ rating }) {
//   return <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, index) => <HiStar key={index} className={'h-4 w-4 ' + (index < Number(rating || 0) ? 'text-amber-400' : 'text-gray-200')} />)}</div>;
// }

// function ModerationBadge({ review }) {
//   const hidden = review.reviewStatus === 'HIDDEN';
//   const pending = review.adminReviewStatus === 'PENDING';
//   return <span className={'rounded-full px-3 py-1 text-[11px] font-black ' + (hidden ? 'bg-red-50 text-red-600' : pending ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700')}>{statusLabel(review)}</span>;
// }

// export default function AdminReviews() {
//   const navigate = useNavigate();
//   const [reviews, setReviews] = useState([]);
//   const [counts, setCounts] = useState({});
//   const [activeTab, setActiveTab] = useState('ALL');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [dateFilter, setDateFilter] = useState('all');
//   const [dateFrom, setDateFrom] = useState('');
//   const [dateTo, setDateTo] = useState('');
//   const [activeReview, setActiveReview] = useState(null);
//   const [logs, setLogs] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isLoading, setIsLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState('');

//   const loadReviews = async (tab = activeTab) => {
//     try {
//       setIsLoading(true);
//       setErrorMessage('');
//       const [list, countData] = await Promise.all([getAdminReviews({ tab }), getAdminReviewCounts()]);
//       setReviews(Array.isArray(list) ? list : []);
//       setCounts(countData || {});
//     } catch (error) {
//       setErrorMessage(error.message || 'Không tải được danh sách đánh giá');
//       setReviews([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => { loadReviews(activeTab); }, [activeTab]);

//   const filteredReviews = useMemo(() => {
//     const keyword = searchTerm.trim().toLowerCase();
//     return reviews.filter((review) => {
//       const matchesSearch = !keyword || [review.customerName, review.customerEmail, review.homestayName, review.bookingCode, review.comment, review.moderationReason]
//         .some((value) => String(value || '').toLowerCase().includes(keyword));
//       const matchesDate = isWithinDateFilter(review.createdAt, dateFilter, dateFrom, dateTo);
//       return matchesSearch && matchesDate;
//     });
//   }, [reviews, searchTerm, dateFilter, dateFrom, dateTo]);

//   const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ITEMS_PER_PAGE));
//   const currentItems = filteredReviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

//   const openDetail = async (review) => {
//     setActiveReview(review);
//     try {
//       setLogs(await getAdminReviewLogs(review.reviewId));
//     } catch {
//       setLogs([]);
//     }
//   };

//   const runAction = async (action, review, reason = '') => {
//     try {
//       setErrorMessage('');
//       await action(review.reviewId, reason);
//       await loadReviews(activeTab);
//       setActiveReview(null);
//     } catch (error) {
//       setErrorMessage(error.message || 'Không thực hiện được thao tác');
//     }
//   };

//   const removeReview = async (review) => {
//     if (!window.confirm('Xóa đánh giá này?')) return;
//     await deleteAdminReview(review.reviewId);
//     await loadReviews(activeTab);
//   };

//   return (
//     <AdminLayout>
//       <div className="space-y-5 text-sm">
//         <ManagementHeaderRow backButton={<ManagementBackButton onClick={() => navigate('/admin')} />}>
//           <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//             <div className="flex items-center gap-4">
//               <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2C3E2B]/10 text-[#2C3E2B]"><HiShieldExclamation className="h-7 w-7" /></div>
//               <div>
//                 <p className="text-xs font-black uppercase tracking-[0.24em] text-[#B6784F]">AI Moderation</p>
//                 <h1 className="font-classic text-3xl font-black text-[#2C1E15]">Quản lý đánh giá</h1>
//                 <p className="mt-1 text-sm font-semibold text-gray-500">Theo dõi đánh giá bị AI gắn cờ, đã ẩn và quyết định hiển thị công khai.</p>
//               </div>
//             </div>
//           </div>
//         </section>
//         </ManagementHeaderRow>

//         <ManagementToolbar

//           filters={[
//             {
//               label: 'Trạng thái',
//               value: activeTab,
//               onChange: (value) => { setActiveTab(value); setCurrentPage(1); },
//               options: TABS.map(([value, label, key]) => ({ value, label: `${label} (${counts[key] ?? 0})` })),
//             },
//           ]}
//           dateFilter={dateFilter}
//           onDateFilterChange={(value) => { setDateFilter(value); setCurrentPage(1); }}
//           dateFrom={dateFrom}
//           dateTo={dateTo}
//           onDateFromChange={(value) => { setDateFrom(value); setCurrentPage(1); }}
//           onDateToChange={(value) => { setDateTo(value); setCurrentPage(1); }}
//           searchValue={searchTerm}
//           onSearchChange={(value) => { setSearchTerm(value); setCurrentPage(1); }}
//           searchPlaceholder="Tìm khách, homestay, mã đơn..."
//           onReset={() => {
//             setActiveTab('ALL');
//             setSearchTerm('');
//             setDateFilter('all');
//             setDateFrom('');
//             setDateTo('');
//             setCurrentPage(1);
//             loadReviews('ALL');
//           }}
//         />

//         {errorMessage && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{errorMessage}</p>}

//         <section className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//           <div className="grid grid-cols-[1.2fr_1.1fr_90px_1.6fr_140px_140px_190px] bg-gray-50 px-5 py-4 text-xs font-black uppercase tracking-wide text-gray-500">
//             <span>Khách hàng</span><span>Homestay</span><span>Sao</span><span>Nội dung</span><span>AI</span><span>Trạng thái</span><span className="text-right">Thao tác</span>
//           </div>
//           {isLoading ? <div className="p-8 text-center font-bold text-gray-400">Đang tải...</div> : currentItems.length === 0 ? <div className="p-8 text-center font-bold text-gray-400">Chưa có đánh giá.</div> : currentItems.map((review) => (
//             <div key={review.reviewId} className="grid grid-cols-[1.2fr_1.1fr_90px_1.6fr_140px_140px_190px] items-center gap-3 border-t border-gray-100 px-5 py-4">
//               <div><p className="font-black text-[#2C1E15]">{review.customerName || 'Khách hàng'}</p><p className="text-xs font-semibold text-gray-400">{review.customerEmail}</p></div>
//               <div><p className="font-black text-[#2C1E15]">{review.homestayName}</p><p className="text-xs font-semibold text-gray-400">{review.bookingCode}</p></div>
//               <ReviewStars rating={review.rating} />
//               <p className="line-clamp-2 text-sm font-semibold leading-6 text-gray-600">{review.comment}</p>
//               <div><p className="text-xs font-black text-[#2C3E2B]">{scorePercent(review.finalScore)}</p><p className="mt-1 line-clamp-1 text-[11px] font-bold text-gray-400">{review.moderationAction || 'ALLOW'}</p></div>
//               <ModerationBadge review={review} />
//               <div className="flex justify-end gap-2">
//                 <button type="button" onClick={() => openDetail(review)} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gray-100 px-3 text-xs font-black text-gray-700 hover:bg-gray-200"><HiEye className="h-4 w-4" />Xem</button>
//                 {review.reviewStatus !== 'VISIBLE' && <button type="button" onClick={() => runAction(keepReviewVisible, review, 'Admin duyệt hiển thị')} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-black text-emerald-700"><HiCheckCircle className="h-4 w-4" />Hiển thị</button>}
//                 {review.reviewStatus === 'VISIBLE' && <button type="button" onClick={() => runAction(hideReview, review, 'Admin ẩn đánh giá')} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-red-50 px-3 text-xs font-black text-red-600"><HiEyeSlash className="h-4 w-4" />Ẩn</button>}
//                 <button type="button" onClick={() => removeReview(review)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><HiTrash className="h-4 w-4" /></button>
//               </div>
//             </div>
//           ))}
//         </section>

//         <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredReviews.length} itemsPerPage={ITEMS_PER_PAGE} itemName="đánh giá" />

//         {activeReview && (
//           <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onMouseDown={() => setActiveReview(null)}>
//             <div className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
//               <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-6 py-5">
//                 <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#B6784F]">Chi tiết đánh giá</p><h2 className="font-classic text-2xl font-black text-[#2C1E15]">{activeReview.homestayName}</h2><p className="text-sm font-semibold text-gray-400">{activeReview.customerName} - {formatDateTime(activeReview.createdAt)}</p></div>
//                 <button type="button" onClick={() => setActiveReview(null)} className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500"><HiXMark className="h-6 w-6" /></button>
//               </header>
//               <div className="space-y-5 px-6 py-6">
//                 <div className="grid gap-4 md:grid-cols-4">
//                   {[['Toxicity', activeReview.toxicityScore], ['Threat', activeReview.threatScore], ['Hate', activeReview.hateScore], ['Spam', activeReview.spamScore]].map(([label, value]) => <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><p className="text-xs font-black uppercase text-gray-400">{label}</p><p className="mt-2 text-2xl font-black text-[#2C3E2B]">{scorePercent(value)}</p></div>)}
//                 </div>
//                 <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><ReviewStars rating={activeReview.rating} /><p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-gray-700">{activeReview.comment}</p></div>
//                 <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4"><p className="font-black text-amber-800">Lý do AI/Admin</p><p className="mt-2 text-sm font-semibold leading-6 text-amber-700">{activeReview.moderationReason || 'Không có ghi chú.'}</p></div>
//                 <div className="flex flex-wrap justify-end gap-2">
//                   <button onClick={() => runAction(keepReviewVisible, activeReview, 'Admin duyệt hiển thị')} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white">Giữ hiển thị</button>
//                   <button onClick={() => runAction(hideReview, activeReview, 'Admin ẩn đánh giá')} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white">Ẩn đánh giá</button>
//                   <button onClick={() => runAction(rejectReview, activeReview, 'Admin từ chối đánh giá')} className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-black text-white">Từ chối</button>
//                   <button onClick={() => runAction(restoreReview, activeReview, 'Admin khôi phục đánh giá')} className="rounded-xl bg-white px-4 py-2 text-sm font-black text-gray-700 ring-1 ring-gray-200">Khôi phục</button>
//                 </div>
//                 <div><h3 className="font-black text-[#2C1E15]">Nhật ký AI</h3><div className="mt-3 space-y-2">{logs.length === 0 ? <p className="text-sm font-semibold text-gray-400">Chưa có log.</p> : logs.map((log) => <div key={log.logId} className="rounded-2xl border border-gray-100 p-3 text-xs font-semibold text-gray-600"><b>{log.provider}</b> - {log.moderationAction} - {formatDateTime(log.createdAt)}<p className="mt-1 text-gray-400">{log.moderationReason}</p></div>)}</div></div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCheckCircle, HiEye, HiEyeSlash, HiShieldExclamation, HiStar, HiTrash, HiXMark } from 'react-icons/hi2';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/common/Pagination';
import ManagementBackButton from '../../components/common/ManagementBackButton';
import ManagementHeaderRow from '../../components/common/ManagementHeaderRow';
import ManagementToolbar from '../../components/common/ManagementToolbar';
import { isWithinDateFilter } from '../../utils/dateFilter';
import { deleteAdminReview, getAdminReviewCounts, getAdminReviewLogs, getAdminReviews, hideReview, keepReviewVisible, rejectReview, restoreReview } from '../../services/reviewService';

const ITEMS_PER_PAGE = 6;
const TABS = [
  ['ALL', 'Tất cả', 'all'],
  ['NEED_REVIEW', 'Cần xem xét', 'needReview'],
  ['AI_HIDDEN', 'AI đã ẩn', 'aiHidden'],
  ['VISIBLE', 'Đang hiển thị', 'visible'],
  ['RESOLVED', 'Đã xử lý', 'resolved'],
  ['REJECTED', 'Từ chối', 'rejected'],
];

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusLabel(review) {
  if (review.reviewStatus === 'HIDDEN') return 'AI/Admin đang ẩn';
  if (review.reviewStatus === 'REJECTED') return 'Đã từ chối';
  if (review.adminReviewStatus === 'PENDING') return 'Cần admin xem xét';
  if (review.adminReviewStatus === 'RESOLVED') return 'Đã xử lý';
  return 'Đang hiển thị';
}

function scorePercent(value) {
  return Math.round(Number(value || 0) * 100) + '%';
}

function ReviewStars({ rating }) {
  return <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, index) => <HiStar key={index} className={'h-4 w-4 ' + (index < Number(rating || 0) ? 'text-amber-400' : 'text-gray-200')} />)}</div>;
}

function ModerationBadge({ review }) {
  const hidden = review.reviewStatus === 'HIDDEN';
  const pending = review.adminReviewStatus === 'PENDING';
  return <span className={'rounded-full px-3 py-1 text-[11px] font-black ' + (hidden ? 'bg-red-50 text-red-600' : pending ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700')}>{statusLabel(review)}</span>;
}

export default function AdminReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [counts, setCounts] = useState({});
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeReview, setActiveReview] = useState(null);
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadReviews = useCallback(async (tab) => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const [list, countData] = await Promise.all([
        getAdminReviews({ tab }),
        getAdminReviewCounts(),
      ]);

      setReviews(Array.isArray(list) ? list : []);
      setCounts(countData || {});
    } catch (error) {
      setErrorMessage(error.message || 'Không tải được danh sách đánh giá');
      setReviews([]);
      setCounts({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReviews(activeTab);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeTab, loadReviews]);

  const filteredReviews = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesSearch = !keyword || [review.customerName, review.customerEmail, review.homestayName, review.bookingCode, review.comment, review.moderationReason]
        .some((value) => String(value || '').toLowerCase().includes(keyword));
      const matchesDate = isWithinDateFilter(review.createdAt, dateFilter, dateFrom, dateTo);
      return matchesSearch && matchesDate;
    });
  }, [reviews, searchTerm, dateFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ITEMS_PER_PAGE));
  const currentItems = filteredReviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const openDetail = async (review) => {
    setActiveReview(review);
    try {
      setLogs(await getAdminReviewLogs(review.reviewId));
    } catch {
      setLogs([]);
    }
  };

  const runAction = async (action, review, reason = '') => {
    try {
      setErrorMessage('');
      await action(review.reviewId, reason);
      await loadReviews(activeTab);
      setActiveReview(null);
    } catch (error) {
      setErrorMessage(error.message || 'Không thực hiện được thao tác');
    }
  };

  const removeReview = async (review) => {
    if (!window.confirm('Xóa đánh giá này?')) return;
    await deleteAdminReview(review.reviewId);
    await loadReviews(activeTab);
  };

  return (
    <AdminLayout>
      <div className="space-y-5 text-sm">
        <ManagementHeaderRow backButton={<ManagementBackButton onClick={() => navigate('/admin')} />}>
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2C3E2B]/10 text-[#2C3E2B]"><HiShieldExclamation className="h-7 w-7" /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#B6784F]">AI Moderation</p>
                <h1 className="font-classic text-3xl font-black text-[#2C1E15]">Quản lý đánh giá</h1>
                <p className="mt-1 text-sm font-semibold text-gray-500">Theo dõi đánh giá bị AI gắn cờ, đã ẩn và quyết định hiển thị công khai.</p>
              </div>
            </div>
          </div>
        </section>
        </ManagementHeaderRow>

        <ManagementToolbar

          filters={[
            {
              label: 'Trạng thái',
              value: activeTab,
              onChange: (value) => { setActiveTab(value); setCurrentPage(1); },
              options: TABS.map(([value, label, key]) => ({ value, label: `${label} (${counts[key] ?? 0})` })),
            },
          ]}
          dateFilter={dateFilter}
          onDateFilterChange={(value) => { setDateFilter(value); setCurrentPage(1); }}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={(value) => { setDateFrom(value); setCurrentPage(1); }}
          onDateToChange={(value) => { setDateTo(value); setCurrentPage(1); }}
          searchValue={searchTerm}
          onSearchChange={(value) => { setSearchTerm(value); setCurrentPage(1); }}
          searchPlaceholder="Tìm khách, homestay, mã đơn..."
          onReset={() => {
            const wasAlreadyAll = activeTab === 'ALL';

            setActiveTab('ALL');
            setSearchTerm('');
            setDateFilter('all');
            setDateFrom('');
            setDateTo('');
            setCurrentPage(1);

            if (wasAlreadyAll) {
              void loadReviews('ALL');
            }
          }}
        />

        {errorMessage && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{errorMessage}</p>}

        <section className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.2fr_1.1fr_90px_1.6fr_140px_140px_190px] bg-gray-50 px-5 py-4 text-xs font-black uppercase tracking-wide text-gray-500">
            <span>Khách hàng</span><span>Homestay</span><span>Sao</span><span>Nội dung</span><span>AI</span><span>Trạng thái</span><span className="text-right">Thao tác</span>
          </div>
          {isLoading ? <div className="p-8 text-center font-bold text-gray-400">Đang tải...</div> : currentItems.length === 0 ? <div className="p-8 text-center font-bold text-gray-400">Chưa có đánh giá.</div> : currentItems.map((review) => (
            <div key={review.reviewId} className="grid grid-cols-[1.2fr_1.1fr_90px_1.6fr_140px_140px_190px] items-center gap-3 border-t border-gray-100 px-5 py-4">
              <div><p className="font-black text-[#2C1E15]">{review.customerName || 'Khách hàng'}</p><p className="text-xs font-semibold text-gray-400">{review.customerEmail}</p></div>
              <div><p className="font-black text-[#2C1E15]">{review.homestayName}</p><p className="text-xs font-semibold text-gray-400">{review.bookingCode}</p></div>
              <ReviewStars rating={review.rating} />
              <p className="line-clamp-2 text-sm font-semibold leading-6 text-gray-600">{review.comment}</p>
              <div><p className="text-xs font-black text-[#2C3E2B]">{scorePercent(review.finalScore)}</p><p className="mt-1 line-clamp-1 text-[11px] font-bold text-gray-400">{review.moderationAction || 'ALLOW'}</p></div>
              <ModerationBadge review={review} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => openDetail(review)} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gray-100 px-3 text-xs font-black text-gray-700 hover:bg-gray-200"><HiEye className="h-4 w-4" />Xem</button>
                {review.reviewStatus !== 'VISIBLE' && <button type="button" onClick={() => runAction(keepReviewVisible, review, 'Admin duyệt hiển thị')} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-black text-emerald-700"><HiCheckCircle className="h-4 w-4" />Hiển thị</button>}
                {review.reviewStatus === 'VISIBLE' && <button type="button" onClick={() => runAction(hideReview, review, 'Admin ẩn đánh giá')} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-red-50 px-3 text-xs font-black text-red-600"><HiEyeSlash className="h-4 w-4" />Ẩn</button>}
                <button type="button" onClick={() => removeReview(review)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><HiTrash className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </section>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredReviews.length} itemsPerPage={ITEMS_PER_PAGE} itemName="đánh giá" />

        {activeReview && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onMouseDown={() => setActiveReview(null)}>
            <div className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
              <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white px-6 py-5">
                <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#B6784F]">Chi tiết đánh giá</p><h2 className="font-classic text-2xl font-black text-[#2C1E15]">{activeReview.homestayName}</h2><p className="text-sm font-semibold text-gray-400">{activeReview.customerName} - {formatDateTime(activeReview.createdAt)}</p></div>
                <button type="button" onClick={() => setActiveReview(null)} className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500"><HiXMark className="h-6 w-6" /></button>
              </header>
              <div className="space-y-5 px-6 py-6">
                <div className="grid gap-4 md:grid-cols-4">
                  {[['Toxicity', activeReview.toxicityScore], ['Threat', activeReview.threatScore], ['Hate', activeReview.hateScore], ['Spam', activeReview.spamScore]].map(([label, value]) => <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><p className="text-xs font-black uppercase text-gray-400">{label}</p><p className="mt-2 text-2xl font-black text-[#2C3E2B]">{scorePercent(value)}</p></div>)}
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><ReviewStars rating={activeReview.rating} /><p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-gray-700">{activeReview.comment}</p></div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4"><p className="font-black text-amber-800">Lý do AI/Admin</p><p className="mt-2 text-sm font-semibold leading-6 text-amber-700">{activeReview.moderationReason || 'Không có ghi chú.'}</p></div>
                <div className="flex flex-wrap justify-end gap-2">
                  <button onClick={() => runAction(keepReviewVisible, activeReview, 'Admin duyệt hiển thị')} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white">Giữ hiển thị</button>
                  <button onClick={() => runAction(hideReview, activeReview, 'Admin ẩn đánh giá')} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white">Ẩn đánh giá</button>
                  <button onClick={() => runAction(rejectReview, activeReview, 'Admin từ chối đánh giá')} className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-black text-white">Từ chối</button>
                  <button onClick={() => runAction(restoreReview, activeReview, 'Admin khôi phục đánh giá')} className="rounded-xl bg-white px-4 py-2 text-sm font-black text-gray-700 ring-1 ring-gray-200">Khôi phục</button>
                </div>
                <div><h3 className="font-black text-[#2C1E15]">Nhật ký AI</h3><div className="mt-3 space-y-2">{logs.length === 0 ? <p className="text-sm font-semibold text-gray-400">Chưa có log.</p> : logs.map((log) => <div key={log.logId} className="rounded-2xl border border-gray-100 p-3 text-xs font-semibold text-gray-600"><b>{log.provider}</b> - {log.moderationAction} - {formatDateTime(log.createdAt)}<p className="mt-1 text-gray-400">{log.moderationReason}</p></div>)}</div></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}











