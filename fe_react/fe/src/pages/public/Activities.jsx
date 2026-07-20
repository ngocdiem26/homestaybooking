import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiBolt, HiMapPin, HiPhone, HiPhoto } from 'react-icons/hi2';
import UserLayout from '../../layouts/UserLayout';
import { getPublicActivities } from '../../services/activityService';
import { buildSearchParams, saveSearchState } from '../../services/searchState';

function getActivityImage(activity) {
  return activity.thumbnailUrl || activity.images?.[0]?.imageUrl || '';
}

export default function Activities() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activitiesList, setActivitiesList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleSearchNearby = (activity) => {
    const destination = activity?.province || '';
    const savedSearch = saveSearchState({ destination });
    const params = buildSearchParams(savedSearch);
    navigate('/search' + (params.toString() ? '?' + params.toString() : ''));
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
          <section id="activity-detail" className="mx-auto max-w-6xl scroll-mt-24 px-6 text-left">
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
                  onClick={() => handleSearchNearby(selectedActivity)}
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
          </section>
        )}
      </div>
    </UserLayout>
  );
}

