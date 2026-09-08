import { useMemo, useState } from 'react';
import ModalPortal from '../common/ModalPortal';

function formatDateTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusClass(status) {
  if (status === 'RESOLVED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (status === 'REJECTED') return 'bg-red-50 text-red-700 ring-red-200';
  if (status === 'PROCESSING') return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-gray-100 text-gray-600 ring-gray-200';
}

const TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chưa xử lý' },
  { key: 'PROCESSING', label: 'Đang xử lý' },
  { key: 'RESOLVED', label: 'Đã xử lý' },
  { key: 'REJECTED', label: 'Từ chối' },
];

export default function ComplaintManager({ complaints = [], errorMessage }) {
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const filteredComplaints = useMemo(() => {
    if (activeStatus === 'ALL') return complaints;
    return complaints.filter((item) => item.status === activeStatus);
  }, [activeStatus, complaints]);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="border-b border-gray-100 pb-3">
        <h2 className="font-classic text-xl font-bold text-[#2C1E15]">Khiếu nại của tôi</h2>
        <p className="text-xs text-gray-400 font-medium">Theo dõi trạng thái xử lý các khiếu nại bạn đã gửi cho Cozygo.</p>
      </div>

      {errorMessage && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{errorMessage}</div>}

      <div className="flex w-full gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 text-xs font-bold shadow-sm shadow-[#2C1E15]/5 ring-1 ring-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveStatus(tab.key)}
            className={'rounded-xl px-5 py-2.5 transition whitespace-nowrap cursor-pointer ' + (activeStatus === tab.key ? 'bg-[#2C3E2B] text-white shadow-md shadow-[#2C3E2B]/20' : 'text-gray-500 hover:bg-[#F8F6F0] hover:text-[#2C3E2B]')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 h-[560px] overflow-y-scroll pr-2 custom-scrollbar">
        {filteredComplaints.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm font-semibold text-gray-400">Chưa có khiếu nại nào.</div>
        ) : filteredComplaints.map((complaint) => (
          <article key={complaint.complaintId} className="rounded-2xl bg-white p-5 border border-gray-200 shadow-sm ring-1 ring-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#2C1E15]/8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-bold text-gray-600">{complaint.complaintCode}</span>
                  <span className={(statusClass(complaint.status)) + ' rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1'}>{complaint.statusLabel}</span>
                </div>
                <h3 className="text-base font-extrabold text-[#2C1E15] truncate">{complaint.title}</h3>
                <p className="text-xs font-semibold text-gray-500">{complaint.homestayName || '--'} · {complaint.bookingCode || '--'} · {formatDateTime(complaint.createdAt)}</p>
                {complaint.reply && (
                  <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-bold leading-5 text-emerald-700">
                    Admin đã gửi kết quả xử lý. Vui lòng kiểm tra email và xem phản hồi trong chi tiết khiếu nại.
                  </p>
                )}
              </div>
              <button type="button" onClick={() => setSelectedComplaint(complaint)} className="rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-200">Xem chi tiết</button>
            </div>
          </article>
        ))}
      </div>

      {selectedComplaint && (
        <ModalPortal className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onBackdropClick={() => setSelectedComplaint(null)}>
          <div onClick={(event) => event.stopPropagation()} className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white text-left shadow-2xl">
            <header className="flex items-start justify-between bg-[#F6EFE6] px-6 py-5 text-[#2C1E15]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B66A3C]">Chi tiết khiếu nại</p>
                <h3 className="mt-1 font-classic text-2xl font-black">{selectedComplaint.title}</h3>
                <p className="mt-2 font-mono text-xs font-bold text-gray-500">{selectedComplaint.complaintCode} · {selectedComplaint.bookingCode}</p>
              </div>
              <button type="button" onClick={() => setSelectedComplaint(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-black text-gray-600 shadow-sm ring-1 ring-gray-200 transition hover:bg-[#2C3E2B] hover:text-white">×</button>
            </header>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6 text-sm font-semibold text-gray-600">
              <InfoRow label="Homestay" value={selectedComplaint.homestayName} />
              <InfoRow label="Thời gian gửi" value={formatDateTime(selectedComplaint.createdAt)} />
              <InfoRow label="Trạng thái" value={selectedComplaint.statusLabel} />
              <div className="rounded-2xl bg-[#F8F6F0] p-4">
                <p className="text-xs font-black uppercase text-gray-400">Nội dung khiếu nại</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#2C1E15]">{selectedComplaint.description}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-100">
                <p className="text-xs font-black uppercase text-gray-400">Phản hồi từ admin</p>
                {selectedComplaint.reply ? <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#2C1E15]">{selectedComplaint.reply}</p> : <p className="mt-2 text-sm text-gray-400">Admin chưa gửi phản hồi xử lý.</p>}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return <p className="text-sm"><span className="inline-block w-32 text-gray-400">{label}:</span><span className="font-black text-[#2C1E15]">{value || '--'}</span></p>;
}





