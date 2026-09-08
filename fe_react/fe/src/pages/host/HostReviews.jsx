// import { useEffect, useMemo, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { HiEye,  HiPaperAirplane, HiStar, HiXMark } from 'react-icons/hi2';
// import HostLayout from '../../layouts/HostLayout';
// import Pagination from '../../components/common/Pagination';
// import ManagementBackButton from '../../components/common/ManagementBackButton';
// import ManagementHeaderRow from '../../components/common/ManagementHeaderRow';
// import ManagementToolbar from '../../components/common/ManagementToolbar';
// import { isWithinDateFilter } from '../../utils/dateFilter';
// import { getHostReviews, replyToHostReview } from '../../services/reviewService';

// const ITEMS_PER_PAGE = 6;

// function formatDateTime(value) {
//   if (!value) return '';
//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return String(value);
//   return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
// }

// function friendlyStatus(review) {
//   if (review.reviewStatus === 'HIDDEN') return 'Đang được Cozygo xem xét';
//   if (review.reviewStatus === 'REJECTED') return 'Không hiển thị công khai';
//   return 'Đang hiển thị công khai';
// }

// function ReviewStars({ rating }) {
//   return <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, index) => <HiStar key={index} className={'h-4 w-4 ' + (index < Number(rating || 0) ? 'text-amber-400' : 'text-gray-200')} />)}</div>;
// }

// export default function HostReviews() {
//   const navigate = useNavigate();
//   const [reviews, setReviews] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('ALL');
//   const [dateFilter, setDateFilter] = useState('all');
//   const [dateFrom, setDateFrom] = useState('');
//   const [dateTo, setDateTo] = useState('');
//   const [activeReview, setActiveReview] = useState(null);
//   const [replyDraft, setReplyDraft] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSaving, setIsSaving] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');

//   const loadReviews = async () => {
//     try {
//       setIsLoading(true);
//       setErrorMessage('');
//       const data = await getHostReviews();
//       setReviews(Array.isArray(data) ? data : []);
//     } catch (error) {
//       setErrorMessage(error.message || 'Không tải được danh sách đánh giá');
//       setReviews([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => { loadReviews(); }, []);

//   const filteredReviews = useMemo(() => {
//     const keyword = searchTerm.trim().toLowerCase();
//     return reviews.filter((review) => {
//       const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'REPLIED' ? Boolean(review.replyContent) : !review.replyContent);
//       const matchesSearch = !keyword || [review.customerName, review.customerEmail, review.homestayName, review.bookingCode, review.comment, review.replyContent]
//         .some((value) => String(value || '').toLowerCase().includes(keyword));
//       const matchesDate = isWithinDateFilter(review.createdAt, dateFilter, dateFrom, dateTo);
//       return matchesStatus && matchesSearch && matchesDate;
//     });
//   }, [reviews, searchTerm, statusFilter, dateFilter, dateFrom, dateTo]);

//   const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ITEMS_PER_PAGE));
//   const currentItems = filteredReviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

//   const openReview = (review) => {
//     setActiveReview(review);
//     setReplyDraft(review.replyContent || '');
//     setErrorMessage('');
//   };

//   const submitReply = async (event) => {
//     event.preventDefault();
//     if (!activeReview || activeReview.replyContent) return;
//     if (replyDraft.trim().length < 2) {
//       setErrorMessage('Nội dung phản hồi cần ít nhất 2 ký tự');
//       return;
//     }
//     try {
//       setIsSaving(true);
//       setErrorMessage('');
//       const updated = await replyToHostReview(activeReview.reviewId, replyDraft.trim());
//       setReviews((current) => current.map((item) => item.reviewId === updated.reviewId ? updated : item));
//       setActiveReview(updated);
//       setReplyDraft(updated.replyContent || '');
//     } catch (error) {
//       setErrorMessage(error.message || 'Không gửi được phản hồi');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <HostLayout>
//       <div className="space-y-5 text-left text-sm">
//         <ManagementHeaderRow backButton={<ManagementBackButton onClick={() => navigate('/host')} />}>
//           <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
//             <div className="flex items-center gap-3">
//               <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2C3E2B]/10 text-[#2C3E2B]"><HiStar className="h-6 w-6" /></div>
//               <div>
//                 <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B6784F]">Host review center</p>
//                 <h2 className="font-classic text-2xl font-black text-[#2C1E15]">Quản lý đánh giá</h2>
//                 <p className="mt-0.5 max-w-2xl text-xs font-semibold leading-relaxed text-gray-500">Theo dõi đánh giá thuộc homestay của bạn và phản hồi công khai cho khách hàng.</p>
//               </div>
//             </div>
//             <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
//               <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"><p className="text-gray-500">Tất cả</p><p className="mt-1 text-lg text-[#2C1E15]">{reviews.length}</p></div>
//               <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3"><p className="text-emerald-600">Đã phản hồi</p><p className="mt-1 text-lg text-emerald-700">{reviews.filter((item) => item.replyContent).length}</p></div>
//               <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3"><p className="text-amber-600">Chưa phản hồi</p><p className="mt-1 text-lg text-amber-700">{reviews.filter((item) => !item.replyContent).length}</p></div>
//             </div>
//           </div>
//         </section>
//         </ManagementHeaderRow>

