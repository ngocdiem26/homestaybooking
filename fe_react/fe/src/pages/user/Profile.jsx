import { useCallback, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import UserLayout from '../../layouts/UserLayout';
import { useAuth } from '../../hooks/useAuth';

// Import các component đã tách cho trang hồ sơ
import ProfileDashboard from '../../components/profile/ProfileDashboard';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import AccountInfo from '../../components/profile/AccountInfo';
import BookingManager from '../../components/profile/BookingManager';
import PaymentManager from '../../components/profile/PaymentManager';
import TransactionHistory from '../../components/profile/TransactionHistory';
import CustomSchedule from '../../components/profile/CustomSchedule';
import ReviewManager from '../../components/profile/ReviewManager';
import ComplaintManager from '../../components/profile/ComplaintManager';
import ComplaintFormModal from '../../components/profile/ComplaintFormModal';
import ModalPortal from '../../components/common/ModalPortal';
import { cancelMyBooking, getMyBookings, getMyPaymentTransactions } from '../../services/bookingService';
import { createReview, getMyReviews, updateReview } from '../../services/reviewService';
import { createComplaint, getMyComplaints } from '../../services/complaintService';
import { getMyProfile, updateMyAvatar, updateMyProfile } from '../../services/profileService';



function getProfileViewFromSearch(search) {
  const view = new URLSearchParams(search || '').get('view');
  const allowedViews = ['dashboard', 'info', 'bookings', 'payment', 'transactions', 'schedule', 'reviews', 'complaints'];
  return allowedViews.includes(view) ? view : 'dashboard';
}
function formatBookingDate(value) {
  if (!value) return '';
  return new Date(value + 'T00:00:00').toLocaleDateString('vi-VN');
}

function formatBookingDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatBookingMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN') + 'đ';
}

function isPastBookingCheckIn(value) {
  if (!value) return false;
  const checkIn = new Date(value + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkIn < today;
}

function normalizeProfileGender(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['male', 'nam', 'm'].includes(normalized)) return 'male';
  if (['female', 'nu', 'nữ', 'f'].includes(normalized)) return 'female';
  if (['other', 'khac', 'khác'].includes(normalized)) return 'other';
  return normalized;
}

function mapProfileResponse(profile = {}, authUser = {}) {
  return {
    name: profile.fullName || authUser?.fullName || '',
    email: profile.email || authUser?.email || '',
    phone: profile.phoneNumber || authUser?.phoneNumber || '',
    dob: profile.birthday || authUser?.birthday || authUser?.dob || '',
    gender: normalizeProfileGender(profile.gender || authUser?.gender),
    address: profile.address || authUser?.address || '',
    avatar: profile.avatar || authUser?.avatar || authUser?.avatarUrl || authUser?.imageUrl || authUser?.profileImage || null,
  };
}

function toProfilePayload(info = {}) {
  return {
    fullName: String(info.name || '').trim(),
    phoneNumber: String(info.phone || '').trim(),
    birthday: info.dob || null,
    gender: info.gender || null,
    address: String(info.address || '').trim(),
  };
}

function mapBookingStatus(status, paymentStatus, checkInDate) {
  const normalized = String(status || '').toUpperCase();
  const normalizedPayment = String(paymentStatus || '').toUpperCase();
  if (['CANCELLED', 'EXPIRED', 'NO_SHOW'].includes(normalized)) return 'cancelled';
  if (normalizedPayment === 'PAID') return isPastBookingCheckIn(checkInDate) ? 'completed' : 'confirmed';
  if (normalized === 'CONFIRMED') return 'confirmed';
  if (normalized === 'COMPLETED') return 'completed';
  return 'pending';
}

function mapBookingStatusDetailLabel(status) {
  if (status === 'completed') return 'Đã hoàn thành';
  if (status === 'confirmed') return 'Đã xác nhận';
  if (status === 'cancelled') return 'Đã hủy';
  return 'Đang chờ xử lý';
}

function mapPaymentStatusLabel(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'PAID') return 'Đã thanh toán';
  if (normalized === 'REFUNDED') return 'Đã hoàn tiền';
  if (normalized === 'FAILED') return 'Thanh toán lỗi';
  if (normalized === 'EXPIRED') return 'Quá hạn thanh toán';
  return 'Chờ thanh toán';
}

