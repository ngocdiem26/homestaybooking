import { HiCheckCircle, HiExclamationTriangle, HiHome, HiClipboardDocumentList } from 'react-icons/hi2';

export default function BookingResultStep({ result, onHome, onMyBookings, onRetry, onChooseOther }) {
  const success = result?.status === 'SUCCESS';

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-gray-100 bg-[#FAF8F3] p-5">
        <div className="flex items-start gap-3">
          <div className={(success ? 'bg-[#2C3E2B] text-white' : 'bg-amber-100 text-amber-700') + ' flex h-9 w-9 shrink-0 items-center justify-center rounded-full'}>
            {success ? <HiCheckCircle className="h-6 w-6" /> : <HiExclamationTriangle className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-[#2C1E15]">{result?.title}</h3>
            <p className="mt-2 text-sm font-semibold text-gray-500">{result?.message}</p>
            {result?.bookingCode && (
              <div className="mt-4 space-y-2 text-sm font-semibold text-gray-500">
                <div className="flex max-w-xs justify-between gap-6"><span>Mã đơn</span><b className="text-[#2C1E15]">{result.bookingCode}</b></div>
                <div className="flex max-w-xs justify-between gap-6"><span>Trạng thái</span><b className={success ? 'text-[#2C3E2B]' : 'text-amber-700'}>{result.bookingStatus}</b></div>
                <div className="flex max-w-xs justify-between gap-6"><span>Thanh toán</span><b className="text-[#2C1E15]">{result.paymentText}</b></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <p className="text-xs font-black uppercase tracking-wide text-gray-400">Bước tiếp theo</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-gray-500">
          {success
            ? 'Bạn có thể xem lại đơn đặt trong trang cá nhân. Chủ homestay sẽ xác nhận đơn và cập nhật trạng thái trong hệ thống.'
            : 'Bạn có thể thử đặt lại hoặc chọn phương thức thanh toán khác để hoàn tất đơn.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {success ? (
          <>
            <button type="button" onClick={onHome} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#F4F1EA] px-5 text-sm font-black text-[#2C1E15]"><HiHome /> Đặt đơn khác</button>
            <button type="button" onClick={onMyBookings} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#2C3E2B] px-5 text-sm font-black text-white shadow"><HiClipboardDocumentList /> Xem đơn của tôi</button>
          </>
        ) : (
          <>
            <button type="button" onClick={onRetry} className="h-11 rounded-2xl bg-[#2C3E2B] px-5 text-sm font-black text-white">Đặt lại</button>
            <button type="button" onClick={onChooseOther} className="h-11 rounded-2xl bg-[#F4F1EA] px-5 text-sm font-black text-[#2C1E15]">Chọn phương thức khác</button>
          </>
        )}
      </div>
    </div>
  );
}