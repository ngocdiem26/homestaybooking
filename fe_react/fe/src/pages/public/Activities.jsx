import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  HiChevronLeft,
  HiChevronRight,
  HiClock,
  HiMapPin,
  HiPhone,
  HiPhoto,
  HiStar,
} from 'react-icons/hi2';

import UserLayout from '../../layouts/UserLayout';
import {
  getNearbyHomestaysByActivity,
  getPublicActivities,
} from '../../services/activityService';

const FAVORITE_HOMESTAYS_STORAGE_KEY =
  'cozygo.favoriteHomestayIds';

const NEARBY_RADIUS_FILTERS = [
  {
    label: 'Tất cả bán kính',
    value: '',
  },
  {
    label: 'Trong 3 km',
    value: '3',
  },
  {
    label: 'Trong 5 km',
    value: '5',
  },
  {
    label: 'Trong 10 km',
    value: '10',
  },
  {
    label: 'Trong 20 km',
    value: '20',
  },
  {
    label: 'Trong 50 km',
    value: '50',
  },
];

function getActivityImage(activity) {
  return (
    activity.thumbnailUrl ||
    activity.images?.[0]?.imageUrl ||
    ''
  );
}

function formatCurrency(value) {
  const number = Number(value || 0);

  return Number.isFinite(number)
    ? `${number.toLocaleString('vi-VN')}đ`
    : 'Liên hệ';
}

function formatDistance(distanceKm) {
  const number = Number(distanceKm);

  if (!Number.isFinite(number)) {
    return 'Chưa có khoảng cách';
  }

  if (number < 1) {
    return `${Math.round(number * 1000)} m`;
  }

  return `${number.toFixed(1)} km`;
}

function formatActivityTime(value) {
  if (!value) {
    return '';
  }

  const text = String(value).trim();

  return text.length >= 5
    ? text.slice(0, 5)
    : text;
}

function formatActivityHours(activity = {}) {
  const opening = formatActivityTime(
    activity.openingTime,
  );

  const closing = formatActivityTime(
    activity.closingTime,
  );

  if (opening && closing) {
    return `${opening} - ${closing}`;
  }

  if (opening) {
    return `Từ ${opening}`;
  }

  if (closing) {
    return `Đến ${closing}`;
  }

  return 'Chưa cập nhật';
}

function readFavoriteHomestayIds() {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const storedValue =
      window.localStorage.getItem(
        FAVORITE_HOMESTAYS_STORAGE_KEY,
      );

    const parsedValue = JSON.parse(
      storedValue || '[]',
    );

    if (!Array.isArray(parsedValue)) {
      return new Set();
    }

    return new Set(
      parsedValue.map((id) => String(id)),
    );
  } catch {
    return new Set();
  }
}

