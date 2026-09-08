import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { getAdminHomestays } from '../../services/adminHomestayService';
import { getAdminRevenueSummary } from '../../services/adminRevenueService';
import { getAdminUsers } from '../../services/adminUserService';

const todayIso = () => new Date().toISOString().slice(0, 10);

const numberValue = (value) => Number(value || 0);

const listOf = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  })
    .format(numberValue(value))
    .replace('₫', 'đ');

function roleOf(user) {
  return String(user?.roleName || user?.role?.roleName || user?.role || user?.roleCode || '').toUpperCase();
}

function SvgIcon({ children, className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const Icons = {
  users: (props) => (
    <SvgIcon {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </SvgIcon>
  ),
  host: (props) => (
    <SvgIcon {...props}>
      <path d="M3 11 12 4l9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </SvgIcon>
  ),
  homestay: (props) => (
    <SvgIcon {...props}>
      <path d="M4 20h16" />
      <path d="M6 20V9l6-5 6 5v11" />
      <path d="M9 20v-6h6v6" />
      <path d="M8 11h.01" />
      <path d="M16 11h.01" />
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
  complaint: (props) => (
    <SvgIcon {...props}>
      <path d="M12 3v18" />
      <path d="m5 8 7-5 7 5" />
      <path d="M5 8 2 15h6z" />
      <path d="m19 8-3 7h6z" />
      <path d="M8 21h8" />
    </SvgIcon>
  ),
  promo: (props) => (
    <SvgIcon {...props}>
      <path d="M4 9V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
      <path d="M4 9a3 3 0 0 1 0 6" />
      <path d="M20 9a3 3 0 0 0 0 6" />
      <path d="M9 9h.01" />
      <path d="m15 9-6 6" />
      <path d="M15 15h.01" />
    </SvgIcon>
  ),
  booking: (props) => (
    <SvgIcon {...props}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </SvgIcon>
  ),
  arrow: (props) => (
    <SvgIcon {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </SvgIcon>
  ),
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage('');

      const [usersResult, homestaysResult, revenueResult] = await Promise.allSettled([
        getAdminUsers(),
        getAdminHomestays(),
        getAdminRevenueSummary({ fromDate: '1970-01-01', toDate: todayIso() }),
      ]);

      if (!mounted) return;

      if (usersResult.status === 'fulfilled') setUsers(listOf(usersResult.value));
      if (homestaysResult.status === 'fulfilled') setHomestays(listOf(homestaysResult.value));
      if (revenueResult.status === 'fulfilled') setRevenue(revenueResult.value || null);

      const failed = [usersResult, homestaysResult, revenueResult].some((result) => result.status === 'rejected');
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

  const stats = useMemo(() => {
    const customerCount = users.filter((user) => {
      const role = roleOf(user);
      return role.includes('CUSTOMER') || role.includes('KHACH');
    }).length;

    const hostCount = users.filter((user) => {
      const role = roleOf(user);
      return role.includes('HOST') || role.includes('CHU');
    }).length;

    const platformRevenue =
      revenue?.totalPlatformRevenue ??
      numberValue(revenue?.commissionRevenue) + numberValue(revenue?.maintenanceRevenue);

    return [
      {
        id: 'customers',
        label: 'Khách hàng',
        count: customerCount,
        Icon: Icons.users,
        tone: 'from-sky-50 to-blue-50 text-blue-700 ring-blue-100',
      },
      {
        id: 'hosts',
        label: 'Chủ nhà',
        count: hostCount,
        Icon: Icons.host,
        tone: 'from-amber-50 to-orange-50 text-amber-700 ring-amber-100',
      },
      {
        id: 'homestays',
        label: 'Homestay',
        count: homestays.length,
        Icon: Icons.homestay,
        tone: 'from-emerald-50 to-green-50 text-emerald-700 ring-emerald-100',
      },
      {
        id: 'revenue',
        label: 'Doanh thu hệ thống',
        count: formatCurrency(platformRevenue),
        Icon: Icons.revenue,
        tone: 'from-rose-50 to-orange-50 text-[#8A4F3D] ring-orange-100',
      },
    ];
  }, [homestays.length, revenue, users]);

  const managementModules = [
    { title: 'Quản lý Người dùng', desc: 'Xem danh sách, phân quyền tài khoản khách lữ hành và đối tác chủ nhà, khóa hoặc kích hoạt tài khoản vi phạm.', Icon: Icons.users, path: '/admin/users', btnText: 'Vào quản lý', color: 'text-blue-700 bg-blue-50 ring-blue-100' },
    { title: 'Quản lý Homestay', desc: 'Kiểm duyệt các căn hộ gỗ, bungalow mới đăng ký, quản lý danh sách phòng đang hoạt động trên toàn hệ thống.', Icon: Icons.homestay, path: '/admin/homestays', btnText: 'Vào quản lý', color: 'text-emerald-700 bg-emerald-50 ring-emerald-100' },
    { title: 'Quản lý Đánh giá', desc: 'Theo dõi, kiểm tra phản hồi và số sao đánh giá của khách hàng nhằm đảm bảo tính khách quan của cộng đồng.', Icon: Icons.review, path: '/admin/reviews', btnText: 'Xem đánh giá', color: 'text-violet-700 bg-violet-50 ring-violet-100' },
    { title: 'Quản lý Khiếu nại', desc: 'Tiếp nhận và xử lý các tranh chấp, khiếu nại giữa khách hàng và chủ nhà liên quan đến đặt phòng hoặc hoàn tiền.', Icon: Icons.complaint, path: '/admin/complaints', btnText: 'Xử lý khiếu nại', color: 'text-orange-700 bg-orange-50 ring-orange-100' },
    { title: 'Quản lý Khuyến mãi', desc: 'Tạo mới, điều chỉnh thời hạn hoặc thiết lập các mã giảm giá, voucher kích cầu du lịch theo mùa cao điểm.', Icon: Icons.promo, path: '/admin/promotions', btnText: 'Quản lý mã', color: 'text-pink-700 bg-pink-50 ring-pink-100' },
    { title: 'Quản lý Doanh thu', desc: 'Thống kê doanh thu từ hoa hồng booking hoàn thành và phí duy trì host đã thanh toán.', Icon: Icons.revenue, path: '/admin/revenue', btnText: 'Xem doanh thu', color: 'text-[#8A4F3D] bg-[#F8EEE8] ring-[#E9CEC0]' },
    { title: 'Quản lý Đơn đặt phòng', desc: 'Tra cứu toàn bộ lịch sử booking, tình trạng nhận/trả phòng, quản lý các đơn yêu cầu hủy phòng cấp tốc.', Icon: Icons.booking, path: '/admin/bookings', btnText: 'Vào quản lý đơn', color: 'text-slate-700 bg-slate-50 ring-slate-200' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-10 animate-fade-in text-left">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2C1E15]">Bảng điều khiển quản trị</h2>
          <p className="text-xs md:text-sm text-gray-400 font-medium">Quản lý nhanh khách hàng, homestay, đánh giá và theo dõi doanh thu tổng quan.</p>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-bold text-amber-700 shadow-sm">
            {errorMessage}
          </div>
        )}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => {
            const Icon = stat.Icon;
            return (
              <div
                key={stat.id}
                className="group relative overflow-hidden rounded-3xl border border-[#6E473B]/10 bg-white p-5 shadow-[0_10px_24px_rgba(44,30,21,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#6E473B]/25 hover:shadow-[0_18px_40px_rgba(44,30,21,0.16)]"
              >
                <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#F4F1EA]/60 transition group-hover:scale-110" />
                <div className="relative flex items-center gap-4">
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner ring-1 ${stat.tone}`}>
                    <Icon className="h-7 w-7" />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <p className="text-[11px] md:text-xs font-black uppercase tracking-wider text-gray-400">{stat.label}</p>
                    <h4 className="truncate font-mono text-lg font-black tracking-tight text-[#2C1E15] md:text-xl">
                      {isLoading ? '...' : stat.count}
                    </h4>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="space-y-6">
          <h3 className="border-l-4 border-[#6E473B] pl-2.5 font-serif text-lg font-bold text-[#2C1E15]">
            Danh mục quản trị hệ thống
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {managementModules.map((module) => {
              const Icon = module.Icon;
              return (
                <div
                  key={module.path}
                  className="group flex flex-col justify-between gap-5 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_10px_26px_rgba(44,30,21,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#6E473B]/25 hover:shadow-[0_20px_46px_rgba(44,30,21,0.14)]"
                >
                  <div className="flex items-start gap-4">
                    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner ring-1 transition group-hover:scale-105 ${module.color}`}>
                      <Icon className="h-7 w-7" />
                    </span>
                    <div className="space-y-1.5">
                      <h4 className="text-base font-extrabold text-[#2C1E15] transition group-hover:text-[#6E473B]">
                        {module.title}
                      </h4>
                      <p className="text-xs font-medium leading-relaxed text-gray-500">
                        {module.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => navigate(module.path)}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-none bg-[#2C3E2B] px-5 py-2.5 text-xs font-bold text-[#F4F1EA] shadow-md transition hover:bg-[#1f2d20] hover:shadow-lg active:scale-95"
                    >
                      {module.btnText}
                      <Icons.arrow className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
