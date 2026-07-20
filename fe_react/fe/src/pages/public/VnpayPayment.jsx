import { useNavigate } from 'react-router-dom';

export default function VnpayPayment() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[#F3F0E8] px-4 py-10 text-[#2C1E15]">
      <section className="mx-auto max-w-xl rounded-[28px] bg-white p-8 text-center shadow-xl ring-1 ring-black/5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B6784F]">VNPAY Sandbox</p>
        <h1 className="mt-3 text-3xl font-black">Cozygo không tự tạo trang thanh toán</h1>
        <p className="mt-4 text-sm font-semibold leading-7 text-gray-500">
          Khi chọn thanh toán VNPAY, hệ thống sẽ tạo URL và chuyển bạn sang cổng VNPAY Sandbox chính thức để chọn ngân hàng, thẻ hoặc QR.
        </p>
        <button type="button" onClick={() => navigate('/')} className="mt-7 h-12 rounded-2xl bg-[#2C3E2B] px-7 text-sm font-black text-white shadow-lg">
          Về trang chủ
        </button>
      </section>
    </main>
  );
}