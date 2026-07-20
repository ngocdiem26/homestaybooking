import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiChatBubbleLeftRight, HiPencilSquare, HiStar, HiXMark } from 'react-icons/hi2';
import ModalPortal from '../common/ModalPortal';

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function ReviewStars({ rating, onChange, size = 'sm', interactive = false }) {
  const iconSize = size === 'lg' ? 'h-8 w-8' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => {
        const value = index + 1;
        const Icon = <HiStar className={iconSize + ' ' + (value <= Number(rating || 0) ? 'text-amber-400' : 'text-gray-200')} />;
        return interactive ? (
          <button key={value} type="button" onClick={() => onChange(value)} className="rounded-lg p-0.5 transition hover:scale-105" aria-label={value + ' sao'}>
            {Icon}
          </button>
        ) : <span key={value}>{Icon}</span>;
      })}
    </div>
  );
}

function ReplyCollapse({ review }) {
  const [open, setOpen] = useState(false);
  if (!review.replyContent) return null;
  return (
    <div className="mt-3">
      <button type="button" onClick={() => setOpen((current) => !current)} className="inline-flex items-center gap-1.5 rounded-full bg-[#2C3E2B]/10 px-3 py-1.5 text-[11px] font-black text-[#2C3E2B] transition hover:bg-[#2C3E2B] hover:text-white">
        <HiChatBubbleLeftRight className="h-3.5 w-3.5" /> 1 phản hồi {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="mt-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold leading-6 text-gray-600">
          <p className="font-black text-[#2C3E2B]">Phản hồi của chủ homestay</p>
          <p className="mt-1 whitespace-pre-line">{review.replyContent}</p>
          <p className="mt-2 text-[10px] font-bold text-gray-400">{formatDateTime(review.replyUpdatedAt || review.replyCreatedAt)}</p>
        </div>
      )}
    </div>
  );
}

function EditReviewModal({ review, onClose, onSubmit }) {
  const [rating, setRating] = useState(Number(review.rating || 5));
  const [comment, setComment] = useState(review.comment || '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (comment.trim().length < 10) {
      setError('Nội dung đánh giá cần ít nhất 10 ký tự.');
      return;
    }
    try {
      setIsSaving(true);
      setError('');
      await onSubmit(review.reviewId, { rating, comment: comment.trim() });
      onClose();
    } catch (err) {
      setError(err.message || 'Không sửa được đánh giá');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalPortal className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white text-left shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B6784F]">Cozygo Review</p>
            <h3 className="mt-1 font-classic text-2xl font-black text-[#2C1E15]">Sửa đánh giá</h3>
            <p className="mt-1 text-sm font-semibold text-gray-400">{review.homestayName}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-[#2C3E2B] hover:text-white" aria-label="Đóng">
            <HiXMark className="h-6 w-6" />
          </button>
        </header>
        <form onSubmit={submit} className="space-y-5 px-6 py-6">
          <div>
            <label className="text-sm font-black text-[#2C1E15]">* Chấm điểm</label>
            <div className="mt-2"><ReviewStars rating={rating} onChange={setRating} size="lg" interactive /></div>
          </div>
          <label className="block">
            <span className="text-sm font-black text-[#2C1E15]">Nhận xét</span>
            <textarea value={comment} onChange={(event) => { setComment(event.target.value); setError(''); }} rows={5} className="mt-2 w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold leading-6 text-gray-700 outline-none transition focus:border-[#2C3E2B]" />
          </label>
          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} className="h-11 rounded-2xl bg-gray-100 px-5 text-sm font-black text-gray-600 transition hover:bg-gray-200">Hủy</button>
            <button disabled={isSaving} type="submit" className="h-11 rounded-2xl bg-[#2C3E2B] px-6 text-sm font-black text-white shadow transition hover:bg-[#223322] disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}

export default function ReviewManager({ errorMessage = '', reviews = [], focusedReviewId = null, onUpdateReview }) {
  const navigate = useNavigate();
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    if (!focusedReviewId) return;
    const target = document.getElementById('review-card-' + focusedReviewId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('ring-2', 'ring-[#B6784F]', 'ring-offset-2');
      window.setTimeout(() => target.classList.remove('ring-2', 'ring-[#B6784F]', 'ring-offset-2'), 1800);
    }
  }, [focusedReviewId, reviews]);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Đánh giá của tôi</h2>
        <p className="text-xs text-gray-400 font-medium">Các nhận xét bạn đã gửi sau khi hoàn thành đơn đặt homestay.</p>
      </div>
      {errorMessage && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{errorMessage}</div>}
      <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2 custom-scrollbar">
        {reviews.length ? reviews.map((review) => (
          <div id={'review-card-' + review.reviewId} key={review.reviewId} className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <button type="button" onClick={() => navigate('/homestay/' + review.homeId)} className="block max-w-full truncate text-left text-base font-black text-[#2C1E15] transition hover:text-[#6E473B] hover:underline">
                  {review.homestayName}
                </button>
                <p className="mt-0.5 text-[11px] font-semibold text-[#6E473B]">{review.bookingCode}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">{formatDateTime(review.createdAt)}</span>
                <button type="button" onClick={() => setEditingReview(review)} className="inline-flex items-center gap-1 rounded-xl bg-[#F4F1EA] px-3 py-2 text-[11px] font-black text-[#2C3E2B] transition hover:bg-[#2C3E2B] hover:text-white">
                  <HiPencilSquare className="h-4 w-4" /> Sửa
                </button>
              </div>
            </div>
            <ReviewStars rating={review.rating} />
            <p className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs font-semibold leading-relaxed text-gray-600 whitespace-pre-line">{review.comment}</p>
            <ReplyCollapse review={review} />
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm font-semibold text-gray-400">
            Bạn chưa có đánh giá nào. Các đơn đã hoàn thành sẽ có nút đánh giá trong mục đơn đặt phòng.
          </div>
        )}
      </div>
      {editingReview && <EditReviewModal review={editingReview} onClose={() => setEditingReview(null)} onSubmit={onUpdateReview} />}
    </div>
  );
}
