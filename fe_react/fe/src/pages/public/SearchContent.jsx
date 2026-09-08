// import { useEffect, useMemo, useState } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import {
//   HiAdjustmentsHorizontal,
//   HiArrowPath,
//   HiBars3,
//   HiChevronDown,
//   HiChevronRight,
//   HiChevronUp,
//   HiMap,
//   HiSquares2X2,
//   HiStar,
// } from 'react-icons/hi2';
// import UserLayout from '../../layouts/UserLayout';
// import HomestaySearchForm from '../../components/homestay/HomestaySearchForm';
// import HorizontalHomestayCard from '../../components/homestay/HorizontalHomestayCard';
// import VerticalHomestayCard from '../../components/homestay/VerticalHomestayCard';
// import HomestayMapModal from '../../components/homestay/HomestayMapModal';
// import PrettySelect from '../../components/common/PrettySelect';
// import { getPublicHomestays } from '../../services/homestayService';
// import { buildSearchParams as buildStoredSearchParams, saveSearchState } from '../../services/searchState';

// const PAGE_SIZE = 20;
// const DEFAULT_MAX_PRICE = 2400000;
// const DEFAULT_AMENITIES = ['Wi-Fi', 'Bếp riêng', 'Hồ bơi', 'Bãi đỗ xe'];
// const DEFAULT_SERVICES = ['Đưa đón sân bay', 'Thuê xe máy', 'Bữa sáng', 'Dọn phòng'];
// const RATING_FILTERS = [5, 4, 3];
// const SORT_OPTIONS = [
//   { value: 'recommended', label: 'Cozygo đề xuất' },
//   { value: 'popular', label: 'Được đặt nhiều' },
//   { value: 'rating', label: 'Đánh giá cao' },
//   { value: 'priceAsc', label: 'Giá thấp trước' },
//   { value: 'priceDesc', label: 'Giá cao trước' },
// ];


// function formatCurrency(value) {
//   return Number(value || 0).toLocaleString('vi-VN') + ' đ';
// }

// function uniqueValues(values) {
//   return [...new Set(values.filter(Boolean))];
// }

// export default function SearchContent({ favorites = [], toggleFavorite = () => {} }) {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [catalogHomestays, setCatalogHomestays] = useState([]);
//   const [homestays, setHomestays] = useState([]);
//   const [viewMode, setViewMode] = useState('horizontal');
//   const [sortBy, setSortBy] = useState('recommended');
//   const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
//   const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
//   const [selectedAmenities, setSelectedAmenities] = useState([]);
//   const [selectedServices, setSelectedServices] = useState([]);
//   const [selectedRatings, setSelectedRatings] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [isMapOpen, setIsMapOpen] = useState(false);
//   const [selectedMapHomestay, setSelectedMapHomestay] = useState(null);

//   const destination = searchParams.get('destination') || searchParams.get('province') || 'Tất cả địa điểm';
//   const checkIn = searchParams.get('checkIn') || '';
//   const checkOut = searchParams.get('checkOut') || '';

//   useEffect(() => {
//     let isMounted = true;

//     async function loadCatalog() {
//       try {
//         const data = await getPublicHomestays({ sort: 'recommended' });
//         if (isMounted) setCatalogHomestays(data);
//       } catch (error) {
//         if (isMounted) setErrorMessage(error.message || 'Không tải được dữ liệu bộ lọc');
//       }
//     }

//     loadCatalog();
//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     let isMounted = true;

//     async function loadHomestays() {
//       try {
//         setIsLoading(true);
//         setErrorMessage('');
//         const data = await getPublicHomestays({
//           destination: destination === 'Tất cả địa điểm' ? '' : destination,
//           maxPrice,
//           amenities: selectedAmenities,
//           services: selectedServices,
//           checkIn,
//           checkOut,
//           sort: sortBy,
//         });
//         if (!isMounted) return;
//         setHomestays(data);
//         setVisibleCount(PAGE_SIZE);
//       } catch (error) {
//         if (!isMounted) return;
//         setHomestays([]);
//         setErrorMessage(error.message || 'Không tải được danh sách homestay');
//       } finally {
//         if (isMounted) setIsLoading(false);
//       }
//     }

