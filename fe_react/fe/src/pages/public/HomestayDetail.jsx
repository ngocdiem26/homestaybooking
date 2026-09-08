import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCalendarDays,
  HiChatBubbleLeftRight,
  HiCheckCircle,
  HiHomeModern,
  HiChevronLeft,
  HiChevronRight,
  HiMapPin,
  HiPhoto,
  HiShieldCheck,
  HiXMark,
  HiStar,
  HiHeart,
  HiUsers,
} from 'react-icons/hi2';
import UserLayout from '../../layouts/UserLayout';
import ModalPortal from '../../components/common/ModalPortal';
import BookingCheckoutModal from '../../components/booking/BookingCheckoutModal';
import { useAuth } from '../../hooks/useAuth';
import HomestaySearchForm from '../../components/homestay/HomestaySearchForm';
import { checkPublicHomestayAvailability, getPublicHomestay } from '../../services/homestayService';
import { getHomestayReviews } from '../../services/reviewService';
import { buildSearchParams, calculateNights, getStoredSearchState, saveSearchState, SEARCH_STATE_EVENT } from '../../services/searchState';

const fallbackImage = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400&auto=format&fit=crop';

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function getPricingUnitLabel(unit) {
  const normalized = String(unit || '').trim().toUpperCase();

  if (normalized === 'PER_DAY') return 'ngày';
  if (normalized === 'PER_USE') return 'lần';
  if (normalized === 'PER_PERSON') return 'người';
  if (normalized === 'PER_STAY') return 'lượt ở';

  return '';
}

function getServicePricingUnit(service = {}) {
  return (
    service.pricingUnit ||
    service.pricing_unit ||
    service.priceUnit ||
    service.price_unit ||
    ''
  );
}

function formatTime(value, fallback) {
  if (!value) return fallback;
  return String(value).slice(0, 5);
}

function todayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function DetailStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-[#6E473B]/10 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400">
        <Icon className="h-4 w-4 text-[#6E473B]" />
        {label}
      </div>
      <p className="mt-1 text-base font-black text-[#2C1E15]">{value}</p>
    </div>
  );
}

