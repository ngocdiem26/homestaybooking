import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HostLayout from '../../layouts/HostLayout';
import ModalPortal from '../../components/common/ModalPortal';
import Pagination from '../../components/common/Pagination';
import { getHostComplaints } from '../../services/complaintService';

function statusClass(status) {
  if (status === 'RESOLVED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'REJECTED') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'PROCESSING') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}


export default function HostComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const loadComplaints = async () => {
    try { setLoading(true); setError(''); setComplaints(await getHostComplaints()); }
    catch (err) { setError(err?.message || 'Không tải được danh sách khiếu nại.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadInitialComplaints() {
      try {
        setLoading(true);
        setError('');
        const data = await getHostComplaints();
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
    if (!keyword) return complaints;
    return complaints.filter((item) => [item.complaintCode, item.bookingCode, item.title, item.customerName, item.homestayName].filter(Boolean).some((value) => String(value).toLowerCase().includes(keyword)));
  }, [complaints, searchTerm]);

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage) || 1;
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = indexOfFirstItem + itemsPerPage;
  const currentItems = filteredComplaints.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <HostLayout>
      <div className="w-full px-6 py-8 text-left lg:px-10">
        <button onClick={() => navigate('/host')} className="mb-5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-600 shadow-sm transition hover:bg-gray-50">&lt; Về bảng điều khiển</button>
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="text-xs font-black uppercase tracking-[0.25em] text-[#B8794C]">Host support view</p><h1 className="font-classic text-3xl font-black text-[#2C1E15]">Khiếu nại liên quan homestay</h1><p className="mt-1 text-sm font-semibold text-gray-500">Chủ homestay chỉ được xem thông tin khiếu nại. Quyền xử lý thuộc admin.</p></div>
            <button onClick={loadComplaints} className="rounded-2xl bg-[#2C3E2B] px-5 py-3 text-sm font-black text-white shadow">Làm mới</button>
          </div>
        </section>
        <section className="mt-5 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"><input value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} className="h-11 w-full rounded-2xl border border-gray-200 px-4 text-sm font-semibold outline-none focus:border-[#2C3E2B]" placeholder="Tìm mã khiếu nại, mã đơn, khách hàng, homestay..." /></section>
        {error && <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">{error}</div>}
        <section className="mt-5 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="bg-[#F8F6F0] text-xs font-black uppercase tracking-wider text-gray-500"><tr><th className="px-5 py-4">Mã KN</th><th className="px-5 py-4">Khách hàng</th><th className="px-5 py-4">Homestay</th><th className="px-5 py-4">Tiêu đề</th><th className="px-5 py-4 text-center">Trạng thái</th><th className="px-5 py-4 text-right">Thao tác</th></tr></thead><tbody className="divide-y divide-gray-100 text-sm font-semibold text-gray-700">
            {loading ? <tr><td colSpan="6" className="px-5 py-10 text-center text-gray-400">Đang tải dữ liệu...</td></tr> : currentItems.length === 0 ? <tr><td colSpan="6" className="px-5 py-10 text-center text-gray-400">Chưa có khiếu nại nào.</td></tr> : currentItems.map((item) => <tr key={item.complaintId} className="hover:bg-gray-50/60"><td className="px-5 py-4"><p className="font-mono font-black text-[#2C1E15]">{item.complaintCode}</p><p className="font-mono text-xs text-gray-400">{item.bookingCode}</p></td><td className="px-5 py-4"><p className="font-black text-[#2C1E15]">{item.customerName}</p><p className="text-xs text-gray-400">{item.customerEmail}</p></td><td className="px-5 py-4"><p className="font-black text-[#2C1E15]">{item.homestayName}</p><p className="text-xs text-gray-400">{item.province}</p></td><td className="max-w-[280px] px-5 py-4"><p className="truncate font-black text-[#2C1E15]">{item.title}</p><p className="line-clamp-1 text-xs text-gray-400">{item.description}</p></td><td className="px-5 py-4 text-center"><span className={(statusClass(item.status)) + ' inline-flex rounded-full border px-3 py-1 text-xs font-black'}>{item.statusLabel}</span></td><td className="px-5 py-4 text-right"><button onClick={() => setSelectedComplaint(item)} className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-black text-gray-700 hover:bg-gray-200">Xem khiếu nại</button></td></tr>)}
          </tbody></table></div>
          <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} totalItems={filteredComplaints.length} indexOfFirstItem={indexOfFirstItem} indexOfLastItem={indexOfLastItem} itemName="khiếu nại" />
        </section>
      </div>
      {selectedComplaint && <HostComplaintDetail complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />}
    </HostLayout>
  );
}

function HostComplaintDetail({ complaint, onClose }) {
  return <ModalPortal className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onBackdropClick={onClose}><div onClick={(event) => event.stopPropagation()} className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"><header className="flex items-start justify-between bg-[#202c3c] px-6 py-5 text-white"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#E3B17A]">Chi tiết khiếu nại</p><h3 className="mt-1 text-2xl font-black">{complaint.title}</h3><p className="font-mono text-xs text-white/70">{complaint.complaintCode} · {complaint.bookingCode}</p></div><button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl font-black">×</button></header><div className="max-h-[70vh] space-y-4 overflow-y-auto p-6 text-sm font-semibold text-gray-600"><p><span className="inline-block w-32 text-gray-400">Khách hàng:</span><span className="font-black text-[#2C1E15]">{complaint.customerName}</span></p><p><span className="inline-block w-32 text-gray-400">Trạng thái:</span><span className="font-black text-[#2C1E15]">{complaint.statusLabel}</span></p><div className="rounded-2xl bg-[#F8F6F0] p-4"><p className="text-xs font-black uppercase text-gray-400">Nội dung</p><p className="mt-2 whitespace-pre-line text-[#2C1E15]">{complaint.description}</p></div><div className="rounded-2xl border border-gray-100 bg-white p-4"><p className="text-xs font-black uppercase text-gray-400">Phản hồi admin</p><p className="mt-2 whitespace-pre-line text-[#2C1E15]">{complaint.reply || 'Admin chưa gửi phản hồi.'}</p></div></div></div></ModalPortal>;
}