//     loadHomestays();
//     return () => {
//       isMounted = false;
//     };
//   }, [destination, checkIn, checkOut, maxPrice, selectedAmenities, selectedServices, sortBy]);

//   const availableAmenities = useMemo(() => {
//     const values = uniqueValues(catalogHomestays.flatMap((item) => item.amenities || []));
//     return values.length > 0 ? values : DEFAULT_AMENITIES;
//   }, [catalogHomestays]);

//   const availableServices = useMemo(() => {
//     const values = uniqueValues(catalogHomestays.flatMap((item) => item.services || []));
//     return values.length > 0 ? values : DEFAULT_SERVICES;
//   }, [catalogHomestays]);

//   const maxCatalogPrice = useMemo(() => {
//     const prices = catalogHomestays.map((item) => item.pricePerNight || 0);
//     return Math.max(DEFAULT_MAX_PRICE, ...prices);
//   }, [catalogHomestays]);

//   const filteredHomestays = useMemo(() => {
//     const byRating = selectedRatings.length === 0
//       ? homestays
//       : homestays.filter((item) => selectedRatings.some((star) => Math.floor(Number(item.rating || 0)) === star));

//     return [...byRating].sort((a, b) => {
//       if (sortBy === 'priceAsc') return a.pricePerNight - b.pricePerNight;
//       if (sortBy === 'priceDesc') return b.pricePerNight - a.pricePerNight;
//       if (sortBy === 'rating') return b.rating - a.rating;
//       if (sortBy === 'popular') return Number(b.orders) - Number(a.orders);
//       return b.rating * 100 + Number(b.orders) - (a.rating * 100 + Number(a.orders));
//     });
//   }, [homestays, selectedRatings, sortBy]);

//   const visibleHomestays = filteredHomestays.slice(0, visibleCount);
//   const hasMore = visibleCount < filteredHomestays.length;

//   const toggleValue = (value, setter) => {
//     setter((current) =>
//       current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
//     );
//     setVisibleCount(PAGE_SIZE);
//   };

//   const resetFilters = () => {
//     setMaxPrice(DEFAULT_MAX_PRICE);
//     setSelectedAmenities([]);
//     setSelectedServices([]);
//     setSelectedRatings([]);
//     setSortBy('recommended');
//     setVisibleCount(PAGE_SIZE);
//   };

//   const openMap = (homestay = null) => {
//     setSelectedMapHomestay(homestay);
//     setIsMapOpen(true);
//   };

//   const closeMap = () => {
//     setIsMapOpen(false);
//     setSelectedMapHomestay(null);
//   };

//   const handleSearch = (search) => {
//     const savedSearch = saveSearchState(search);
//     setSearchParams(buildStoredSearchParams(savedSearch));
//     setVisibleCount(PAGE_SIZE);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   return (
//     <UserLayout>
//       <main className="bg-[#F4F1EA] min-h-screen pb-16 text-left">
//         <div className="relative bg-[#202c3c] pt-4 pb-6 px-4 sm:px-6 lg:px-8 text-center rounded-b-[50px] border-b-[6px] border-[#dc824f] shadow-lg z-30">
//           <div className="max-w-3xl mx-auto space-y-2 mb-10 mt-5">
//             <h2 className="text-white text-xl md:text-2xl font-bold tracking-wide font-serif">
//               Tìm kiếm homestay cho chuyến đi của bạn
//             </h2>

//           </div>

//           <div className="absolute left-4 right-4 bottom-0 transform translate-y-1/2 z-30 max-w-5xl mx-auto">
//             <HomestaySearchForm onSearch={handleSearch} />
//           </div>
//         </div>

//         <div className="pt-14" />

