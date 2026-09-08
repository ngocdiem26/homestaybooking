import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineHome,
  HiOutlineUser,
  HiOutlineUsers,
} from 'react-icons/hi';
import AdminLayout from '../../layouts/AdminLayout';
import ModalPortal from '../../components/common/ModalPortal';
import Pagination from '../../components/common/Pagination';
import ManagementBackButton from '../../components/common/ManagementBackButton';
import ManagementHeaderRow from '../../components/common/ManagementHeaderRow';
import ManagementToolbar from '../../components/common/ManagementToolbar';
import { isWithinDateFilter, pickDateValue } from '../../utils/dateFilter';
import { confirmAdminBookingPayment, getAdminBookings, updateAdminBookingStatus } from '../../services/bookingService';

const ITEMS_PER_PAGE = 6;

const STATUS_FILTERS = [
  ['ALL', 'Tất cả'],
  ['PENDING', 'Chờ duyệt'],
  ['CONFIRMED', 'Đã xác nhận'],
  ['COMPLETED', 'Hoàn thành'],
  ['CANCELLED', 'Đã hủy'],
];

const PAYMENT_FILTERS = [
  ['ALL', 'Tất cả thanh toán'],
  ['PENDING', 'Chờ thanh toán'],
  ['PAID', 'Đã thanh toán'],
  ['EXPIRED', 'Quá hạn'],
  ['FAILED', 'Lỗi thanh toán'],
];

function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN') + ' đ';
}

function formatDate(value) {
  if (!value) return '--';
  return new Date(value + 'T00:00:00').toLocaleDateString('vi-VN');
}

function formatDateTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function isPastCheckInDate(value) {
  if (!value) return false;
  const checkIn = new Date(value + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return checkIn < today;
}

function getDisplayStatus(booking) {
  const bookingStatus = String(booking.bookingStatus || '').toUpperCase();
  const paymentStatus = String(booking.paymentStatus || '').toUpperCase();
  if (['CANCELLED', 'EXPIRED', 'NO_SHOW'].includes(bookingStatus)) return 'Đã hủy';
  if (bookingStatus === 'COMPLETED') return 'Hoàn thành';
  if (paymentStatus === 'PAID' && isPastCheckInDate(booking.checkInDate)) return 'Hoàn thành';
  if (bookingStatus === 'CONFIRMED' || paymentStatus === 'PAID') return 'Đã xác nhận';
  return 'Chờ duyệt';
}

function getStatusKey(booking) {
  const label = getDisplayStatus(booking);
  if (label === 'Đã xác nhận') return 'CONFIRMED';
  if (label === 'Hoàn thành') return 'COMPLETED';
  if (label === 'Đã hủy') return 'CANCELLED';
  return 'PENDING';
}

function getPaymentLabel(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'PAID') return 'Đã thanh toán';
  if (normalized === 'REFUNDED') return 'Đã hoàn tiền';
  if (normalized === 'FAILED') return 'Lỗi thanh toán';
  if (normalized === 'EXPIRED') return 'Quá hạn';
  return 'Chờ thanh toán';
}

function getPaymentKey(status) {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'PAID') return 'PAID';
  if (normalized === 'EXPIRED') return 'EXPIRED';
  if (normalized === 'FAILED') return 'FAILED';
  if (normalized === 'REFUNDED') return 'REFUNDED';
  return 'PENDING';
}

function getPaymentMethodLabel(method) {
  const normalized = String(method || '').toUpperCase();
  if (normalized === 'VNPAY') return 'VNPay';
  if (normalized === 'PAY_AT_PROPERTY') return 'Thanh toán tại chỗ';
  return method || 'Chưa chọn';
}

function toBackendStatus(label) {
  if (label === 'Đã xác nhận') return 'CONFIRMED';
  if (label === 'Hoàn thành') return 'COMPLETED';
  if (label === 'Đã hủy') return 'CANCELLED';
  return 'PAYMENT_PENDING';
}

