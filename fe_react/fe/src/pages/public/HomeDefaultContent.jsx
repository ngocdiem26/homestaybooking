import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicActivities } from '../../services/activityService';
import { getPublicDestinations, getPublicHomestays } from '../../services/homestayService';
import PromotionCard from '../../components/promotion/PromotionCard';
import { getPublicPromotions } from '../../services/promotionService';
import { getFeaturedReviews } from '../../services/reviewService';
import { buildSearchParams, saveSearchState } from '../../services/searchState';

const fallbackDestinationImage = 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=900&auto=format&fit=crop';
const DESTINATION_PAGE_SIZE = 6;
const HOMESTAY_PAGE_SIZE = 4;
const ACTIVITY_PAGE_SIZE = 3;

function getPromotionScrollAmount(container) {
  const card = container?.querySelector('[data-promotion-card]');
  if (!container || !card) return 560;
  const styles = window.getComputedStyle(container);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || '24') || 24;
  return card.getBoundingClientRect().width + gap;
}

function getReviewScrollAmount(container) {
  const card = container?.querySelector('[data-review-card]');
  if (!container || !card) return 420;
  const styles = window.getComputedStyle(container);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || '24') || 24;
  return card.getBoundingClientRect().width + gap;
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN');
}

const HOME_PROMO_TEXT = {
  title: 'Ch\u01b0\u01a1ng tr\u00ecnh khuy\u1ebfn m\u00e3i ch\u1ed7 \u1edf',
  subtitle: 'Nh\u1eadn c\u00e1c \u01b0u \u0111\u00e3i \u0111ang ph\u00e1t h\u00e0nh t\u1eeb Cozygo cho h\u00e0nh tr\u00ecnh c\u1ee7a b\u1ea1n',
  viewAll: 'Xem t\u1ea5t c\u1ea3',
  empty: 'Ch\u01b0a c\u00f3 m\u00e3 khuy\u1ebfn m\u00e3i n\u00e0o \u0111ang hi\u1ec3n th\u1ecb.',
  pageLabel: 'Trang khuy\u1ebfn m\u00e3i',
};

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function samePlace(left, right) {
  const normalizedLeft = normalizeText(left);
  const normalizedRight = normalizeText(right);
  return normalizedLeft !== '' && normalizedLeft === normalizedRight;
}

