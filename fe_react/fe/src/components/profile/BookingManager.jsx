import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiPencilSquare, HiStar, HiXMark } from 'react-icons/hi2';
import ModalPortal from '../common/ModalPortal';

const TEXT = {
  all: 'Tất cả',
  pending: 'Đang chờ xử lý',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
  completed: 'Đã hoàn thành',
  managerTitle: 'Quản lý đơn đặt phòng',
  managerDesc: 'Theo dõi trạng thái xử lý, thanh toán và đánh giá các đơn đã hoàn thành.',
  paidPending: 'Chờ thanh toán',
  detail: 'Xem chi tiết',
  cancel: 'Hủy đặt phòng',
  review: 'Đánh giá',
  noBooking: 'Không có đơn đặt phòng phù hợp.',
  region: 'Vùng miền',
  time: 'Thời gian',
  modalTitle: 'Đánh giá trải nghiệm',
  score: 'Chấm điểm',
  comment: 'Nhận xét',
  placeholder: 'Chia sẻ cảm nhận của bạn về homestay này...',
  minComment: 'Nội dung đánh giá cần ít nhất 10 ký tự.',
  submit: 'Gửi đánh giá',
  submitting: 'Đang gửi...',
  close: 'Hủy',
  bookAgain: 'Đặt lại',
  reviewSent: 'Đã gửi đánh giá',
};

const FILTERS = [
  { key: 'all', label: TEXT.all },
  { key: 'pending', label: TEXT.pending },
  { key: 'confirmed', label: TEXT.confirmed },
  { key: 'cancelled', label: TEXT.cancelled },
  { key: 'completed', label: TEXT.completed },
];

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

const STATUS_LABELS = {
  pending: TEXT.pending,
  confirmed: TEXT.confirmed,
  cancelled: TEXT.cancelled,
  completed: TEXT.completed,
};

const PAYMENT_STYLES = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-blue-50 text-blue-700 border-blue-200',
};

function ReviewStars({ rating, onChange, disabled = false }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const value = index + 1;
        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(value)}
            className="rounded-xl p-1 transition hover:scale-105 disabled:cursor-default disabled:hover:scale-100"
            aria-label={value + ' sao'}
          >
            <HiStar className={'h-8 w-8 ' + (value <= rating ? 'text-amber-400' : 'text-gray-200')} />
          </button>
        );
      })}
    </div>
  );
}