function mapBooking(apiBooking) {
  return {
    ...apiBooking,
    id: apiBooking.bookingCode || ('BK' + apiBooking.bookingId),
    statusLabel: getDisplayStatus(apiBooking),
    statusKey: getStatusKey(apiBooking),
    paymentLabel: getPaymentLabel(apiBooking.paymentStatus),
    paymentKey: getPaymentKey(apiBooking.paymentStatus),
    paymentMethodLabel: getPaymentMethodLabel(apiBooking.paymentMethod),
    createdAtLabel: formatDateTime(apiBooking.createdAt),
    checkInLabel: formatDate(apiBooking.checkInDate),
    checkOutLabel: formatDate(apiBooking.checkOutDate),
    totalPriceLabel: formatMoney(apiBooking.totalPrice),
    unitPriceLabel: formatMoney(apiBooking.unitPrice),
    roomTotalLabel: formatMoney(apiBooking.roomTotal),
    serviceTotalLabel: formatMoney(apiBooking.serviceTotal),
    discountAmountLabel: formatMoney(apiBooking.discountAmount),
    customerName: apiBooking.customerName || 'Khách hàng',
    customerEmail: apiBooking.customerEmail || '--',
    customerPhone: apiBooking.customerPhone || '--',
    hostName: apiBooking.hostName || 'Chủ homestay',
    hostEmail: apiBooking.hostEmail || '--',
    hostPhone: apiBooking.hostPhone || '--',
  };
}

function StatusBadge({ booking }) {
  const styles = {
    PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
    CONFIRMED: 'border-blue-200 bg-blue-50 text-blue-700',
    COMPLETED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    CANCELLED: 'border-red-200 bg-red-50 text-red-700',
  };
  return <span className={'inline-flex rounded-full border px-3 py-1 text-[11px] font-black ' + (styles[booking.statusKey] || styles.PENDING)}>{booking.statusLabel}</span>;
}

function PaymentBadge({ booking }) {
  const styles = {
    PAID: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
    EXPIRED: 'border-gray-200 bg-gray-100 text-gray-600',
    FAILED: 'border-red-200 bg-red-50 text-red-700',
    REFUNDED: 'border-blue-200 bg-blue-50 text-blue-700',
  };
  return <span className={'inline-flex rounded-full border px-3 py-1 text-[11px] font-black ' + (styles[booking.paymentKey] || styles.PENDING)}>{booking.paymentLabel}</span>;
}