function mapPaymentStatusKey(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'PAID') return 'paid';
  if (['FAILED', 'EXPIRED'].includes(normalized)) return 'failed';
  if (normalized === 'REFUNDED') return 'refunded';
  return 'pending';
}

function mapPaymentMethodLabel(method) {
  const normalized = String(method || '').toUpperCase();
  if (normalized === 'VNPAY') return 'VNPay';
  if (normalized === 'PAY_AT_PROPERTY') return 'Thanh toán tại chỗ';
  return method || 'Chưa chọn';
}

function normalizeBoolean(value) {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value == null) return false;
  const normalized = String(value).trim().toLowerCase();
  return ['true', '1', 'yes', 'y'].includes(normalized);
}

function mapUserBooking(apiBooking) {
  return {
    id: apiBooking.bookingCode || ('BK' + apiBooking.bookingId),
    bookingId: apiBooking.bookingId,
    homeId: apiBooking.homeId,
    homestay: apiBooking.homestayName,
    location: apiBooking.province,
    address: apiBooking.homestayAddress,
    imageUrl: apiBooking.imageUrl,
    checkIn: formatBookingDate(apiBooking.checkInDate),
    checkOut: formatBookingDate(apiBooking.checkOutDate),
    createdAt: formatBookingDateTime(apiBooking.createdAt),
    price: formatBookingMoney(apiBooking.totalPrice),
    unitPrice: formatBookingMoney(apiBooking.unitPrice),
    roomTotal: formatBookingMoney(apiBooking.roomTotal),
    serviceTotal: formatBookingMoney(apiBooking.serviceTotal),
    discountAmount: formatBookingMoney(apiBooking.discountAmount),
    totalPrice: formatBookingMoney(apiBooking.totalPrice),
    status: mapBookingStatus(apiBooking.bookingStatus, apiBooking.paymentStatus, apiBooking.checkInDate),
    bookingStatus: apiBooking.bookingStatus,
    paymentStatus: apiBooking.paymentStatus,
    paymentStatusLabel: mapPaymentStatusLabel(apiBooking.paymentStatus),
    paymentStatusKey: mapPaymentStatusKey(apiBooking.paymentStatus),
    paymentMethod: apiBooking.paymentMethod,
    paymentMethodLabel: mapPaymentMethodLabel(apiBooking.paymentMethod),
    guestCount: apiBooking.numberOfGuest || 1,
    nights: apiBooking.numberOfNights || 1,
    guests: (apiBooking.numberOfGuest || 1) + ' khách',
    roomType: (apiBooking.numberOfNights || 1) + ' đêm tại ' + (apiBooking.homestayName || 'homestay'),
    services: (apiBooking.services || []).map((service) => ({
      ...service,
      unitPriceLabel: formatBookingMoney(service.unitPrice),
      totalPriceLabel: formatBookingMoney(service.totalPrice),
    })),
    note: apiBooking.note || '',
    reviewed: normalizeBoolean(apiBooking.reviewed),
  };
}

function DetailItem({ label, value, strong = false }) {
  return (
    <div className="rounded-2xl bg-[#F8F6F0] px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-wide text-gray-400">{label}</p>
      <p className={(strong ? 'font-black text-[#2C1E15]' : 'font-bold text-gray-700') + ' mt-1'}>{value || '--'}</p>
    </div>
  );
}

function PriceRow({ label, value, highlight = false, negative = false }) {
  return (
    <div className={(highlight ? 'bg-[#7A5547] text-white' : 'bg-white text-gray-700') + ' flex items-center justify-between gap-4 px-5 py-3'}>
      <span className="font-bold">{label}</span>
      <strong className={negative ? 'text-emerald-700' : ''}>{negative ? '- ' : ''}{value}</strong>
    </div>
  );
}

