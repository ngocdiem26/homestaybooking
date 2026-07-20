import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineHome,
  HiOutlineRefresh,
  HiOutlineSparkles,
  HiOutlineTrendingUp,
} from 'react-icons/hi';
import HostLayout from '../../layouts/HostLayout';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import { getHostRevenue } from '../../services/hostRevenueService';

const PAGE_SIZE = 6;

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' đ';
}

function formatCompactMoney(value) {
  const number = Number(value || 0);
  if (number >= 1000000000) return (number / 1000000000).toFixed(1).replace('.0', '') + ' tỷ';
  if (number >= 1000000) return (number / 1000000).toFixed(1).replace('.0', '') + ' tr';
  if (number >= 1000) return (number / 1000).toFixed(0) + 'k';
  return String(number);
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value + 'T00:00:00').toLocaleDateString('vi-VN');
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatPeriod(period, groupBy) {
  if (!period) return '-';
  if (groupBy === 'month') {
    const [year, month] = period.split('-');
    return 'T' + month + '/' + year;
  }
  return new Date(period + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonthIso() {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

function addDaysIso(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function firstDayOfYearIso() {
  const date = new Date();
  date.setMonth(0, 1);
  return date.toISOString().slice(0, 10);
}

function mapPaymentMethod(method) {
  const normalized = String(method || '').toUpperCase();
  if (normalized === 'SEPAY') return 'SePay';
  if (normalized === 'PAY_AT_PROPERTY') return 'Thanh toán tại chỗ';
  return method || '-';
}

function getGrowthText(trends) {
  if (trends.length < 2) return 'Cần thêm dữ liệu để so sánh tăng trưởng.';
  const previous = Number(trends[trends.length - 2]?.revenue || 0);
  const current = Number(trends[trends.length - 1]?.revenue || 0);
  if (previous === 0 && current > 0) return 'Kỳ gần nhất bắt đầu phát sinh doanh thu.';
  if (previous === 0) return 'Doanh thu kỳ gần nhất chưa thay đổi.';
  const percent = ((current - previous) / previous) * 100;
  if (percent > 0) return 'Tăng ' + percent.toFixed(1) + '% so với kỳ trước.';
  if (percent < 0) return 'Giảm ' + Math.abs(percent).toFixed(1) + '% so với kỳ trước.';
  return 'Doanh thu ổn định so với kỳ trước.';
}

export default function Revenue() {
  const navigate = useNavigate();
  const [rangePreset, setRangePreset] = useState('month');
  const [groupBy, setGroupBy] = useState('day');
  const [fromDate, setFromDate] = useState(firstDayOfMonthIso());
  const [toDate, setToDate] = useState(todayIso());
  const [search, setSearch] = useState('');
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const loadRevenue = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getHostRevenue({ fromDate, toDate, groupBy });
      setRevenue(data);
    } catch (err) {
      setError(err.message || 'Không tải được dữ liệu doanh thu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(async () => {
      try {
        if (isMounted) { setLoading(true); setError(''); }
        const data = await getHostRevenue({ fromDate, toDate, groupBy });
        if (isMounted) setRevenue(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Không tải được dữ liệu doanh thu');
      } finally {
        if (isMounted) setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [fromDate, toDate, groupBy]);

  const applyPreset = (preset) => {
    setRangePreset(preset);
    setPage(1);
    if (preset === 'month') { setFromDate(firstDayOfMonthIso()); setToDate(todayIso()); setGroupBy('day'); }
    if (preset === '30days') { setFromDate(addDaysIso(-29)); setToDate(todayIso()); setGroupBy('day'); }
    if (preset === '90days') { setFromDate(addDaysIso(-89)); setToDate(todayIso()); setGroupBy('month'); }
    if (preset === 'year') { setFromDate(firstDayOfYearIso()); setToDate(todayIso()); setGroupBy('month'); }
    if (preset === 'custom') setRangePreset('custom');
  };

  const trends = useMemo(() => revenue?.trends || [], [revenue]);
  const homestays = useMemo(() => revenue?.homestays || [], [revenue]);
  const bookings = useMemo(() => revenue?.recentBookings || [], [revenue]);
  const roomRevenue = Number(revenue?.roomRevenue || 0);
  const serviceRevenue = Number(revenue?.serviceRevenue || 0);
  const totalRevenue = Number(revenue?.totalRevenue || 0);
  const roomShare = totalRevenue > 0 ? Math.round((roomRevenue / totalRevenue) * 100) : 0;
  const serviceShare = totalRevenue > 0 ? Math.round((serviceRevenue / totalRevenue) * 100) : 0;
  const bestPeriod = trends.reduce((best, item) => Number(item.revenue || 0) > Number(best?.revenue || 0) ? item : best, null);
  const bestHomestay = homestays[0];

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return bookings;
    return bookings.filter((booking) =>
      String(booking.bookingCode || '').toLowerCase().includes(keyword)
      || String(booking.homestayName || '').toLowerCase().includes(keyword)
      || String(booking.customerName || '').toLowerCase().includes(keyword)
    );
  }, [bookings, search]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const pageItems = filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const firstIndex = (page - 1) * PAGE_SIZE;
  const lastIndex = firstIndex + pageItems.length;

  return (
    <HostLayout>
      <div className="animate-fade-in text-sm -mt-6" style={{ fontFamily: "'Be Vietnam Pro', 'Inter', sans-serif" }}>
        <div className="mb-4 flex justify-start">
          <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-gray-600 shadow-sm border border-gray-200 hover:bg-gray-50 transition" onClick={() => navigate('/host')} type="button">
            <HiOutlineArrowLeft size={16} />
            Về bảng điều khiển
          </button>
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-[#202c3c] text-white shadow-xl mb-5">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,#d9b18f44,transparent_48%)]" />
          <div className="relative p-6 xl:p-8 grid grid-cols-1 xl:grid-cols-[1.15fr_.85fr] gap-6 items-end">
            <div>
              <p className="text-sm font-extrabold text-[#F2C29B]">Trung tâm doanh thu</p>
              <h2 className="mt-2 font-serif text-4xl md:text-5xl font-bold leading-tight">Quản lý doanh thu</h2>
              <p className="mt-3 max-w-3xl text-sm text-white/85 leading-6">Theo dõi tiền đã thu, sức bán từng homestay và biến động doanh thu theo thời gian. Dữ liệu chỉ tính các đơn đã thanh toán và loại trừ đơn hủy/quá hạn.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/80 border border-white/10">{formatDate(revenue?.fromDate || fromDate)} - {formatDate(revenue?.toDate || toDate)}</span>
                <span className="rounded-full bg-emerald-400/15 px-4 py-2 text-xs font-black text-emerald-100 border border-emerald-300/20">{revenue?.paidBookingCount || 0} đơn đã thanh toán</span>
                <span className="rounded-full bg-amber-400/15 px-4 py-2 text-xs font-black text-amber-100 border border-amber-300/20">{revenue?.occupancyNights || 0} đêm đã bán</span>
              </div>
            </div>
            <div className="rounded-3xl bg-white/10 border border-white/10 p-6 shadow-2xl backdrop-blur-sm">
              <p className="text-sm font-extrabold text-white/75">Tổng doanh thu thực thu</p>
              <p className="mt-3 text-5xl font-black text-white">{formatMoney(totalRevenue)}</p>
              <p className="mt-2 text-sm font-semibold text-emerald-100">{getGrowthText(trends)}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <HeroMini label="Doanh thu phòng" value={formatMoney(roomRevenue)} />
                <HeroMini label="Dịch vụ thêm" value={formatMoney(serviceRevenue)} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 mb-5">
          <MetricCard title="Tổng doanh thu" value={formatMoney(totalRevenue)} icon={HiOutlineCash} accent="#2C3E2B" hint="Tổng tiền khách đã thanh toán" />
          <MetricCard title="Doanh thu phòng" value={formatMoney(roomRevenue)} icon={HiOutlineHome} accent="#6E473B" hint={roomShare + '% tổng doanh thu'} />
          <MetricCard title="Dịch vụ thêm" value={formatMoney(serviceRevenue)} icon={HiOutlineSparkles} accent="#B45309" hint={serviceShare + '% tổng doanh thu'} />
          <MetricCard title="Đã giảm giá" value={formatMoney(revenue?.discountTotal)} icon={HiOutlineTrendingUp} accent="#DC2626" hint="Ưu đãi đã áp dụng" />
          <MetricCard title="Giá trị TB/đơn" value={formatMoney(revenue?.averageOrderValue)} icon={HiOutlineChartBar} accent="#1D4ED8" hint="Trung bình mỗi booking" />
          <MetricCard title="Đêm đã bán" value={String(revenue?.occupancyNights || 0)} icon={HiOutlineClock} accent="#047857" hint="Tổng số đêm lưu trú" />
        </section>

        <section className="bg-white rounded-3xl border border-gray-200/70 shadow-sm p-4 mb-5 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-gray-800">Khoảng thời gian:</span>
            {[
              ['month', 'Tháng này'], ['30days', '30 ngày'], ['90days', '90 ngày'], ['year', 'Năm nay'], ['custom', 'Tùy chọn'],
            ].map(([key, label]) => (
              <button className={(rangePreset === key ? 'bg-[#2C3E2B] text-white border-[#2C3E2B] shadow ' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 ') + 'h-11 rounded-2xl px-5 text-xs font-black border transition'} key={key} onClick={() => applyPreset(key)} type="button">{label}</button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <DateInput value={fromDate} onChange={(value) => { setRangePreset('custom'); setPage(1); setFromDate(value); }} />
            <DateInput value={toDate} onChange={(value) => { setRangePreset('custom'); setPage(1); setToDate(value); }} />
            <select className="h-11 rounded-2xl border border-gray-200 bg-white px-4 text-xs font-black text-[#2C3E2B] outline-none" onChange={(event) => { setPage(1); setGroupBy(event.target.value); }} value={groupBy}>
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
            </select>
            <button className="h-11 rounded-2xl border border-gray-200 bg-white px-4 text-xs font-black text-gray-500 shadow-sm hover:bg-gray-50 transition" onClick={loadRevenue} type="button"><HiOutlineRefresh className="inline mr-1" size={16} /> Làm mới</button>
          </div>
        </section>

        {error && <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">{error}</div>}
        {loading && <div className="mb-5 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm font-bold text-gray-600">Đang tải dữ liệu doanh thu...</div>}

        <section className="grid grid-cols-1 2xl:grid-cols-[1.4fr_.6fr] gap-5 mb-5">
          <RevenueComboChart trends={trends} groupBy={groupBy} />
          <RevenueInsights bestPeriod={bestPeriod} bestHomestay={bestHomestay} revenue={revenue} roomShare={roomShare} serviceShare={serviceShare} groupBy={groupBy} />
        </section>

        <section className="grid grid-cols-1 2xl:grid-cols-[.72fr_1.28fr] gap-5 mb-5">
          <HomestayRevenueList homestays={homestays} totalRevenue={totalRevenue} />
          <RevenueTransactions pageItems={pageItems} filteredCount={filteredBookings.length} search={search} setSearch={setSearch} setPage={setPage} />
        </section>

        <Pagination currentPage={page} indexOfFirstItem={firstIndex} indexOfLastItem={lastIndex} itemName="giao dịch" setCurrentPage={setPage} totalItems={filteredBookings.length} totalPages={totalPages} />
      </div>
    </HostLayout>
  );
}

function RevenueComboChart({ trends, groupBy }) {
  const width = 920;
  const height = 360;
  const pad = { left: 74, right: 56, top: 34, bottom: 58 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxRevenue = Math.max(...trends.map((item) => Number(item.revenue || 0)), 1);
  const maxBooking = Math.max(...trends.map((item) => Number(item.bookingCount || 0)), 1);
  const labelStep = Math.max(1, Math.ceil(trends.length / 7));
  const points = trends.map((item, index) => {
    const x = pad.left + (trends.length <= 1 ? innerW / 2 : (index / (trends.length - 1)) * innerW);
    const revenue = Number(item.revenue || 0);
    const bookingCount = Number(item.bookingCount || 0);
    const barHeight = (revenue / maxRevenue) * innerH;
    const yRevenue = pad.top + innerH - barHeight;
    const yBooking = pad.top + innerH - (bookingCount / maxBooking) * innerH;
    return { ...item, x, yRevenue, yBooking, revenue, bookingCount, barHeight };
  });
  const linePath = points.map((item, index) => (index === 0 ? 'M ' : 'L ') + item.x + ' ' + item.yBooking).join(' ');
  const areaPath = points.length ? linePath + ' L ' + points[points.length - 1].x + ' ' + (pad.top + innerH) + ' L ' + points[0].x + ' ' + (pad.top + innerH) + ' Z' : '';
  const gridValues = [1, 0.75, 0.5, 0.25, 0];
  const barWidth = Math.max(20, Math.min(46, innerW / Math.max(points.length, 1) * 0.46));

  return (
    <div className="bg-white rounded-3xl border border-gray-200/70 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-[#6E473B]">Biểu đồ tổng hợp</p>
          <h3 className="font-serif text-3xl font-bold text-[#2C1E15] mt-1">Doanh thu & số đơn theo {groupBy === 'month' ? 'tháng' : 'ngày'}</h3>
          <p className="text-sm text-gray-700 font-semibold mt-1">Cột xanh biểu thị doanh thu đã thu, đường vàng biểu thị số đơn thanh toán trong cùng kỳ.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-black">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#2C3E2B]/10 px-3 py-1.5 text-[#2C3E2B]"><span className="h-2.5 w-2.5 rounded-sm bg-[#2C3E2B]" /> Doanh thu</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-amber-700"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Số đơn</span>
        </div>
      </div>

      <div className="p-5 overflow-x-auto">
        {trends.length === 0 ? (
          <div className="h-[360px] flex flex-col items-center justify-center text-center text-gray-600">
            <HiOutlineChartBar size={42} className="mb-3 opacity-40" />
            <p className="font-black">Chưa có doanh thu trong khoảng thời gian này.</p>
            <p className="text-xs font-semibold mt-1">Hãy đổi bộ lọc thời gian hoặc kiểm tra các đơn đã thanh toán.</p>
          </div>
        ) : (
          <svg className="min-w-[820px] w-full" viewBox={'0 0 ' + width + ' ' + height} role="img" aria-label="Biểu đồ doanh thu và số đơn">
            <defs>
              <linearGradient id="revenueBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#31563a" /><stop offset="100%" stopColor="#1f3524" /></linearGradient>
              <linearGradient id="bookingArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.24" /><stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" /></linearGradient>
              <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#203024" floodOpacity="0.16" /></filter>
            </defs>
            <rect x="0" y="0" width={width} height={height} rx="24" fill="#ffffff" />
            {gridValues.map((ratio) => {
              const y = pad.top + innerH * (1 - ratio);
              return (
                <g key={ratio}>
                  <line x1={pad.left} x2={pad.left + innerW} y1={y} y2={y} stroke="#E5E7EB" strokeDasharray={ratio === 0 ? '0' : '6 8'} />
                  <text x={pad.left - 12} y={y + 4} textAnchor="end" fontSize="11" fontWeight="700" fill="#9CA3AF">{formatCompactMoney(maxRevenue * ratio)}</text>
                </g>
              );
            })}
            <text x={pad.left} y={18} fontSize="11" fontWeight="900" fill="#6B7280">Doanh thu</text>
            <text x={pad.left + innerW} y={18} textAnchor="end" fontSize="11" fontWeight="900" fill="#B45309">Số đơn tối đa: {maxBooking}</text>
            {areaPath && <path d={areaPath} fill="url(#bookingArea)" />}
            {points.map((item, index) => (
              <g key={item.period}>
                <rect x={item.x - barWidth / 2} y={item.yRevenue} width={barWidth} height={Math.max(2, item.barHeight)} rx="10" fill="url(#revenueBar)" filter="url(#barShadow)">
                  <title>{formatPeriod(item.period, groupBy) + ': ' + formatMoney(item.revenue) + ', ' + item.bookingCount + ' đơn'}</title>
                </rect>
                {(index % labelStep === 0 || index === points.length - 1) && <text x={item.x} y={height - 22} textAnchor="middle" fontSize="11" fontWeight="800" fill="#8B95A7">{formatPeriod(item.period, groupBy)}</text>}
              </g>
            ))}
            {linePath && <path d={linePath} fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />}
            {points.map((item) => (
              <g key={'p-' + item.period}>
                <circle cx={item.x} cy={item.yBooking} r="6" fill="#F59E0B" stroke="#fff" strokeWidth="3">
                  <title>{formatPeriod(item.period, groupBy) + ': ' + item.bookingCount + ' đơn'}</title>
                </circle>
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}

function RevenueInsights({ bestPeriod, bestHomestay, revenue, roomShare, serviceShare, groupBy }) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-white border border-gray-200/70 shadow-sm p-5">
        <p className="text-sm font-extrabold text-[#6E473B]">Phân tích nhanh</p>
        <h3 className="font-serif text-2xl font-bold text-[#2C1E15] mt-1">Điểm đáng chú ý</h3>
        <div className="mt-4 space-y-3">
          <InsightRow label="Kỳ doanh thu cao nhất" value={bestPeriod ? formatPeriod(bestPeriod.period, groupBy) : 'Chưa có'} note={bestPeriod ? formatMoney(bestPeriod.revenue) : 'Không có dữ liệu'} />
          <InsightRow label="Homestay dẫn đầu" value={bestHomestay?.homestayName || 'Chưa có'} note={bestHomestay ? formatMoney(bestHomestay.revenue) : 'Không có doanh thu'} />
          <InsightRow label="Đơn đang chờ" value={String(revenue?.pendingBookingCount || 0)} note="Cần theo dõi xử lý" />
          <InsightRow label="Đơn đã hoàn thành" value={String(revenue?.completedBookingCount || 0)} note="Đã lưu trú hoặc qua ngày nhận" />
        </div>
      </div>
      <div className="rounded-3xl bg-white border border-gray-200/70 shadow-sm p-5">
        <p className="text-sm font-extrabold text-[#6E473B]">Cơ cấu doanh thu</p>
        <h3 className="font-serif text-2xl font-bold text-[#2C1E15] mt-1">Phòng và dịch vụ</h3>
        <div className="mt-5 space-y-4">
          <ShareBar label="Tiền phòng" percent={roomShare} color="#2C3E2B" />
          <ShareBar label="Dịch vụ thêm" percent={serviceShare} color="#B45309" />
        </div>
      </div>
    </div>
  );
}

function HomestayRevenueList({ homestays, totalRevenue }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200/70 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-white"><p className="text-sm font-extrabold text-[#6E473B]">Bảng xếp hạng</p><h3 className="font-serif text-2xl font-bold text-[#2C1E15] mt-1">Doanh thu theo homestay</h3><p className="text-sm text-gray-700 font-semibold mt-1">Căn có doanh thu cao hơn được xếp trước.</p></div>
      <div className="divide-y divide-gray-100 max-h-[520px] overflow-y-auto">
        {homestays.length === 0 ? <p className="px-5 py-10 text-center text-sm font-bold text-gray-600">Chưa có homestay phát sinh doanh thu.</p> : homestays.map((item, index) => {
          const percent = totalRevenue > 0 ? Math.round((Number(item.revenue || 0) / totalRevenue) * 100) : 0;
          return (
            <div className="px-5 py-4" key={item.homeId}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#2C3E2B]/10 text-[#2C3E2B] flex items-center justify-center text-xs font-black">#{index + 1}</div>
                <div className="min-w-0 flex-1"><p className="font-black text-[#2C1E15] truncate">{item.homestayName}</p><p className="text-[11px] text-gray-600 font-bold truncate">{item.province} • {item.bookingCount} đơn • {Number(item.averageRating || 0).toFixed(1)} sao</p></div>
                <div className="text-right"><p className="font-black text-[#2C3E2B]">{formatMoney(item.revenue)}</p><p className="text-[10px] text-gray-600 font-bold">{percent}% tổng doanh thu</p></div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-[#2C3E2B]" style={{ width: percent + '%' }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RevenueTransactions({ pageItems, filteredCount, search, setSearch, setPage }) {
  const columns = { gridTemplateColumns: '1.05fr 1.55fr 0.9fr 0.85fr 0.95fr' };

  return (
    <section className="bg-white rounded-3xl border border-[#2C3E2B]/10 shadow-lg overflow-hidden">
      <div className="px-6 py-5 bg-gradient-to-r from-[#202c3c] to-[#2C3E2B] text-white flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-[#F2C29B]">Lịch sử giao dịch</p>
          <h3 className="font-serif text-2xl font-bold mt-1">Giao dịch tạo doanh thu</h3>
          <p className="text-xs text-white/80 font-semibold mt-1">{filteredCount} giao dịch phù hợp trong bộ lọc hiện tại. Danh sách tự cuộn khi có nhiều đơn.</p>
        </div>
        <SearchBar value={search} onChange={(value) => { setPage(1); setSearch(value); }} placeholder="Tìm mã đơn, khách, homestay..." onReset={() => { setPage(1); setSearch(''); }} />
      </div>

      <div className="bg-white p-3">
        <div className="grid items-center rounded-2xl bg-[#2C3E2B] px-4 py-3 text-[10px] font-black uppercase tracking-wider text-white shadow-sm" style={columns}>
          <div>Mã đơn</div>
          <div>Homestay</div>
          <div>Thanh toán</div>
          <div className="text-right">Tổng tiền</div>
          <div className="text-right">Đã thu</div>
        </div>

        <div className="mt-3 max-h-[520px] overflow-y-auto pr-1 space-y-2">
          {pageItems.length === 0 ? (
            <div className="rounded-2xl bg-white px-5 py-12 text-center text-sm font-bold text-gray-600 shadow-sm border border-gray-100">Không có giao dịch phù hợp.</div>
          ) : pageItems.map((booking) => (
            <div className="grid items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md hover:border-[#2C3E2B]/25 transition" key={booking.bookingId} style={columns}>
              <div className="min-w-0">
                <p className="font-mono text-[12px] leading-5 font-black text-[#8B4A2F] break-words">{booking.bookingCode}</p>
                <p className="text-[10px] font-bold text-gray-500 mt-1">Tạo: {formatDateTime(booking.createdAt)}</p>
              </div>
              <div className="min-w-0">
                <p className="font-black text-[#2C1E15] leading-5 break-words">{booking.homestayName}</p>
                <p className="mt-1 inline-flex rounded-full bg-white border border-[#6E473B]/15 px-2 py-0.5 text-[10px] font-black text-[#6E473B]">{formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}</p>
              </div>
              <div className="min-w-0">
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 shadow-sm">Đã thanh toán</span>
                <p className="mt-1 text-[11px] font-bold text-gray-600 break-words">{mapPaymentMethod(booking.paymentMethod)}</p>
              </div>
              <div className="min-w-0 text-right">
                <p className="text-sm font-black text-[#2C3E2B] break-words">{formatMoney(booking.totalPrice)}</p>
              </div>
              <div className="min-w-0 text-right">
                <p className="text-[11px] leading-5 font-black text-gray-700 break-words">{formatDateTime(booking.paidAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DateInput({ value, onChange }) {
  return (
    <label className="inline-flex h-11 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600">
      <HiOutlineCalendar size={16} />
      <input className="outline-none font-bold text-gray-700" onChange={(event) => onChange(event.target.value)} type="date" value={value} />
    </label>
  );
}

function HeroMini({ label, value }) {
  return <div className="rounded-2xl bg-white/10 border border-white/10 p-4"><p className="text-sm font-extrabold text-white/70">{label}</p><p className="mt-2 text-lg font-black text-white">{value}</p></div>;
}

function MetricCard({ title, value, icon: Icon, accent, hint }) {
  return (
    <div className="rounded-3xl border border-gray-200/70 bg-white p-5 shadow-sm min-h-[154px] flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition">
      <div className="flex items-center justify-between gap-3"><span className="text-sm font-extrabold text-gray-800">{title}</span><span className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: accent + '14', color: accent }}><Icon size={22} /></span></div>
      <div><p className="text-2xl font-black leading-tight" style={{ color: accent }}>{value}</p><p className="mt-1 text-xs font-bold text-gray-700">{hint}</p></div>
    </div>
  );
}

function InsightRow({ label, value, note }) {
  return <div className="rounded-2xl border border-gray-200 bg-white p-4"><p className="text-sm font-extrabold text-gray-800">{label}</p><p className="mt-1 text-lg font-black text-[#2C1E15] truncate">{value}</p><p className="mt-0.5 text-xs font-bold text-[#6E473B] truncate">{note}</p></div>;
}

function ShareBar({ label, percent, color }) {
  return <div><div className="mb-2 flex items-center justify-between text-xs font-black"><span className="text-gray-700">{label}</span><span style={{ color }}>{percent}%</span></div><div className="h-3 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: percent + '%', backgroundColor: color }} /></div></div>;
}