function InfoTile({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-[#F8F6F0] p-4">
      <p className="flex items-center gap-1.5 text-xs font-black uppercase text-gray-400">{Icon && <Icon className="h-4 w-4" />}{label}</p>
      <p className="mt-1 font-black text-[#2C1E15]">{value || '--'}</p>
    </div>
  );
}

function BookingDetailModal({ booking, onClose, onUpdateStatus, onConfirmPayment }) {
  const services = booking.services || [];
  const canConfirm = booking.paymentMethodLabel === 'Thanh toán tại chỗ' && booking.paymentKey === 'PENDING' && ['CONFIRMED', 'COMPLETED'].includes(booking.statusKey);

  return (
    <ModalPortal className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-fade-in" onBackdropClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-white text-left text-sm font-semibold shadow-2xl">
        <header className="flex items-start justify-between gap-4 bg-[#202c3c] px-6 py-5 text-white">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E3B17A]">Chi tiết đơn đặt phòng</p>
            <h3 className="mt-1 font-classic text-2xl font-black">{booking.homestayName}</h3>
            <p className="mt-1 font-mono text-xs text-white/70">{booking.id}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white hover:text-[#202c3c]">×</button>
        </header>

        <div className="max-h-[calc(92vh-92px)] overflow-y-auto p-6">
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="overflow-hidden rounded-2xl bg-[#F4F1EA]">
              {booking.imageUrl ? <img src={booking.imageUrl} alt={booking.homestayName} className="h-56 w-full object-cover lg:h-full" /> : <div className="flex h-56 items-center justify-center text-gray-400">Không có ảnh</div>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile icon={HiOutlineUser} label="Khách hàng" value={booking.customerName} />
              <InfoTile icon={HiOutlineHome} label="Chủ homestay" value={booking.hostName} />
              <InfoTile icon={HiOutlineCalendar} label="Nhận phòng" value={booking.checkInLabel} />
              <InfoTile icon={HiOutlineCalendar} label="Trả phòng" value={booking.checkOutLabel} />
              <InfoTile icon={HiOutlineUsers} label="Số khách" value={(booking.numberOfGuest || 1) + ' khách'} />
              <InfoTile icon={HiOutlineClock} label="Thời gian tạo" value={booking.createdAtLabel} />
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-4">
              <h4 className="font-black text-[#2C1E15]">Thông tin lưu trú</h4>
              <div className="mt-3 space-y-2 text-gray-600">
                <p><span className="text-gray-400">Mã homestay:</span> <span className="font-black text-[#2C1E15]">{booking.homestayCode}</span></p>
                <p><span className="text-gray-400">Địa chỉ:</span> <span className="text-gray-800">{booking.homestayAddress || booking.province}</span></p>
                <p><span className="text-gray-400">Trạng thái đơn:</span> <StatusBadge booking={booking} /></p>
                <p><span className="text-gray-400">Thanh toán:</span> <PaymentBadge booking={booking} /></p>
                <p><span className="text-gray-400">Phương thức:</span> <span className="font-black text-[#2C1E15]">{booking.paymentMethodLabel}</span></p>
                {booking.note && <p><span className="text-gray-400">Ghi chú:</span> <span className="italic text-gray-700">{booking.note}</span></p>}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <div className="bg-[#F8F6F0] px-4 py-3 font-black text-[#2C1E15]">Bảng giá</div>
              <div className="divide-y divide-gray-100 text-sm">
                <div className="flex justify-between px-4 py-3"><span>Giá mỗi đêm</span><strong>{booking.unitPriceLabel}</strong></div>
                <div className="flex justify-between px-4 py-3"><span>Tiền phòng ({booking.numberOfNights || 1} đêm)</span><strong>{booking.roomTotalLabel}</strong></div>
                <div className="flex justify-between px-4 py-3"><span>Dịch vụ thêm</span><strong>{booking.serviceTotalLabel}</strong></div>
                <div className="flex justify-between px-4 py-3 text-emerald-700"><span>Giảm giá</span><strong>- {booking.discountAmountLabel}</strong></div>
                <div className="flex justify-between bg-[#2C3E2B] px-4 py-4 text-base text-white"><span>Tổng cộng</span><strong>{booking.totalPriceLabel}</strong></div>
              </div>
            </section>
          </div>

          <section className="mt-5 rounded-2xl border border-gray-100 bg-white p-4">
            <h4 className="font-black text-[#2C1E15]">Dịch vụ đi kèm</h4>
            {services.length ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {services.map((service, index) => (
                  <div key={service.homestayServiceId || index} className="flex items-center justify-between rounded-xl bg-[#F8F6F0] px-4 py-3">
                    <div><p className="font-black text-[#2C1E15]">{service.serviceName}</p><p className="text-xs text-gray-400">x{service.quantity} · {formatMoney(service.unitPrice)}</p></div>
                    <strong className="text-[#6E473B]">{formatMoney(service.totalPrice)}</strong>
                  </div>
                ))}
              </div>
            ) : <p className="mt-2 text-gray-400">Khách không chọn dịch vụ thêm.</p>}
          </section>

          <section className="mt-5 rounded-2xl border border-gray-100 bg-white p-4">
            <h4 className="font-black text-[#2C1E15]">Liên hệ</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-[#F8F6F0] p-4"><p className="text-xs font-black uppercase text-gray-400">Khách hàng</p><p className="mt-1 font-black text-[#2C1E15]">{booking.customerEmail}</p><p className="text-xs text-gray-500">{booking.customerPhone}</p></div>
              <div className="rounded-xl bg-[#F8F6F0] p-4"><p className="text-xs font-black uppercase text-gray-400">Chủ homestay</p><p className="mt-1 font-black text-[#2C1E15]">{booking.hostEmail}</p><p className="text-xs text-gray-500">{booking.hostPhone}</p></div>
            </div>
          </section>

          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
            {booking.statusKey === 'PENDING' && <button type="button" onClick={() => onUpdateStatus(booking, 'Đã xác nhận')} className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow transition hover:bg-emerald-700">Duyệt đơn</button>}
            {booking.statusKey === 'CONFIRMED' && <button type="button" onClick={() => onUpdateStatus(booking, 'Hoàn thành')} className="rounded-2xl bg-[#2C3E2B] px-5 py-3 text-sm font-black text-white shadow transition hover:bg-[#223322]">Hoàn thành</button>}
            {canConfirm && <button type="button" onClick={() => onConfirmPayment(booking)} className="rounded-2xl bg-amber-100 px-5 py-3 text-sm font-black text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-200">Đã thanh toán</button>}
            {!['CANCELLED', 'COMPLETED'].includes(booking.statusKey) && <button type="button" onClick={() => onUpdateStatus(booking, 'Đã hủy')} className="rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-600 ring-1 ring-red-100 transition hover:bg-red-100">Hủy đơn</button>}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export default function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await getAdminBookings();
      setBookings(Array.isArray(data) ? data.map(mapBooking) : []);
    } catch (error) {
      setErrorMessage(error.message || 'Không tải được danh sách đơn đặt phòng');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesStatus = statusFilter === 'ALL' || booking.statusKey === statusFilter;
      const matchesPayment = paymentFilter === 'ALL' || booking.paymentKey === paymentFilter;
      const matchesDate = isWithinDateFilter(pickDateValue(booking, ['createdAt', 'createdAtLabel', 'checkInDate']), dateFilter, dateFrom, dateTo);
      const matchesSearch = !keyword || [booking.id, booking.customerName, booking.customerEmail, booking.customerPhone, booking.hostName, booking.homestayName, booking.homestayCode, booking.province]
        .some((value) => String(value || '').toLowerCase().includes(keyword));
      return matchesStatus && matchesPayment && matchesDate && matchesSearch;
    });
  }, [bookings, dateFilter, dateFrom, dateTo, paymentFilter, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / ITEMS_PER_PAGE));
  const indexOfFirstItem = (currentPage - 1) * ITEMS_PER_PAGE;
  const indexOfLastItem = indexOfFirstItem + ITEMS_PER_PAGE;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((booking) => booking.statusKey === 'PENDING').length,
    completed: bookings.filter((booking) => booking.statusKey === 'COMPLETED').length,
    revenue: bookings.filter((booking) => booking.paymentKey === 'PAID').reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0),
  }), [bookings]);

  const replaceBooking = (updatedBooking) => {
    const mapped = mapBooking(updatedBooking);
    setBookings((current) => current.map((booking) => booking.bookingId === mapped.bookingId ? mapped : booking));
    setSelectedBooking((current) => current?.bookingId === mapped.bookingId ? mapped : current);
  };

  const handleUpdateStatus = async (booking, nextStatusLabel) => {
    try {
      setErrorMessage('');
      const updated = await updateAdminBookingStatus(booking.bookingId, toBackendStatus(nextStatusLabel));
      replaceBooking(updated);
    } catch (error) {
      setErrorMessage(error.message || 'Không cập nhật được trạng thái đơn');
    }
  };

  const handleConfirmPayment = async (booking) => {
    try {
      setErrorMessage('');
      const updated = await confirmAdminBookingPayment(booking.bookingId);
      replaceBooking(updated);
    } catch (error) {
      setErrorMessage(error.message || 'Không xác nhận được thanh toán');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPaymentFilter('ALL');
    setDateFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    loadBookings();
  };

  return (
    <AdminLayout>
      <div className="space-y-5 text-left text-sm animate-fade-in">
        <ManagementHeaderRow backButton={<ManagementBackButton onClick={() => navigate('/admin')} />}>
          <section className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#2C3E2B]/5 bg-[#2C3E2B]/10 text-[#2C3E2B] shadow-inner">
                <HiOutlineClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-classic text-2xl font-black text-[#2C1E15]">Quản lý đơn đặt phòng</h2>
                <p className="mt-0.5 max-w-2xl text-xs font-semibold leading-relaxed text-gray-400">Theo dõi toàn bộ đơn đặt homestay, trạng thái thanh toán, thông tin khách hàng và hỗ trợ xử lý đơn trên hệ thống Cozygo.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-black md:grid-cols-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"><p className="text-gray-400">Tất cả</p><p className="mt-1 text-lg text-[#2C1E15]">{stats.total}</p></div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3"><p className="text-amber-600">Chờ duyệt</p><p className="mt-1 text-lg text-amber-700">{stats.pending}</p></div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3"><p className="text-emerald-600">Hoàn thành</p><p className="mt-1 text-lg text-emerald-700">{stats.completed}</p></div>
              <div className="rounded-xl border border-[#2C3E2B]/10 bg-[#2C3E2B]/5 px-4 py-3"><p className="text-[#2C3E2B]">Doanh thu</p><p className="mt-1 text-lg text-[#2C3E2B]">{formatMoney(stats.revenue)}</p></div>
            </div>
          </div>
        </section>
        </ManagementHeaderRow>
        <ManagementToolbar
          filters={[
            {
              label: 'Trạng thái',
              value: statusFilter,
              onChange: (value) => { setStatusFilter(value); setCurrentPage(1); },
              options: STATUS_FILTERS.map(([value, label]) => ({ value, label })),
            },
            {
              label: 'Thanh toán',
              value: paymentFilter,
              onChange: (value) => { setPaymentFilter(value); setCurrentPage(1); },
              options: PAYMENT_FILTERS.map(([value, label]) => ({ value, label })),
            },
          ]}
          dateFilter={dateFilter}
          onDateFilterChange={(value) => { setDateFilter(value); setCurrentPage(1); }}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={(value) => { setDateFrom(value); setCurrentPage(1); }}
          onDateToChange={(value) => { setDateTo(value); setCurrentPage(1); }}
          searchValue={searchTerm}
          onSearchChange={(value) => { setSearchTerm(value); setCurrentPage(1); }}
          searchPlaceholder="Tìm mã đơn, khách, chủ nhà, homestay..."
          onReset={resetFilters}
        />

        {errorMessage && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">{errorMessage}</div>}

        <section className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] table-fixed text-left">
              <thead className="border-b border-gray-200 bg-gray-50/80 text-xs font-black uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-[12%] px-4 py-4">Mã đơn</th>
                  <th className="w-[18%] px-4 py-4">Khách hàng</th>
                  <th className="w-[19%] px-4 py-4">Homestay</th>
                  <th className="w-[12%] px-4 py-4">Thời gian</th>
                  <th className="w-[12%] px-4 py-4">Tổng tiền</th>
                  <th className="w-[11%] px-4 py-4 text-center">Trạng thái</th>
                  <th className="w-[10%] px-4 py-4 text-center">Thanh toán</th>
                  <th className="w-[6%] px-4 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-semibold text-gray-600">
                {isLoading ? (
                  <tr><td colSpan="8" className="p-8 text-center text-gray-400">Đang tải danh sách đơn đặt phòng...</td></tr>
                ) : currentItems.length ? currentItems.map((booking) => (
                  <tr key={booking.bookingId} className="transition hover:bg-gray-50/60">
                    <td className="px-4 py-4"><p className="font-mono text-xs font-black text-[#6E473B]">{booking.id}</p><p className="mt-1 text-[11px] text-gray-400">#{booking.bookingId}</p></td>
                    <td className="px-4 py-4"><p className="truncate font-black text-[#2C1E15]">{booking.customerName}</p><p className="mt-0.5 truncate text-[11px] text-gray-400">{booking.customerEmail}</p></td>
                    <td className="px-4 py-4"><p className="truncate font-black text-[#2C1E15]">{booking.homestayName}</p><p className="mt-0.5 truncate text-[11px] text-[#6E473B]">{booking.province} · {booking.hostName}</p></td>
                    <td className="px-4 py-4 text-xs"><p className="font-black text-gray-700">{booking.checkInLabel}</p><p className="text-gray-400">đến {booking.checkOutLabel}</p></td>
                    <td className="px-4 py-4"><p className="font-black text-[#2C1E15]">{booking.totalPriceLabel}</p><p className="mt-0.5 text-[11px] text-gray-400">{booking.numberOfGuest} khách · {booking.numberOfNights} đêm</p></td>
                    <td className="px-4 py-4 text-center"><StatusBadge booking={booking} /></td>
                    <td className="px-4 py-4 text-center"><PaymentBadge booking={booking} /></td>
                    <td className="px-4 py-4 text-right"><button type="button" onClick={() => setSelectedBooking(booking)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-[#2C3E2B] shadow-sm transition hover:bg-[#2C3E2B] hover:text-white"><HiOutlineEye className="h-5 w-5" /></button></td>
                  </tr>
                )) : (
                  <tr><td colSpan="8" className="p-8 text-center text-gray-400">Không có đơn đặt phòng phù hợp.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} totalItems={filteredBookings.length} indexOfFirstItem={indexOfFirstItem} indexOfLastItem={indexOfLastItem} itemName="đơn đặt" />
        </section>

        {selectedBooking && (
          <BookingDetailModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onUpdateStatus={handleUpdateStatus}
            onConfirmPayment={handleConfirmPayment}
          />
        )}
      </div>
    </AdminLayout>
  );
}





