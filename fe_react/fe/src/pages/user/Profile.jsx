import { useEffect, useState, useRef } from 'react';
import UserLayout from '../../layouts/UserLayout';

// Import toàn bộ các mảnh ghép component vừa bóc tách
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
import { cancelMyBooking, getMyBookings } from '../../services/bookingService';
import { createReview, getMyReviews, updateReview } from '../../services/reviewService';
import { createComplaint, getMyComplaints } from '../../services/complaintService';


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
  if (normalized === 'SEPAY') return 'SePay';
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

function BookingDetailModal({ booking, review, onClose, onCancel, onViewReview, onOpenComplaint }) {
  const canCancel = booking.status === 'confirmed';
  const canComplaint = booking.status === 'completed';
  return (
    <ModalPortal className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in" onBackdropClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white text-sm font-semibold shadow-2xl">
        <header className="flex items-start justify-between gap-4 bg-[#202c3c] px-6 py-5 text-white">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E3B17A]">Chi tiết đơn đặt phòng</p>
            <h3 className="mt-1 font-classic text-2xl font-black">{booking.homestay}</h3>
            <p className="mt-1 font-mono text-xs text-white/70">{booking.id}</p>
          </div>
          <button onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[#202c3c]">×</button>
        </header>
        <div className="max-h-[calc(90vh-92px)] overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <div className="overflow-hidden rounded-2xl bg-[#F4F1EA]">
              {booking.imageUrl ? <img src={booking.imageUrl} alt={booking.homestay} className="h-44 w-full object-cover md:h-full" /> : <div className="flex h-44 items-center justify-center text-gray-400">Không có ảnh</div>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#F8F6F0] p-4"><p className="text-xs font-black uppercase text-gray-400">Thời gian tạo</p><p className="mt-1 text-[#2C1E15]">{booking.createdAt || '--'}</p></div>
              <div className="rounded-2xl bg-[#F8F6F0] p-4"><p className="text-xs font-black uppercase text-gray-400">Khu vực</p><p className="mt-1 text-[#2C1E15]">{booking.location || '--'}</p></div>
              <div className="rounded-2xl bg-[#F8F6F0] p-4"><p className="text-xs font-black uppercase text-gray-400">Nhận phòng</p><p className="mt-1 text-[#2C1E15]">{booking.checkIn}</p></div>
              <div className="rounded-2xl bg-[#F8F6F0] p-4"><p className="text-xs font-black uppercase text-gray-400">Trả phòng</p><p className="mt-1 text-[#2C1E15]">{booking.checkOut}</p></div>
              <div className="rounded-2xl bg-[#F8F6F0] p-4"><p className="text-xs font-black uppercase text-gray-400">Số khách</p><p className="mt-1 text-[#2C1E15]">{booking.guests}</p></div>
              <div className="rounded-2xl bg-[#F8F6F0] p-4"><p className="text-xs font-black uppercase text-gray-400">Số đêm</p><p className="mt-1 text-[#2C1E15]">{booking.nights} đêm</p></div>
            </div>
          </div>

          <section className="mt-5 rounded-2xl border border-gray-100 bg-white p-4">
            <h4 className="font-black text-[#2C1E15]">Thông tin lưu trú</h4>
            <div className="mt-3 space-y-2 text-gray-600">
              <p><span className="text-gray-400">Địa chỉ:</span> <span className="text-gray-800">{booking.address || booking.location || '--'}</span></p>
              <p><span className="text-gray-400">Trạng thái đơn:</span> <span className="font-black text-[#2C3E2B]">{mapBookingStatusDetailLabel(booking.status)}</span></p>
              <p><span className="text-gray-400">Thanh toán:</span> <span className="font-black text-[#2C3E2B]">{booking.paymentStatusLabel}</span></p>
              <p><span className="text-gray-400">Phương thức:</span> <span className="font-black text-[#2C1E15]">{booking.paymentMethodLabel}</span></p>
              {booking.note && <p><span className="text-gray-400">Ghi chú:</span> <span className="italic text-gray-700">{booking.note}</span></p>}
            </div>
          </section>

          <section className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <div className="bg-[#F8F6F0] px-4 py-3 font-black text-[#2C1E15]">Bảng giá</div>
            <div className="divide-y divide-gray-100 text-sm">
              <div className="flex justify-between px-4 py-3"><span>Giá mỗi đêm</span><strong>{booking.unitPrice}</strong></div>
              <div className="flex justify-between px-4 py-3"><span>Tiền phòng ({booking.nights} đêm)</span><strong>{booking.roomTotal}</strong></div>
              <div className="flex justify-between px-4 py-3"><span>Dịch vụ thêm</span><strong>{booking.serviceTotal}</strong></div>
              <div className="flex justify-between px-4 py-3 text-emerald-700"><span>Giảm giá</span><strong>- {booking.discountAmount}</strong></div>
              <div className="flex justify-between bg-[#2C3E2B] px-4 py-4 text-base text-white"><span>Tổng cộng</span><strong>{booking.totalPrice}</strong></div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-gray-100 bg-white p-4">
            <h4 className="font-black text-[#2C1E15]">Dịch vụ đi kèm</h4>
            {booking.services?.length ? (
              <div className="mt-3 space-y-2">
                {booking.services.map((service, index) => (
                  <div key={service.homestayServiceId || index} className="flex items-center justify-between rounded-xl bg-[#F8F6F0] px-4 py-3">
                    <div><p className="font-black text-[#2C1E15]">{service.serviceName}</p><p className="text-xs text-gray-400">x{service.quantity} · {service.unitPriceLabel}</p></div>
                    <strong className="text-[#6E473B]">{service.totalPriceLabel}</strong>
                  </div>
                ))}
              </div>
            ) : <p className="mt-2 text-gray-400">Không chọn dịch vụ thêm.</p>}
          </section>

          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
            {review && <button onClick={() => onViewReview(review)} className="rounded-2xl bg-amber-100 px-5 py-3 text-sm font-black text-amber-800 shadow-sm ring-1 ring-amber-200 transition hover:bg-amber-200 hover:text-amber-900">Xem đánh giá</button>}
            {canComplaint && <button onClick={() => onOpenComplaint(booking)} className="rounded-2xl bg-[#2C3E2B] px-5 py-3 text-sm font-black text-white shadow transition hover:bg-[#1f2d1f]">Viết khiếu nại</button>}
            {canCancel && <button onClick={() => onCancel(booking.id)} className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow transition hover:bg-red-700">Yêu cầu hủy đơn</button>}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export default function Profile() {
  const fileInputRef = useRef(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [focusedReviewId, setFocusedReviewId] = useState(null);
  const [complaintBooking, setComplaintBooking] = useState(null);
  const [complaintToast, setComplaintToast] = useState('');

  // STATE NGUỒN DỮ LIỆU GỐC (GIỮ NGUYÊN HOÀN TOÀN)
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "Thạch Thị Ngọc Diểm",
    email: "ngocdiem.ctump@gmail.com",
    phone: "0912 345 678",
    dob: "2004-03-15",
    gender: "female",
    address: "Ninh Kiều, Cần Thơ",
    avatar: null 
  });
  const [tempInfo, setTempInfo] = useState({ ...userInfo });

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

  const [transactions] = useState([
    { id: "TXN-5517", bookingId: "CZG-8892", date: "2026-06-05", amount: "2,400,000đ", method: "Visa (Ending 8892)", status: "Thành công" },
    { id: "TXN-1926", bookingId: "CZG-9374", date: "2026-03-28", amount: "1,200,000đ", method: "Ví Điện Tử", status: "Thành công" },
    { id: "TXN-0012", bookingId: "CZG-1102", date: "2026-01-02", amount: "3,500,000đ", method: "Thẻ nội địa", status: "Đã hoàn tiền" }
  ]);

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
        { time: "05:00", location: "Săn mây đỉnh đồi ngoại ô", note: "Mang theo áo khoác dày vì nhiệt độ sáng sớm khá lạnh." },
        { time: "18:00", location: "Tiệc nướng BBQ củi than tại homestay", note: "Đã đặt trước chủ nhà chuẩn bị khoai lùi." }
      ]
    }
  ]);
  const [scheduleName, setScheduleName] = useState('');
  
  // KHẮC PHỤC DỨT ĐIỂM TRANG TRẮNG: Luôn mồi sẵn 1 object cấu trúc chuỗi trống rỗng cho mảng input ban đầu
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

  // LOGIC ĐIỀU PHỐI (HANDLERS)
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
      alert("Hủy đơn đặt phòng thành công!");
    } catch (error) {
      alert(error.message || "Không hủy được đơn đặt phòng");
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
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserInfo(prev => ({ ...prev, avatar: imageUrl }));
      setTempInfo(prev => ({ ...prev, avatar: imageUrl }));
    }
  };

  const handleSaveInfo = (e) => {
    e.preventDefault();
    setUserInfo({ ...tempInfo });
    setIsEditing(false);
    alert("Cập nhật thông tin thành công!");
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
        
        {/* VIEW 1: TRANG DASHBOARD TỔNG QUAN */}
        {currentView === 'dashboard' && (
          <ProfileDashboard 
            userInfo={userInfo} fileInputRef={fileInputRef} handleAvatarChange={handleAvatarChange}
            setCurrentView={setCurrentView} setIsEditing={setIsEditing} mySchedulesCount={mySchedules.length}
          />
        )}

        {/* VIEW 2: TRANG CHI TIẾT PHÂN HỆ DẠNG LIST */}
        {currentView !== 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8 pt-10 items-start">
            
            <ProfileSidebar currentView={currentView} setCurrentView={setCurrentView} setIsEditing={setIsEditing} userInfo={userInfo} />

            <main className="lg:col-span-3 bg-white p-6 md:p-8 rounded-3xl border border-[#6E473B]/10 shadow-sm min-h-[520px]">
              {currentView === 'info' && <AccountInfo isEditing={isEditing} setIsEditing={setIsEditing} tempInfo={tempInfo} setTempInfo={setTempInfo} handleSaveInfo={handleSaveInfo} />}
              {currentView === 'bookings' && <>
                {bookingError && <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{bookingError}</div>}
                <BookingManager bookings={bookings} bookingFilter={bookingFilter} setBookingFilter={setBookingFilter} setSelectedBooking={setSelectedBooking} handleCancelBooking={handleCancelBooking} onSubmitReview={handleSubmitReview} reviews={reviews} onViewReview={handleViewReview} />
              </>}
              {currentView === 'payment' && <PaymentManager cards={cards} showAddCard={showAddCard} setShowAddCard={setShowAddCard} newCard={newCard} setNewCard={setNewCard} handleAddCard={handleAddCard} />}
              {currentView === 'transactions' && <TransactionHistory transactions={transactions} />}
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