//         <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
//           <div className="rounded-2xl border border-[#6E473B]/10 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm mb-5">
//             <div>
//               <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5 flex-wrap">
//                 <span>Trang chủ</span>
//                 <HiChevronRight size={14} />
//                 <span>Tìm kiếm</span>
//                 <HiChevronRight size={14} />
//                 <span className="text-[#2C3E2B]">{destination}</span>
//               </div>
//               <div role="heading" aria-level="1" className="text-2xl font-black text-[#2C1E15] mt-1 leading-tight tracking-normal">
//                 <span className="font-black">{filteredHomestays.length}</span>{' '}
//                 homestay phù hợp {destination !== 'Tất cả địa điểm' ? 'tại ' + destination : 'trên hệ thống'}
//               </div>
//               <p className="text-xs text-gray-400 mt-1">
//                 Hiển thị {visibleHomestays.length} / {filteredHomestays.length} kết quả.
//               </p>
//             </div>

//             <div className="flex flex-wrap items-center gap-2">
//               <PrettySelect
//                 value={sortBy}
//                 onChange={setSortBy}
//                 options={SORT_OPTIONS}
//                 prefixLabel="Sắp xếp theo:"
//                 align="right"
//                 minWidth="min-w-[260px]"
//                 buttonClassName="h-10 rounded-xl border border-gray-200 bg-white px-4 shadow-sm hover:bg-[#FFFDF9]"
//                 menuClassName="min-w-[220px]"
//               />

//               <div className="h-10 rounded-xl border border-gray-200 bg-[#F9F8F6] p-1 flex items-center gap-1">
//                 <button
//                   type="button"
//                   onClick={() => setViewMode('horizontal')}
//                   className={'h-8 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition border-none cursor-pointer ' + (viewMode === 'horizontal' ? 'bg-[#2C3E2B] text-white' : 'text-gray-500 hover:text-[#2C3E2B] bg-transparent')}
//                 >
//                   <HiBars3 size={15} /> Ngang
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setViewMode('vertical')}
//                   className={'h-8 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition border-none cursor-pointer ' + (viewMode === 'vertical' ? 'bg-[#2C3E2B] text-white' : 'text-gray-500 hover:text-[#2C3E2B] bg-transparent')}
//                 >
//                   <HiSquares2X2 size={15} /> Dọc
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6 items-start">
//             <aside className="space-y-4 xl:sticky xl:top-24">
//               <div className="relative h-44 rounded-2xl overflow-hidden border border-[#6E473B]/10 shadow-md bg-[#20342a]">
//                 <img
//                   src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=700&auto=format&fit=crop"
//                   alt="Bản đồ khu vực"
//                   className="w-full h-full object-cover grayscale opacity-80"
//                 />
//                 <div className="absolute inset-0 bg-[#2C3E2B]/25 flex items-center justify-center p-4">
//                   <button
//                     type="button"
//                     onClick={() => openMap()}
//                     className="bg-[#2C3E2B] text-white rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider shadow-xl inline-flex items-center gap-2 border-none cursor-pointer"
//                   >
//                     <HiMap size={14} /> Xem trên bản đồ
//                   </button>
//                 </div>
//               </div>

//               <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm space-y-5">
//                 <div className="flex items-center justify-between border-b border-gray-100 pb-2">
//                   <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
//                     <HiAdjustmentsHorizontal size={14} /> Bộ lọc tìm kiếm
//                   </span>
//                   <button onClick={resetFilters} className="text-[11px] font-bold text-[#6E473B] hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1">
//                     <HiArrowPath size={12} /> Xóa lọc
//                   </button>
//                 </div>

//                 <div className="space-y-2">
//                   <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide">Khoảng giá mỗi đêm</span>
//                   <input
//                     type="range"
//                     min="400000"
//                     max={maxCatalogPrice}
//                     step="50000"
//                     value={maxPrice}
//                     onChange={(event) => setMaxPrice(Number(event.target.value))}
//                     className="w-full accent-[#6E473B] h-1.5 bg-gray-100 rounded-lg cursor-pointer"
//                   />
//                   <div className="flex justify-between items-center text-xs font-bold text-gray-700 mt-1">
//                     <span className="text-gray-400 font-normal">Từ: 400.000 đ</span>
//                     <span className="text-[#6E473B] bg-[#6E473B]/5 px-2 py-0.5 rounded-md">Đến: {formatCurrency(maxPrice)}</span>
//                   </div>
//                 </div>