function GalleryModal({ images, homestayName, onClose, onOpenLightbox }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-white text-[#2C1E15]">
      <div className="flex h-full flex-col">
        <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-4 shadow-sm md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B6784F]">Thư viện ảnh</p>
              <h3 className="mt-1 font-classic text-2xl font-black md:text-3xl">{homestayName}</h3>
              <p className="mt-1 text-sm font-semibold text-gray-400">{images.length} ảnh homestay. Bấm vào ảnh để xem phóng to.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-[#2C1E15] shadow-sm transition hover:bg-[#2C3E2B] hover:text-white"
              aria-label="Đóng thư viện ảnh"
            >
              <HiXMark className="h-6 w-6" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#F4F1EA] px-4 py-6 md:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <button
                key={image + index}
                type="button"
                onClick={() => onOpenLightbox(index)}
                className="group overflow-hidden rounded-2xl border border-white bg-white p-0 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img src={image} alt={homestayName + ' ảnh ' + (index + 1)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-xs font-black text-gray-500">
                  <span>Ảnh {index + 1}</span>
                  <span className="text-[#6E473B]">Xem lớn</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginRequiredModal({ onClose, onLogin, onRegister }) {
  return (
    <ModalPortal>
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F4F1EA] text-2xl font-black text-[#6E473B]">C</div>
        <h3 className="mt-4 font-classic text-3xl font-black text-[#2C1E15]">Đăng nhập để đặt phòng</h3>
        <p className="mt-2 text-sm font-semibold text-gray-500">Bạn cần đăng nhập để Cozygo lưu booking và gửi thông tin xác nhận đúng tài khoản.</p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="h-11 flex-1 rounded-2xl bg-[#F4F1EA] text-sm font-black text-[#2C1E15]">Để sau</button>
          <button type="button" onClick={onLogin} className="h-11 flex-1 rounded-2xl bg-[#2C3E2B] text-sm font-black text-white shadow">Đăng nhập</button>
        </div>
        <button type="button" onClick={onRegister} className="mt-3 text-sm font-black text-[#6E473B] hover:underline">Chưa có tài khoản? Đăng ký</button>
      </div>
    </ModalPortal>
  );
}

function LightboxModal({ images, currentIndex, setCurrentIndex, homestayName, onClose }) {
  const image = images[currentIndex] || images[0] || fallbackImage;
  const goTo = (direction) => {
    setCurrentIndex((current) => (current + direction + images.length) % images.length);
  };

  

  return (
    <div className="fixed inset-0 z-[10000] bg-black/95 text-white">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-black"
        aria-label="Đóng ảnh phóng to"
      >
        <HiXMark className="h-7 w-7" />
      </button>

      <div className="flex h-full flex-col">
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-16">
          <button
            type="button"
            onClick={() => goTo(-1)}
            className="absolute left-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-black md:left-8"
            aria-label="Ảnh trước"
          >
            <HiChevronLeft className="h-7 w-7" />
          </button>

          <img src={image} alt={homestayName + ' ảnh lớn ' + (currentIndex + 1)} className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl" />

          <button
            type="button"
            onClick={() => goTo(1)}
            className="absolute right-4 top-1/2 z-20 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-black md:right-8"
            aria-label="Ảnh sau"
          >
            <HiChevronRight className="h-7 w-7" />
          </button>
        </div>

        <footer className="shrink-0 border-t border-white/10 bg-black/60 px-4 py-4 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black">{homestayName}</p>
              <p className="text-xs font-semibold text-white/60">Ảnh {currentIndex + 1}/{images.length}</p>
            </div>
            <div className="hidden max-w-[60%] gap-2 overflow-x-auto md:flex">
              {images.map((thumbnail, index) => (
                <button
                  key={thumbnail + index}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={'h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 p-0 transition ' + (currentIndex === index ? 'border-white' : 'border-white/20 opacity-60 hover:opacity-100')}
                >
                  <img src={thumbnail} alt={'Thumbnail ' + (index + 1)} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ReviewReplyCollapse({ review }) {
  const [open, setOpen] = useState(false);
  if (!review.replyContent) return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#2C3E2B]/10 px-3 py-1.5 text-[11px] font-black text-[#2C3E2B] transition hover:bg-[#2C3E2B] hover:text-white"
      >
        <HiChatBubbleLeftRight className="h-3.5 w-3.5" />
        1 phản hồi {open ? '▲' : '▼'}
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

function ReviewPanel({ reviews, ratingAverage, ratingCount, highlightReviewId = null }) {
  const [selectedRating, setSelectedRating] = useState('all');
  const [visibleCount, setVisibleCount] = useState(3);
  const [ratingDropdownOpen, setRatingDropdownOpen] = useState(false);
  const ratingDropdownRef = useRef(null);

  const highlightedReviewId = highlightReviewId ? Number(highlightReviewId) : null;

  const text = {
    title: 'Đánh giá từ khách đã lưu trú',
    count: 'đánh giá',
    empty: 'Homestay này chưa có đánh giá hiển thị.',
    emptyFilter: 'Chưa có đánh giá phù hợp với số sao đã chọn.',
    guest: 'Khách Cozygo',
  };

  const visibleReviews = reviews.filter((review) => review.status !== 'HIDDEN');

  const computedAverage = visibleReviews.length
    ? visibleReviews.reduce((total, review) => total + Number(review.rating || 0), 0) / visibleReviews.length
    : 0;

  const average = Number(ratingAverage || computedAverage || 0).toFixed(1);
  const totalCount = Number(ratingCount || visibleReviews.length || 0);

  const ratingCounts = [5, 4, 3, 2, 1].reduce((result, star) => {
    result[star] = visibleReviews.filter(
      (review) => Math.round(Number(review.rating || 0)) === star
    ).length;
    return result;
  }, {});

  const ratingOptions = [
    {
      value: 'all',
      label: 'Tất cả đánh giá',
      count: visibleReviews.length,
      star: null,
    },
    ...[5, 4, 3, 2, 1].map((star) => ({
      value: String(star),
      label: `${star} sao`,
      count: ratingCounts[star] || 0,
      star,
    })),
  ];

  const selectedRatingOption =
    ratingOptions.find((option) => String(option.value) === String(selectedRating)) ||
    ratingOptions[0];

  const filteredReviews =
    selectedRating === 'all'
      ? visibleReviews
      : visibleReviews.filter(
          (review) => Math.round(Number(review.rating || 0)) === Number(selectedRating)
        );

  const highlightedIndex = highlightedReviewId
    ? filteredReviews.findIndex((review) => Number(review.reviewId) === highlightedReviewId)
    : -1;
  const displayLimit = highlightedIndex >= visibleCount ? highlightedIndex + 1 : visibleCount;
  const displayedReviews = filteredReviews.slice(0, displayLimit);
  const hasMoreReviews = filteredReviews.length > displayedReviews.length;

  const handleSelectRating = (value) => {
    setSelectedRating(value);
    setVisibleCount(3);
    setRatingDropdownOpen(false);
  };

  useEffect(() => {
    if (!highlightedReviewId) return;
    const timer = window.setTimeout(() => {
      const target = document.getElementById('review-card-' + highlightedReviewId);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [highlightedReviewId, displayedReviews.length]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        ratingDropdownRef.current &&
        !ratingDropdownRef.current.contains(event.target)
      ) {
        setRatingDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setRatingDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <section id="reviews" className="rounded-[28px] border border-[#6E473B]/10 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h3 className="font-classic text-2xl font-black">{text.title}</h3>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Lọc theo số sao để xem nhanh trải nghiệm của khách hàng.
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 px-5 py-3 text-center text-amber-700 ring-1 ring-amber-100">
          <div className="flex items-center justify-center gap-1 text-lg font-black">
            <HiStar className="h-5 w-5" /> {average}/5
          </div>
          <p className="text-[11px] font-black uppercase tracking-wide">
            {totalCount} {text.count}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-[#6E473B]/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F8F1EA] text-lg text-[#A64D23] shadow-inner">
              ★
            </div>

            <div>
              <p className="text-sm font-black text-[#2C1E15]">
                Bộ lọc đánh giá
              </p>
            </div>
          </div>

          <div ref={ratingDropdownRef} className="relative w-full sm:w-80">
            <button
              type="button"
              onClick={() => setRatingDropdownOpen((current) => !current)}
              className="flex h-12 w-full items-center justify-between rounded-[22px] border border-[#E7DDD4] bg-white px-4 text-left text-sm font-black text-[#2C3E2B] shadow-[0_8px_24px_rgba(44,30,21,0.06)] outline-none transition-all duration-200 hover:border-[#A64D23]/40 focus:border-[#A64D23] focus:ring-4 focus:ring-[#A64D23]/10"
            >
              <span className="flex min-w-0 items-center gap-2 truncate">
                {selectedRatingOption.star ? (
                  <>
                    <span className="shrink-0 text-amber-400">
                      {'★'.repeat(selectedRatingOption.star)}
                    </span>
                    <span className="truncate">
                      {selectedRatingOption.star} sao ({selectedRatingOption.count})
                    </span>
                  </>
                ) : (
                  <span className="truncate">
                    Tất cả đánh giá ({selectedRatingOption.count})
                  </span>
                )}
              </span>

              <span
                className={`ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F8F1EA] text-[10px] font-black text-[#A64D23] transition-transform duration-200 ${
                  ratingDropdownOpen ? 'rotate-180' : ''
                }`}
              >
                ▼
              </span>
            </button>

            {ratingDropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-full overflow-hidden rounded-[24px] border border-[#E7DDD4] bg-white p-2 shadow-[0_18px_45px_rgba(44,30,21,0.16)]">
                {ratingOptions.map((option) => {
                  const isActive = String(selectedRating) === String(option.value);

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelectRating(option.value)}
                      className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-left text-sm font-bold transition-all ${
                        isActive
                          ? 'bg-[#2C3E2B] text-white shadow-sm'
                          : 'bg-white text-[#2C1E15] hover:bg-[#F8F1EA] hover:text-[#A64D23]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {option.star ? (
                          <>
                            <span className="min-w-[76px] text-amber-400">
                              {'★'.repeat(option.star)}
                            </span>
                            <span>{option.star} sao</span>
                          </>
                        ) : (
                          <span>Tất cả đánh giá</span>
                        )}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-[#F8F6F0] text-gray-500'
                        }`}
                      >
                        {option.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {displayedReviews.length ? (
          displayedReviews.map((review) => (
            <article
              id={'review-card-' + review.reviewId}
              key={review.reviewId}
              className={'rounded-2xl border bg-white p-5 shadow-sm transition ' + (Number(review.reviewId) === highlightedReviewId ? 'border-[#D68A45] ring-4 ring-[#FFE4C7]' : 'border-gray-200/80')}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2C3E2B] text-sm font-black text-white">
                  {review.customerAvatar ? (
                    <img
                      src={review.customerAvatar}
                      alt={review.customerName || text.guest}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (review.customerName || 'K').charAt(0).toUpperCase()
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-black text-[#2C1E15]">
                        {review.customerName || text.guest}
                      </h4>
                      <p className="text-[11px] font-semibold text-gray-400">
                        {formatDateTime(review.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <HiStar
                          key={index}
                          className={
                            'h-4 w-4 ' +
                            (index < Number(review.rating || 0)
                              ? 'text-amber-400'
                              : 'text-gray-200')
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-line rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm font-semibold leading-6 text-gray-600">
                    {review.comment}
                  </p>

                  <ReviewReplyCollapse review={review} />
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-[#F8F6F0] p-6 text-center text-sm font-bold text-gray-400">
            {visibleReviews.length ? text.emptyFilter : text.empty}
          </div>
        )}
      </div>

      {hasMoreReviews ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((current) => current + 3)}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#2C3E2B] px-6 text-sm font-black text-white shadow-md transition hover:bg-[#223322]"
            >
              Xem thêm đánh giá
            </button>
          </div>
        ) : (
          displayedReviews.length > 0 && (
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#6E473B]/10 bg-[#F8F6F0] px-5 py-2.5 text-xs font-black text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                Không còn đánh giá để hiển thị
              </div>
            </div>
          )
        )}
    </section>
  );
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDisplayDate(value) {
  if (!value) return 'Đang cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getInitial(name) {
  return String(name || 'C').trim().charAt(0).toUpperCase() || 'C';
}


function paymentStatusLabel(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'PAID') return 'Đã thanh toán qua VNPay';
  if (normalized === 'FAILED') return 'Thanh toán thất bại';
  if (normalized === 'EXPIRED') return 'Quá hạn thanh toán';
  if (normalized === 'REFUNDED') return 'Đã hoàn tiền';
  return 'Chờ thanh toán';
}

function bookingStatusLabel(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'CONFIRMED') return 'Đã xác nhận';
  if (normalized === 'PAYMENT_PENDING') return 'Chờ thanh toán';
  if (normalized === 'CANCELLED') return 'Đã hủy';
  if (normalized === 'EXPIRED') return 'Đã quá hạn';
  if (normalized === 'COMPLETED') return 'Hoàn thành';
  return status || 'Đang xử lý';
}

function buildVnpayCheckoutResult(search) {
  const params = new URLSearchParams(search || '');
  if (params.get('checkout') !== 'vnpay-result') return null;

  const status = params.get('status') || 'failed';
  const success = status === 'success' && String(params.get('paymentStatus') || '').toUpperCase() === 'PAID';
  return {
    status: success ? 'SUCCESS' : 'FAILED',
    title: success ? 'Thanh toán thành công' : 'Thanh toán chưa hoàn tất',
    message: params.get('message') || (success
      ? 'Hệ thống đã ghi nhận thanh toán VNPay và cập nhật đơn đặt homestay của bạn.'
      : 'Giao dịch VNPay chưa hoàn tất. Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.'),
    bookingCode: params.get('bookingCode') || params.get('bookingId') || '',
    bookingStatus: bookingStatusLabel(params.get('bookingStatus')),
    paymentText: paymentStatusLabel(params.get('paymentStatus')),
    profileTarget: 'bookings',
    profileButtonLabel: 'Xem đơn hàng của bạn',
  };
}
export default function HomestayDetail({ favorites = [], toggleFavorite = () => {} }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const initialSearch = getStoredSearchState();
  const [homestay, setHomestay] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [checkIn, setCheckIn] = useState(initialSearch.checkIn || '');
  const [checkOut, setCheckOut] = useState(initialSearch.checkOut || '');
  const [guests, setGuests] = useState(initialSearch.guests || '1');
  const [promotionCode, setPromotionCode] = useState(initialSearch.promotionCode || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [bookingAvailabilityMessage, setBookingAvailabilityMessage] = useState('');
  const highlightedReviewId = useMemo(() => new URLSearchParams(location.search).get('reviewId'), [location.search]);
  const vnpayCheckoutResult = useMemo(() => buildVnpayCheckoutResult(location.search), [location.search]);


  useEffect(() => {
    if (!vnpayCheckoutResult || !isAuthenticated || !homestay) return undefined;
    const timer = window.setTimeout(() => setIsCheckoutOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, [vnpayCheckoutResult, isAuthenticated, homestay]);
  useEffect(() => {
    const handleSearchStateChange = (event) => {
      const nextSearch = event.detail || getStoredSearchState();
      setCheckIn(nextSearch.checkIn || '');
      setCheckOut(nextSearch.checkOut || '');
      setGuests(nextSearch.guests || '1');
      setPromotionCode(nextSearch.promotionCode || '');
    };

    window.addEventListener(SEARCH_STATE_EVENT, handleSearchStateChange);
    window.addEventListener('storage', handleSearchStateChange);

    return () => {
      window.removeEventListener(SEARCH_STATE_EVENT, handleSearchStateChange);
      window.removeEventListener('storage', handleSearchStateChange);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadHomestay() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const data = await getPublicHomestay(id);
        if (!isMounted) return;
        setHomestay(data);
        setActiveImageIndex(0);
        setIsGalleryOpen(false);
        setLightboxIndex(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error.message || 'Không tải được chi tiết homestay');
        setHomestay(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHomestay();
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      try {
        const data = await getHomestayReviews(id);
        if (isMounted) setReviews(Array.isArray(data) ? data : []);
      } catch {
        if (isMounted) setReviews([]);
      }
    }

    if (id) loadReviews();
    return () => {
      isMounted = false;
    };
  }, [id]);


  useEffect(() => {
    let cancelled = false;
    const homeId = homestay?.homeId || homestay?.id || id;

    async function verifyAvailability() {
      if (!homeId || !checkIn || !checkOut || calculateNights(checkIn, checkOut) <= 0) {
        setBookingAvailabilityMessage('');
        return;
      }

      try {
        const result = await checkPublicHomestayAvailability(homeId, checkIn, checkOut);
        if (cancelled) return;
        const isUnavailable = result?.unavailable || result?.dateRangeBooked || result?.available === false;
        setBookingAvailabilityMessage(isUnavailable ? (result?.message || 'Khoảng thời gian này đã có người đặt') : '');
      } catch {
        if (!cancelled) setBookingAvailabilityMessage('');
      }
    }

    verifyAvailability();
    return () => {
      cancelled = true;
    };
  }, [homestay?.homeId, homestay?.id, id, checkIn, checkOut]);

  const images = useMemo(() => {
    const sourceImages = homestay?.images?.length
      ? homestay.images.map((image) => image.url || image.imageUrl).filter(Boolean)
      : [homestay?.img || fallbackImage];
    return sourceImages.length ? sourceImages : [fallbackImage];
  }, [homestay]);

  const activeImage = images[activeImageIndex] || images[0] || fallbackImage;
  const galleryPreviewImages = images.slice(1, 5);
  const remainingImageCount = Math.max(0, images.length - 5);
  const maxGuests = Math.max(1, Number(homestay?.maxGuest || 1));
  const bookingGuests = Math.min(maxGuests, Math.max(1, Number(guests) || 1));
  const serviceItems = homestay?.serviceItems?.length
    ? homestay.serviceItems
    : (homestay?.services || []).map((name) => ({ name, serviceName: name }));
  const nights = calculateNights(checkIn, checkOut);
  const minBookingDate = todayDateString();
  const roomTotal = Number(homestay?.pricePerNight || 0) * nights;
  const currentHomestayId = Number(homestay?.id || homestay?.homeId || id);
  const isFavorite = favorites.map(Number).includes(currentHomestayId);
  const hostName = homestay?.ownerName || 'Cozygo Host';

  const handleSearch = (search = {}) => {
    const savedSearch = saveSearchState(search);
    const params = buildSearchParams(savedSearch);
    navigate('/search' + (params.toString() ? '?' + params.toString() : ''));
  };

  const updateBookingSearch = (field, value) => {
    if ((field === 'checkIn' || field === 'checkOut') && value && value < minBookingDate) return;

    const nextFields = { [field]: value };
    if (field === 'checkIn' && value && checkOut && checkOut <= value) {
      nextFields.checkOut = '';
    }
    if (field === 'checkOut' && checkIn && value && value <= checkIn) {
      nextFields.checkOut = '';
    }

    const nextSearch = saveSearchState(nextFields);
    setCheckIn(nextSearch.checkIn || '');
    setCheckOut(nextSearch.checkOut || '');
    setGuests(nextSearch.guests || '1');
  };

  const updateGuestCount = (value) => {
    const nextGuests = Math.min(maxGuests, Math.max(1, Number(value) || 1));
    updateBookingSearch('guests', String(nextGuests));
  };

  const handleGuestInput = (value) => {
    const onlyDigits = value.replace(/\D/g, '');
    if (!onlyDigits) {
      setGuests('');
      saveSearchState({ guests: '' });
      return;
    }

    updateGuestCount(onlyDigits);
  };

  const handleBookNow = () => {
    if (bookingAvailabilityMessage) {
      return;
    }
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    setIsCheckoutOpen(true);
  };


  const closeCheckoutModal = () => {
    setIsCheckoutOpen(false);
    if (vnpayCheckoutResult) {
      navigate(location.pathname, { replace: true });
    }
  };
  const goToAuth = (path) => {
    const redirect = encodeURIComponent(location.pathname + location.search);
    navigate(path + '?redirect=' + redirect);
  };

  const openGallery = (index = 0) => {
    setActiveImageIndex(index);
    setIsGalleryOpen(true);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#F4F1EA] pb-16 text-[#2C1E15]">
        <section className="relative bg-[#202c3c] px-4 pb-10 pt-7 shadow-lg">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="mt-2 font-classic text-2xl font-black text-[#fedcb7] md:text-4xl">Chi tiết homestay</h1>
            <p className="mt-2 text-sm font-medium text-white/60">Xem thông tin, hình ảnh, tiện nghi và chọn ngày lưu trú phù hợp.</p>
          </div>
          <div className="absolute inset-x-4 bottom-0 z-20 mx-auto max-w-5xl translate-y-1/2">
            <HomestaySearchForm onSearch={handleSearch} />
          </div>
        </section>

        <div className="h-16" />

        <main className="mx-auto max-w-7xl px-4 md:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#6E473B]/10 bg-white px-4 py-2 text-xs font-black text-[#2C3E2B] shadow-sm transition hover:bg-[#2C3E2B] hover:text-white"
          >
            <HiArrowLeft className="h-4 w-4" />
            Quay lại
          </button>

          {isLoading && (
            <div className="rounded-[28px] border border-gray-100 bg-white p-8 shadow-sm">
              <div className="h-8 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="mt-6 h-[420px] animate-pulse rounded-3xl bg-gray-100" />
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="rounded-[28px] border border-red-100 bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-black text-red-600">{errorMessage}</p>
              <p className="mt-2 text-sm font-semibold text-gray-400">Kiểm tra lại backend hoặc homestay có còn được hiển thị công khai không.</p>
            </div>
          )}

          {!isLoading && homestay && (
            <div className="space-y-8">
              <section className="rounded-[32px] border border-[#6E473B]/10 bg-white p-4 shadow-sm md:p-6">
                <header className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="min-w-0">
                    <h2 className="font-classic text-3xl font-black leading-tight text-[#2C1E15] md:text-4xl">{homestay.name}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold text-gray-600">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-100">
                        <HiStar className="h-4 w-4" />
                        {homestay.score || homestay.rating || '0.0'} ({homestay.reviewCount || 0} đánh giá)
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <HiMapPin className="h-4 w-4 text-[#6E473B]" />
                        {homestay.address || homestay.location}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(currentHomestayId)}
                    className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-black shadow-sm transition ${
                      isFavorite
                        ? 'border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100'
                        : 'border-[#6E473B]/10 bg-[#F8F6F0] text-[#6E473B] hover:bg-[#2C3E2B] hover:text-white'
                    }`}
                    aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                  >
                    <HiHeart className="h-5 w-5" />
                    {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
                  </button>
                </header>

                <div className="grid gap-2 overflow-hidden rounded-[26px] bg-[#F8F6F0] p-2 md:grid-cols-[1.08fr_1fr]">
                  <button
                    type="button"
                    onClick={() => openGallery(0)}
                    className="group relative h-[320px] overflow-hidden rounded-[22px] bg-gray-100 p-0 text-left md:h-[500px]"
                  >
                    <img src={activeImage} alt={homestay.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#0B4DBC] shadow-lg">
                      <HiPhoto className="h-5 w-5" />
                      Xem tất cả ảnh
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {galleryPreviewImages.map((image, previewIndex) => {
                      const actualIndex = previewIndex + 1;
                      const isLastPreview = previewIndex === galleryPreviewImages.length - 1;
                      return (
                        <button
                          key={image + actualIndex}
                          type="button"
                          onClick={() => openGallery(actualIndex)}
                          className="group relative h-[154px] overflow-hidden rounded-2xl bg-gray-100 p-0 md:h-[246px]"
                        >
                          <img src={image} alt={homestay.name + ' ảnh ' + (actualIndex + 1)} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
                          {isLastPreview && remainingImageCount > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-center text-white backdrop-blur-[1px]">
                              <span className="rounded-full bg-black/45 px-5 py-2 text-lg font-black shadow-lg">+{remainingImageCount} ảnh</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                    <DetailStat icon={HiUsers} label="Sức chứa" value={maxGuests + ' khách'} />
                    <DetailStat icon={HiHomeModern} label="Phòng ngủ" value={(homestay.bedroomCount || 0) + ' phòng'} />
                    <DetailStat icon={HiHomeModern} label="Giường" value={(homestay.bedCount || 0) + ' giường'} />
                    <DetailStat icon={HiHomeModern} label="Phòng tắm" value={(homestay.bathroomCount || 0) + ' phòng'} />
                    <DetailStat icon={HiHomeModern} label="Bếp" value={(homestay.kitchenCount || 0) + ' bếp'} />
                  </div>

                  <article className="overflow-hidden rounded-[28px] border border-[#6E473B]/10 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-gray-100 p-6 md:flex-row md:items-center md:justify-between md:p-8">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#7B4D3B] text-2xl font-black text-white shadow-sm">
                          {getInitial(hostName)}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B6784F]">Chủ homestay</p>
                          <h3 className="mt-1 text-xl font-black text-[#2C1E15]">{hostName}</h3>
                        </div>
                      </div>
                     <div className="flex flex-col gap-1">
                          <p className="mt-1 text-sm font-bold text-gray-500">Bắt đầu hoạt động: {formatDisplayDate(homestay.createdAt)}</p>
                          <div className="flex flex-wrap gap-3 text-xs font-black text-[#2C3E2B]">
                        <span className="rounded-full bg-[#2C3E2B]/10 px-3 py-1.5">
                          Nhận phòng {formatTime(homestay.checkinTime, '14:00')} - {formatTime(homestay.checkinEndTime, '20:00')}
                        </span>
                        <span className="rounded-full bg-[#2C3E2B]/10 px-3 py-1.5">
                          Trả phòng {formatTime(homestay.checkoutStartTime, '08:00')} - {formatTime(homestay.checkoutTime, '12:00')}
                        </span>
                      </div>
                     </div>
                      
                    </div>
                    
                    <div className="p-6 md:p-8">
                      <h3 className="font-classic text-2xl font-black">Về homestay này</h3>
                      <p className="mt-4 whitespace-pre-line text-base font-medium leading-8 text-gray-700">
                        {homestay.description || 'Chưa có mô tả chi tiết cho homestay này.'}
                      </p>
                    </div>
                  </article>

                  <section className="rounded-[28px] border border-[#6E473B]/10 bg-white p-6 shadow-sm md:p-8">
                    <h3 className="font-classic text-2xl font-black">Tiện nghi</h3>
                    {homestay.amenities?.length ? (
                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {homestay.amenities.map((amenity) => (
                          <div key={amenity} className="inline-flex items-center gap-3 rounded-2xl border border-gray-100 bg-[#F8F6F0] px-4 py-3 text-sm font-bold text-[#2C1E15]">
                            <HiCheckCircle className="h-5 w-5 text-emerald-600" />
                            {amenity}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm font-semibold text-gray-400">Homestay chưa cập nhật tiện nghi.</p>
                    )}
                  </section>

                  <section className="rounded-[28px] border border-[#6E473B]/10 bg-white p-6 shadow-sm md:p-8">
                    <h3 className="font-classic text-2xl font-black">Dịch vụ bổ sung</h3>
                    {serviceItems.length ? (
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {serviceItems.map((service, index) => (
                          <div key={(service.serviceName || service.name || 'service') + index} className="rounded-2xl border border-gray-100 bg-[#F8F6F0] p-4">
                            <p className="font-black text-[#2C1E15]">{service.serviceName || service.name}</p>
                            {service.price !== undefined && service.price !== null && (
                              <p className="mt-1 text-sm font-black text-[#6E473B]">
                                {formatCurrency(service.price)} / {
                                  getPricingUnitLabel(getServicePricingUnit(service)) || 'chưa cập nhật đơn vị'
                                }
                              </p>
                            )}
                            {service.description && <p className="mt-2 text-xs font-semibold leading-5 text-gray-500">{service.description}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm font-semibold text-gray-400">Homestay chưa có dịch vụ bổ sung.</p>
                    )}
                  </section>

                  <section className="rounded-[28px] border border-[#6E473B]/10 bg-white p-6 shadow-sm md:p-8">
                    <h3 className="font-classic text-2xl font-black">Nội quy homestay</h3>
                    {homestay.rules?.length ? (
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {homestay.rules.map((rule) => (
                          <div key={rule} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-700">
                            <HiShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#6E473B]" />
                            {rule}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm font-semibold text-gray-400">Chưa có nội quy riêng.</p>
                    )}
                  </section>
                  <ReviewPanel
                    reviews={reviews}
                    ratingAverage={homestay.ratingAvg || homestay.rating}
                    ratingCount={homestay.reviewCount || homestay.reviewsCount}
                    highlightReviewId={highlightedReviewId}
                  />
                </div>

                <aside className="lg:sticky lg:top-24 lg:self-start">
                  <div className="rounded-[28px] border border-[#6E473B]/10 bg-white p-6 shadow-xl shadow-[#2C1E15]/10">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Tạm tính từ</p>
                        <p className="text-2xl font-black text-[#6E473B]">{formatCurrency(homestay.pricePerNight)}</p>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                        <HiStar className="h-4 w-4" /> {homestay.score || '0.0'}
                      </div>
                    </div>

                    <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200">
                      <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200">
                        <label className="p-3">
                          <span className="text-[10px] font-black uppercase text-gray-500">Nhận phòng</span>
                          <input type="date" min={minBookingDate} value={checkIn} onChange={(event) => updateBookingSearch('checkIn', event.target.value)} className="mt-1 w-full bg-transparent text-xs font-bold outline-none" />
                        </label>
                        <label className="p-3">
                          <span className="text-[10px] font-black uppercase text-gray-500">Trả phòng</span>
                          <input type="date" min={checkIn || minBookingDate} value={checkOut} onChange={(event) => updateBookingSearch('checkOut', event.target.value)} className="mt-1 w-full bg-transparent text-xs font-bold outline-none" />
                        </label>
                      </div>
                      <div className="p-3">
                        <span className="text-[10px] font-black uppercase text-gray-500">Số khách</span>
                        <div className="mt-2 flex items-center justify-between rounded-2xl bg-[#F4F1EA] p-1.5">
                          <button
                            type="button"
                            onClick={() => updateGuestCount(bookingGuests - 1)}
                            disabled={bookingGuests <= 1}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg font-black text-[#2C3E2B] shadow-sm transition hover:bg-[#2C3E2B] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#2C3E2B]"
                            aria-label="Giảm số khách"
                          >
                            -
                          </button>
                          <div className="flex min-w-0 flex-1 items-center justify-center gap-1 px-3">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={guests}
                              onChange={(event) => handleGuestInput(event.target.value)}
                              onBlur={() => updateGuestCount(guests)}
                              className="w-12 bg-transparent text-center text-base font-black text-[#2C1E15] outline-none"
                              aria-label="Số khách"
                            />
                            <span className="text-sm font-bold text-gray-500">khách</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateGuestCount(bookingGuests + 1)}
                            disabled={bookingGuests >= maxGuests}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg font-black text-[#2C3E2B] shadow-sm transition hover:bg-[#2C3E2B] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#2C3E2B]"
                            aria-label="Tăng số khách"
                          >
                            +
                          </button>
                        </div>
                        <p className="mt-1.5 text-[11px] font-semibold text-gray-400">Tối đa {maxGuests} khách</p>
                      </div>
                    </div>

                    {bookingAvailabilityMessage && (
                      <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-black leading-5 text-red-700">
                        ⚠ {bookingAvailabilityMessage}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleBookNow}
                      disabled={Boolean(bookingAvailabilityMessage)}
                      className={
                        'mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black text-white shadow-lg transition ' +
                        (bookingAvailabilityMessage ? 'cursor-not-allowed bg-gray-300 text-gray-500 shadow-none' : 'bg-[#2C3E2B] hover:bg-[#223322]')
                      }
                    >
                      <HiCalendarDays className="h-5 w-5" />
                      Đặt phòng ngay
                    </button>

                    <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 text-sm font-semibold text-gray-500">
                      <div className="flex justify-between">
                        <span>{formatCurrency(homestay.pricePerNight)} x {nights} đêm</span>
                        <span className="font-black text-[#2C1E15]">{formatCurrency(roomTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phí dịch vụ cơ bản</span>
                        <span className="font-black text-[#2C1E15]">0đ</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-black text-[#2C1E15]">
                        <span>Tổng tạm tính</span>
                        <span>{formatCurrency(roomTotal)}</span>
                      </div>
                    </div>
                  </div>
                </aside>
              </section>
            </div>
          )}
        </main>

        {isGalleryOpen && (
          <GalleryModal
            images={images}
            homestayName={homestay?.name || 'Homestay'}
            onClose={() => setIsGalleryOpen(false)}
            onOpenLightbox={openLightbox}
          />
        )}

        {showLoginPrompt && (
          <LoginRequiredModal
            onClose={() => setShowLoginPrompt(false)}
            onLogin={() => goToAuth('/login')}
            onRegister={() => goToAuth('/register')}
          />
        )}

        {isCheckoutOpen && homestay && (
          <BookingCheckoutModal
            homestay={homestay}
            user={user}
            bookingDefaults={{ checkIn, checkOut, guests: bookingGuests, promotionCode }}
            initialResult={vnpayCheckoutResult}
            onClose={closeCheckoutModal}
          />
        )}

        {lightboxIndex !== null && (
          <LightboxModal
            images={images}
            currentIndex={lightboxIndex}
            setCurrentIndex={setLightboxIndex}
            homestayName={homestay?.name || 'Homestay'}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </div>
    </UserLayout>
  );
}
