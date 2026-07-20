import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import UserLayout from '../../layouts/UserLayout';
import VerticalHomestayCard from '../../components/homestay/VerticalHomestayCard';
import { getFavoriteHomestays } from '../../services/favoriteService';
import { getAuthToken } from '../../services/authStorage';
import { getPublicHomestays } from '../../services/homestayService';

function getCardScrollAmount(container) {
  const card = container?.querySelector('[data-favorite-card]');
  if (!container || !card) return 320;
  const styles = window.getComputedStyle(container);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || '24') || 24;
  return card.getBoundingClientRect().width + gap;
}

function FavoriteSlider({ items, favoriteIds, onToggleFavorite, emptyState }) {
  const scrollRef = useRef(null);
  const canSlide = items.length > 1;

  const slide = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({
      left: getCardScrollAmount(container) * direction,
      behavior: 'smooth',
    });
  };

  return (
    <section className="space-y-10">
      <header className="border-b border-gray-200 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-classic text-3xl font-bold text-[#2C1E15] md:text-4xl">
              <span className="mr-3 align-middle text-3xl md:text-4xl">💗</span>
              Danh sách yêu thích của bạn
            </h1>
            <p className="mt-2 text-sm font-semibold text-[#9AA4B5]">
              Lưu trữ những chốn dừng chân ấm áp bạn đã chọn cho hành trình sắp tới ({items.length} chỗ nghỉ)
            </p>
          </div>

        </div>
      </header>

      {items.length === 0 ? (
        emptyState
      ) : (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory scrollbar-none"
          >
            {items.map((item) => (
              <div
                key={item.id}
                data-favorite-card
                className="min-w-[270px] sm:min-w-[300px] lg:min-w-[306px] snap-start"
              >
                <VerticalHomestayCard
                  item={item}
                  isFav={favoriteIds.includes(item.id)}
                  onFavToggle={onToggleFavorite}
                />
              </div>
            ))}
          </div>

          {canSlide && (
            <>
              <button
                type="button"
                onClick={() => slide(-1)}
                className="absolute -left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 rounded-full bg-white/95 text-[#2C3E2B] shadow-lg ring-1 ring-gray-100 transition hover:bg-[#2C3E2B] hover:text-white lg:flex lg:items-center lg:justify-center"
                aria-label="Trượt sang trái"
              >
                <HiChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => slide(1)}
                className="absolute -right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 rounded-full bg-white/95 text-[#2C3E2B] shadow-lg ring-1 ring-gray-100 transition hover:bg-[#2C3E2B] hover:text-white lg:flex lg:items-center lg:justify-center"
                aria-label="Trượt sang phải"
              >
                <HiChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export default function Favorites({ favorites = [], toggleFavorite }) {
  const [favoriteHomestays, setFavoriteHomestays] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(favorites);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const isLoggedIn = Boolean(getAuthToken());

  useEffect(() => {
    let isMounted = true;

    async function loadFavorites() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        if (isLoggedIn) {
          const data = await getFavoriteHomestays();
          if (!isMounted) return;
          setFavoriteHomestays(data);
          setFavoriteIds(data.map((item) => item.id));
          return;
        }

        const publicHomestays = await getPublicHomestays({ sort: 'recommended' });
        if (!isMounted) return;
        setFavoriteIds(favorites);
        setFavoriteHomestays(publicHomestays.filter((item) => favorites.includes(item.id)));
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error.message || 'Không tải được danh sách yêu thích');
        setFavoriteHomestays([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadFavorites();
    return () => {
      isMounted = false;
    };
  }, [favorites, isLoggedIn]);

  const handleToggleFavorite = async (homeId) => {
    const previousIds = favoriteIds;
    const previousHomestays = favoriteHomestays;
    const isFavorite = favoriteIds.includes(homeId);

    setFavoriteIds((current) =>
      isFavorite ? current.filter((id) => id !== homeId) : [...current, homeId]
    );
    if (isFavorite) {
      setFavoriteHomestays((current) => current.filter((item) => item.id !== homeId));
    }

    try {
      if (typeof toggleFavorite === 'function') {
        await toggleFavorite(homeId);
      }
    } catch (error) {
      setFavoriteIds(previousIds);
      setFavoriteHomestays(previousHomestays);
      setErrorMessage(error.message || 'Không cập nhật được yêu thích');
    }
  };

  const emptyFavorites = useMemo(() => (
    <div className="mx-auto mt-2 flex min-h-[345px] max-w-[560px] flex-col items-center justify-center rounded-[22px] border border-dashed border-gray-300 bg-white px-10 py-14 text-center shadow-sm">
      <div className="mb-5 text-5xl drop-shadow-sm">🤍</div>
      <h3 className="font-classic text-xl font-bold text-[#2C1E15]">Chưa có homestay yêu thích nào</h3>
      <p className="mt-5 max-w-[380px] text-sm font-semibold leading-6 text-[#9AA4B5]">
        Hãy duyệt quanh trang chủ và bấm vào biểu tượng trái tim trên các căn hộ gỗ để lưu giữ chúng tại đây.
      </p>
      <Link
        to="/search"
        className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#2C3E2B] px-7 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-[#1f2d20]"
      >
        Khám phá chỗ ở ngay
      </Link>
    </div>
  ), []);

  return (
    <UserLayout>
      <main className="min-h-screen bg-[#F4F1EA] px-4 py-12 text-left md:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {errorMessage && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
              {errorMessage}
            </div>
          )}

          {!isLoggedIn && favorites.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
              Danh sách này đang được lưu tạm thời trên trình duyệt. Đăng nhập để lưu vào tài khoản của bạn.
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-80 rounded-3xl bg-white/70 shadow-sm animate-pulse" />
              ))}
            </div>
          ) : (
            <FavoriteSlider
              items={favoriteHomestays}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              emptyState={emptyFavorites}
            />
          )}
        </div>
      </main>
    </UserLayout>
  );
}
