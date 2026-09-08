import ModalPortal from '../../common/ModalPortal';

export default function AdminOwnerModal({ homestay, onClose }) {
  if (!homestay) {
    return null;
  }

  return (
    <ModalPortal>
      <div className="bg-[#F4F1EA] max-w-sm w-full rounded-3xl p-6 border border-[#6E473B]/20 shadow-2xl space-y-4 relative font-semibold text-gray-600">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none"
          type="button"
        >
          x
        </button>
        <div className="border-b border-gray-200 pb-2">
          <h3 className="font-serif text-lg font-bold text-[#2C1E15]">Thông tin chủ đối tác</h3>
          <p className="text-xs text-gray-400 font-mono">{homestay.ownerCode}</p>
        </div>
        <div className="space-y-2.5 text-xs md:text-sm">
          <InfoRow label="Họ và tên" value={homestay.ownerName} />
          <InfoRow label="Số điện thoại" value={homestay.ownerPhone || 'Chưa cập nhật'} />
          <InfoRow label="Email" value={homestay.ownerEmail} isMono />
        </div>
      </div>
    </ModalPortal>
  );
}

function InfoRow({ isMono = false, label, value }) {
  return (
    <p>
      <span className="text-gray-400 inline-block w-24">{label}:</span>
      <span className={`text-gray-800 font-bold ${isMono ? 'font-mono' : ''}`}>{value}</span>
    </p>
  );
}