function BookingDetailModal({ booking, review, onClose, onCancel, onViewReview, onOpenComplaint }) {
  const canCancel = booking.status === 'confirmed';
  const canComplaint = booking.status === 'completed';
  return (
    <ModalPortal className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-fade-in" onBackdropClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[28px] bg-white text-left text-sm font-semibold shadow-2xl">
        <header className="bg-[#F6EFE6] px-6 py-5 text-[#2C1E15]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B66A3C]">Chi tiết đơn đặt phòng</p>
              <h3 className="mt-1 font-classic text-2xl font-black">{booking.homestay}</h3>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 font-mono text-xs font-black text-gray-700 ring-1 ring-gray-200">{booking.id}</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-200">{mapBookingStatusDetailLabel(booking.status)}</span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-200">{booking.paymentStatusLabel}</span>
              </div>
            </div>
            <button onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-black text-gray-600 shadow-sm ring-1 ring-gray-200 transition hover:bg-[#2C3E2B] hover:text-white" aria-label="Đóng">×</button>
          </div>
        </header>

        <div className="max-h-[calc(90vh-112px)] overflow-y-auto p-6">
          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B6784F]">Thông tin đơn hàng</p>
                <h4 className="mt-1 text-xl font-black text-[#2C1E15]">{booking.homestay}</h4>
                <p className="mt-1 text-sm font-semibold text-gray-500">{booking.address || booking.location || '--'}</p>
              </div>
              <div className="rounded-2xl bg-[#F8F6F0] px-4 py-3 text-right">
                <p className="text-[11px] font-black uppercase text-gray-400">Tổng thanh toán</p>
                <p className="mt-1 text-xl font-black text-[#2C3E2B]">{booking.totalPrice}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Thời gian tạo" value={booking.createdAt} />
              <DetailItem label="Khu vực" value={booking.location} />
              <DetailItem label="Phương thức" value={booking.paymentMethodLabel} />
              <DetailItem label="Nhận phòng" value={booking.checkIn} strong />
              <DetailItem label="Trả phòng" value={booking.checkOut} strong />
              <DetailItem label="Số khách" value={booking.guests} />
              <DetailItem label="Số đêm" value={`${booking.nights} đêm`} />
              <DetailItem label="Trạng thái đơn" value={mapBookingStatusDetailLabel(booking.status)} />
              <DetailItem label="Trạng thái thanh toán" value={booking.paymentStatusLabel} />
            </div>

            {booking.note && (
              <div className="mt-4 rounded-2xl bg-[#FFF8ED] px-4 py-3 text-sm font-bold text-[#7A4E2E]">
                Ghi chú: <span className="font-semibold italic">{booking.note}</span>
              </div>
            )}
          </section>

          <section className="mt-5 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-[#F8F6F0] px-5 py-4">
              <h4 className="font-black text-[#2C1E15]">Chi phí đơn đặt phòng</h4>
            </div>
            <div className="divide-y divide-gray-100">
              <PriceRow label="Giá mỗi đêm" value={booking.unitPrice} />
              <PriceRow label={`Tiền phòng (${booking.nights} đêm)`} value={booking.roomTotal} />
              <PriceRow label="Dịch vụ thêm" value={booking.serviceTotal} />
              <PriceRow label="Giảm giá" value={booking.discountAmount} negative />
              <PriceRow label="Tổng cộng" value={booking.totalPrice} highlight />
            </div>
          </section>

          <section className="mt-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h4 className="font-black text-[#2C1E15]">Dịch vụ đi kèm</h4>
            {booking.services?.length ? (
              <div className="mt-3 grid gap-2">
                {booking.services.map((service, index) => (
                  <div key={service.homestayServiceId || index} className="flex items-center justify-between gap-4 rounded-2xl bg-[#F8F6F0] px-4 py-3">
                    <div>
                      <p className="font-black text-[#2C1E15]">{service.serviceName}</p>
                      <p className="text-xs font-semibold text-gray-400">x{service.quantity} · {service.unitPriceLabel}</p>
                    </div>
                    <strong className="text-[#6E473B]">{service.totalPriceLabel}</strong>
                  </div>
                ))}
              </div>
            ) : <p className="mt-2 rounded-2xl bg-[#F8F6F0] px-4 py-3 text-gray-400">Không chọn dịch vụ thêm.</p>}
          </section>

          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
            {review && <button onClick={() => onViewReview(review)} className="rounded-2xl bg-amber-100 px-5 py-3 text-sm font-black text-amber-800 shadow-sm ring-1 ring-amber-200 transition hover:bg-amber-200 hover:text-amber-900">Xem đánh giá</button>}
            {canComplaint && <button onClick={() => onOpenComplaint(booking)} className="rounded-2xl bg-[#7A5547] px-5 py-3 text-sm font-black text-white shadow transition hover:bg-[#6C483A]">Viết khiếu nại</button>}
            {canCancel && <button onClick={() => onCancel(booking.id)} className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow transition hover:bg-red-700">Yêu cầu hủy đơn</button>}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
export default function Profile() {
  const fileInputRef = useRef(null);
  const location = useLocation();
  const { user: authUser, updateUser } = useAuth();
  const [currentView, setCurrentView] = useState(() => getProfileViewFromSearch(location.search));
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [focusedReviewId, setFocusedReviewId] = useState(null);
  const [complaintBooking, setComplaintBooking] = useState(null);
  const [complaintToast, setComplaintToast] = useState('');
  const isScheduleView = currentView === 'schedule';

  // State dữ liệu gốc của trang hồ sơ
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState(() => mapProfileResponse({}, authUser));
  const [tempInfo, setTempInfo] = useState(() => mapProfileResponse({}, authUser));
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setProfileError('');
        const profile = await getMyProfile();
        if (!isMounted) return;
        const mappedProfile = mapProfileResponse(profile, authUser);
        setUserInfo(mappedProfile);
        setTempInfo(mappedProfile);
        updateUser?.({
          avatar: profile.avatar,
          fullName: profile.fullName,
          email: profile.email,
          phoneNumber: profile.phoneNumber,
          birthday: profile.birthday,
          address: profile.address,
          gender: profile.gender,
          roleName: profile.roleName,
        });
      } catch (error) {
        if (isMounted) setProfileError(error.message || 'Không tải được hồ sơ cá nhân');
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  // Chỉ tải hồ sơ một lần khi vào trang; updateUser sẽ cập nhật auth storage sau khi API trả về.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadBookings() {
      try {
        setBookingError('');
        const data = await getMyBookings();
        if (isMounted) setBookings(data.map(mapUserBooking));
      } catch (error) {
        if (isMounted) setBookingError(error.message || 'Không tải được đơn đặt phòng');
      }
    }

    loadBookings();
    return () => {
      isMounted = false;
    };
  }, []);

  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionError, setTransactionError] = useState('');
  const loadTransactions = useCallback(async () => {
    try {
      setTransactionsLoading(true);
      setTransactionError('');
      const data = await getMyPaymentTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      setTransactionError(error.message || 'Không tải được lịch sử giao dịch');
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentView !== 'transactions') return;
    queueMicrotask(() => loadTransactions());
  }, [currentView, loadTransactions]);

  const [cards, setCards] = useState([
    { id: 1, type: "Visa", number: "**** **** **** 8892", expiry: "12/29", holder: "THACH THI NGOC DIEM" }
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', expiry: '', holder: '', type: 'Visa' });

  const [mySchedules, setMySchedules] = useState([
    {
      id: 1,
      name: "Chuyến trốn nắng Đà Lạt cùng gia đình",
      items: [
        { time: "05:00", location: "Săn mây Đỉnh Đồi Ngoại Ô", note: "Mang theo áo khoác dày vì nhiệt độ sáng sớm khá lạnh." },
        { time: "18:00", location: "Tiệc nướng BBQ củi than tại homestay", note: "Đã đặt trước chủ nhà chuẩn bị khoai lùi." }
      ]
    }
  ]);
  const [scheduleName, setScheduleName] = useState('');
  
  // Luôn mồi sẵn một dòng để form lịch trình không bị trống khi mới mở.
  const [scheduleItems, setScheduleItems] = useState([{ time: '', location: '', note: '' }]);
  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [complaintError, setComplaintError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadMyReviews() {
      try {
        setReviewError('');
        const data = await getMyReviews();
        if (isMounted) {
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          setReviewError(error.message || 'Không tải được đánh giá của tôi');
        }
      }
    }

    loadMyReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers điều phối dữ liệu người dùng
  useEffect(() => {
    if (currentView !== 'complaints') return;
    let isMounted = true;

    async function loadMyComplaints() {
      try {
        setComplaintError('');
        const data = await getMyComplaints();
        if (isMounted) setComplaints(Array.isArray(data) ? data : []);
      } catch (error) {
        if (isMounted) setComplaintError(error.message || 'Không tải được danh sách khiếu nại của tôi');
      }
    }

    loadMyComplaints();
    return () => {
      isMounted = false;
    };
  }, [currentView]);

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn đặt phòng này không? Hành động này tuân theo chính sách hoàn tiền của Cozygo.")) return;

    try {
      const booking = bookings.find((item) => item.id === id || item.bookingId === id);
      const updated = await cancelMyBooking(booking?.bookingId || id);
      setBookings((current) => current.map((item) => item.bookingId === updated.bookingId ? mapUserBooking(updated) : item));
      setSelectedBooking(null);
      await loadTransactions();
      const refunded = String(updated.paymentStatus || '').toUpperCase() === 'REFUNDED';
      alert(refunded ? "Hủy đơn thành công. Hệ thống đã ghi nhận hoàn tiền VNPay." : "Hủy đơn đặt phòng thành công!");
    } catch (error) {
      alert(error.message || "Không cập nhật được thông tin hồ sơ");
    }
  };


  const handleSubmitReview = async ({ booking, rating, comment }) => {
    const created = await createReview({
      homeId: booking.homeId,
      bookingId: booking.bookingId,
      rating,
      comment,
    });
    setBookings((current) => current.map((item) => (
      item.bookingId === booking.bookingId ? { ...item, reviewed: true } : item
    )));
    setReviews((current) => [created, ...current.filter((item) => item.reviewId !== created.reviewId)]);
    return created;
  };

  const showComplaintToast = (message) => {
    setComplaintToast(message);
    window.setTimeout(() => setComplaintToast(''), 2200);
  };

  const handleSubmitComplaint = async (payload) => {
    const created = await createComplaint(payload);
    setComplaints((current) => [created, ...current.filter((item) => item.complaintId !== created.complaintId)]);
    setComplaintBooking(null);
    setSelectedBooking(null);
    setCurrentView('complaints');
    showComplaintToast('Đã gửi khiếu nại. Bạn có thể theo dõi trong mục Khiếu nại của tôi.');
    return created;
  };


  const handleUpdateReview = async (reviewId, payload) => {
    const updated = await updateReview(reviewId, payload);
    setReviews((current) => current.map((item) => item.reviewId === updated.reviewId ? updated : item));
    return updated;
  };

  const handleViewReview = (review) => {
    if (!review) return;
    setFocusedReviewId(review.reviewId);
    setCurrentView('reviews');
    setSelectedBooking(null);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const imageUrl = String(reader.result || '');
      setUserInfo((current) => ({ ...current, avatar: imageUrl }));
      setTempInfo((current) => ({ ...current, avatar: imageUrl }));

      try {
        const updatedProfile = await updateMyAvatar(imageUrl);
        updateUser?.({
          avatar: updatedProfile.avatar,
          fullName: updatedProfile.fullName,
          email: updatedProfile.email,
          phoneNumber: updatedProfile.phoneNumber,
          birthday: updatedProfile.birthday,
          address: updatedProfile.address,
          gender: updatedProfile.gender,
          roleName: updatedProfile.roleName,
        });
        setUserInfo((current) => ({ ...current, avatar: updatedProfile.avatar || imageUrl }));
        setTempInfo((current) => ({ ...current, avatar: updatedProfile.avatar || imageUrl }));
      } catch (error) {
        alert(error.message || 'Không lưu được avatar vào hệ thống');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();

    try {
      const updatedProfile = await updateMyProfile(toProfilePayload(tempInfo));
      const mappedProfile = mapProfileResponse(updatedProfile, authUser);
      setUserInfo(mappedProfile);
      setTempInfo(mappedProfile);
      updateUser?.({
        avatar: updatedProfile.avatar,
        fullName: updatedProfile.fullName,
        email: updatedProfile.email,
        phoneNumber: updatedProfile.phoneNumber,
        birthday: updatedProfile.birthday,
        address: updatedProfile.address,
        gender: updatedProfile.gender,
        roleName: updatedProfile.roleName,
      });
      setIsEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      alert(error.message || "Không cập nhật được thông tin hồ sơ");
    }
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    const maskedNumber = `**** **** **** ${newCard.number.slice(-4)}`;
    setCards([...cards, { id: Date.now(), type: newCard.type, number: maskedNumber, expiry: newCard.expiry, holder: newCard.holder.toUpperCase() }]);
    setShowAddCard(false);
    setNewCard({ number: '', expiry: '', holder: '', type: 'Visa' });
  };

  const handleCreateSchedule = (e) => {
    e.preventDefault();
    if (!scheduleName) return alert("Vui lòng nhập tên lịch trình!");
    setMySchedules([...mySchedules, { id: Date.now(), name: scheduleName, items: scheduleItems.filter(item => item.time && item.location) }]);
    setScheduleName('');
    setScheduleItems([{ time: '', location: '', note: '' }]);
    alert("Tạo lịch trình thành công!");
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...scheduleItems];
    updated[index][field] = value;
    setScheduleItems(updated);
  };

  const handleAddField = () => {
    setScheduleItems([...scheduleItems, { time: '', location: '', note: '' }]);
  };

  return (
    <UserLayout>
      <div className="bg-[#F4F1EA] min-h-screen text-[#23150d] animate-fade-in text-left pb-24">
        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
        
        {/* View tổng quan */}
        {currentView === 'dashboard' && (
          <ProfileDashboard 
            userInfo={userInfo} fileInputRef={fileInputRef} handleAvatarChange={handleAvatarChange}
            setCurrentView={setCurrentView} setIsEditing={setIsEditing} mySchedulesCount={mySchedules.length}
          />
        )}

        {/* View chi tiết theo từng mục */}
        {currentView !== 'dashboard' && (
          <div className="mx-auto grid max-w-[1760px] grid-cols-1 gap-6 px-4 pt-6 md:px-8 lg:grid-cols-[300px_minmax(0,1fr)] items-start">
            
            <ProfileSidebar currentView={currentView} setCurrentView={setCurrentView} setIsEditing={setIsEditing} />

            <main className={isScheduleView ? 'min-h-[520px] min-w-0' : 'min-h-[520px] min-w-0 rounded-3xl border border-[#6E473B]/10 bg-white p-5 shadow-sm md:p-6'}>
              {currentView === 'info' && profileError && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{profileError}</div>}
              {currentView === 'info' && <AccountInfo isEditing={isEditing} setIsEditing={setIsEditing} tempInfo={tempInfo} setTempInfo={setTempInfo} handleSaveInfo={handleSaveInfo} fileInputRef={fileInputRef} handleAvatarChange={handleAvatarChange} />}
              {currentView === 'bookings' && <>
                {bookingError && <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{bookingError}</div>}
                <BookingManager bookings={bookings} bookingFilter={bookingFilter} setBookingFilter={setBookingFilter} setSelectedBooking={setSelectedBooking} handleCancelBooking={handleCancelBooking} onSubmitReview={handleSubmitReview} reviews={reviews} onViewReview={handleViewReview} />
              </>}
              {currentView === 'payment' && <PaymentManager cards={cards} showAddCard={showAddCard} setShowAddCard={setShowAddCard} newCard={newCard} setNewCard={setNewCard} handleAddCard={handleAddCard} />}
              {currentView === 'transactions' && <TransactionHistory transactions={transactions} isLoading={transactionsLoading} errorMessage={transactionError} />}
              {currentView === 'schedule' && <CustomSchedule scheduleName={scheduleName} setScheduleName={setScheduleName} scheduleItems={scheduleItems} handleItemChange={handleItemChange} handleAddField={handleAddField} handleCreateSchedule={handleCreateSchedule} mySchedules={mySchedules} />}
              {currentView === 'reviews' && <ReviewManager errorMessage={reviewError} reviews={reviews} focusedReviewId={focusedReviewId} onUpdateReview={handleUpdateReview} />}
              {currentView === 'complaints' && <ComplaintManager complaints={complaints} errorMessage={complaintError} />}
            </main>
          </div>
        )}

        {selectedBooking && (
          <BookingDetailModal
            booking={selectedBooking}
            review={reviews.find((review) => Number(review.bookingId) === Number(selectedBooking.bookingId))}
            onClose={() => setSelectedBooking(null)}
            onCancel={handleCancelBooking}
            onViewReview={handleViewReview}
            onOpenComplaint={setComplaintBooking}
          />
        )}

        {complaintBooking && (
          <ComplaintFormModal
            booking={complaintBooking}
            onClose={() => setComplaintBooking(null)}
            onSubmit={handleSubmitComplaint}
          />
        )}

        {complaintToast && (
          <ModalPortal className="pointer-events-none fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <div className="rounded-3xl bg-white px-8 py-5 text-center shadow-2xl ring-1 ring-black/5">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-2xl font-black text-emerald-600">✓</div>
              <p className="text-base font-black text-[#2C1E15]">{complaintToast}</p>
            </div>
          </ModalPortal>
        )}

      </div>
    </UserLayout>
  );
}










