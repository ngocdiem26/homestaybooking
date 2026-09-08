import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/common/Pagination';
import ManagementBackButton from '../../components/common/ManagementBackButton';
import ManagementHeaderRow from '../../components/common/ManagementHeaderRow';
import ManagementToolbar from '../../components/common/ManagementToolbar';
import PrettySelect from '../../components/common/PrettySelect';
import { isWithinDateFilter } from '../../utils/dateFilter';
import ModalPortal from '../../components/common/ModalPortal';
import { getAdminComplaints, resolveAdminComplaint } from '../../services/complaintService';

function formatDateTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('vi-VN') + ' đ';
}

function statusClass(status) {
  if (status === 'RESOLVED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'REJECTED') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'PROCESSING') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}


export default function AdminComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailComplaint, setDetailComplaint] = useState(null);
  const [bookingComplaint, setBookingComplaint] = useState(null);
  const [replyComplaint, setReplyComplaint] = useState(null);
  const [replyStatus, setReplyStatus] = useState('RESOLVED');
  const [replyContent, setReplyContent] = useState('');
  const [notice, setNotice] = useState('');
  const itemsPerPage = 6;

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      setComplaints(await getAdminComplaints());
    } catch (err) {
      setError(err?.message || 'Không tải được danh sách khiếu nại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadInitialComplaints() {
      try {
        setError('');
        const data = await getAdminComplaints();
        if (isMounted) setComplaints(data);
      } catch (err) {
        if (isMounted) setError(err?.message || 'Không tải được danh sách khiếu nại.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitialComplaints();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredComplaints = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return complaints.filter((item) => {
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchSearch = !keyword || [item.complaintCode, item.bookingCode, item.title, item.customerName, item.customerEmail, item.homestayName]
        .filter(Boolean).some((value) => String(value).toLowerCase().includes(keyword));
      const matchDate = isWithinDateFilter(item.createdAt, dateFilter, dateFrom, dateTo);
      return matchStatus && matchSearch && matchDate;
    });
  }, [complaints, searchTerm, statusFilter, dateFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = indexOfFirstItem + itemsPerPage;
  const currentItems = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);

  const openReply = (complaint) => {
    setReplyComplaint(complaint);
    setReplyStatus(complaint.status === 'REJECTED' ? 'REJECTED' : 'RESOLVED');
    setReplyContent(complaint.reply || [
      'Kính chào Quý khách,',
      '',
      'Cozygo đã kiểm tra khiếu nại của Quý khách. Kết quả xử lý như sau:',
    ].join('\n'));
  };

  const submitReply = async (event) => {
    event.preventDefault();
    if (!replyContent.trim()) {
      setNotice('Vui lòng nhập nội dung phản hồi trước khi gửi.');
      return;
    }
    try {
      const updated = await resolveAdminComplaint(replyComplaint.complaintId, { status: replyStatus, note: replyContent.trim() });
      setComplaints((current) => current.map((item) => item.complaintId === updated.complaintId ? updated : item));
      setReplyComplaint(null);
      setNotice(updated.mailSent ? 'Đã xử lý khiếu nại và gửi email cho khách hàng.' : 'Đã lưu kết quả xử lý. Chưa gửi được email, vui lòng kiểm tra cấu hình SMTP.');
      window.setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setNotice(err?.message || 'Không gửi được kết quả xử lý.');
    }
  };

  const handleStatusChange = async (complaint, nextStatus) => {
    if (nextStatus === complaint.status) return;
    if (nextStatus === 'PROCESSING') {
      try {
        const updated = await resolveAdminComplaint(complaint.complaintId, { status: 'PROCESSING', note: '' });
        setComplaints((current) => current.map((item) => item.complaintId === updated.complaintId ? updated : item));
      } catch (err) {
        setNotice(err?.message || 'Không cập nhật được trạng thái khiếu nại.');
      }
      return;
    }
    setReplyComplaint(complaint);
    setReplyStatus(nextStatus);
    setReplyContent(complaint.reply || [
      'Kính chào Quý khách,',
      '',
      'Cozygo đã kiểm tra khiếu nại của Quý khách. Kết quả xử lý như sau:',
    ].join('\n'));
  };

  const tabs = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chưa xử lý' },
    { key: 'PROCESSING', label: 'Đang xử lý' },
    { key: 'RESOLVED', label: 'Đã xử lý' },
    { key: 'REJECTED', label: 'Từ chối' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in text-left text-sm">
        <ManagementHeaderRow backButton={<ManagementBackButton onClick={() => navigate('/admin')} />}>
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2C3E2B]/10 text-2xl font-black text-[#2C3E2B]">!</div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-[#B8794C]">Admin support</p>
                <h1 className="font-classic text-3xl font-black text-[#2C1E15]">Quản lý khiếu nại</h1>
                <p className="mt-1 text-sm font-semibold text-gray-500">Admin là người xử lý cuối cùng và gửi kết quả qua email cho khách hàng.</p>
              </div>
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
              options: tabs.map((tab) => ({ value: tab.key, label: tab.label })),
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
          searchPlaceholder="Tìm mã khiếu nại, mã đơn, khách hàng, homestay..."
          onReset={() => {
            setStatusFilter('ALL');
            setSearchTerm('');
            setDateFilter('all');
            setDateFrom('');
            setDateTo('');
            setCurrentPage(1);
            loadComplaints();
          }}
        />

        {notice && <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-black text-amber-700 ring-1 ring-amber-100">{notice}</div>}
        {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">{error}</div>}

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-[#F8F6F0] text-xs font-black uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Mã KN</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Homestay</th>
                  <th className="px-5 py-4">Tiêu đề</th>
                  <th className="px-5 py-4 text-center">Trạng thái</th>
                  <th className="px-5 py-4">Thời gian</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-semibold text-gray-700">
                {loading ? <tr><td colSpan="7" className="px-5 py-10 text-center text-gray-400">Đang tải dữ liệu...</td></tr> : currentItems.length === 0 ? <tr><td colSpan="7" className="px-5 py-10 text-center text-gray-400">Không có khiếu nại phù hợp.</td></tr> : currentItems.map((item) => (
                  <tr key={item.complaintId} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4"><p className="font-mono font-black text-[#2C1E15]">{item.complaintCode}</p><p className="font-mono text-xs text-gray-400">{item.bookingCode}</p></td>
                    <td className="px-5 py-4"><p className="font-black text-[#2C1E15]">{item.customerName}</p><p className="text-xs text-gray-400">{item.customerEmail}</p></td>
                    <td className="px-5 py-4"><p className="font-black text-[#2C1E15]">{item.homestayName}</p><p className="text-xs text-gray-400">{item.province}</p></td>
                    <td className="max-w-[260px] px-5 py-4"><p className="truncate font-black text-[#2C1E15]" title={item.title}>{item.title}</p><p className="mt-1 line-clamp-1 text-xs text-gray-400">{item.description}</p></td>
                    <td className="px-5 py-4 text-center"><span className={(statusClass(item.status)) + ' inline-flex rounded-full border px-3 py-1 text-xs font-black'}>{item.statusLabel}</span></td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{formatDateTime(item.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex min-w-[360px] items-center justify-end gap-2">
                        <PrettySelect value={item.status} onChange={(value) => handleStatusChange(item, value)} options={[{ value: 'PENDING', label: 'Chưa xử lý' }, { value: 'PROCESSING', label: 'Đang xử lý' }, { value: 'RESOLVED', label: 'Đã xử lý' }, { value: 'REJECTED', label: 'Từ chối' }]} buttonClassName={(statusClass(item.status)) + ' h-10 border px-3 text-xs font-black shadow-none focus:ring-2 focus:ring-[#2C3E2B]/20'} minWidth="min-w-[150px]" />
                        <button onClick={() => setDetailComplaint(item)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600 shadow-sm transition hover:bg-gray-100" title="Xem khiếu nại">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button onClick={() => setBookingComplaint(item)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm transition hover:bg-blue-100" title="Xem đơn liên quan">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12m-7.5 2.25h15A2.25 2.25 0 0021.75 18V9.75a2.25 2.25 0 00-.659-1.591l-5.25-5.25a2.25 2.25 0 00-1.591-.659H4.5A2.25 2.25 0 002.25 4.5v15A2.25 2.25 0 004.5 21.75z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openReply(item)}
                          className={(item.status === 'RESOLVED' || item.status === 'REJECTED' ? 'bg-gray-100 text-gray-400 border-gray-100' : 'bg-[#2C3E2B]/10 text-[#2C3E2B] border-[#2C3E2B]/20 hover:bg-[#2C3E2B]/15') + ' inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-xs font-black shadow-sm transition'}
                          title="Phản hồi khiếu nại"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-6.75 8.25V5.25A2.25 2.25 0 017.5 3h9A2.25 2.25 0 0118.75 5.25v13.5L15 16.5H7.5a2.25 2.25 0 01-2.25-2.25z" />
                          </svg>
                          <span>{item.status === 'RESOLVED' || item.status === 'REJECTED' ? 'Đã phản hồi' : 'Phản hồi'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} totalItems={filteredComplaints.length} indexOfFirstItem={indexOfFirstItem} indexOfLastItem={indexOfLastItem} itemName="khiếu nại" />
        </section>
      </div>

      {detailComplaint && <ComplaintDetailModal complaint={detailComplaint} onClose={() => setDetailComplaint(null)} />}
      {bookingComplaint && <BookingComplaintModal complaint={bookingComplaint} onClose={() => setBookingComplaint(null)} />}
      {replyComplaint && (
        <ModalPortal className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onBackdropClick={() => setReplyComplaint(null)}>
          <form onSubmit={submitReply} onClick={(event) => event.stopPropagation()} className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="bg-[#202c3c] px-6 py-5 text-white"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#E3B17A]">Gửi kết quả xử lý</p><h3 className="mt-1 text-2xl font-black">{replyComplaint.complaintCode}</h3><p className="text-sm text-white/70">Email khách: {replyComplaint.customerEmail}</p></header>
            <div className="space-y-4 p-6">
              <div className="rounded-2xl bg-[#F8F6F0] p-4"><p className="text-xs font-black uppercase text-gray-400">Nội dung khách gửi</p><p className="mt-2 whitespace-pre-line text-sm font-semibold text-[#2C1E15]">{replyComplaint.description}</p></div>
              <label className="block space-y-2"><span className="text-sm font-black text-gray-500">Trạng thái xử lý</span><PrettySelect value={replyStatus} onChange={setReplyStatus} options={[{ value: 'RESOLVED', label: 'Đã xử lý' }, { value: 'REJECTED', label: 'Từ chối' }, { value: 'PROCESSING', label: 'Đang xử lý' }]} className="w-full" minWidth="min-w-full" buttonClassName="h-12 rounded-2xl px-4 text-sm" /></label>
              <label className="block space-y-2"><span className="text-sm font-black text-gray-500">Nội dung email phản hồi</span><textarea value={replyContent} onChange={(event) => setReplyContent(event.target.value)} rows={8} className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold outline-none focus:border-[#2C3E2B]" /></label>
            </div>
            <footer className="flex justify-end gap-3 border-t border-gray-100 bg-[#FAF8F3] px-6 py-4"><button type="button" onClick={() => setReplyComplaint(null)} className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-600">Hủy</button><button type="submit" className="rounded-2xl bg-[#2C3E2B] px-6 py-3 text-sm font-black text-white shadow">Gửi xử lý</button></footer>
          </form>
        </ModalPortal>
      )}
    </AdminLayout>
  );
}

function ComplaintDetailModal({ complaint, onClose }) {
  return (
    <ModalPortal className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onBackdropClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between bg-[#202c3c] px-6 py-5 text-white"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#E3B17A]">Chi tiết khiếu nại</p><h3 className="mt-1 text-2xl font-black">{complaint.title}</h3><p className="font-mono text-xs text-white/70">{complaint.complaintCode} · {complaint.bookingCode}</p></div><button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl font-black">×</button></header>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6 text-sm font-semibold text-gray-600">
          <Info label="Khách hàng" value={(complaint.customerName || '--') + ' · ' + (complaint.customerEmail || '--')} />
          <Info label="Homestay" value={(complaint.homestayName || '--') + ' · ' + (complaint.province || '--')} />
          <Info label="Tổng tiền" value={formatMoney(complaint.totalAmount)} />
          <Info label="Trạng thái" value={complaint.statusLabel} />
          <div className="rounded-2xl bg-[#F8F6F0] p-4"><p className="text-xs font-black uppercase text-gray-400">Nội dung khiếu nại</p><p className="mt-2 whitespace-pre-line text-[#2C1E15]">{complaint.description}</p></div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4"><p className="text-xs font-black uppercase text-gray-400">Phản hồi admin</p><p className="mt-2 whitespace-pre-line text-[#2C1E15]">{complaint.reply || 'Chưa có phản hồi.'}</p></div>
        </div>
      </div>
    </ModalPortal>
  );
}

function BookingComplaintModal({ complaint, onClose }) {
  return (
    <ModalPortal className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onBackdropClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between bg-[#202c3c] px-6 py-5 text-white">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#E3B17A]">Đơn liên quan</p>
            <h3 className="mt-1 text-2xl font-black">{complaint.bookingCode}</h3>
            <p className="font-mono text-xs text-white/70">{complaint.homestayName}</p>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl font-black">×</button>
        </header>
        <div className="space-y-3 p-6 text-sm font-semibold text-gray-600">
          <Info label="Khách hàng" value={(complaint.customerName || '--') + ' · ' + (complaint.customerEmail || '--')} />
          <Info label="Homestay" value={(complaint.homestayName || '--') + ' · ' + (complaint.province || '--')} />
          <Info label="Ngày nhận" value={complaint.checkInDate || '--'} />
          <Info label="Ngày trả" value={complaint.checkOutDate || '--'} />
          <Info label="Tổng tiền" value={formatMoney(complaint.totalAmount)} />
          <Info label="Mã khiếu nại" value={complaint.complaintCode} />
        </div>
      </div>
    </ModalPortal>
  );
}

function Info({ label, value }) { return <p><span className="inline-block w-28 text-gray-400">{label}:</span><span className="font-black text-[#2C1E15]">{value}</span></p>; }









