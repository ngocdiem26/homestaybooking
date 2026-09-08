import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HostLayout from '../../layouts/HostLayout';
import { getHostBookings } from '../../services/bookingService';
import { getHostComplaints } from '../../services/complaintService';
import { getHostHomestays } from '../../services/hostHomestayService';
import { getHostRevenue } from '../../services/hostRevenueService';
import { getHostReviews } from '../../services/reviewService';

const numberValue = (value) => Number(value || 0);

const listOf = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const toIsoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const currentMonthRange = () => {
  const now = new Date();
  return {
    fromDate: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    toDate: toIsoDate(now),
  };
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  })
    .format(numberValue(value))
    .replace('₫', 'đ');

function SvgIcon({ children, className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const Icons = {
  home: (props) => (
    <SvgIcon {...props}>
      <path d="M3 11 12 4l9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </SvgIcon>
  ),
  calendar: (props) => (
    <SvgIcon {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
    </SvgIcon>
  ),
  revenue: (props) => (
    <SvgIcon {...props}>
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
    </SvgIcon>
  ),
  review: (props) => (
    <SvgIcon {...props}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </SvgIcon>
  ),
  alert: (props) => (
    <SvgIcon {...props}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </SvgIcon>
  ),
  arrow: (props) => (
    <SvgIcon {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </SvgIcon>
  ),
};

function statusOf(item) {
  return String(item?.bookingStatus || item?.statusKey || item?.status || '').toUpperCase();
}

function complaintStatusOf(item) {
  return String(item?.status || item?.complaintStatus || '').toUpperCase();
}

export default function HostDashboard() {
  const navigate = useNavigate();
  const [homestays, setHomestays] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage('');

      const range = currentMonthRange();
      const [homestayResult, bookingResult, revenueResult, reviewResult, complaintResult] = await Promise.allSettled([
        getHostHomestays(),
        getHostBookings(),
        getHostRevenue(range),
        getHostReviews(),
        getHostComplaints(),
      ]);

      if (!mounted) return;

      if (homestayResult.status === 'fulfilled') setHomestays(listOf(homestayResult.value));
      if (bookingResult.status === 'fulfilled') setBookings(listOf(bookingResult.value));
      if (revenueResult.status === 'fulfilled') setRevenue(revenueResult.value || null);
      if (reviewResult.status === 'fulfilled') setReviews(listOf(reviewResult.value));
      if (complaintResult.status === 'fulfilled') setComplaints(listOf(complaintResult.value));

      const failed = [homestayResult, bookingResult, revenueResult, reviewResult, complaintResult].some((result) => result.status === 'rejected');
      if (failed) {
        setErrorMessage('Một vài thống kê chưa tải được. Vui lòng kiểm tra backend rồi bấm làm mới trang.');
      }

      setIsLoading(false);
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const statsData = useMemo(() => {
    const pendingBookings = bookings.filter((booking) => {
      const status = statusOf(booking);
      return status.includes('PENDING') || status.includes('WAITING') || status.includes('CHO_DUYET');
    }).length;

    const openComplaints = complaints.filter((complaint) => {
      const status = complaintStatusOf(complaint);
      return !['RESOLVED', 'REJECTED', 'CLOSED', 'DONE'].includes(status);
    }).length;

    const newReviews = reviews.filter((review) => !review.replyContent && !review.hostReply && !review.reply).length || reviews.length;
    const hostRevenue = revenue?.totalHostRevenue ?? revenue?.totalRevenue ?? revenue?.retainedBookingAmount ?? 0;

    return [
      { id: 'homestays', label: 'Homestay đang quản lý', count: homestays.length, tag: 'Tài sản', Icon: Icons.home, tone: 'text-blue-700 bg-blue-50 ring-blue-100' },
      { id: 'pending', label: 'Đơn chờ xác nhận', count: pendingBookings, tag: 'Cần xử lý', Icon: Icons.calendar, tone: 'text-amber-700 bg-amber-50 ring-amber-100' },
      { id: 'revenue', label: 'Doanh thu khả dụng', count: formatCurrency(hostRevenue), tag: 'Tháng này', Icon: Icons.revenue, tone: 'text-emerald-700 bg-emerald-50 ring-emerald-100', isCurrency: true },
      { id: 'reviews', label: 'Đánh giá mới', count: newReviews, tag: 'Phản hồi', Icon: Icons.review, tone: 'text-violet-700 bg-violet-50 ring-violet-100' },
      { id: 'complaints', label: 'Khiếu nại mở', count: openComplaints, tag: 'Ưu tiên', Icon: Icons.alert, tone: 'text-red-700 bg-red-50 ring-red-100' },
    ];
  }, [bookings, complaints, homestays.length, revenue, reviews]);

  const quickModules = [
    { id: 'homestays', title: 'Quản lý Homestay', desc: 'Cập nhật thông tin, ảnh, tiện nghi, dịch vụ và quy tắc riêng cho từng homestay bạn đang sở hữu.', Icon: Icons.home, btnText: 'Vào quản lý', path: '/host/homestays', color: 'text-blue-700 bg-blue-50 ring-blue-100' },
    { id: 'availability', title: 'Quản lý lịch trống', desc: 'Thiết lập ngày còn trống, tạm khóa hoặc bảo trì để đồng bộ với tìm kiếm và tránh khách đặt trùng lịch.', Icon: Icons.calendar, btnText: 'Cập nhật lịch', path: '/host/availability', color: 'text-emerald-700 bg-emerald-50 ring-emerald-100' },
    { id: 'bookings', title: 'Đơn đặt Homestay', desc: 'Xem đơn đặt phòng mới, xác nhận lưu trú, theo dõi trạng thái nhận/trả phòng và tổng tiền của khách.', Icon: Icons.calendar, btnText: 'Vào quản lý đơn', path: '/host/bookings', color: 'text-amber-700 bg-amber-50 ring-amber-100' },
    { id: 'revenue', title: 'Quản lý Doanh thu', desc: 'Thống kê chi tiết tài chính, số tiền thực nhận sau chiết khấu sàn, biểu đồ tăng trưởng và lịch sử phí duy trì.', Icon: Icons.revenue, btnText: 'Xem doanh thu', path: '/host/revenue', color: 'text-[#8A4F3D] bg-[#F8EEE8] ring-[#E9CEC0]' },
    { id: 'reviews', title: 'Quản lý Đánh giá', desc: 'Đọc nhận xét của khách hàng đã lưu trú, theo dõi điểm số sao trung bình và viết phản hồi công khai.', Icon: Icons.review, btnText: 'Xem đánh giá', path: '/host/reviews', color: 'text-violet-700 bg-violet-50 ring-violet-100' },
    { id: 'complaints', title: 'Quản lý Khiếu nại', desc: 'Tiếp nhận phản ánh từ khách về sự cố phát sinh, ghi nhận hướng xử lý hoàn cọc hoặc đền bù tổn thất.', Icon: Icons.alert, btnText: 'Kiểm tra', path: '/host/complaints', color: 'text-red-700 bg-red-50 ring-red-100' },
  ];

  return (
    <HostLayout currentTab="dashboard">
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col justify-between gap-4 rounded-3xl border border-gray-200/70 bg-white p-6 shadow-[0_10px_28px_rgba(44,30,21,0.08)] sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#6E473B]">OWNER WORKSPACE</p>
            <h2 className="font-serif text-2xl font-bold text-[#2C1E15] md:text-3xl">Bảng điều khiển chủ homestay</h2>
            <p className="text-xs font-medium text-gray-400 md:text-sm">Theo dõi tài sản, đơn đặt phòng, doanh thu, đánh giá và khiếu nại của các homestay đang vận hành.</p>
          </div>
          {/* <button
            type="button"
            onClick={() => navigate('/host/homestays')}
            className="shrink-0 cursor-pointer rounded-xl border-none bg-[#2C3E2B] px-5 py-3 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#1f2d20] hover:shadow-lg active:scale-95 sm:self-auto"
          >
            + Thêm homestay
          </button> */}
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-700 shadow-sm">
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {statsData.map((stat) => {
            const Icon = stat.Icon;
            return (
              <div
                key={stat.id}
                className="group relative flex h-40 flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/70 bg-white p-5 shadow-[0_10px_24px_rgba(44,30,21,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#2C3E2B]/25 hover:shadow-[0_18px_40px_rgba(44,30,21,0.15)]"
              >
                <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-[#F4F1EA]/70 transition group-hover:scale-125" />
                <div className="relative flex w-full items-center justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-inner ring-1 ${stat.tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full border border-gray-100 bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight text-gray-400">
                    {stat.tag}
                  </span>
                </div>

                <div className="relative mt-auto space-y-1">
                  <h4 className={`truncate font-mono font-black leading-none tracking-tight text-[#2C1E15] ${stat.isCurrency ? 'text-lg md:text-xl' : 'text-3xl md:text-4xl'}`}>
                    {isLoading ? '...' : stat.count}
                  </h4>
                  <p className="truncate text-[11px] font-bold text-gray-400 md:text-xs">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </section>

        <section className="space-y-6">
          <h3 className="border-l-4 border-[#6E473B] pl-2.5 font-serif text-lg font-bold text-[#2C1E15]">
            Danh mục quản lý hệ thống
          </h3>

          <div className="flex w-full flex-wrap justify-center gap-6">
            {quickModules.map((module) => {
              const Icon = module.Icon;
              return (
                <div
                  key={module.id}
                  onClick={() => navigate(module.path)}
                  className="group relative flex h-64 w-full min-w-[280px] cursor-pointer flex-col justify-between rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_10px_26px_rgba(44,30,21,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2C3E2B]/25 hover:shadow-[0_20px_46px_rgba(44,30,21,0.14)] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                  <span className="absolute right-5 top-5 text-gray-300 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#2C3E2B]">
                    <Icons.arrow className="h-4 w-4" />
                  </span>

                  <div className="space-y-4">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner ring-1 transition group-hover:scale-105 ${module.color}`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="space-y-1.5">
                      <h4 className="inline-block border-b-2 border-transparent pb-0.5 text-base font-extrabold text-[#2C1E15] transition group-hover:text-[#2C3E2B]">
                        {module.title}
                      </h4>
                      <p className="line-clamp-3 text-xs font-medium leading-relaxed text-gray-500">
                        {module.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-start pt-2">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(module.path);
                      }}
                      className="cursor-pointer rounded-xl border-none bg-[#2C3E2B] px-4 py-2 text-[11px] font-bold text-white shadow-md transition hover:bg-[#1f2d20] hover:shadow-lg active:scale-95"
                    >
                      {module.btnText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </HostLayout>
  );
}
