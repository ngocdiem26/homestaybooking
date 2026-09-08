import { useMemo } from 'react';
import { HiHomeModern, HiMapPin, HiStar, HiXMark } from 'react-icons/hi2';

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getCoordinate(item) {
  const latitude = toNumber(item?.latitude ?? item?.lat ?? item?.homeLatitude);
  const longitude = toNumber(item?.longitude ?? item?.lng ?? item?.homeLongitude);
  if (latitude == null || longitude == null) return null;
  return { latitude, longitude };
}

function buildLocatedHomestays(homestays = []) {
  return homestays
    .map((item) => {
      const coordinate = getCoordinate(item);
      return coordinate ? { ...item, ...coordinate } : null;
    })
    .filter(Boolean);
}

function formatCoordinate(value) {
  return Number(value).toFixed(5);
}

function getHomestayId(item) {
  return item?.homeId || item?.id;
}

function buildGoogleMapsEmbedUrl(item) {
  if (!item) return '';
  const query = encodeURIComponent(formatCoordinate(item.latitude) + ',' + formatCoordinate(item.longitude));
  return 'https://www.google.com/maps?q=' + query + '&z=15&output=embed';
}

function buildGoogleMapsOpenUrl(item) {
  if (!item) return '#';
  const query = encodeURIComponent(formatCoordinate(item.latitude) + ',' + formatCoordinate(item.longitude));
  return 'https://www.google.com/maps/search/?api=1&query=' + query;
}

function getImageUrl(item) {
  return item?.images?.[0]?.url || item?.img || '';
}

export default function HomestayMapModal({ homestays = [], selectedHomestay = null, onSelectHomestay, onClose }) {
  const locatedHomestays = useMemo(() => buildLocatedHomestays(homestays), [homestays]);
  const selectedId = getHomestayId(selectedHomestay);
  const activeHomestay = locatedHomestays.find((item) => getHomestayId(item) === selectedId) || locatedHomestays[0] || null;
  const mapEmbedUrl = buildGoogleMapsEmbedUrl(activeHomestay);
  const mapOpenUrl = buildGoogleMapsOpenUrl(activeHomestay);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#111827]/70 p-2 backdrop-blur-sm md:p-4">
      <div className="flex h-[94vh] w-full max-w-[min(1760px,98vw)] flex-col overflow-hidden rounded-[26px] bg-white shadow-2xl ring-1 ring-white/40">
        <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-gray-100 bg-[#F8F6F0] px-5 py-3 md:px-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#B66A3C]">Cozygo map</p>
            <h2 className="mt-1 font-classic text-2xl font-black text-[#2C1E15]">Bản đồ vị trí homestay</h2>
            <p className="mt-1 text-sm font-semibold text-gray-500">Bản đồ Google Maps được nhúng theo tọa độ latitude/longitude đã lưu trong hệ thống.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm transition hover:bg-[#2C3E2B] hover:text-white"
            aria-label="Đóng bản đồ"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden bg-white lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="flex min-h-0 p-3 md:p-4">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[22px] border border-[#D8B48A]/45 bg-[#EDE7DC] shadow-inner">
              {activeHomestay ? (
                <>
                  <iframe
                    key={getHomestayId(activeHomestay)}
                    title={'Google Maps - ' + (activeHomestay.name || 'Homestay')}
                    src={mapEmbedUrl}
                    className="h-full w-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />

                  <div className="pointer-events-none absolute bottom-5 left-20 right-5 z-20 flex flex-wrap items-end justify-between gap-3">
                    <div className="max-w-[360px] rounded-2xl bg-white/95 px-4 py-3 text-left shadow-lg backdrop-blur">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B66A3C]">Đang xem</p>
                      <h3 className="mt-1 truncate text-base font-black text-[#2C1E15]">{activeHomestay.name}</h3>
                      <p className="mt-1 text-xs font-bold text-gray-500">{activeHomestay.address || activeHomestay.city || activeHomestay.province || 'Chưa cập nhật địa chỉ'}</p>
                    </div>
                    <div className="rounded-2xl bg-white/95 px-4 py-3 text-xs font-black text-[#2C3E2B] shadow-lg backdrop-blur">
                      {formatCoordinate(activeHomestay.latitude)}, {formatCoordinate(activeHomestay.longitude)}
                    </div>
                  </div>
                  <a
                    href={mapOpenUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-5 top-5 z-20 inline-flex items-center gap-2 rounded-2xl bg-[#2C3E2B] px-4 py-3 text-xs font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#1f2d20]"
                  >
                    <HiMapPin className="h-4 w-4" /> Mở Google Maps
                  </a>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                  <div className="max-w-sm rounded-3xl bg-white/90 p-6 shadow-xl">
                    <HiMapPin className="mx-auto h-9 w-9 text-[#6E473B]" />
                    <p className="mt-3 text-sm font-black text-[#2C1E15]">Chưa có homestay nào trong danh sách hiện tại có tọa độ.</p>
                    <p className="mt-1 text-xs font-semibold text-gray-500">Hãy kiểm tra latitude và longitude trong dữ liệu homestay.</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="flex min-h-0 flex-col border-t border-gray-100 bg-[#FAF8F3] p-4 lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B66A3C]">Danh sách vị trí</p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#2C3E2B] shadow-sm">{locatedHomestays.length} điểm</span>
            </div>
            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {locatedHomestays.map((item) => {
                const itemId = getHomestayId(item);
                const selected = itemId === getHomestayId(activeHomestay);
                return (
                  <button
                    key={itemId}
                    type="button"
                    onClick={() => onSelectHomestay?.(item)}
                    className={(selected ? 'border-[#2C3E2B] bg-white shadow-md' : 'border-gray-200 bg-white/70 hover:bg-white hover:shadow-sm') + ' w-full rounded-2xl border p-3 text-left transition'}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <img src={getImageUrl(item)} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-[#2C1E15]">{item.name}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-gray-500"><HiHomeModern className="h-4 w-4 text-[#6E473B]" /> {item.city || item.province || 'Chưa cập nhật'}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs font-black text-[#2C3E2B]"><HiStar className="h-4 w-4 text-amber-400" /> {item.score || item.rating || '0.0'} · {formatCoordinate(item.latitude)}, {formatCoordinate(item.longitude)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
