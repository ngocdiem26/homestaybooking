import { FaHome, FaMapMarkerAlt, FaStar, FaTicketAlt, FaCompass, FaHiking } from "react-icons/fa";

function formatCurrency(value) {
  if (value === null || value === undefined) return "Đang cập nhật";
  return Number(value).toLocaleString("vi-VN") + "đ";
}

export default function ChatbotRichData({ dataType, data }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  if (dataType === "HOMESTAY_LIST") {
    return (
      <div className="mt-3 space-y-3">
        {data.map((item) => (
          <a
            key={item.homeId}
            href={`/homestay/${item.homeId}`}
            className="block rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition"
          >
            <div className="h-32 bg-gray-100 overflow-hidden">
              <img
                src={item.thumbnailUrl || "/images/destinations/da-lat.jpg"}
                alt={item.homeName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-3">
              <h4 className="font-bold text-sm text-[#2C1E15] flex items-center gap-2">
                <FaHome className="text-[#2C3E2B]" />
                {item.homeName}
              </h4>

              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <FaMapMarkerAlt />
                {item.province}
              </p>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-black text-[#7A4E3A]">
                  {formatCurrency(item.pricePerNight)} / đêm
                </span>

                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <FaStar />
                  {item.ratingAvg || "Mới"}
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Sức chứa tối đa: {item.maxGuest} khách
              </p>
            </div>
          </a>
        ))}
      </div>
    );
  }

  if (dataType === "PROMOTION_LIST") {
    return (
      <div className="mt-3 space-y-2">
        {data.map((item) => (
          <div
            key={item.promotionId}
            className="rounded-2xl bg-white border border-gray-200 p-3 shadow-sm"
          >
            <h4 className="font-bold text-sm text-[#2C1E15] flex items-center gap-2">
              <FaTicketAlt className="text-[#7A4E3A]" />
              {item.promotionName}
            </h4>

            <p className="mt-1 text-xs font-black text-[#2C3E2B]">
              Mã: {item.promotionCode}
            </p>

            <p className="mt-1 text-xs text-gray-600">
              Giảm{" "}
              {item.discountType === "PERCENT"
                ? `${item.discountValue}%`
                : formatCurrency(item.discountValue)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Đơn tối thiểu: {formatCurrency(item.minOrderAmount)}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (dataType === "DESTINATION_LIST") {
    return (
      <div className="mt-3 grid grid-cols-1 gap-3">
        {data.map((item) => (
          <a
            key={item.destinationId}
            href={`/search?destination=${encodeURIComponent(item.city || item.provinceName)}`}
            className="relative h-32 rounded-2xl overflow-hidden shadow-sm border border-gray-200 block"
          >
            <img
              src={item.thumbnailUrl || "/images/destinations/da-lat.jpg"}
              alt={item.displayName}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/35" />

            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h4 className="font-black flex items-center gap-2">
                <FaCompass />
                {item.displayName}
              </h4>
              <p className="text-xs text-white/85 line-clamp-2">
                {item.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    );
  }

  if (dataType === "ACTIVITY_LIST") {
    return (
      <div className="mt-3 space-y-3">
        {data.map((item) => (
          <a
            key={item.activityId}
            href={`/search?destination=${encodeURIComponent(item.city || item.province)}`}
            className="block rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="h-28 bg-gray-100 overflow-hidden">
              <img
                src={item.thumbnailUrl || "/images/destinations/da-lat.jpg"}
                alt={item.activityName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-3">
              <h4 className="font-bold text-sm text-[#2C1E15] flex items-center gap-2">
                <FaHiking className="text-[#2C3E2B]" />
                {item.activityName}
              </h4>

              <p className="mt-1 text-xs text-gray-500">
                {item.shortDescription}
              </p>

              {item.badgeText && (
                <span className="mt-2 inline-flex rounded-full bg-[#F4F1EA] px-3 py-1 text-[11px] font-bold text-[#7A4E3A]">
                  {item.badgeText}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    );
  }

  return null;
}