export default function HomeDefaultContent({ setHasSearched, favorites, toggleFavorite, HomestayCard }) {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [activities, setActivities] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [activeCity, setActiveCity] = useState('');
  const [destinationPage, setDestinationPage] = useState(0);
  const [homestayPage, setHomestayPage] = useState(0);
  const [activityPage, setActivityPage] = useState(0);
  const promotionScrollRef = useRef(null);
  const reviewScrollRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const [destinationData, homestayData, activityData, promotionData, featuredReviewData] = await Promise.all([
          getPublicDestinations(),
          getPublicHomestays({ sort: 'recommended' }),
          getPublicActivities(),
          getPublicPromotions(),
          getFeaturedReviews(),
        ]);

        if (!isMounted) return;
        setDestinations(destinationData);
        setHomestays(homestayData);
        setActivities(activityData);
        setPromotions(promotionData);
        setFeaturedReviews(Array.isArray(featuredReviewData) ? featuredReviewData : []);
        const firstCity = destinationData[0]?.city || homestayData[0]?.city || homestayData[0]?.province || '';
        setActiveCity((current) => current || firstCity);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error.message || 'Không tải được dữ liệu homestay từ backend');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);


  const cityTabs = useMemo(() => {
    const fromDestinations = destinations.map((destination) => destination.city || destination.provinceName).filter(Boolean);
    const fromHomestays = homestays.map((homestay) => homestay.city || homestay.province).filter(Boolean);
    return [...new Set([...fromDestinations, ...fromHomestays])];
  }, [destinations, homestays]);

  const activeCityHomestays = useMemo(() => {
    if (!activeCity) return homestays;
    return homestays.filter((homestay) =>
      samePlace(homestay.province, activeCity) ||
      samePlace(homestay.city, activeCity) ||
      samePlace(homestay.location, activeCity)
    );
  }, [activeCity, homestays]);

  const visibleDestinations = useMemo(() => {
    const start = destinationPage * DESTINATION_PAGE_SIZE;
    return destinations.slice(start, start + DESTINATION_PAGE_SIZE);
  }, [destinationPage, destinations]);

  const visibleHomestays = useMemo(() => {
    const start = homestayPage * HOMESTAY_PAGE_SIZE;
    return activeCityHomestays.slice(start, start + HOMESTAY_PAGE_SIZE);
  }, [activeCityHomestays, homestayPage]);

  const visibleActivities = useMemo(() => {
    const start = activityPage * ACTIVITY_PAGE_SIZE;
    return activities.slice(start, start + ACTIVITY_PAGE_SIZE);
  }, [activities, activityPage]);


  const destinationPageCount = Math.max(1, Math.ceil(destinations.length / DESTINATION_PAGE_SIZE));
  const homestayPageCount = Math.max(1, Math.ceil(activeCityHomestays.length / HOMESTAY_PAGE_SIZE));
  const activityPageCount = Math.max(1, Math.ceil(activities.length / ACTIVITY_PAGE_SIZE));
  const canSlideDestinations = destinations.length > DESTINATION_PAGE_SIZE;
  const canSlideHomestays = activeCityHomestays.length > HOMESTAY_PAGE_SIZE;
  const canSlideActivities = activities.length > ACTIVITY_PAGE_SIZE;
  const canSlidePromotions = promotions.length > 1;
  const canSlideReviews = featuredReviews.length > 3;

  const goToSearch = (destination) => {
    setHasSearched(destination ? { destination } : {});
  };

  const changeDestinationPage = (direction) => {
    setDestinationPage((current) => (current + direction + destinationPageCount) % destinationPageCount);
  };

  const changeHomestayPage = (direction) => {
    setHomestayPage((current) => (current + direction + homestayPageCount) % homestayPageCount);
  };

  const changeActivityPage = (direction) => {
    setActivityPage((current) => (current + direction + activityPageCount) % activityPageCount);
  };

  const slidePromotions = (direction) => {
    const container = promotionScrollRef.current;
    if (!container) return;
    container.scrollBy({
      left: getPromotionScrollAmount(container) * direction,
      behavior: 'smooth',
    });
  };

  const slideFeaturedReviews = (direction) => {
    const container = reviewScrollRef.current;
    if (!container) return;
    container.scrollBy({
      left: getReviewScrollAmount(container) * direction,
      behavior: 'smooth',
    });
  };

  const openReviewDetail = (review) => {
    if (!review?.homeId) return;
    const reviewQuery = review.reviewId ? '?reviewId=' + encodeURIComponent(review.reviewId) : '';
    navigate('/homestay/' + review.homeId + reviewQuery + '#reviews');
  };

  const openActivityDetail = (activity) => {
    navigate('/activities', { state: { activityId: activity.id } });
  };

  const searchActivityHomestays = (event, activity) => {
    event.stopPropagation();
    navigate('/activities', {
      state: {
        activityId: activity?.id,
        scrollToNearby: true,
      },
    });
  };

  const usePromotion = (promotion) => {
    const saved = saveSearchState({ promotionCode: promotion.promotionCode });
    const params = buildSearchParams(saved);
    navigate('/search' + (params.toString() ? '?' + params.toString() : ''));
  };

  return (
    <div className="space-y-20 pb-20">
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-12 text-left animate-fade-in">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15] mb-1">Khám phá Việt Nam</h2>
            <p className="text-sm text-gray-400">Chọn địa danh để xem các homestay đang có trong cơ sở dữ liệu Cozygo</p>
          </div>
          <div className="flex items-center gap-3">
            {errorMessage && <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{errorMessage}</p>}
            {canSlideDestinations && (
              <div className="hidden sm:flex items-center gap-2">
                <button type="button" onClick={() => changeDestinationPage(-1)} className="w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm text-[#2C3E2B] font-black hover:bg-[#2C3E2B] hover:text-white transition">‹</button>
                <button type="button" onClick={() => changeDestinationPage(1)} className="w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm text-[#2C3E2B] font-black hover:bg-[#2C3E2B] hover:text-white transition">›</button>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-56 rounded-2xl bg-white/70 border border-gray-100 shadow-sm animate-pulse" />
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm font-semibold text-gray-400">
            Chưa có dữ liệu điểm đến. Hãy kiểm tra bảng homestays hoặc destinations trong database.
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleDestinations.map((destination) => (
                <button
                  type="button"
                  key={destination.slug || destination.city || destination.provinceName}
                  onClick={() => goToSearch(destination.city || destination.provinceName)}
                  className="relative h-56 rounded-2xl overflow-hidden shadow-md group cursor-pointer border border-[#6E473B]/5 text-left p-0 bg-transparent"
                >
                  <img
                    src={destination.thumbnailUrl || fallbackDestinationImage}
                    alt={destination.displayName}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700 brightness-[0.65]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#23150d]/85 via-black/20 to-transparent flex flex-col justify-end p-5 text-[#F4F1EA]">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h4 className="font-classic text-lg font-bold text-white">{destination.displayName}</h4>
                      <span className="bg-white/15 backdrop-blur text-[10px] font-black px-2.5 py-1 rounded-full border border-white/20">
                        {destination.homestayCount} homestay
                      </span>
                    </div>
                    <p className="text-[11px] text-white/75 font-medium line-clamp-2">{destination.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {canSlideDestinations && (
              <>
                <button type="button" onClick={() => changeDestinationPage(-1)} className="sm:hidden absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow-lg text-[#2C3E2B] font-black">‹</button>
                <button type="button" onClick={() => changeDestinationPage(1)} className="sm:hidden absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow-lg text-[#2C3E2B] font-black">›</button>
                <div className="mt-5 flex justify-center gap-1.5">
                  {Array.from({ length: destinationPageCount }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setDestinationPage(index)}
                      className={'h-1.5 rounded-full transition-all border-none ' + (destinationPage === index ? 'w-8 bg-[#2C3E2B]' : 'w-2 bg-gray-300')}
                      aria-label={'Trang điểm đến ' + (index + 1)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="font-classic text-xl md:text-2xl font-bold text-[#2C1E15]">Những chỗ nghỉ nổi bật được đề xuất cho quý khách:</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToSearch(activeCity)}
              className="h-7 rounded-full border border-[#F2A65A]/40 bg-[#FFF4E8] px-4 text-xs font-black uppercase tracking-wider text-[#B65C20] shadow-sm transition hover:bg-[#e2be99] hover:text-white"
            >
              Xem thêm các chỗ nghỉ {activeCity ? '(' + activeCity + ')' : ''} ❯
            </button>
            {canSlideHomestays && (
              <div className="hidden sm:flex items-center gap-2">
                <button type="button" onClick={() => changeHomestayPage(-1)} className="w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm text-[#2C3E2B] font-black hover:bg-[#2C3E2B] hover:text-white transition">‹</button>
                <button type="button" onClick={() => changeHomestayPage(1)} className="w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm text-[#2C3E2B] font-black hover:bg-[#2C3E2B] hover:text-white transition">›</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-6 border-b border-gray-200 text-xs font-bold mb-6 overflow-x-auto scrollbar-none">
          {cityTabs.map((city) => (
            <button
              key={city}
              onClick={() => {
                setActiveCity(city);
                setHomestayPage(0);
              }}
              className={
                'pb-3 border-b-2 transition-all whitespace-nowrap px-1 bg-transparent cursor-pointer ' +
                (activeCity === city
                  ? 'border-[#2C3E2B] text-[#2C3E2B] font-extrabold text-[13px]'
                  : 'border-transparent text-gray-400 hover:text-gray-600')
              }
            >
              {city}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-72 rounded-2xl bg-white/70 animate-pulse" />)}
          </div>
        ) : activeCityHomestays.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm font-semibold text-gray-400">
            Chưa có homestay thuộc {activeCity || 'địa danh này'} để hiển thị.
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleHomestays.map((item) => (
                <HomestayCard
                  key={item.id}
                  item={item}
                  isFav={favorites.includes(item.id)}
                  onFavToggle={toggleFavorite}
                />
              ))}
            </div>

            {canSlideHomestays && (
              <>
                <button type="button" onClick={() => changeHomestayPage(-1)} className="sm:hidden absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow-lg text-[#2C3E2B] font-black">‹</button>
                <button type="button" onClick={() => changeHomestayPage(1)} className="sm:hidden absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow-lg text-[#2C3E2B] font-black">›</button>
                <div className="mt-5 flex justify-center gap-1.5">
                  {Array.from({ length: homestayPageCount }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setHomestayPage(index)}
                      className={'h-1.5 rounded-full transition-all border-none ' + (homestayPage === index ? 'w-8 bg-[#2C3E2B]' : 'w-2 bg-gray-300')}
                      aria-label={'Trang homestay ' + (index + 1)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 text-left">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15] mb-1">Hoạt động trải nghiệm thú vị</h2>
            <p className="text-sm text-gray-400">Khám phá các hoạt động bản địa đang có trong hệ thống Cozygo và tìm nhanh homestay gần khu vực đó</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/activities')}
              className="h-7 rounded-full border border-[#F2A65A]/40 bg-[#FFF4E8] px-4 text-xs font-black uppercase tracking-wider text-[#B65C20] shadow-sm transition hover:bg-[#e2be99] hover:text-white"
            >
              Xem tất cả <span className="text-[10px]">❯</span>
            </button>
            {canSlideActivities && (
              <>
                <button type="button" onClick={() => changeActivityPage(-1)} className="w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm text-[#2C3E2B] font-black hover:bg-[#2C3E2B] hover:text-white transition">‹</button>
                <button type="button" onClick={() => changeActivityPage(1)} className="w-10 h-10 rounded-full border border-gray-200 bg-white shadow-sm text-[#2C3E2B] font-black hover:bg-[#2C3E2B] hover:text-white transition">›</button>
              </>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => <div key={item} className="h-80 rounded-2xl bg-white/70 border border-gray-100 shadow-sm animate-pulse" />)}
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm font-semibold text-gray-400">
            Chưa có hoạt động trải nghiệm nào để hiển thị.
          </div>
        ) : (
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleActivities.map((activity) => {
                const imageUrl = activity.thumbnailUrl || activity.images?.[0]?.imageUrl || fallbackDestinationImage;
                return (
                  <article
                    key={activity.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openActivityDetail(activity)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') openActivityDetail(activity);
                    }}
                    className="group relative h-80 cursor-pointer overflow-hidden rounded-2xl border border-[#6E473B]/10 bg-[#1f2d20] text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <img src={imageUrl} alt={activity.title} className="absolute inset-0 h-full w-full object-cover brightness-[0.68] transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#23150d]/90 via-[#23150d]/24 to-black/10" />

                    <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
                      <span className="rounded-full bg-[#2c3d2b]/75 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#ffffff] shadow-md">
                        {activity.badgeText || 'Mùa trải nghiệm'}
                      </span>
                      <span className="max-w-[46%] truncate rounded-full bg-[#dc824f]/75 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-[#ffffff] shadow-md">
                        {activity.province || 'Khu vực'}
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 space-y-3 p-5 text-white">
                      <div>
                        <h3 className="font-classic text-base font-bold leading-tight drop-shadow-sm">{activity.title}</h3>
                        <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-5 text-white/78">{activity.shortDescription || activity.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => searchActivityHomestays(event, activity)}
                        className="inline-flex h-9 items-center justify-center rounded-xl bg-[#be7143]/75 px-4 text-[10px] font-black uppercase tracking-wider text-white shadow-md transition hover:bg-[#E97820]"
                      >
                        Tìm homestay gần đây
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {canSlideActivities && (
              <>
                <button type="button" onClick={() => changeActivityPage(-1)} className="sm:hidden absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow-lg text-[#2C3E2B] font-black">‹</button>
                <button type="button" onClick={() => changeActivityPage(1)} className="sm:hidden absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow-lg text-[#2C3E2B] font-black">›</button>
                <div className="mt-5 flex justify-center gap-1.5">
                  {Array.from({ length: activityPageCount }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActivityPage(index)}
                      className={'h-1.5 rounded-full transition-all border-none ' + (activityPage === index ? 'w-8 bg-[#2C3E2B]' : 'w-2 bg-gray-300')}
                      aria-label={'Trang hoạt động ' + (index + 1)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 text-left">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-classic text-xl md:text-2xl font-bold text-[#2C1E15]">{HOME_PROMO_TEXT.title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{HOME_PROMO_TEXT.subtitle}</p>
          </div>
          <button onClick={() => navigate('/promotions')} className="h-8 rounded-full border border-[#F2A65A]/40 bg-[#FFF4E8] px-4 text-xs font-black uppercase tracking-wider text-[#B65C20] shadow-sm transition hover:bg-[#FF9800] hover:text-white">
            {HOME_PROMO_TEXT.viewAll} <span className="text-[10px]">&rsaquo;</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex gap-6 overflow-hidden pb-4">
            {[1, 2, 3].map((item) => <div key={item} className="h-[176px] min-w-[520px] animate-pulse rounded-2xl bg-white/70" />)}
          </div>
        ) : promotions.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm font-semibold text-gray-400">
            {HOME_PROMO_TEXT.empty}
          </div>
        ) : (
          <div className="relative">
            <div ref={promotionScrollRef} className="flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory scrollbar-none">
              {promotions.map((promotion) => (
                <div key={promotion.promotionId} data-promotion-card className="min-w-[360px] sm:min-w-[520px] lg:min-w-[560px] snap-start">
                  <PromotionCard promotion={promotion} compact onUse={usePromotion} />
                </div>
              ))}
            </div>
            {canSlidePromotions && (
              <>
                <button type="button" onClick={() => slidePromotions(-1)} className="absolute -left-8 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 rounded-full bg-white/95 text-[#2C3E2B] shadow-lg ring-1 ring-gray-100 transition hover:bg-[#2C3E2B] hover:text-white lg:flex lg:items-center lg:justify-center xl:-left-12" aria-label={'Tr\u01b0\u1ee3t sang tr\u00e1i'}>&lsaquo;</button>
                <button type="button" onClick={() => slidePromotions(1)} className="absolute -right-8 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 rounded-full bg-white/95 text-[#2C3E2B] shadow-lg ring-1 ring-gray-100 transition hover:bg-[#2C3E2B] hover:text-white lg:flex lg:items-center lg:justify-center xl:-right-12" aria-label={'Tr\u01b0\u1ee3t sang ph\u1ea3i'}>&rsaquo;</button>
              </>
            )}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 text-left">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15] mb-1">Nhật ký những bước chân ấm</h2>
            <p className="text-sm text-gray-400">6 đánh giá 5 sao từ các homestay có điểm đánh giá cao nhất trên Cozygo.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-6 overflow-hidden pb-4">
            {[1, 2, 3].map((item) => <div key={item} className="h-[220px] w-[340px] flex-none animate-pulse rounded-2xl bg-white/70 sm:w-[360px] xl:w-[380px]" />)}
          </div>
        ) : featuredReviews.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm font-semibold text-gray-400">
            Chưa có đánh giá 5 sao nào để hiển thị.
          </div>
        ) : (
          <div className="relative">
            <div ref={reviewScrollRef} className="flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory scrollbar-none">
              {featuredReviews.map((review) => (
                <article key={review.reviewId} data-review-card className="flex min-h-[220px] w-[340px] flex-none snap-start flex-col justify-between rounded-2xl border border-[#6E473B]/5 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl sm:w-[360px] xl:w-[380px]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, index) => <span key={index} className="text-sm leading-none">★</span>)}
                      <span className="ml-2 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">5 sao</span>
                    </div>
                    <p className="line-clamp-5 text-sm font-semibold italic leading-7 text-gray-600">
                      “{review.comment}”
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-3 border-t border-gray-50 pt-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2C3E2B] text-xs font-black text-[#F4F1EA]">
                      {review.customerAvatar ? (
                        <img src={review.customerAvatar} alt={review.customerName || 'Khách Cozygo'} className="h-full w-full object-cover" />
                      ) : (
                        (review.customerName || 'K').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-black text-[#2C1E15]">{review.customerName || 'Khách Cozygo'}</h4>
                      <p className="mt-0.5 truncate text-[12px] font-medium text-gray-400">
                        {formatDateTime(review.createdAt)} ·{' '}
                        <button type="button" onClick={() => openReviewDetail(review)} className="bg-transparent p-0 text-left font-bold text-[#6E473B] transition hover:text-[#2C3E2B] hover:underline">
                          {review.homestayName || 'Homestay Cozygo'}
                        </button>
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {canSlideReviews && (
              <>
                <button type="button" onClick={() => slideFeaturedReviews(-1)} className="absolute -left-8 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 rounded-full bg-white/95 text-[#2C3E2B] shadow-lg ring-1 ring-gray-100 transition hover:bg-[#2C3E2B] hover:text-white lg:flex lg:items-center lg:justify-center xl:-left-12" aria-label="Trượt đánh giá sang trái">&lsaquo;</button>
                <button type="button" onClick={() => slideFeaturedReviews(1)} className="absolute -right-8 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 rounded-full bg-white/95 text-[#2C3E2B] shadow-lg ring-1 ring-gray-100 transition hover:bg-[#2C3E2B] hover:text-white lg:flex lg:items-center lg:justify-center xl:-right-12" aria-label="Trượt đánh giá sang phải">&rsaquo;</button>
              </>
            )}
          </div>
        )}

      </section>
    </div>
  );
}



