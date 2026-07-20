import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiBolt, HiChevronLeft, HiChevronRight, HiMapPin, HiPhone, HiPhoto, HiStar } from 'react-icons/hi2';
import UserLayout from '../../layouts/UserLayout';
import { getNearbyHomestaysByActivity, getPublicActivities } from '../../services/activityService';

function getActivityImage(activity) {
  return activity.thumbnailUrl || activity.images?.[0]?.imageUrl || '';
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number.toLocaleString('vi-VN') + 'đ' : 'Liên hệ';
}

function formatDistance(distanceKm) {
  const number = Number(distanceKm);
  if (!Number.isFinite(number)) return 'Chưa có khoảng cách';
  if (number < 1) return Math.round(number * 1000) + ' m';
  return number.toFixed(1) + ' km';
}

const NEARBY_RADIUS_FILTERS = [
  { label: 'Tất cả bán kính', value: '' },
  { label: 'Trong 3 km', value: '3' },
  { label: 'Trong 5 km', value: '5' },
  { label: 'Trong 10 km', value: '10' },
  { label: 'Trong 20 km', value: '20' },
  { label: 'Trong 50 km', value: '50' },
];


function NearbyHomestaysSlider({ homestays, loading, error, onOpenHomestay }) {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    sliderRef.current?.scrollBy({ left: direction * 360, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-80 animate-pulse rounded-3xl bg-white/70 shadow-sm" />
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
        Chưa có homestay gần hoạt động này hoặc dữ liệu tọa độ chưa đầy đủ.
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

      <div ref={sliderRef} className="flex gap-5 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {homestays.map((homestay) => (
          <article
            key={homestay.homeId || homestay.id}
            onClick={() => onOpenHomestay(homestay)}
            className="group min-w-[285px] max-w-[285px] cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl md:min-w-[330px] md:max-w-[330px]"
          >
            <div className="relative h-48 overflow-hidden bg-gray-100">
              {homestay.img ? (
                <img src={homestay.img} alt={homestay.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <HiPhoto className="h-12 w-12" />
                </div>
              )}
              <span className="absolute left-4 top-4 rounded-full bg-[#2C3E2B] px-3 py-1.5 text-xs font-black text-white shadow-lg">
                Cách {formatDistance(homestay.distanceKm)}
              </span>
              <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-[#2C3E2B] shadow-md">
                <HiStar className="h-4 w-4 text-yellow-500" /> {Number(homestay.rating || 0).toFixed(1)}
              </span>
            </div>

            <div className="space-y-3 p-5">
              <div>
                <h3 className="line-clamp-1 font-classic text-xl font-black text-[#2C1E15]">{homestay.name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-gray-500">
                  <HiMapPin className="h-4 w-4 text-[#B8754D]" />
                  <span className="line-clamp-1">{homestay.city || homestay.province || homestay.address}</span>
                </p>
              </div>

              <div className="flex items-end justify-between border-t border-gray-100 pt-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">Giá mỗi đêm</p>
                  <p className="text-xl font-black text-[#794737]">{formatCurrency(homestay.pricePerNight)}</p>
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenHomestay(homestay);
                  }}
                  className="rounded-2xl bg-[#2C3E2B] px-4 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-[#1f2f20]"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </article>
        ))}
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
  const [activitiesList, setActivitiesList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [error, setError] = useState('');
  const [nearbyError, setNearbyError] = useState('');
  const [nearbyHomestays, setNearbyHomestays] = useState([]);
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadActivities() {
      setIsLoading(true);
      setError('');
      try {
        const data = await getPublicActivities();
        if (!isMounted) return;
        const requestedId = location.state?.activityId;
        const requestedIndex = requestedId ? data.findIndex((activity) => activity.id === requestedId) : -1;
        const startIndex = requestedIndex >= 0 ? requestedIndex : (data.length > 2 ? 2 : 0);
        setActivitiesList(data);
        setCurrentIndex(startIndex);
        setSelectedActivityId(data[startIndex]?.id || null);
      } catch (exception) {
        if (!isMounted) return;
        setError(exception.message || 'Không tải được danh sách hoạt động.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadActivities();
    return () => {
      isMounted = false;
    };
  }, [location.state?.activityId]);

  const selectedActivity = useMemo(() => {
    return activitiesList.find((activity) => activity.id === selectedActivityId) || activitiesList[currentIndex] || null;
  }, [activitiesList, selectedActivityId, currentIndex]);

  useEffect(() => {
    if (!location.state?.scrollToNearby || !selectedActivity?.id) return undefined;
    const timer = window.setTimeout(() => {
      nearbySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [location.state?.scrollToNearby, selectedActivity?.id]);


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
        const data = await getNearbyHomestaysByActivity(selectedActivity.id, {
          limit: 12,
          radiusKm: nearbyRadiusKm,
        });
        if (!isMounted) return;
        setNearbyHomestays(data);
      } catch (exception) {
        if (!isMounted) return;
        setNearbyHomestays([]);
        setNearbyError(exception.message || 'Không tải được danh sách homestay gần hoạt động này.');
      } finally {
        if (isMounted) setIsLoadingNearby(false);
      }
    }

    loadNearbyHomestays();
    return () => {
      isMounted = false;
    };
  }, [selectedActivity?.id, nearbyRadiusKm]);

  const handleNext = () => {
    if (activitiesList.length === 0) return;
    setCurrentIndex((prev) => {
      const next = (prev + 1) % activitiesList.length;
      setSelectedActivityId(activitiesList[next]?.id || null);
      return next;
    });
  };

  const handlePrev = () => {
    if (activitiesList.length === 0) return;
    setCurrentIndex((prev) => {
      const next = (prev - 1 + activitiesList.length) % activitiesList.length;
      setSelectedActivityId(activitiesList[next]?.id || null);
      return next;
    });
  };

  const handleShowDetail = (activity) => {
    setSelectedActivityId(activity.id);
    setTimeout(() => {
      document.getElementById('activity-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleSearchNearby = () => {
    nearbySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOpenHomestay = (homestay) => {
    navigate('/homestay/' + (homestay.homeId || homestay.id));
  };

  return (
    <UserLayout>
      <div className="min-h-screen space-y-14 bg-[#F4F1EA] pb-24 text-[#23150d]">
        <section className="relative flex min-h-[640px] flex-col items-center justify-center overflow-hidden bg-[#202c3c] px-4 pb-16 pt-12 text-center md:px-8">
          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

          <div className="relative z-10 mx-auto mt-0 mb-4 max-w-3xl">
            <span className="rounded-full bg-[#6E473B] px-4 py-1.5 text-[14px] font-bold uppercase tracking-widest text-white shadow-md">
              Trải nghiệm các hoạt động thú vị cùng Cozygo
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
              activitiesList.map((activity, idx) => {
                let offset = idx - currentIndex;

                if (offset < -Math.floor(activitiesList.length / 2)) offset += activitiesList.length;
                if (offset > Math.floor(activitiesList.length / 2)) offset -= activitiesList.length;

                const absOffset = Math.abs(offset);
                if (absOffset > 2) return null;

                const transformStyle = {
                  transform: `translateX(${offset * 260}px) scale(${1 - absOffset * 0.2}) rotateY(${offset * -30}deg) translateZ(${absOffset * -150}px)`,
                  zIndex: 10 - absOffset,
                  opacity: absOffset === 0 ? 1 : absOffset === 1 ? 0.55 : 0.15,
                };

                const imageUrl = getActivityImage(activity);

                return (
                  <div
                    key={activity.id}
                    style={transformStyle}
                    onClick={() => (absOffset === 0 ? handleShowDetail(activity) : (setCurrentIndex(idx), setSelectedActivityId(activity.id)))}
                    className={`absolute h-[460px] w-[320px] cursor-pointer overflow-hidden rounded-[32px] border shadow-2xl transition-all duration-500 ease-out sm:w-[350px] md:w-[380px] ${
                      absOffset === 0 ? 'border-[#E7B10A] ring-4 ring-[#E7B10A]/20' : 'border-white/10'
                    }`}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={activity.title}
                        className="h-full w-full object-cover brightness-[0.6] transition duration-700 group-hover:scale-103"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#172433] text-white/30">
                        <HiPhoto className="h-16 w-16" />
                      </div>
                    )}

                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/25 to-transparent p-7 text-left text-white">
                      <h3 className="font-classic mb-2.5 text-base font-bold tracking-wide text-white drop-shadow md:text-xl">
                        {activity.title}
                      </h3>
                      <p className={`text-xs leading-relaxed text-gray-300 transition-all duration-300 ${absOffset === 0 ? 'max-h-24 overflow-y-auto opacity-100' : 'line-clamp-1 opacity-40'}`}>
                        {activity.shortDescription || activity.description || 'Khám phá hoạt động bản địa cùng Cozygo.'}
                      </p>

                      {absOffset === 0 && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleShowDetail(activity);
                          }}
                          className="active:scale-98 mt-5 w-full rounded-2xl bg-[#6E473B] py-3.5 text-center text-xs font-bold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#57362c]"
                        >
                          <span className="inline-flex items-center gap-2">
                            <HiBolt className="h-4 w-4 text-[#E7B10A]" /> Xem chi tiết
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="z-20 mt-4 flex items-center space-x-4">
            <button
              type="button"
              onClick={handlePrev}
              className="rounded-xl border border-white/15 bg-white/10 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#202c3c] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={activitiesList.length <= 1}
            >
              PREV
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="rounded-xl border border-white/15 bg-[#6E473B] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#57362c] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={activitiesList.length <= 1}
            >
              NEXT
            </button>
          </div>
        </section>

        {selectedActivity && (
          <section id="activity-detail" className="mx-auto max-w-6xl scroll-mt-24 space-y-8 px-6 text-left">
            <div className="overflow-hidden rounded-3xl border border-[#6E473B]/10 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-gray-100 p-6 md:flex-row md:items-end md:justify-between md:p-8">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#B8754D]">Chi tiết hoạt động</p>
                  <h2 className="font-classic mt-2 font-serif text-3xl font-bold text-[#2C1E15] md:text-4xl">
                    {selectedActivity.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-gray-500">
                    {selectedActivity.shortDescription || 'Thông tin trải nghiệm được cập nhật trực tiếp từ hệ thống Cozygo.'}
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
                  {selectedActivity.images?.slice(0, 6).map((image, index) => (
                    <div
                      key={image.imageId || index}
                      className={`${index === 0 ? 'h-80 sm:col-span-2' : 'h-48'} overflow-hidden rounded-2xl bg-gray-100`}
                    >
                      <img
                        src={image.imageUrl}
                        alt={selectedActivity.title}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    </div>
                  ))}

                  {(!selectedActivity.images || selectedActivity.images.length === 0) && (
                    <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-[#F9F8F6] text-sm font-bold text-gray-400 sm:col-span-2">
                      Chưa có ảnh hoạt động.
                    </div>
                  )}
                </div>

                <aside className="space-y-4">
                  <div className="rounded-2xl border border-gray-100 bg-[#F9F8F6] p-5">
                    <h3 className="font-classic font-serif text-2xl font-bold text-[#2C1E15]">Mô tả hoạt động</h3>
                    <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-gray-600">
                      {selectedActivity.description || 'Chưa có mô tả chi tiết.'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">Địa chỉ hoạt động</p>
                    <p className="mt-2 flex gap-2 text-sm font-bold leading-6 text-[#2C1E15]">
                      <HiMapPin className="mt-1 h-4 w-4 shrink-0 text-[#6E473B]" />
                      {selectedActivity.address || selectedActivity.province || 'Chưa cập nhật địa chỉ'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">Hotline liên hệ</p>
                    <p className="mt-2 flex items-center gap-2 text-lg font-black text-[#2C3E2B]">
                      <HiPhone className="h-5 w-5 text-[#6E473B]" />
                      {selectedActivity.hotline || 'Chưa cập nhật'}
                    </p>
                  </div>
                </aside>
              </div>
            </div>

            <div ref={nearbySectionRef} className="scroll-mt-24 rounded-3xl border border-[#6E473B]/10 bg-[#FBFAF7] p-6 shadow-sm md:p-8">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#B8754D]">Lưu trú gần hoạt động</p>
                  <h3 className="font-classic mt-2 text-3xl font-black text-[#2C1E15]">Homestay gần {selectedActivity.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-gray-500">
                    Sắp xếp theo khoảng cách tọa độ, nơi gần nhất được hiển thị trước. {nearbyRadiusKm ? `Đang lọc trong bán kính ${nearbyRadiusKm} km.` : 'Đang xem tất cả bán kính.'}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm md:w-60">
                  <label className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
                    Bán kính tìm kiếm
                  </label>
                  <select
                    value={nearbyRadiusKm}
                    onChange={(event) => setNearbyRadiusKm(event.target.value)}
                    className="h-11 rounded-xl border border-gray-200 bg-[#FBFAF7] px-3 text-sm font-black text-[#2C3E2B] outline-none transition focus:border-[#B8754D] focus:bg-white"
                  >
                    {NEARBY_RADIUS_FILTERS.map((option) => (
                      <option key={option.value || 'all'} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs font-bold text-gray-500">
                    {nearbyHomestays.length} homestay phù hợp
                  </span>
                </div>
              </div>

              <NearbyHomestaysSlider
                homestays={nearbyHomestays}
                loading={isLoadingNearby}
                error={nearbyError}
                onOpenHomestay={handleOpenHomestay}
              />
            </div>
          </section>
        )}
      </div>
    </UserLayout>
  );
}