//                 <div className="border-t border-gray-100 pt-4">
//                   <FilterSection title="Đánh giá sao chỗ nghỉ">
//                     <div className="space-y-2.5 text-left mt-2">
//                       {RATING_FILTERS.map((stars) => (
//                         <label key={stars} className="flex items-center justify-between text-xs font-semibold text-gray-600 cursor-pointer select-none hover:text-[#2C3E2B]">
//                           <span className="flex items-center gap-2">
//                             <input
//                               type="checkbox"
//                               checked={selectedRatings.includes(stars)}
//                               onChange={() => toggleValue(stars, setSelectedRatings)}
//                               className="accent-[#2C3E2B] w-4 h-4 rounded"
//                             />
//                             <span className="flex items-center gap-0.5 text-amber-500 font-bold">
//                               {Array.from({ length: stars }).map((_, index) => (
//                                 <HiStar key={index} size={13} fill="currentColor" />
//                               ))}
//                               <span className="text-gray-600 text-xs ml-1">{stars} sao</span>
//                             </span>
//                           </span>
//                         </label>
//                       ))}
//                     </div>
//                   </FilterSection>
//                 </div>

//                 <div className="border-t border-gray-100 pt-4">
//                   <FilterSection title="Tiện nghi homestay">
//                     <CheckList items={availableAmenities} selected={selectedAmenities} onToggle={(value) => toggleValue(value, setSelectedAmenities)} />
//                   </FilterSection>
//                 </div>

//                 <div className="border-t border-gray-100 pt-4">
//                   <FilterSection title="Dịch vụ đi kèm">
//                     <CheckList items={availableServices} selected={selectedServices} onToggle={(value) => toggleValue(value, setSelectedServices)} />
//                   </FilterSection>
//                 </div>
//               </div>
//             </aside>

//             <section className="flex-1 space-y-4 min-w-0">
//               {errorMessage && (
//                 <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm font-semibold">
//                   {errorMessage}
//                 </div>
//               )}

//               {isLoading ? (
//                 <div className="space-y-4">
//                   {[1, 2, 3].map((item) => (
//                     <div key={item} className="h-48 rounded-2xl bg-white/70 border border-gray-100 animate-pulse" />
//                   ))}
//                 </div>
//               ) : visibleHomestays.length === 0 ? (
//                 <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 font-bold">
//                   Không tìm thấy homestay phù hợp với dữ liệu hoặc bộ lọc hiện tại.
//                 </div>
//               ) : viewMode === 'horizontal' ? (
//                 <div className="space-y-4">
//                   {visibleHomestays.map((item) => (
//                     <HorizontalHomestayCard
//                       key={item.id}
//                       item={item}
//                       isFav={favorites.includes(item.id)}
//                       onFavToggle={toggleFavorite}
//                       onViewMap={openMap}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
//                   {visibleHomestays.map((item) => (
//                     <VerticalHomestayCard
//                       key={item.id}
//                       item={item}
//                       isFav={favorites.includes(item.id)}
//                       onFavToggle={toggleFavorite}
//                     />
//                   ))}
//                 </div>
//               )}

//               {hasMore && (
//                 <div className="pt-3 flex justify-center">
//                   <button
//                     type="button"
//                     onClick={() => setVisibleCount((current) => Math.min(current + PAGE_SIZE, filteredHomestays.length))}
//                     className="h-11 px-8 rounded-xl bg-[#2C3E2B] text-white text-xs font-black uppercase tracking-wider shadow-md hover:bg-[#1f2d20] transition border-none cursor-pointer"
//                   >
//                     Tải thêm 20 homestay
//                   </button>
//                 </div>
//               )}
//             </section>
//           </div>
//         </section>
//       </main>
//       {isMapOpen && (
//         <HomestayMapModal
//           homestays={filteredHomestays}
//           selectedHomestay={selectedMapHomestay}
//           onSelectHomestay={setSelectedMapHomestay}
//           onClose={closeMap}
//         />
//       )}
//     </UserLayout>
//   );
// }

// function FilterSection({ title, children }) {
//   return (
//     <div className="space-y-2 text-left">
//       <h3 className="text-xs font-black uppercase tracking-wider text-[#2C1E15]">{title}</h3>
//       {children}
//     </div>
//   );
// }

