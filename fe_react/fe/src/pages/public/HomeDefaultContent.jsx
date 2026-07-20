import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicActivities } from '../../services/activityService';
import { getPublicDestinations, getPublicHomestays } from '../../services/homestayService';

const fallbackDestinationImage = 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=900&auto=format&fit=crop';
const DESTINATION_PAGE_SIZE = 6;
const HOMESTAY_PAGE_SIZE = 4;
const ACTIVITY_PAGE_SIZE = 3;

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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
  const [activeCity, setActiveCity] = useState('');
  const [destinationPage, setDestinationPage] = useState(0);
  const [homestayPage, setHomestayPage] = useState(0);
  const [activityPage, setActivityPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const [destinationData, homestayData, activityData] = await Promise.all([
          getPublicDestinations(),
          getPublicHomestays({ sort: 'recommended' }),
          getPublicActivities(),
        ]);

        if (!isMounted) return;
        setDestinations(destinationData);
        setHomestays(homestayData);
        setActivities(activityData);
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

  const openActivityDetail = (activity) => {
    navigate('/activities', { state: { activityId: activity.id } });
  };

  const searchActivityHomestays = (event, activity) => {
    event.stopPropagation();
    goToSearch(activity?.province || '');
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-classic text-xl md:text-2xl font-bold text-[#2C1E15]">Chương trình khuyến mãi chỗ ở</h2>
            <p className="text-sm text-gray-400 mt-0.5">Nhận các ưu đãi đặc quyền, giảm giá sâu cho hành trình của bạn</p>
          </div>
          <button onClick={() => goToSearch()} className="h-7 rounded-full border border-[#F2A65A]/40 bg-[#FFF4E8] px-4 text-xs font-black uppercase tracking-wider text-[#B65C20] shadow-sm transition hover:bg-[#e2be99] hover:text-white">
            Xem tất cả <span className="text-[10px]">❯</span>
          </button>
        </div>

        <div className="relative flex items-center group">
          <div className="w-full overflow-x-auto flex space-x-5 scrollbar-none pb-4 snap-x">
            {[
              ['from-purple-700 to-indigo-800', 'Độc quyền Cozygo', 'Nhận mọi ưu đãi của quý khách tại đây!', 'Áp dụng tự động khi thanh toán trực tuyến'],
              ['from-teal-700 to-[#2C3E2B]', 'WORLDWIDE', 'Top Match-Day Mộc Lâm Homestay', 'Miễn phí dịch vụ nướng củi sân vườn đêm'],
              ['from-green-600 to-[#7d9f81]', 'Nghỉ hè rực rỡ', 'Bơi, lướt, lặn, tiết kiệm - Giảm thêm 15%', 'Áp dụng cho các căn có hồ bơi hoặc sân vườn'],
            ].map(([color, badge, title, desc]) => (
              <div key={title} className={
                'flex-shrink-0 w-[320px] sm:w-[380px] h-40 bg-gradient-to-r rounded-2xl p-5 relative overflow-hidden text-white flex flex-col justify-center snap-start border border-black/5 shadow-sm ' + color
              }>
                <span className="bg-white/20 text-[9px] font-bold px-2 py-0.5 rounded-full w-fit mb-2">{badge}</span>
                <h4 className="text-lg font-black leading-tight whitespace-pre-line">{title}</h4>
                <p className="text-[10px] text-white/75 mt-1 font-medium">✦ {desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 text-left">
        <div className="mb-8">
          <h2 className="font-classic text-2xl md:text-3xl font-bold text-[#2C1E15] mb-1">Nhật ký những bước chân ấm</h2>
          <p className="text-sm text-gray-400">Những chia sẻ mộc mạc từ người lữ hành đã chọn dừng chân tại Cozygo</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Minh Tú', role: 'Cặp đôi trải nghiệm', avatar: 'M', comment: 'Căn homestay ven hồ thực sự làm tụi mình bất ngờ. Đêm lạnh, nhóm lò sưởi và nhâm nhi tách trà là đủ nhớ mãi.', target: 'Cozygo Lake House', stars: '★★★★★' },
            { name: 'Khánh Linh', role: 'Solo Traveler', avatar: 'K', comment: 'Đi trốn deadline một mình mà tìm được chỗ rất ưng. Phòng sạch, chủ nhà nhiệt tình và chỉ nhiều quán địa phương ngon.', target: 'Nhà Mộc Riêng Biệt', stars: '★★★★★' },
            { name: 'Gia đình anh Đức', role: 'Chuyến đi 5 thành viên', avatar: 'Đ', comment: 'Sân vườn rộng, các bé chạy nhảy thoải mái. Tối cả nhà cùng mở tiệc BBQ rất đáng nhớ.', target: 'Mộc Lâm Đỉnh Villa', stars: '★★★★☆' },
          ].map((rev) => (
            <div key={rev.name} className="bg-white p-6 rounded-2xl border border-[#6E473B]/5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-amber-400 text-xs tracking-tighter">{rev.stars}</div>
                <p className="text-xs text-gray-600 italic leading-relaxed">"{rev.comment}"</p>
              </div>
              <div className="flex items-center space-x-3 pt-2 border-t border-gray-50">
                <div className="w-8 h-8 rounded-full bg-[#2C3E2B] text-[#F4F1EA] text-xs font-bold flex items-center justify-center">{rev.avatar}</div>
                <div>
                  <h4 className="text-sm font-bold text-[#2C1E15]">{rev.name}</h4>
                  <p className="text-[12px] text-gray-400 font-medium">{rev.role} • <span className="text-[#6E473B] font-semibold">{rev.target}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