function ReviewModal({ booking, error, rating, comment, isSubmitting, onClose, onSubmit, onRatingChange, onCommentChange }) {
  return (
    <ModalPortal className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-[28px] bg-white text-left shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B6784F]">Cozygo Review</p>
            <h3 className="mt-1 font-classic text-2xl font-black text-[#2C1E15]">{TEXT.modalTitle}</h3>
            <p className="mt-1 text-sm font-semibold text-gray-400">{booking.homestay}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-[#2C3E2B] hover:text-white" aria-label="Close">
            <HiXMark className="h-6 w-6" />
          </button>
        </header>

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6">
          <div className="rounded-2xl bg-[#F8F6F0] px-4 py-3">
            <p className="text-xs font-black uppercase tracking-wide text-gray-400">{booking.id}</p>
            <p className="mt-1 font-black text-[#2C1E15]">{booking.homestay}</p>
            <p className="mt-1 text-xs font-semibold text-gray-500">{booking.checkIn} - {booking.checkOut}</p>
          </div>

          <div>
            <label className="text-sm font-black text-[#2C1E15]">* {TEXT.score}</label>
            <div className="mt-2"><ReviewStars rating={rating} onChange={onRatingChange} /></div>
          </div>

          <label className="block">
            <span className="text-sm font-black text-[#2C1E15]">{TEXT.comment}</span>
            <textarea
              value={comment}
              onChange={(event) => onCommentChange(event.target.value)}
              rows={5}
              className="mt-2 w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold leading-6 text-gray-700 outline-none transition focus:border-[#2C3E2B]"
              placeholder={TEXT.placeholder}
            />
          </label>

          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" onClick={onClose} className="h-11 rounded-2xl bg-gray-100 px-5 text-sm font-black text-gray-600 transition hover:bg-gray-200">{TEXT.close}</button>
            <button disabled={isSubmitting} type="submit" className="h-11 rounded-2xl bg-[#2C3E2B] px-6 text-sm font-black text-white shadow transition hover:bg-[#223322] disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? TEXT.submitting : TEXT.submit}
            </button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}

function ReviewToast({ message }) {
  if (!message) return null;
  return (
    <ModalPortal className="pointer-events-none fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div className="rounded-3xl bg-white px-8 py-5 text-center shadow-2xl ring-1 ring-black/5">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-2xl font-black text-emerald-600">✓</div>
        <p className="text-base font-black text-[#2C1E15]">{message}</p>
      </div>
    </ModalPortal>
  );
}

export default function BookingManager({ bookings, bookingFilter, setBookingFilter, setSelectedBooking, handleCancelBooking, onSubmitReview }) {
  const navigate = useNavigate();
  const filteredBookings = bookings?.filter((booking) => bookingFilter === 'all' || booking.status === bookingFilter) || [];
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const openReviewModal = (booking) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewComment('');
    setReviewError('');
  };

  const closeReviewModal = () => {
    setReviewBooking(null);
    setReviewError('');
  };

  const showToast = (message) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(''), 2000);
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!reviewBooking) return;
    if (reviewComment.trim().length < 10) {
      setReviewError(TEXT.minComment);
      return;
    }

    try {
      setIsReviewSubmitting(true);
      setReviewError('');
      await onSubmitReview?.({ booking: reviewBooking, rating: reviewRating, comment: reviewComment.trim() });
      setReviewBooking(null);
      setReviewComment('');
      setReviewRating(5);
      showToast(TEXT.reviewSent);
    } catch (error) {
      setReviewError(error.message || TEXT.minComment);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const goBookAgain = (booking) => {
    if (booking?.homeId) navigate('/homestay/' + booking.homeId);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="font-classic text-xl font-bold text-[#2C1E15]">{TEXT.managerTitle}</h2>
        <p className="text-xs text-gray-400 font-medium">{TEXT.managerDesc}</p>
      </div>

      <div className="flex bg-[#23150d]/5 p-1 rounded-xl text-xs font-bold border w-full overflow-x-auto">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setBookingFilter(filter.key)}
            className={'px-4 py-2 rounded-lg transition whitespace-nowrap cursor-pointer ' + (bookingFilter === filter.key ? 'bg-[#2C3E2B] text-white shadow' : 'text-gray-500')}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 max-h-[540px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredBookings.map((book) => {
          const canReview = book.status === 'completed' && !book.reviewed;
          const canBookAgain = book.status === 'completed' && book.reviewed && book.homeId;
          return (
            <div key={book.id} className="border border-gray-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:shadow-md transition">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{book.id}</span>
                  <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ' + (STATUS_STYLES[book.status] || STATUS_STYLES.pending)}>
                    {STATUS_LABELS[book.status] || STATUS_LABELS.pending}
                  </span>
                  <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ' + (PAYMENT_STYLES[book.paymentStatusKey] || PAYMENT_STYLES.pending)}>
                    {book.paymentStatusLabel || TEXT.paidPending}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-[#2C1E15] truncate">{book.homestay}</h4>
                <p className="text-xs text-gray-500 font-semibold">{TEXT.region}: {book.location || '--'} | {TEXT.time}: {book.checkIn} - {book.checkOut}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:self-center shrink-0">
                <button onClick={() => setSelectedBooking(book)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer">{TEXT.detail}</button>
                {canReview && (
                  <button onClick={() => openReviewModal(book)} className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer">
                    <HiPencilSquare className="h-4 w-4" /> {TEXT.review}
                  </button>
                )}
                {canBookAgain && (
                  <button onClick={() => goBookAgain(book)} className="bg-[#2C3E2B] hover:bg-[#223322] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm">{TEXT.bookAgain}</button>
                )}
                {['pending', 'confirmed'].includes(book.status) && (
                  <button onClick={() => handleCancelBooking(book.id)} className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer">{TEXT.cancel}</button>
                )}
              </div>
            </div>
          );
        })}
        {filteredBookings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm font-semibold text-gray-400">
            {TEXT.noBooking}
          </div>
        )}
      </div>

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          rating={reviewRating}
          comment={reviewComment}
          error={reviewError}
          isSubmitting={isReviewSubmitting}
          onClose={closeReviewModal}
          onSubmit={submitReview}
          onRatingChange={setReviewRating}
          onCommentChange={(value) => { setReviewComment(value); setReviewError(''); }}
        />
      )}
      <ReviewToast message={toastMessage} />
    </div>
  );
}