// function CheckList({ items, selected, onToggle }) {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const displayedItems = useMemo(() => (isExpanded ? items : items.slice(0, 4)), [items, isExpanded]);

//   return (
//     <div className="space-y-2 text-left mt-2">
//       <div className="space-y-2">
//         {displayedItems.map((item) => (
//           <label key={item} className="flex items-center justify-between gap-3 text-xs font-semibold text-gray-600 cursor-pointer hover:text-[#2C3E2B] select-none">
//             <span className="inline-flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={selected.includes(item)}
//                 onChange={() => onToggle(item)}
//                 className="accent-[#2C3E2B] w-4 h-4 rounded"
//               />
//               {item}
//             </span>
//             <span className="text-[10px] text-gray-400 font-mono">{8 + item.length}</span>
//           </label>
//         ))}
//       </div>

//       {items.length > 4 && (
//         <button
//           type="button"
//           onClick={() => setIsExpanded(!isExpanded)}
//           className="text-[11px] font-bold text-[#6E473B] hover:text-[#2C3E2B] flex items-center gap-1 mt-1 bg-transparent border-none cursor-pointer p-0"
//         >
//           {isExpanded ? (
//             <>Thu gọn <HiChevronUp size={12} /></>
//           ) : (
//             <>Xem thêm ({items.length - 4}) <HiChevronDown size={12} /></>
//           )}
//         </button>
//       )}
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  HiAdjustmentsHorizontal,
  HiArrowPath,
  HiBars3,
  HiChevronDown,
  HiChevronRight,
  HiChevronUp,
  HiMap,
  HiSquares2X2,
  HiStar,
} from 'react-icons/hi2';
import UserLayout from '../../layouts/UserLayout';
import HomestaySearchForm from '../../components/homestay/HomestaySearchForm';
import HorizontalHomestayCard from '../../components/homestay/HorizontalHomestayCard';
import VerticalHomestayCard from '../../components/homestay/VerticalHomestayCard';
import HomestayMapModal from '../../components/homestay/HomestayMapModal';
import PrettySelect from '../../components/common/PrettySelect';
import { getPublicHomestays } from '../../services/homestayService';
import { buildSearchParams as buildStoredSearchParams, saveSearchState } from '../../services/searchState';

const PAGE_SIZE = 20;
const DEFAULT_MAX_PRICE = 2400000;
const RATING_FILTERS = [5, 4, 3];
const SORT_OPTIONS = [
  { value: 'recommended', label: 'Cozygo đề xuất' },
  { value: 'popular', label: 'Được đặt nhiều' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'priceAsc', label: 'Giá thấp trước' },
  { value: 'priceDesc', label: 'Giá cao trước' },
];


function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN') + ' đ';
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function getAmenityNames(homestay = {}) {
  return (homestay.amenities || [])
    .map((amenity) => {
      if (typeof amenity === 'string') return amenity;
      return amenity?.name || amenity?.amenityName || amenity?.label || '';
    })
    .filter(Boolean);
}

function getServiceNames(homestay = {}) {
  return (homestay.services || homestay.serviceItems || [])
    .map((service) => {
      if (typeof service === 'string') return service;
      return service?.name || service?.serviceName || service?.label || '';
    })
    .filter(Boolean);
}

function buildFacetCounts(homestays, getValues) {
  const counts = {};

  homestays.forEach((homestay) => {
    // Mỗi homestay chỉ được tính 1 lần cho cùng một tiện nghi/dịch vụ.
    uniqueValues(getValues(homestay)).forEach((value) => {
      counts[value] = (counts[value] || 0) + 1;
    });
  });

  return counts;
}