//         <ManagementToolbar
//           filters={[
//             {
//               label: 'Trạng thái',
//               value: statusFilter,
//               onChange: (value) => { setStatusFilter(value); setCurrentPage(1); },
//               options: [
//                 { value: 'ALL', label: 'Tất cả' },
//                 { value: 'WAITING', label: 'Chưa phản hồi' },
//                 { value: 'REPLIED', label: 'Đã phản hồi' },
//               ],
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
//             setStatusFilter('ALL');
//             setSearchTerm('');
//             setDateFilter('all');
//             setDateFrom('');
//             setDateTo('');
//             setCurrentPage(1);
//             loadReviews();
//           }}
//         />

//         {errorMessage && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{errorMessage}</p>}

//         <section className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
//           <div className="grid grid-cols-[1.1fr_1.2fr_90px_1.7fr_140px_180px] bg-gray-50 px-5 py-4 text-xs font-black uppercase tracking-wide text-gray-500"><span>Khách</span><span>Homestay</span><span>Sao</span><span>Nội dung</span><span>Trạng thái</span><span className="text-right">Thao tác</span></div>
//           {isLoading ? <div className="p-8 text-center font-bold text-gray-400">Đang tải...</div> : currentItems.length === 0 ? <div className="p-8 text-center font-bold text-gray-400">Chưa có đánh giá.</div> : currentItems.map((review) => (
//             <div key={review.reviewId} className="grid grid-cols-[1.1fr_1.2fr_90px_1.7fr_140px_180px] items-center gap-3 border-t border-gray-100 px-5 py-4">
//               <div><p className="font-black text-[#2C1E15]">{review.customerName || 'Khách hàng'}</p><p className="text-xs font-semibold text-gray-400">{formatDateTime(review.createdAt)}</p></div>
//               <div><p className="font-black text-[#2C1E15]">{review.homestayName}</p><p className="text-xs font-semibold text-gray-400">{review.bookingCode}</p></div>
//               <ReviewStars rating={review.rating} />
//               <p className="line-clamp-2 text-sm font-semibold leading-6 text-gray-600">{review.comment}</p>
//               <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-black text-gray-600">{friendlyStatus(review)}</span>
//               <div className="flex justify-end"><button type="button" onClick={() => openReview(review)} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#2C3E2B] px-4 text-xs font-black text-white"><HiEye className="h-4 w-4" />Xem và phản hồi</button></div>
//             </div>
//           ))}
//         </section>

//         <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredReviews.length} itemsPerPage={ITEMS_PER_PAGE} itemName="đánh giá" />