function NearbyHomestaysSlider({
  homestays,
  loading,
  error,
  onOpenHomestay,
  favoriteHomestayIds,
  onFavoriteToggle,
}) {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    sliderRef.current?.scrollBy({
      left: direction * 380,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-[365px] animate-pulse rounded-2xl bg-white/70 shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold text-amber-700">
        {error}
      </div>
    );
  }

  if (!homestays.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm font-bold text-gray-400">
        Chưa có homestay gần hoạt động này hoặc dữ
        liệu tọa độ chưa đầy đủ.
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scroll(-1)}
        className="absolute -left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-[#2C3E2B] shadow-lg transition hover:bg-[#2C3E2B] hover:text-white md:flex"
        aria-label="Trượt homestay gần đây sang trái"
      >
        <HiChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={sliderRef}
        className="flex gap-7 overflow-x-auto scroll-smooth px-1 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {homestays.map(
          (homestay, homestayIndex) => {
            const homestayId =
              homestay.homeId ?? homestay.id;

            const normalizedHomestayId =
              homestayId == null
                ? ''
                : String(homestayId);

            const isFavorite =
              normalizedHomestayId !== '' &&
              favoriteHomestayIds.has(
                normalizedHomestayId,
              );

            const score = Number(
              homestay.rating ||
                homestay.score ||
                0,
            ).toFixed(1);

            const reviewCount = Number(
              homestay.reviewCount ??
                homestay.reviewsCount ??
                0,
            );

            const orders = Number(
              homestay.orders || 0,
            );

            const pricePerNight = Number(
              homestay.pricePerNight || 0,
            );

            const oldPrice = Math.round(
              pricePerNight * 1.18,
            );

            const displayCity =
              homestay.city ||
              homestay.province ||
              homestay.address ||
              'Chưa cập nhật';

            return (
              <article
                key={
                  normalizedHomestayId ||
                  `nearby-homestay-${homestayIndex}`
                }
                onClick={() =>
                  onOpenHomestay(homestay)
                }
                className="group flex min-w-[300px] max-w-[300px] cursor-pointer flex-col rounded-2xl border border-[#6E473B]/5 bg-white p-3.5 text-left font-sans shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:min-w-[335px] md:max-w-[335px]"
              >
                <div className="relative mb-3.5 h-44 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  {homestay.img ? (
                    <img
                      src={homestay.img}
                      alt={homestay.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <HiPhoto className="h-12 w-12" />
                    </div>
                  )}

                  <span className="absolute left-3 top-3 rounded-full bg-[#2C3E2B] px-3 py-1.5 text-xs font-black text-white shadow-lg">
                    Cách{' '}
                    {formatDistance(
                      homestay.distanceKm,
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();

                      onFavoriteToggle?.(
                        homestay,
                      );
                    }}
                    aria-label={
                      isFavorite
                        ? 'Bỏ khỏi danh sách yêu thích'
                        : 'Thêm vào danh sách yêu thích'
                    }
                    aria-pressed={isFavorite}
                    title={
                      isFavorite
                        ? 'Bỏ yêu thích'
                        : 'Thêm yêu thích'
                    }
                    className="
                      group/heart
                      absolute right-3 top-3 z-20
                      flex h-9 w-9 items-center justify-center
                      rounded-full
                      border border-white/70
                      bg-white/90
                      shadow-md
                      backdrop-blur-sm
                      transition-all duration-200
                      hover:scale-110
                      hover:bg-red-50
                    "
                  >
                    {isFavorite ? (
                      <span className="select-none text-base transition-transform duration-200 group-hover/heart:scale-110">
                        ❤️
                      </span>
                    ) : (
                      <>
                        <span className="select-none text-base group-hover/heart:hidden">
                          🤍
                        </span>

                        <span className="hidden select-none text-base group-hover/heart:inline">
                          ❤️
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="mb-0.5 line-clamp-1 font-classic text-lg font-black text-[#2C1E15] transition group-hover:text-[#6E473B]">
                      {homestay.name}
                    </h3>

                    <p className="flex items-center gap-1 text-[12px] font-bold text-[#2C3E2B]">
                      <HiMapPin
                        size={13}
                        className="shrink-0 text-[#a50000]"
                      />

                      <span className="line-clamp-1">
                        {displayCity}
                      </span>
                    </p>

                    <div className="inline-flex items-center gap-2 pt-1.5">
                      <div className="flex h-8 w-9 items-center justify-center rounded-lg rounded-br-none bg-[#2C3E2B] text-xs font-black text-white shadow-sm">
                        <HiStar className="h-3.5 w-3.5 text-amber-300" />

                        <span className="ml-0.5">
                          {score}
                        </span>
                      </div>

                      <span className="rounded-xl border border-[#2C3E2B]/10 bg-[#2C3E2B]/5 px-2.5 py-2 text-[10px] font-bold text-gray-700">
                        {reviewCount > 0
                          ? `${reviewCount} đánh giá`
                          : 'Chưa có đánh giá'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-3">
                    <div className="mb-3 flex items-end justify-between gap-3">
                      <div className="flex min-w-0 flex-col text-left">
                        <span className="text-[12px] font-semibold text-gray-500 line-through">
                          {formatCurrency(oldPrice)}
                        </span>

                        <span className="w-fit rounded-r-3xl bg-[#f9dfd7] px-2 py-1 text-[13px] font-bold text-[#904630] shadow-lg">
                          {formatCurrency(
                            pricePerNight,
                          )}

                          <span className="text-[11px] text-[#904630]/80">
                            {' '}
                            / 1 đêm
                          </span>
                        </span>
                      </div>

                      <span className="shrink-0 rounded-md border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-700 shadow-md">
                        {orders} lượt đặt
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          },
        )}
      </div>

      <button
        type="button"
        onClick={() => scroll(1)}
        className="absolute -right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-[#2C3E2B] shadow-lg transition hover:bg-[#2C3E2B] hover:text-white md:flex"
        aria-label="Trượt homestay gần đây sang phải"
      >
        <HiChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function Activities() {
  const navigate = useNavigate();
  const location = useLocation();

  const nearbySectionRef = useRef(null);

  const [
    activitiesList,
    setActivitiesList,
  ] = useState([]);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    selectedActivityId,
    setSelectedActivityId,
  ] = useState(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isLoadingNearby,
    setIsLoadingNearby,
  ] = useState(false);

  const [error, setError] = useState('');

  const [
    nearbyError,
    setNearbyError,
  ] = useState('');

  const [
    nearbyHomestays,
    setNearbyHomestays,
  ] = useState([]);

  const [
    nearbyRadiusKm,
    setNearbyRadiusKm,
  ] = useState('');

  const [
    favoriteHomestayIds,
    setFavoriteHomestayIds,
  ] = useState(readFavoriteHomestayIds);

  useEffect(() => {
    let isMounted = true;

    async function loadActivities() {
      setIsLoading(true);
      setError('');

      try {
        const data =
          await getPublicActivities();

        if (!isMounted) {
          return;
        }

        const requestedId =
          location.state?.activityId;

        const requestedIndex = requestedId
          ? data.findIndex(
              (activity) =>
                activity.id === requestedId,
            )
          : -1;

        const startIndex =
          requestedIndex >= 0
            ? requestedIndex
            : data.length > 2
              ? 2
              : 0;

        setActivitiesList(data);
        setCurrentIndex(startIndex);

        setSelectedActivityId(
          data[startIndex]?.id || null,
        );
      } catch (exception) {
        if (!isMounted) {
          return;
        }

        setError(
          exception.message ||
            'Không tải được danh sách hoạt động.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadActivities();

    return () => {
      isMounted = false;
    };
  }, [location.state?.activityId]);

  const selectedActivity = useMemo(() => {
    return (
      activitiesList.find(
        (activity) =>
          activity.id === selectedActivityId,
      ) ||
      activitiesList[currentIndex] ||
      null
    );
  }, [
    activitiesList,
    selectedActivityId,
    currentIndex,
  ]);

  useEffect(() => {
    if (
      !location.state?.scrollToNearby ||
      !selectedActivity?.id
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      nearbySectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    location.state?.scrollToNearby,
    selectedActivity?.id,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function loadNearbyHomestays() {
      if (!selectedActivity?.id) {
        setNearbyHomestays([]);
        return;
      }

      setIsLoadingNearby(true);
      setNearbyError('');

      try {
        const data =
          await getNearbyHomestaysByActivity(
            selectedActivity.id,
            {
              limit: 12,
              radiusKm: nearbyRadiusKm,
            },
          );

        if (!isMounted) {
          return;
        }

        setNearbyHomestays(data);
      } catch (exception) {
        if (!isMounted) {
          return;
        }

        setNearbyHomestays([]);

        setNearbyError(
          exception.message ||
            'Không tải được danh sách homestay gần hoạt động này.',
        );
      } finally {
        if (isMounted) {
          setIsLoadingNearby(false);
        }
      }
    }

    loadNearbyHomestays();

    return () => {
      isMounted = false;
    };
  }, [
    selectedActivity?.id,
    nearbyRadiusKm,
  ]);

  useEffect(() => {
    window.localStorage.setItem(
      FAVORITE_HOMESTAYS_STORAGE_KEY,
      JSON.stringify(
        Array.from(favoriteHomestayIds),
      ),
    );
  }, [favoriteHomestayIds]);

  const handleNext = () => {
    if (activitiesList.length === 0) {
      return;
    }

    setCurrentIndex((previousIndex) => {
      const nextIndex =
        (previousIndex + 1) %
        activitiesList.length;

      setSelectedActivityId(
        activitiesList[nextIndex]?.id || null,
      );

      return nextIndex;
    });
  };

  const handlePrev = () => {
    if (activitiesList.length === 0) {
      return;
    }

    setCurrentIndex((previousIndex) => {
      const nextIndex =
        (previousIndex -
          1 +
          activitiesList.length) %
        activitiesList.length;

      setSelectedActivityId(
        activitiesList[nextIndex]?.id || null,
      );

      return nextIndex;
    });
  };

  const handleShowDetail = (activity) => {
    setSelectedActivityId(activity.id);

    window.setTimeout(() => {
      document
        .getElementById('activity-detail')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 80);
  };

  const handleSearchNearby = () => {
    nearbySectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleOpenHomestay = (homestay) => {
    const homestayId =
      homestay.homeId ?? homestay.id;

    if (homestayId == null) {
      return;
    }

    navigate(`/homestay/${homestayId}`);
  };

  const handleToggleNearbyFavorite = (
    homestay,
  ) => {
    const homestayId =
      homestay?.homeId ?? homestay?.id;

    if (homestayId == null) {
      return;
    }

    const normalizedId =
      String(homestayId);

    setFavoriteHomestayIds(
      (currentFavoriteIds) => {
        const nextFavoriteIds = new Set(
          currentFavoriteIds,
        );

        if (
          nextFavoriteIds.has(normalizedId)
        ) {
          nextFavoriteIds.delete(
            normalizedId,
          );
        } else {
          nextFavoriteIds.add(
            normalizedId,
          );
        }

        return nextFavoriteIds;
      },
    );
  };

  return (
    <UserLayout>
      <div className="min-h-screen space-y-14 bg-[#F4F1EA] pb-24 text-[#23150d]">
        <section className="relative flex min-h-[640px] flex-col items-center justify-center overflow-hidden bg-[#202c3c] px-4 pb-16 pt-8 text-center md:px-8">
          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

          <div className="relative z-10 mx-auto mb-3 mt-0 max-w-3xl">
            <span className="rounded-full bg-[#6E473B] px-4 py-1.5 text-[14px] font-bold uppercase tracking-widest text-white shadow-md">
              Trải nghiệm các hoạt động thú vị cùng
              Cozygo
            </span>
          </div>

          {error && (
            <div className="relative z-10 mb-5 max-w-3xl rounded-2xl border border-red-200/40 bg-red-500/15 px-5 py-4 text-sm font-bold text-red-100">
              {error}
            </div>
          )}

          <div className="relative z-10 flex h-[500px] w-full max-w-7xl items-center justify-center [perspective:1800px]">
            {isLoading ? (
              <div className="h-[460px] w-[320px] animate-pulse rounded-[32px] bg-white/10 sm:w-[350px] md:w-[380px]" />
            ) : activitiesList.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-sm font-bold text-white/60">
                Chưa có hoạt động nào để hiển thị.
              </div>
            ) : (
              activitiesList.map(
                (activity, index) => {
                  let offset =
                    index - currentIndex;

                  if (
                    offset <
                    -Math.floor(
                      activitiesList.length / 2,
                    )
                  ) {
                    offset +=
                      activitiesList.length;
                  }

                  if (
                    offset >
                    Math.floor(
                      activitiesList.length / 2,
                    )
                  ) {
                    offset -=
                      activitiesList.length;
                  }

                  const absoluteOffset =
                    Math.abs(offset);

                  if (absoluteOffset > 2) {
                    return null;
                  }

                  const transformStyle = {
                    transform:
                      `translateX(${offset * 260}px) ` +
                      `scale(${1 - absoluteOffset * 0.2}) ` +
                      `rotateY(${offset * -30}deg) ` +
                      `translateZ(${absoluteOffset * -150}px)`,
                    zIndex:
                      10 - absoluteOffset,
                    opacity:
                      absoluteOffset === 0
                        ? 1
                        : absoluteOffset === 1
                          ? 0.55
                          : 0.15,
                  };

                  const imageUrl =
                    getActivityImage(activity);

                  return (
                    <div
                      key={activity.id}
                      style={transformStyle}
                      onClick={() => {
                        if (
                          absoluteOffset === 0
                        ) {
                          handleShowDetail(
                            activity,
                          );
                        } else {
                          setCurrentIndex(index);

                          setSelectedActivityId(
                            activity.id,
                          );
                        }
                      }}
                      className={`absolute h-[460px] w-[320px] cursor-pointer overflow-hidden rounded-[32px] border shadow-2xl transition-all duration-500 ease-out sm:w-[350px] md:w-[380px] ${
                        absoluteOffset === 0
                          ? 'border-[#E7B10A] ring-4 ring-[#E7B10A]/20'
                          : 'border-white/10'
                      }`}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={activity.title}
                          className="h-full w-full object-cover brightness-100 transition duration-700"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#172433] text-white/30">
                          <HiPhoto className="h-16 w-16" />
                        </div>
                      )}

                      <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(to_top,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.62)_30%,rgba(0,0,0,0.16)_58%,transparent_100%)] p-7 text-left text-white">
                        <h3 className="mb-2.5 font-classic text-base font-bold tracking-wide text-white drop-shadow md:text-xl">
                          {activity.title}
                        </h3>

                        <p
                          className={`text-xs leading-relaxed text-gray-300 transition-all duration-300 ${
                            absoluteOffset === 0
                              ? 'max-h-24 overflow-y-auto opacity-100'
                              : 'line-clamp-1 opacity-40'
                          }`}
                        >
                          {activity.shortDescription ||
                            activity.description ||
                            'Khám phá hoạt động bản địa cùng Cozygo.'}
                        </p>

                        {absoluteOffset === 0 && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();

                              handleShowDetail(
                                activity,
                              );
                            }}
                            className="mt-5 w-full rounded-2xl bg-[#6E473B] py-3.5 text-center text-xs font-bold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#57362c] active:scale-[0.98]"
                          >
                            Xem chi tiết
                          </button>
                        )}
                      </div>
                    </div>
                  );
                },
              )
            )}
          </div>

          <div className="z-20 mt-4 flex items-center space-x-4">
            <button
              type="button"
              onClick={handlePrev}
              className="rounded-xl border border-white/15 bg-white/10 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#202c3c] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={
                activitiesList.length <= 1
              }
            >
              PREV
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="rounded-xl border border-white/15 bg-[#6E473B] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#57362c] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={
                activitiesList.length <= 1
              }
            >
              NEXT
            </button>
          </div>
        </section>

        {selectedActivity && (
          <section
            id="activity-detail"
            className="mx-auto max-w-6xl scroll-mt-24 space-y-8 px-6 text-left"
          >
            <div className="overflow-hidden rounded-3xl border border-[#6E473B]/10 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-100 p-6 md:flex-row md:items-end md:justify-between md:p-8">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#B8754D]">
                    Chi tiết hoạt động
                  </p>

                  <h2 className="mt-2 font-classic font-serif text-3xl font-bold text-[#2C1E15] md:text-4xl">
                    {selectedActivity.title}
                  </h2>

                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-gray-500">
                    {selectedActivity.shortDescription ||
                      'Thông tin trải nghiệm được cập nhật trực tiếp từ hệ thống Cozygo.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSearchNearby}
                  className="h-12 rounded-xl bg-[#6E473B] px-5 text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-[#57362c]"
                >
                  Tìm homestay gần đây
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 p-6 md:p-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {selectedActivity.images
                    ?.slice(0, 6)
                    .map((image, index) => (
                      <div
                        key={
                          image.imageId || index
                        }
                        className={`${
                          index === 0
                            ? 'h-80 sm:col-span-2'
                            : 'h-48'
                        } overflow-hidden rounded-2xl bg-gray-100`}
                      >
                        <img
                          src={image.imageUrl}
                          alt={
                            selectedActivity.title
                          }
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />
                      </div>
                    ))}

                  {(!selectedActivity.images ||
                    selectedActivity.images
                      .length === 0) && (
                    <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-[#F9F8F6] text-sm font-bold text-gray-400 sm:col-span-2">
                      Chưa có ảnh hoạt động.
                    </div>
                  )}
                </div>

                <aside className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 bg-[#F9F8F6] p-5">
                    <h3 className="font-classic font-serif text-2xl font-bold text-[#2C1E15]">
                      Mô tả hoạt động
                    </h3>

                    <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-gray-600">
                      {selectedActivity.description ||
                        'Chưa có mô tả chi tiết.'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">
                      Địa chỉ hoạt động
                    </p>

                    <p className="mt-2 flex gap-2 text-sm font-bold leading-6 text-[#2C1E15]">
                      <HiMapPin className="mt-1 h-4 w-4 shrink-0 text-[#6E473B]" />

                      {selectedActivity.address ||
                        selectedActivity.province ||
                        'Chưa cập nhật địa chỉ'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">
                      Giờ hoạt động
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-lg font-black text-[#2C3E2B]">
                      <HiClock className="h-5 w-5 text-[#6E473B]" />

                      {formatActivityHours(
                        selectedActivity,
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">
                      Hotline liên hệ
                    </p>

                    <p className="mt-2 flex items-center gap-2 text-lg font-black text-[#2C3E2B]">
                      <HiPhone className="h-5 w-5 text-[#6E473B]" />

                      {selectedActivity.hotline ||
                        'Chưa cập nhật'}
                    </p>
                  </div>
                </aside>
              </div>
            </div>

            <div
              ref={nearbySectionRef}
              className="scroll-mt-24 rounded-3xl border border-[#6E473B]/10 bg-[#FBFAF7] p-6 shadow-sm md:p-8"
            >
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#B8754D]">
                    Lưu trú gần hoạt động
                  </p>

                  <h3 className="mt-2 font-classic text-3xl font-black text-[#2C1E15]">
                    Homestay gần{' '}
                    {selectedActivity.title}
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-gray-500">
                    Sắp xếp theo khoảng cách tọa
                    độ, nơi gần nhất được hiển thị
                    trước.{' '}
                    {nearbyRadiusKm
                      ? `Đang lọc trong bán kính ${nearbyRadiusKm} km.`
                      : 'Đang xem tất cả bán kính.'}
                  </p>
                </div>

                <div className="flex w-full flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm md:w-60">
                  <label className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Bán kính tìm kiếm
                  </label>

                  <select
                    value={nearbyRadiusKm}
                    onChange={(event) =>
                      setNearbyRadiusKm(
                        event.target.value,
                      )
                    }
                    className="h-11 rounded-xl border border-gray-200 bg-[#FBFAF7] px-3 text-sm font-black text-[#2C3E2B] outline-none transition focus:border-[#B8754D] focus:bg-white"
                  >
                    {NEARBY_RADIUS_FILTERS.map(
                      (option) => (
                        <option
                          key={
                            option.value ||
                            'all'
                          }
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>

                  <span className="text-xs font-bold text-gray-500">
                    {nearbyHomestays.length}{' '}
                    homestay phù hợp
                  </span>
                </div>
              </div>

              <NearbyHomestaysSlider
                homestays={nearbyHomestays}
                loading={isLoadingNearby}
                error={nearbyError}
                onOpenHomestay={
                  handleOpenHomestay
                }
                favoriteHomestayIds={
                  favoriteHomestayIds
                }
                onFavoriteToggle={
                  handleToggleNearbyFavorite
                }
              />
            </div>
          </section>
        )}
      </div>
    </UserLayout>
  );
}