export default function SearchContent({ favorites = [], toggleFavorite = () => {} }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [catalogHomestays, setCatalogHomestays] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [viewMode, setViewMode] = useState('horizontal');
  const [sortBy, setSortBy] = useState('recommended');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedMapHomestay, setSelectedMapHomestay] = useState(null);

  const destination = searchParams.get('destination') || searchParams.get('province') || 'Tất cả địa điểm';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const data = await getPublicHomestays({ sort: 'recommended' });
        if (isMounted) setCatalogHomestays(data);
      } catch (error) {
        if (isMounted) setErrorMessage(error.message || 'Không tải được dữ liệu bộ lọc');
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadHomestays() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const data = await getPublicHomestays({
          destination: destination === 'Tất cả địa điểm' ? '' : destination,
          maxPrice,
          amenities: selectedAmenities,
          services: selectedServices,
          checkIn,
          checkOut,
          sort: sortBy,
        });
        if (!isMounted) return;
        setHomestays(data);
        setVisibleCount(PAGE_SIZE);
      } catch (error) {
        if (!isMounted) return;
        setHomestays([]);
        setErrorMessage(error.message || 'Không tải được danh sách homestay');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHomestays();
    return () => {
      isMounted = false;
    };
  }, [destination, checkIn, checkOut, maxPrice, selectedAmenities, selectedServices, sortBy]);

  const availableAmenities = useMemo(
    () => uniqueValues(catalogHomestays.flatMap((item) => getAmenityNames(item))),
    [catalogHomestays]
  );

  const availableServices = useMemo(
    () => uniqueValues(catalogHomestays.flatMap((item) => getServiceNames(item))),
    [catalogHomestays]
  );

  const amenityCounts = useMemo(
    () => buildFacetCounts(catalogHomestays, getAmenityNames),
    [catalogHomestays]
  );

  const serviceCounts = useMemo(
    () => buildFacetCounts(catalogHomestays, getServiceNames),
    [catalogHomestays]
  );

  const maxCatalogPrice = useMemo(() => {
    const prices = catalogHomestays.map((item) => item.pricePerNight || 0);
    return Math.max(DEFAULT_MAX_PRICE, ...prices);
  }, [catalogHomestays]);

  const filteredHomestays = useMemo(() => {
    const byRating = selectedRatings.length === 0
      ? homestays
      : homestays.filter((item) => selectedRatings.some((star) => Math.floor(Number(item.rating || 0)) === star));

    return [...byRating].sort((a, b) => {
      if (sortBy === 'priceAsc') return a.pricePerNight - b.pricePerNight;
      if (sortBy === 'priceDesc') return b.pricePerNight - a.pricePerNight;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'popular') return Number(b.orders) - Number(a.orders);
      return b.rating * 100 + Number(b.orders) - (a.rating * 100 + Number(a.orders));
    });
  }, [homestays, selectedRatings, sortBy]);

  const visibleHomestays = filteredHomestays.slice(0, visibleCount);
  const hasMore = visibleCount < filteredHomestays.length;

  const toggleValue = (value, setter) => {
    setter((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
    setVisibleCount(PAGE_SIZE);
  };

  const resetFilters = () => {
    setMaxPrice(DEFAULT_MAX_PRICE);
    setSelectedAmenities([]);
    setSelectedServices([]);
    setSelectedRatings([]);
    setSortBy('recommended');
    setVisibleCount(PAGE_SIZE);
  };

  const openMap = (homestay = null) => {
    setSelectedMapHomestay(homestay);
    setIsMapOpen(true);
  };

  const closeMap = () => {
    setIsMapOpen(false);
    setSelectedMapHomestay(null);
  };

  const handleSearch = (search) => {
    const savedSearch = saveSearchState(search);
    setSearchParams(buildStoredSearchParams(savedSearch));
    setVisibleCount(PAGE_SIZE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <UserLayout>
      <main className="bg-[#F4F1EA] min-h-screen pb-16 text-left">
        <div className="relative bg-[#202c3c] pt-4 pb-6 px-4 sm:px-6 lg:px-8 text-center rounded-b-[50px] border-b-[6px] border-[#dc824f] shadow-lg z-30">
          <div className="max-w-3xl mx-auto space-y-2 mb-10 mt-5">
            <h2 className="text-white text-xl md:text-2xl font-bold tracking-wide font-serif">
              Tìm kiếm homestay cho chuyến đi của bạn
            </h2>

          </div>

          <div className="absolute left-4 right-4 bottom-0 transform translate-y-1/2 z-30 max-w-5xl mx-auto">
            <HomestaySearchForm onSearch={handleSearch} />
          </div>
        </div>

        <div className="pt-14" />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="rounded-2xl border border-[#6E473B]/10 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm mb-5">
            <div>
              <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5 flex-wrap">
                <span>Trang chủ</span>
                <HiChevronRight size={14} />
                <span>Tìm kiếm</span>
                <HiChevronRight size={14} />
                <span className="text-[#2C3E2B]">{destination}</span>
              </div>
              <div role="heading" aria-level="1" className="text-2xl font-black text-[#2C1E15] mt-1 leading-tight tracking-normal">
                <span className="font-black">{filteredHomestays.length}</span>{' '}
                homestay phù hợp {destination !== 'Tất cả địa điểm' ? 'tại ' + destination : 'trên hệ thống'}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Hiển thị {visibleHomestays.length} / {filteredHomestays.length} kết quả.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PrettySelect
                value={sortBy}
                onChange={setSortBy}
                options={SORT_OPTIONS}
                prefixLabel="Sắp xếp theo:"
                align="right"
                minWidth="min-w-[260px]"
                buttonClassName="h-10 rounded-xl border border-gray-200 bg-white px-4 shadow-sm hover:bg-[#FFFDF9]"
                menuClassName="min-w-[220px]"
              />

              <div className="h-10 rounded-xl border border-gray-200 bg-[#F9F8F6] p-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewMode('horizontal')}
                  className={'h-8 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition border-none cursor-pointer ' + (viewMode === 'horizontal' ? 'bg-[#2C3E2B] text-white' : 'text-gray-500 hover:text-[#2C3E2B] bg-transparent')}
                >
                  <HiBars3 size={15} /> Ngang
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('vertical')}
                  className={'h-8 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition border-none cursor-pointer ' + (viewMode === 'vertical' ? 'bg-[#2C3E2B] text-white' : 'text-gray-500 hover:text-[#2C3E2B] bg-transparent')}
                >
                  <HiSquares2X2 size={15} /> Dọc
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6 items-start">
            <aside className="space-y-4 xl:sticky xl:top-24">
              <div className="relative h-44 rounded-2xl overflow-hidden border border-[#6E473B]/10 shadow-md bg-[#20342a]">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=700&auto=format&fit=crop"
                  alt="Bản đồ khu vực"
                  className="w-full h-full object-cover grayscale opacity-80"
                />
                <div className="absolute inset-0 bg-[#2C3E2B]/25 flex items-center justify-center p-4">
                  <button
                    type="button"
                    onClick={() => openMap()}
                    className="bg-[#2C3E2B] text-white rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider shadow-xl inline-flex items-center gap-2 border-none cursor-pointer"
                  >
                    <HiMap size={14} /> Xem trên bản đồ
                  </button>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <HiAdjustmentsHorizontal size={14} /> Bộ lọc tìm kiếm
                  </span>
                  <button onClick={resetFilters} className="text-[11px] font-bold text-[#6E473B] hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1">
                    <HiArrowPath size={12} /> Xóa lọc
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide">Khoảng giá mỗi đêm</span>
                  <input
                    type="range"
                    min="400000"
                    max={maxCatalogPrice}
                    step="50000"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(Number(event.target.value))}
                    className="w-full accent-[#6E473B] h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700 mt-1">
                    <span className="text-gray-400 font-normal">Từ: 400.000 đ</span>
                    <span className="text-[#6E473B] bg-[#6E473B]/5 px-2 py-0.5 rounded-md">Đến: {formatCurrency(maxPrice)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <FilterSection title="Đánh giá sao chỗ nghỉ">
                    <div className="space-y-2.5 text-left mt-2">
                      {RATING_FILTERS.map((stars) => (
                        <label key={stars} className="flex items-center justify-between text-xs font-semibold text-gray-600 cursor-pointer select-none hover:text-[#2C3E2B]">
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedRatings.includes(stars)}
                              onChange={() => toggleValue(stars, setSelectedRatings)}
                              className="accent-[#2C3E2B] w-4 h-4 rounded"
                            />
                            <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                              {Array.from({ length: stars }).map((_, index) => (
                                <HiStar key={index} size={13} fill="currentColor" />
                              ))}
                              <span className="text-gray-600 text-xs ml-1">{stars} sao</span>
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <FilterSection title="Tiện nghi homestay">
                    <CheckList
                        items={availableAmenities}
                        counts={amenityCounts}
                        selected={selectedAmenities}
                        onToggle={(value) => toggleValue(value, setSelectedAmenities)}
                      />
                  </FilterSection>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <FilterSection title="Dịch vụ đi kèm">
                    <CheckList
                        items={availableServices}
                        counts={serviceCounts}
                        selected={selectedServices}
                        onToggle={(value) => toggleValue(value, setSelectedServices)}
                      />
                  </FilterSection>
                </div>
              </div>
            </aside>

            <section className="flex-1 space-y-4 min-w-0">
              {errorMessage && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-sm font-semibold">
                  {errorMessage}
                </div>
              )}

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-48 rounded-2xl bg-white/70 border border-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : visibleHomestays.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 font-bold">
                  Không tìm thấy homestay phù hợp với dữ liệu hoặc bộ lọc hiện tại.
                </div>
              ) : viewMode === 'horizontal' ? (
                <div className="space-y-4">
                  {visibleHomestays.map((item) => (
                    <HorizontalHomestayCard
                      key={item.id}
                      item={item}
                      isFav={favorites.includes(item.id)}
                      onFavToggle={toggleFavorite}
                      onViewMap={openMap}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {visibleHomestays.map((item) => (
                    <VerticalHomestayCard
                      key={item.id}
                      item={item}
                      isFav={favorites.includes(item.id)}
                      onFavToggle={toggleFavorite}
                    />
                  ))}
                </div>
              )}

              {hasMore && (
                <div className="pt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((current) => Math.min(current + PAGE_SIZE, filteredHomestays.length))}
                    className="h-11 px-8 rounded-xl bg-[#2C3E2B] text-white text-xs font-black uppercase tracking-wider shadow-md hover:bg-[#1f2d20] transition border-none cursor-pointer"
                  >
                    Tải thêm 20 homestay
                  </button>
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
      {isMapOpen && (
        <HomestayMapModal
          homestays={filteredHomestays}
          selectedHomestay={selectedMapHomestay}
          onSelectHomestay={setSelectedMapHomestay}
          onClose={closeMap}
        />
      )}
    </UserLayout>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="space-y-2 text-left">
      <h3 className="text-xs font-black uppercase tracking-wider text-[#2C1E15]">{title}</h3>
      {children}
    </div>
  );
}

function CheckList({ items, counts = {}, selected, onToggle }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedItems = useMemo(() => (isExpanded ? items : items.slice(0, 4)), [items, isExpanded]);

  return (
    <div className="space-y-2 text-left mt-2">
      <div className="space-y-2">
        {displayedItems.map((item) => (
          <label key={item} className="flex items-center justify-between gap-3 text-xs font-semibold text-gray-600 cursor-pointer hover:text-[#2C3E2B] select-none">
            <span className="inline-flex items-center gap-2 min-w-0">
              <input
                type="checkbox"
                checked={selected.includes(item)}
                onChange={() => onToggle(item)}
                className="accent-[#2C3E2B] w-4 h-4 rounded shrink-0"
              />
              <span className="truncate">{item}</span>
            </span>
            <span
              className="min-w-6 text-right text-[10px] text-gray-400 font-mono"
              title={`${counts[item] || 0} homestay đang áp dụng`}
            >
              {counts[item] || 0}
            </span>
          </label>
        ))}

        {displayedItems.length === 0 && (
          <p className="py-2 text-[11px] font-semibold text-gray-400">
            Chưa có dữ liệu từ hệ thống.
          </p>
        )}
      </div>

      {items.length > 4 && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] font-bold text-[#6E473B] hover:text-[#2C3E2B] flex items-center gap-1 mt-1 bg-transparent border-none cursor-pointer p-0"
        >
          {isExpanded ? (
            <>Thu gọn <HiChevronUp size={12} /></>
          ) : (
            <>Xem thêm ({items.length - 4}) <HiChevronDown size={12} /></>
          )}
        </button>
      )}
    </div>
  );
}