//         {activeReview && (
//           <div className="fixed inset-0 z-[10000] flex items-center justify-end bg-black/55 backdrop-blur-sm" onMouseDown={() => setActiveReview(null)}>
//             <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
//               <header className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-[#1E2B3A] px-6 py-6 text-white"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F3B37A]">Chi tiết đánh giá</p><h3 className="mt-2 font-classic text-2xl font-black">{activeReview.homestayName}</h3><p className="mt-1 text-sm font-semibold text-white/70">{activeReview.customerName}</p></div><button onClick={() => setActiveReview(null)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><HiXMark className="h-6 w-6" /></button></header>
//               <div className="space-y-5 px-6 py-6">
//                 <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><ReviewStars rating={activeReview.rating} /><p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-gray-700">{activeReview.comment}</p><p className="mt-3 text-xs font-bold text-gray-400">{formatDateTime(activeReview.createdAt)}</p></div>
//                 {activeReview.replyContent ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="font-black text-[#2C3E2B]">Phản hồi đã gửi</p><p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-gray-700">{activeReview.replyContent}</p></div> : <form onSubmit={submitReply} className="space-y-3"><label className="block text-sm font-black text-[#2C1E15]">Phản hồi của chủ homestay</label><textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} rows={5} className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-[#2C3E2B]" placeholder="Nhập phản hồi lịch sự cho khách..." /><button disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2C3E2B] px-5 text-sm font-black text-white"><HiPaperAirplane className="h-4 w-4" />{isSaving ? 'Đang gửi...' : 'Gửi phản hồi'}</button></form>}
//               </div>
//             </aside>
//           </div>
//         )}
//       </div>
//     </HostLayout>
//   );
// }

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiEye,  HiPaperAirplane, HiStar, HiXMark } from 'react-icons/hi2';
import HostLayout from '../../layouts/HostLayout';
import Pagination from '../../components/common/Pagination';
import ManagementBackButton from '../../components/common/ManagementBackButton';
import ManagementHeaderRow from '../../components/common/ManagementHeaderRow';
import ManagementToolbar from '../../components/common/ManagementToolbar';
import { isWithinDateFilter } from '../../utils/dateFilter';
import { getHostReviews, replyToHostReview } from '../../services/reviewService';

const ITEMS_PER_PAGE = 6;

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function friendlyStatus(review) {
  if (review.reviewStatus === 'HIDDEN') return 'Đang được Cozygo xem xét';
  if (review.reviewStatus === 'REJECTED') return 'Không hiển thị công khai';
  return 'Đang hiển thị công khai';
}

function ReviewStars({ rating }) {
  return <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, index) => <HiStar key={index} className={'h-4 w-4 ' + (index < Number(rating || 0) ? 'text-amber-400' : 'text-gray-200')} />)}</div>;
}

