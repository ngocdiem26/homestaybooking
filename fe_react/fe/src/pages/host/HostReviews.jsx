import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiEye, HiMagnifyingGlass, HiPaperAirplane, HiStar, HiXMark } from 'react-icons/hi2';
import HostLayout from '../../layouts/HostLayout';
import Pagination from '../../components/common/Pagination';
import { getHostReviews, replyToHostReview } from '../../services/reviewService';

const ITEMS_PER_PAGE = 6;

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function ReviewStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <HiStar key={index} className={'h-4 w-4 ' + (index < Number(rating || 0) ? 'text-amber-400' : 'text-gray-200')} />
      ))}
    </div>
  );
}

export default function HostReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'REPLIED' ? Boolean(review.replyContent) : !review.replyContent);
      const matchesSearch = !keyword || [review.customerName, review.customerEmail, review.homestayName, review.bookingCode, review.comment, review.replyContent]
        .some((value) => String(value || '').toLowerCase().includes(keyword));
      return matchesStatus && matchesSearch;
    });
  }, [reviews, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ITEMS_PER_PAGE));
  const indexOfFirstItem = (currentPage - 1) * ITEMS_PER_PAGE;
  const indexOfLastItem = indexOfFirstItem + ITEMS_PER_PAGE;
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);

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
        <button type="button" onClick={() => navigate('/host')} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200/60 bg-white px-3.5 py-2 text-xs font-bold text-gray-600 shadow-sm transition hover:bg-gray-100">
          &lt; Về bảng điều khiển
        </button>

        <section className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#2C3E2B]/5 bg-[#2C3E2B]/10 text-[#2C3E2B] shadow-inner">
                <HiStar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-classic text-2xl font-black text-[#2C1E15]">Quản lý đánh giá</h2>
                <p className="mt-0.5 max-w-2xl text-xs font-semibold leading-relaxed text-gray-400">Theo dõi đánh giá thuộc homestay của bạn và phản hồi công khai cho khách hàng.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"><p className="text-gray-400">Tất cả</p><p className="mt-1 text-lg text-[#2C1E15]">{reviews.length}</p></div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3"><p className="text-emerald-600">Đã phản hồi</p><p className="mt-1 text-lg text-emerald-700">{reviews.filter((item) => item.replyContent).length}</p></div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3"><p className="text-amber-600">Chưa phản hồi</p><p className="mt-1 text-lg text-amber-700">{reviews.filter((item) => !item.replyContent).length}</p></div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="flex w-fit rounded-xl border border-gray-200 bg-white p-1 text-xs font-black shadow-sm">
              {[['ALL', 'Tất cả'], ['REPLIED', 'Đã phản hồi'], ['PENDING', 'Chưa phản hồi']].map(([value, label]) => (
                <button key={value} type="button" onClick={() => { setStatusFilter(value); setCurrentPage(1); }} className={'rounded-lg px-4 py-2 transition ' + (statusFilter === value ? 'bg-[#2C3E2B] text-white shadow-sm' : 'text-gray-500 hover:text-[#2C3E2B]')}>
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-1 items-center gap-3 lg:max-w-2xl">
              <div className="flex h-11 flex-1 items-center rounded-xl border border-gray-200 bg-white px-4 shadow-sm focus-within:border-[#2C3E2B]/50">
                <HiMagnifyingGlass className="mr-2 h-4 w-4 text-gray-400" />
                <input value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} placeholder="Tìm khách hàng, homestay, mã đơn..." className="w-full bg-transparent text-sm font-semibold text-gray-700 outline-none placeholder:text-gray-400" />
              </div>
              <button type="button" onClick={loadReviews} className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-xs font-black text-gray-500 shadow-sm transition hover:text-[#2C3E2B]">Làm mới</button>
            </div>
          </div>
        </section>

        {errorMessage && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">{errorMessage}</div>}

        <section className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px] table-fixed text-left">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-xs font-black uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-[17%] px-3 py-4">Khách hàng</th>
                  <th className="w-[18%] px-3 py-4">Homestay</th>
                  <th className="w-[11%] px-3 py-4">Sao</th>
                  <th className="w-[20%] px-3 py-4">Nội dung</th>
                  <th className="w-[13%] px-3 py-4">Ngày tạo</th>
                  <th className="w-[9%] px-3 py-4 text-center">Phản hồi</th>
                  <th className="w-[12%] px-3 py-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-semibold text-gray-600">
                {isLoading ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-400">Đang tải đánh giá...</td></tr>
                ) : currentItems.length ? currentItems.map((review) => (
                  <tr key={review.reviewId} className="transition hover:bg-gray-50/60">
                    <td className="px-3 py-4"><p className="font-black text-[#2C1E15] truncate">{review.customerName}</p><p className="mt-0.5 text-[11px] text-gray-400 truncate">{review.customerEmail}</p></td>
                    <td className="px-3 py-4"><p className="font-black text-[#2C1E15] truncate">{review.homestayName}</p><p className="mt-0.5 text-[11px] text-[#6E473B]">{review.homestayCode} • {review.bookingCode}</p></td>
                    <td className="px-3 py-4"><ReviewStars rating={review.rating} /></td>
                    <td className="px-3 py-4"><p className="line-clamp-2 max-w-full break-words text-xs leading-5" title={review.comment}>{review.comment}</p></td>
                    <td className="px-3 py-4 text-xs font-bold text-gray-500">{formatDateTime(review.createdAt)}</td>
                    <td className="px-3 py-4 text-center"><span className={'rounded-full px-3 py-1 text-[11px] font-black ' + (review.replyContent ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{review.replyContent ? 'Đã phản hồi' : 'Chưa phản hồi'}</span></td>
                    <td className="px-3 py-4 text-center"><button type="button" onClick={() => openReview(review)} className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-gray-50 px-3 text-[11px] font-black text-[#2C3E2B] shadow-sm transition hover:bg-[#2C3E2B] hover:text-white"><HiEye className="h-4 w-4" /><span>Xem và phản hồi</span></button></td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-400">Không có đánh giá phù hợp.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} totalItems={filteredReviews.length} indexOfFirstItem={indexOfFirstItem} indexOfLastItem={indexOfLastItem} itemName="đánh giá" />
        </section>

        {activeReview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 rounded-t-3xl bg-[#202c3c] px-6 py-5 text-white">
                <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#E3B17A]">Chi tiết đánh giá</p><h3 className="mt-1 text-xl font-black">{activeReview.homestayName}</h3><p className="text-xs font-semibold text-white/60">{activeReview.bookingCode} • {formatDateTime(activeReview.createdAt)}</p></div>
                <button type="button" onClick={() => setActiveReview(null)} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[#202c3c]"><HiXMark className="h-6 w-6" /></button>
              </div>
              <form className="space-y-4 p-6" onSubmit={submitReply}>
                <div className="flex items-center justify-between rounded-2xl bg-[#F4F1EA] p-4"><div><p className="text-xs font-bold uppercase text-gray-400">Khách hàng</p><p className="font-black text-[#2C1E15]">{activeReview.customerName}</p><p className="text-xs font-semibold text-gray-500">{activeReview.customerEmail}</p></div><ReviewStars rating={activeReview.rating} /></div>
                <p className="whitespace-pre-line rounded-2xl border border-gray-100 p-4 text-sm font-semibold leading-7 text-gray-600">{activeReview.comment}</p>
                {activeReview.replyContent ? (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold leading-7 text-gray-600">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Phản hồi đã gửi</p>
                    <p className="mt-2 whitespace-pre-line">{activeReview.replyContent}</p>
                    <p className="mt-2 text-[11px] font-bold text-gray-400">Phản hồi chỉ gửi được một lần và không thể chỉnh sửa.</p>
                  </div>
                ) : (
                  <>
                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-wide text-gray-500">Phản hồi của chủ homestay</span>
                      <textarea value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} rows={5} className="mt-2 w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold leading-6 text-gray-700 outline-none transition focus:border-[#2C3E2B]" placeholder="Nhập phản hồi gửi đến khách hàng..." />
                    </label>
                    <button disabled={isSaving} type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#2C3E2B] text-sm font-black text-white shadow transition hover:bg-[#223322] disabled:cursor-not-allowed disabled:opacity-60"><HiPaperAirplane className="h-4 w-4" /> {isSaving ? 'Đang gửi...' : 'Gửi phản hồi'}</button>
                  </>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </HostLayout>
  );
}
