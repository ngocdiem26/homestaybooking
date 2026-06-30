import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCalendarDays,
  HiCheckCircle,
  HiHomeModern,
  HiChevronLeft,
  HiChevronRight,
  HiMapPin,
  HiPhoto,
  HiShieldCheck,
  HiXMark,
  HiStar,
  HiUsers,
} from 'react-icons/hi2';
import UserLayout from '../../layouts/UserLayout';
import HomestaySearchForm from '../../components/homestay/HomestaySearchForm';
import { getPublicHomestay } from '../../services/homestayService';

const fallbackImage = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400&auto=format&fit=crop';

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function formatTime(value, fallback) {
  if (!value) return fallback;
  return String(value).slice(0, 5);
}

function buildSearchParams(search = {}) {
  const params = new URLSearchParams();
  Object.entries(search).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params;
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

export default function HomestayDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [homestay, setHomestay] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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
  const serviceItems = homestay?.serviceItems?.length
    ? homestay.serviceItems
    : (homestay?.services || []).map((name) => ({ name, serviceName: name }));

  const handleSearch = (search = {}) => {
    const params = buildSearchParams(search);
    navigate('/search' + (params.toString() ? '?' + params.toString() : ''));
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
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#E3B17A]">Cozygo Homestay</p>
            <h1 className="mt-2 font-classic text-2xl font-black text-white md:text-4xl">Chi tiết chỗ nghỉ</h1>
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
              <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#B6784F]">{homestay.code || 'HMS-' + homestay.id}</p>
                  <h2 className="mt-2 font-classic text-3xl font-black leading-tight text-[#2C1E15] md:text-5xl">{homestay.name}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-bold text-gray-500">
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
                <div className="rounded-2xl border border-[#6E473B]/10 bg-white px-5 py-4 text-right shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Giá mỗi đêm</p>
                  <p className="mt-1 text-2xl font-black text-[#6E473B]">{formatCurrency(homestay.pricePerNight)}</p>
                </div>
              </header>

              <section className="grid gap-2 overflow-hidden rounded-[30px] bg-white p-2 shadow-sm md:grid-cols-[1.08fr_1fr]">
                <button
                  type="button"
                  onClick={() => openGallery(0)}
                  className="group relative h-[320px] overflow-hidden rounded-[24px] bg-gray-100 p-0 text-left md:h-[500px]"
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

                  <article className="rounded-[28px] border border-[#6E473B]/10 bg-white p-6 shadow-sm md:p-8">
                    <h3 className="font-classic text-2xl font-black">Về homestay này</h3>
                    <p className="mt-4 whitespace-pre-line text-sm font-medium leading-7 text-gray-600">
                      {homestay.description || 'Chưa có mô tả chi tiết cho homestay này.'}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3 text-xs font-black text-[#2C3E2B]">
                      <span className="rounded-full bg-[#2C3E2B]/10 px-3 py-1.5">Check-in {formatTime(homestay.checkinTime, '14:00')}</span>
                      <span className="rounded-full bg-[#2C3E2B]/10 px-3 py-1.5">Check-out {formatTime(homestay.checkoutTime, '12:00')}</span>
                      <span className="rounded-full bg-[#2C3E2B]/10 px-3 py-1.5">Chủ nhà: {homestay.ownerName || 'Cozygo Host'}</span>
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
                              <p className="mt-1 text-sm font-black text-[#6E473B]">{formatCurrency(service.price)} / ngày</p>
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
                          <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="mt-1 w-full bg-transparent text-xs font-bold outline-none" />
                        </label>
                        <label className="p-3">
                          <span className="text-[10px] font-black uppercase text-gray-500">Trả phòng</span>
                          <input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="mt-1 w-full bg-transparent text-xs font-bold outline-none" />
                        </label>
                      </div>
                      <label className="block p-3">
                        <span className="text-[10px] font-black uppercase text-gray-500">Số khách</span>
                        <select value={guests} onChange={(event) => setGuests(Number(event.target.value))} className="mt-1 w-full bg-transparent text-sm font-bold outline-none">
                          {Array.from({ length: maxGuests }).map((_, index) => (
                            <option key={index + 1} value={index + 1}>{index + 1} khách</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <button type="button" className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#2C3E2B] text-sm font-black text-white shadow-lg transition hover:bg-[#223322]">
                      <HiCalendarDays className="h-5 w-5" />
                      Đặt phòng ngay
                    </button>

                    <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 text-sm font-semibold text-gray-500">
                      <div className="flex justify-between">
                        <span>{formatCurrency(homestay.pricePerNight)} x 1 đêm</span>
                        <span className="font-black text-[#2C1E15]">{formatCurrency(homestay.pricePerNight)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phí dịch vụ cơ bản</span>
                        <span className="font-black text-[#2C1E15]">0đ</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-black text-[#2C1E15]">
                        <span>Tổng tạm tính</span>
                        <span>{formatCurrency(homestay.pricePerNight)}</span>
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