export default function HostReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeReview, setActiveReview] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await getHostReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(error.message || 'Không tải được danh sách đánh giá');
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getHostReviews()
      .then((data) => {
        if (!isMounted) return;
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (!isMounted) return;
        setErrorMessage(error.message || 'Không tải được danh sách đánh giá');
        setReviews([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReviews = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'REPLIED' ? Boolean(review.replyContent) : !review.replyContent);
      const matchesSearch = !keyword || [review.customerName, review.customerEmail, review.homestayName, review.bookingCode, review.comment, review.replyContent]
        .some((value) => String(value || '').toLowerCase().includes(keyword));
      const matchesDate = isWithinDateFilter(review.createdAt, dateFilter, dateFrom, dateTo);
      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [reviews, searchTerm, statusFilter, dateFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ITEMS_PER_PAGE));
  const currentItems = filteredReviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const openReview = (review) => {
    setActiveReview(review);
    setReplyDraft(review.replyContent || '');
    setErrorMessage('');
  };

  const submitReply = async (event) => {
    event.preventDefault();
    if (!activeReview || activeReview.replyContent) return;
    if (replyDraft.trim().length < 2) {
      setErrorMessage('Nội dung phản hồi cần ít nhất 2 ký tự');
      return;
    }
    try {
      setIsSaving(true);
      setErrorMessage('');
      const updated = await replyToHostReview(activeReview.reviewId, replyDraft.trim());
      setReviews((current) => current.map((item) => item.reviewId === updated.reviewId ? updated : item));
      setActiveReview(updated);
      setReplyDraft(updated.replyContent || '');
    } catch (error) {
      setErrorMessage(error.message || 'Không gửi được phản hồi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <HostLayout>
      <div className="space-y-5 text-left text-sm">
        <ManagementHeaderRow backButton={<ManagementBackButton onClick={() => navigate('/host')} />}>
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2C3E2B]/10 text-[#2C3E2B]"><HiStar className="h-6 w-6" /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B6784F]">Host review center</p>
                <h2 className="font-classic text-2xl font-black text-[#2C1E15]">Quản lý đánh giá</h2>
                <p className="mt-0.5 max-w-2xl text-xs font-semibold leading-relaxed text-gray-500">Theo dõi đánh giá thuộc homestay của bạn và phản hồi công khai cho khách hàng.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"><p className="text-gray-500">Tất cả</p><p className="mt-1 text-lg text-[#2C1E15]">{reviews.length}</p></div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3"><p className="text-emerald-600">Đã phản hồi</p><p className="mt-1 text-lg text-emerald-700">{reviews.filter((item) => item.replyContent).length}</p></div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3"><p className="text-amber-600">Chưa phản hồi</p><p className="mt-1 text-lg text-amber-700">{reviews.filter((item) => !item.replyContent).length}</p></div>
            </div>
          </div>
        </section>
        </ManagementHeaderRow>

        <ManagementToolbar
          filters={[
            {
              label: 'Trạng thái',
              value: statusFilter,
              onChange: (value) => { setStatusFilter(value); setCurrentPage(1); },
              options: [
                { value: 'ALL', label: 'Tất cả' },
                { value: 'WAITING', label: 'Chưa phản hồi' },
                { value: 'REPLIED', label: 'Đã phản hồi' },
              ],
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
            setStatusFilter('ALL');
            setSearchTerm('');
            setDateFilter('all');
            setDateFrom('');
            setDateTo('');
            setCurrentPage(1);
            loadReviews();
          }}
        />

        {errorMessage && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{errorMessage}</p>}

        <section className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.1fr_1.2fr_90px_1.7fr_140px_180px] bg-gray-50 px-5 py-4 text-xs font-black uppercase tracking-wide text-gray-500"><span>Khách</span><span>Homestay</span><span>Sao</span><span>Nội dung</span><span>Trạng thái</span><span className="text-right">Thao tác</span></div>
          {isLoading ? <div className="p-8 text-center font-bold text-gray-400">Đang tải...</div> : currentItems.length === 0 ? <div className="p-8 text-center font-bold text-gray-400">Chưa có đánh giá.</div> : currentItems.map((review) => (
            <div key={review.reviewId} className="grid grid-cols-[1.1fr_1.2fr_90px_1.7fr_140px_180px] items-center gap-3 border-t border-gray-100 px-5 py-4">
              <div><p className="font-black text-[#2C1E15]">{review.customerName || 'Khách hàng'}</p><p className="text-xs font-semibold text-gray-400">{formatDateTime(review.createdAt)}</p></div>
              <div><p className="font-black text-[#2C1E15]">{review.homestayName}</p><p className="text-xs font-semibold text-gray-400">{review.bookingCode}</p></div>
              <ReviewStars rating={review.rating} />
              <p className="line-clamp-2 text-sm font-semibold leading-6 text-gray-600">{review.comment}</p>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-black text-gray-600">{friendlyStatus(review)}</span>
              <div className="flex justify-end"><button type="button" onClick={() => openReview(review)} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#2C3E2B] px-4 text-xs font-black text-white"><HiEye className="h-4 w-4" />Xem và phản hồi</button></div>
            </div>
          ))}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            totalItems={filteredReviews.length}
            indexOfFirstItem={(currentPage - 1) * ITEMS_PER_PAGE}
            indexOfLastItem={currentPage * ITEMS_PER_PAGE}
            itemName="đánh giá"
          />
        </section>

        {activeReview && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-end bg-black/55 backdrop-blur-sm" onMouseDown={() => setActiveReview(null)}>
            <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
              <header className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-[#1E2B3A] px-6 py-6 text-white"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F3B37A]">Chi tiết đánh giá</p><h3 className="mt-2 font-classic text-2xl font-black">{activeReview.homestayName}</h3><p className="mt-1 text-sm font-semibold text-white/70">{activeReview.customerName}</p></div><button onClick={() => setActiveReview(null)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><HiXMark className="h-6 w-6" /></button></header>
              <div className="space-y-5 px-6 py-6">
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><ReviewStars rating={activeReview.rating} /><p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-gray-700">{activeReview.comment}</p><p className="mt-3 text-xs font-bold text-gray-400">{formatDateTime(activeReview.createdAt)}</p></div>
                {activeReview.replyContent ? <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="font-black text-[#2C3E2B]">Phản hồi đã gửi</p><p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-gray-700">{activeReview.replyContent}</p></div> : <form onSubmit={submitReply} className="space-y-3"><label className="block text-sm font-black text-[#2C1E15]">Phản hồi của chủ homestay</label><textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} rows={5} className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold leading-6 outline-none focus:border-[#2C3E2B]" placeholder="Nhập phản hồi lịch sự cho khách..." /><button disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2C3E2B] px-5 text-sm font-black text-white"><HiPaperAirplane className="h-4 w-4" />{isSaving ? 'Đang gửi...' : 'Gửi phản hồi'}</button></form>}
              </div>
            </aside>
          </div>
        )}
      </div>
    </HostLayout>
  );
}






