import {
  FaCompass,
  FaHiking,
  FaHome,
  FaMapMarkerAlt,
  FaSignInAlt,
  FaStar,
  FaTicketAlt,
  FaUsers,
} from "react-icons/fa";

function pick(...values) {
  return values.find((value) => value !== null && value !== undefined && value !== "") ?? null;
}

function asList(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "Dang cap nhat";
  const number = Number(value);
  if (Number.isNaN(number)) return String(value);
  return number.toLocaleString("vi-VN") + "d";
}

function homestayHref(item) {
  const id = pick(item.homeId, item.home_id, item.id);
  return id ? `/homestay/${id}` : "/search";
}

function imageOf(item) {
  return pick(
    item.thumbnailUrl,
    item.thumbnail_url,
    item.imageUrl,
    item.image_url,
    item.images?.[0]?.imageUrl,
    item.images?.[0]?.image_url,
    "/images/destinations/dalat.jpg"
  );
}

export default function ChatbotRichData({ dataType, data }) {
  if (!dataType) return null;

  if (dataType === "LOGIN_REQUIRED") {
    return (
      <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-[#2C1E15] shadow-sm">
        <div className="flex items-center gap-2 font-black">
          <FaSignInAlt className="text-[#7A4E3A]" />
          Can dang nhap
        </div>
        <p className="mt-1 text-xs text-gray-600">Dang nhap de xem booking, yeu thich va hang thanh vien cua rieng ban.</p>
        <a href="/login" className="mt-3 inline-flex rounded-xl bg-[#2C3E2B] px-4 py-2 text-xs font-black text-white">
          Dang nhap
        </a>
      </div>
    );
  }

  if (dataType === "CLARIFICATION") {
    const missing = asList(data, "missingFields");
    if (!missing.length) return null;
    return (
      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-3 text-xs text-gray-600 shadow-sm">
        Minh can them: <span className="font-black text-[#2C3E2B]">{missing.join(", ")}</span>
      </div>
    );
  }

  if (dataType === "HOMESTAY_LIST") {
    const list = asList(data, "homestays");
    if (!list.length) return null;
    return (
      <div className="mt-3 space-y-3">
        {list.slice(0, 6).map((item, index) => {
          const name = pick(item.homeName, item.home_name, item.name, "Homestay Cozygo");
          const city = pick(item.city, item.province, item.address, "Cozygo");
          const price = pick(item.pricePerNight, item.price_per_night, item.price, item.totalPrice);
          const rating = pick(item.ratingAvg, item.rating_avg, item.rating, "Moi");
          const maxGuest = pick(item.maxGuest, item.max_guest, item.capacity);
          const distance = pick(item.distanceText, item.distance, item.distanceKm !== undefined ? `${item.distanceKm} km` : null);
          return (
            <a
              key={pick(item.homeId, item.home_id, item.id, index)}
              href={homestayHref(item)}
              className="block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="h-28 overflow-hidden bg-gray-100">
                <img src={imageOf(item)} alt={name} className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <h4 className="flex items-center gap-2 text-sm font-black text-[#2C1E15]">
                  <FaHome className="text-[#2C3E2B]" />
                  {name}
                </h4>
                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-gray-500">
                  <FaMapMarkerAlt />
                  {city}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                  <span className="font-black text-[#7A4E3A]">{formatCurrency(price)} / dem</span>
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 font-black text-amber-600">
                    <FaStar /> {rating}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-gray-600">
                  {maxGuest && <span className="rounded-full bg-gray-100 px-2 py-1"><FaUsers className="mr-1 inline" />{maxGuest} khach</span>}
                  {distance && <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">{distance}</span>}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    );
  }

  if (dataType === "PROMOTION_LIST") {
    const list = asList(data, "promotions");
    if (!list.length) return null;
    return (
      <div className="mt-3 space-y-2">
        {list.map((item, index) => {
          const code = pick(item.promotionCode, item.promotion_code, item.code);
          const name = pick(item.promotionName, item.promotion_name, item.name, "Khuyen mai Cozygo");
          const type = pick(item.discountType, item.discount_type);
          const value = pick(item.discountValue, item.discount_value);
          return (
            <div key={pick(item.promotionId, item.promotion_id, index)} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
              <h4 className="flex items-center gap-2 text-sm font-black text-[#2C1E15]">
                <FaTicketAlt className="text-[#7A4E3A]" /> {name}
              </h4>
              <p className="mt-1 text-xs font-black text-[#2C3E2B]">Ma: {code || "Dang cap nhat"}</p>
              <p className="mt-1 text-xs text-gray-600">Giam {type === "PERCENT" ? `${value}%` : formatCurrency(value)}</p>
            </div>
          );
        })}
      </div>
    );
  }

  if (dataType === "DESTINATION_LIST") {
    const list = asList(data, "destinations");
    if (!list.length) return null;
    return (
      <div className="mt-3 grid grid-cols-1 gap-3">
        {list.map((item, index) => {
          const name = pick(item.displayName, item.display_name, item.city, item.provinceName, "Diem den Cozygo");
          const destination = pick(item.city, item.provinceName, item.province_name, name);
          return (
            <a key={pick(item.destinationId, item.destination_id, index)} href={`/search?destination=${encodeURIComponent(destination)}`} className="relative block h-32 overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <img src={imageOf(item)} alt={name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/35" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="flex items-center gap-2 font-black"><FaCompass />{name}</h4>
                <p className="line-clamp-2 text-xs text-white/85">{pick(item.description, item.shortDescription, "Kham pha diem den nay tren Cozygo")}</p>
              </div>
            </a>
          );
        })}
      </div>
    );
  }

  if (dataType === "ACTIVITY_LIST") {
    const list = asList(data, "activities");
    if (!list.length) return null;
    return (
      <div className="mt-3 space-y-3">
        {list.map((item, index) => {
          const name = pick(item.activityName, item.activity_name, item.name, "Hoat dong Cozygo");
          const destination = pick(item.city, item.province, item.activityAddress, "");
          return (
            <a key={pick(item.activityId, item.activity_id, index)} href={`/activities?selected=${pick(item.activityId, item.activity_id, "")}`} className="block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="h-28 overflow-hidden bg-gray-100">
                <img src={imageOf(item)} alt={name} className="h-full w-full object-cover" />
              </div>
              <div className="p-3">
                <h4 className="flex items-center gap-2 text-sm font-black text-[#2C1E15]"><FaHiking className="text-[#2C3E2B]" />{name}</h4>
                <p className="mt-1 text-xs text-gray-500">{pick(item.shortDescription, item.description, destination)}</p>
              </div>
            </a>
          );
        })}
      </div>
    );
  }

  if (dataType === "BOOKING_STATUS") {
    const list = asList(data, "bookings");
    if (!list.length) return null;
    return (
      <div className="mt-3 space-y-2">
        {list.map((item, index) => (
          <div key={pick(item.booking_id, item.bookingId, index)} className="rounded-2xl border border-gray-200 bg-white p-3 text-xs shadow-sm">
            <div className="font-black text-[#2C1E15]">{pick(item.booking_code, item.bookingCode, `Booking ${index + 1}`)}</div>
            <div className="mt-1 text-gray-600">{pick(item.home_name, item.homeName, "Homestay")}</div>
            <div className="mt-2 flex flex-wrap gap-2 font-bold">
              <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">{pick(item.booking_status, item.bookingStatus, "Dang cap nhat")}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">{pick(item.payment_status, item.paymentStatus, "Thanh toan")}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
