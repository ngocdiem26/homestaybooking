import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HiCheckCircle, HiExclamationTriangle } from 'react-icons/hi2';

const RESULT_TEXT = {
  success: {
    title: 'Thanh toán thành công',
    message: 'Hệ thống đã ghi nhận thanh toán VNPAY và cập nhật đơn đặt homestay của bạn.',
  },
  failed: {
    title: 'Thanh toán chưa hoàn tất',
    message: 'Giao dịch bị hủy hoặc thất bại. Bạn có thể kiểm tra lại đơn đặt phòng và thực hiện lại nếu cần.',
  },
  'invalid-signature': {
    title: 'Thanh toán không hợp lệ',
    message: 'Chữ ký VNPAY không hợp lệ nên hệ thống không cập nhật thanh toán. Vui lòng liên hệ Cozygo để kiểm tra.',
  },
};

export default function VnpayResult() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const result = useMemo(() => {
    const status = params.get('status') || 'failed';
    const normalizedStatus = RESULT_TEXT[status] ? status : 'failed';
    return {
      status: normalizedStatus,
      success: normalizedStatus === 'success',
      bookingCode: params.get('bookingCode') || params.get('bookingId') || '',
      message: params.get('message') || RESULT_TEXT[normalizedStatus].message,
      title: RESULT_TEXT[normalizedStatus].title,
    };
  }, [params]);

  return (
    <main className="min-h-screen bg-[#F3F0E8] px-4 py-10 text-[#2C1E15]">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-[30px] bg-white shadow-2xl ring-1 ring-black/5">
        <div className="border-b border-gray-100 px-7 py-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B6784F]">VNPAY Sandbox</p>
          <h1 className="mt-2 text-3xl font-black">{result.title}</h1>
          {result.bookingCode && <p className="mt-1 text-sm font-bold text-gray-500">Mã đơn: {result.bookingCode}</p>}
        </div>

        <div className="px-7 py-10 text-center">
          <div className={(result.success ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600') + ' mx-auto flex h-20 w-20 items-center justify-center rounded-full'}>
            {result.success ? <HiCheckCircle className="h-12 w-12" /> : <HiExclamationTriangle className="h-12 w-12" />}
          </div>
          <p className="mx-auto mt-5 max-w-md text-base font-semibold leading-7 text-gray-600">{result.message}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => navigate('/profile')} className="h-12 rounded-2xl bg-[#2C3E2B] px-7 text-sm font-black text-white shadow-lg">
              Xem đơn của tôi
            </button>
            <button type="button" onClick={() => navigate('/')} className="h-12 rounded-2xl bg-gray-100 px-7 text-sm font-black text-gray-600">
              Về trang chủ
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}