import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCreditCard, HiXMark } from 'react-icons/hi2';
import ModalPortal from '../common/ModalPortal';
import BookingStepIndicator from './BookingStepIndicator';
import GuestInfoStep from './GuestInfoStep';
import BookingConfirmStep from './BookingConfirmStep';
import PaymentMethodStep from './PaymentMethodStep';
import BookingResultStep from './BookingResultStep';
import { createBooking, createBookingQuote } from '../../services/bookingService';
import { getMyProfile } from '../../services/profileService';
import { checkPublicHomestayAvailability } from '../../services/homestayService';
import { calculateNights } from '../../services/searchState';
import { isDateRangeValid, isEmail, isTodayOrFuture, isVietnamPhone } from '../../utils/validate';

function toDateString(value) {
  return value || '';
}

function toBookingDraft(defaults = {}) {
  return {
    checkInDate: toDateString(defaults.checkIn),
    checkOutDate: toDateString(defaults.checkOut),
    numberOfGuest: Number(defaults.guests) || 1,
  };
}

function toGuestInfo(user = {}) {
  return {
    customerName: user.fullName || '',
    customerEmail: user.email || '',
    customerPhone: user.phoneNumber || '',
    note: '',
  };
}

function getUserBirthday(user) {
  return user?.birthday || user?.birthDay || user?.dateOfBirth || user?.birthdate || user?.dob || '';
}

function getAgeFromBirthday(value) {
  if (!value) return null;
  const birthday = new Date(String(value).slice(0, 10) + 'T00:00:00');
  if (Number.isNaN(birthday.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) age -= 1;
  return age;
}

function validateBookerAge(user) {
  if (!user) return 'Vui lòng đăng nhập để đặt phòng.';
  const birthday = getUserBirthday(user);
  if (!birthday) return 'Vui lòng cập nhật ngày sinh trong hồ sơ trước khi đặt phòng.';
  const age = getAgeFromBirthday(birthday);
  if (age === null || age < 0) return 'Ngày sinh trong hồ sơ không hợp lệ.';
  if (age < 18) return 'Người đứng tên đặt phòng phải từ đủ 18 tuổi.';
  return '';
}

export default function BookingCheckoutModal({ homestay, user, bookingDefaults, initialResult = null, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(() => initialResult ? 4 : 1);
  const [profileUser, setProfileUser] = useState(user || null);
  const [guestInfo, setGuestInfo] = useState(() => toGuestInfo(user));
  const [bookingDraft, setBookingDraft] = useState(() => toBookingDraft(bookingDefaults));
  const [selectedServices, setSelectedServices] = useState([]);
  const [promotionCode, setPromotionCode] = useState(() => String(bookingDefaults?.promotionCode || '').toUpperCase());
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('PAY_AT_PROPERTY');
  const [quote, setQuote] = useState(null);
  const errorMessageRef = useRef(null);
  const [result, setResult] = useState(() => initialResult);
  const [errorMessage, setErrorMessage] = useState('');
  const [availabilityWarning, setAvailabilityWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    let isMounted = true;

    async function loadLatestProfile() {
      if (getUserBirthday(user)) {
        setProfileUser(user || null);
        return;
      }

      try {
        const profile = await getMyProfile();
        if (!isMounted) return;
        const mergedUser = { ...(user || {}), ...profile };
        setProfileUser(mergedUser);
        setGuestInfo((current) => ({
          ...current,
          customerName: current.customerName || mergedUser.fullName || '',
          customerEmail: current.customerEmail || mergedUser.email || '',
          customerPhone: current.customerPhone || mergedUser.phoneNumber || '',
        }));
      } catch (_) {
        if (isMounted) setProfileUser(user || null);
      }
    }

    loadLatestProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!initialResult) return;
    setResult(initialResult);
    setStep(4);
    setErrorMessage('');
  }, [initialResult]);
  const booking = useMemo(() => ({
    homeId: homestay?.homeId || homestay?.id,
    checkInDate: bookingDraft.checkInDate,
    checkOutDate: bookingDraft.checkOutDate,
    numberOfGuest: Number(bookingDraft.numberOfGuest) || 1,
    nights: calculateNights(bookingDraft.checkInDate, bookingDraft.checkOutDate),
  }), [bookingDraft, homestay]);

  useEffect(() => {
    let cancelled = false;

    async function verifyAvailability() {
      if (!booking.homeId || !booking.checkInDate || !booking.checkOutDate || booking.nights <= 0) {
        setAvailabilityWarning('');
        return;
      }

      try {
        const result = await checkPublicHomestayAvailability(booking.homeId, booking.checkInDate, booking.checkOutDate);
        if (cancelled) return;
        const isUnavailable = result?.unavailable || result?.dateRangeBooked || result?.available === false;
        setAvailabilityWarning(isUnavailable ? (result?.message || 'Khoảng thời gian này đã có người đặt') : '');
      } catch {
        if (!cancelled) setAvailabilityWarning('');
      }
    }

    verifyAvailability();
    return () => {
      cancelled = true;
    };
  }, [booking.homeId, booking.checkInDate, booking.checkOutDate, booking.nights]);

  const buildQuotePayload = (overridePromotionCode = promotionCode) => ({
    homeId: booking.homeId,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    numberOfGuest: booking.numberOfGuest,
    promotionCode: overridePromotionCode || '',
    services: selectedServices.map((service) => ({
      homestayServiceId: service.homestayServiceId,
      quantity: service.quantity,
    })),
  });

  const loadQuote = async (overridePromotionCode = promotionCode, options = {}) => {
    if (!options.keepError) setErrorMessage('');
    const data = await createBookingQuote(buildQuotePayload(overridePromotionCode));
    setQuote(data);
    return data;
  };

  useEffect(() => {
    if (step !== 2) return undefined;
    const timer = window.setTimeout(() => {
      loadQuote().catch((error) => setErrorMessage(error.message || 'Không tính được tiền đặt phòng'));
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServices, step]);

  useEffect(() => {
    if (!errorMessage) return;
    errorMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [errorMessage]);

  const updateGuestInfo = (field, value) => {
    setGuestInfo((current) => ({ ...current, [field]: value }));
  };

  const updateBookingDraft = (field, value) => {
    setBookingDraft((current) => ({ ...current, [field]: value }));
    setQuote(null);
  };

  const validateGuestInfo = () => {
    const ageMessage = validateBookerAge(profileUser || user);
    if (ageMessage) return ageMessage;
    const maxGuests = Number(homestay.maxGuest || homestay.maxGuests || 1);
    if (!guestInfo.customerName.trim()) return 'Vui lòng nhập họ tên khách đặt.';
    if (guestInfo.customerName.trim().length < 2) return 'Họ tên khách đặt phải có ít nhất 2 ký tự.';
    if (!guestInfo.customerEmail.trim()) return 'Vui lòng nhập email khách đặt.';
    if (!isEmail(guestInfo.customerEmail)) return 'Email khách đặt không đúng định dạng.';
    if (!guestInfo.customerPhone.trim()) return 'Vui lòng nhập số điện thoại khách đặt.';
    if (!isVietnamPhone(guestInfo.customerPhone)) return 'Số điện thoại khách đặt không hợp lệ.';
    if (!booking.checkInDate || !booking.checkOutDate) return 'Vui lòng chọn ngày nhận và trả phòng.';
    if (!isTodayOrFuture(booking.checkInDate)) return 'Ngày nhận phòng không được trước ngày hiện tại.';
    if (!isDateRangeValid(booking.checkInDate, booking.checkOutDate)) return 'Ngày trả phòng phải sau ngày nhận phòng.';
    if (booking.numberOfGuest < 1) return 'Booking phải có ít nhất 1 người lớn.';
    if (booking.numberOfGuest > maxGuests) return 'Số khách vượt quá sức chứa của homestay.';
    if (availabilityWarning) return availabilityWarning;
    return '';
  };

  const goNext = async () => {
    if (step === 1) {
      const message = validateGuestInfo();
      if (message) {
        setErrorMessage(message);
        return;
      }
      try {
        setIsSubmitting(true);
        await loadQuote();
        setStep(2);
      } catch (error) {
        setErrorMessage(error.message || 'Không kiểm tra được booking');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (step === 2) {
      if (!acceptedPolicy) {
        setErrorMessage('Vui lòng đồng ý với chính sách đặt phòng trước khi tiếp tục');
        return;
      }
      setErrorMessage('');
      setStep(3);
    }
  };

  const applyPromotion = async (code = promotionCode, options = {}) => {
    const nextCode = typeof code === 'string' ? code.trim().toUpperCase() : String(promotionCode || '').trim().toUpperCase();

    if (!nextCode) {
      if (options.clear) {
        setPromotionCode('');
        setErrorMessage('');
        try {
          setIsSubmitting(true);
          await loadQuote('');
        } finally {
          setIsSubmitting(false);
        }
        return;
      }
      setErrorMessage('Vui lòng chọn hoặc nhập mã khuyến mãi trước khi áp dụng.');
      return;
    }

    setPromotionCode(nextCode);
    try {
      setIsSubmitting(true);
      await loadQuote(nextCode);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message || 'Mã khuyến mãi không đủ điều kiện áp dụng cho đơn này. Bạn vẫn có thể tiếp tục thanh toán không dùng mã.');
      setPromotionCode('');
      try {
        await loadQuote('', { keepError: true });
      } catch {
        // Giữ thông báo lỗi mã khuyến mãi nếu quote dự phòng cũng lỗi.
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleService = (service) => {
    const id = service.homestayServiceId;
    setSelectedServices((current) => current.some((item) => item.homestayServiceId === id)
      ? current.filter((item) => item.homestayServiceId !== id)
      : [...current, { homestayServiceId: id, quantity: 1 }]);
  };

  const changeServiceQty = (id, quantity) => {
    if (quantity <= 0) {
      setSelectedServices((current) => current.filter((item) => item.homestayServiceId !== id));
      return;
    }
    setSelectedServices((current) => current.map((item) => item.homestayServiceId === id ? { ...item, quantity } : item));
  };

  const submitBooking = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      const bookingResponse = await createBooking({
        ...buildQuotePayload(),
        ...guestInfo,
        paymentMethod,
      });

      if (paymentMethod === 'VNPAY') {
        const paymentUrl = bookingResponse.paymentUrl;
        if (!paymentUrl || !/^https?:\/\//i.test(paymentUrl)) {
          throw new Error('Backend chưa trả về URL thanh toán VNPAY Sandbox. Vui lòng kiểm tra cấu hình VNPAY.');
        }
        window.location.assign(paymentUrl);
        return;
      }

      setResult({
        status: 'SUCCESS',
        title: 'Đặt phòng thành công',
        message: 'Đơn của bạn đã được tạo và đang chờ chủ homestay xác nhận. Bạn sẽ thanh toán khi nhận phòng tại homestay.',
        bookingCode: bookingResponse.bookingCode,
        bookingStatus: 'Chờ chủ homestay xác nhận',
        paymentText: 'Thanh toán tại chỗ',
      });
      setStep(4);
    } catch (error) {
      setErrorMessage(error.message || 'Không tạo được booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalPortal className="fixed inset-0 z-[10000] bg-black/55 p-3 text-left text-sm backdrop-blur-sm md:p-6">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl md:h-[94vh]">
        <header className="flex shrink-0 items-start justify-between gap-4 bg-white px-5 pb-2 pt-5 md:px-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[#2C1E15]">
              <HiCreditCard className="h-5 w-5" />
              <h2 className="text-base font-black">Thanh toán đặt phòng</h2>
            </div>
            <p className="mt-1 truncate text-xs font-semibold text-gray-400">{homestay?.name || 'Homestay'}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-500 transition hover:bg-gray-100 hover:text-[#2C1E15]" aria-label="Đóng checkout">
            <HiXMark className="h-6 w-6" />
          </button>
        </header>

        <BookingStepIndicator currentStep={step} />

        {errorMessage && (
          <div ref={errorMessageRef} className="mx-5 mb-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 shadow-sm md:mx-7">{errorMessage}</div>
        )}

        <main className="min-h-0 flex-1 overflow-y-auto bg-white p-5 pt-0 md:p-7 md:pt-0">
          {step === 1 && <GuestInfoStep homestay={homestay} form={guestInfo} booking={booking} maxGuests={homestay.maxGuest || 1} availabilityWarning={availabilityWarning} onChange={updateGuestInfo} onBookingChange={updateBookingDraft} />}
          {step === 2 && <BookingConfirmStep homestay={homestay} quote={quote} booking={booking} guestInfo={guestInfo} selectedServices={selectedServices} promotionCode={promotionCode} acceptedPolicy={acceptedPolicy} onToggleService={toggleService} onChangeServiceQty={changeServiceQty} onPromotionChange={setPromotionCode} onApplyPromotion={applyPromotion} onAcceptPolicy={setAcceptedPolicy} onPromotionNotice={setErrorMessage} />}
          {step === 3 && <PaymentMethodStep quote={quote} paymentMethod={paymentMethod} onSelectPaymentMethod={setPaymentMethod} />}
          {step === 4 && <BookingResultStep result={result} onHome={() => navigate('/')} onMyBookings={() => navigate('/profile?view=' + encodeURIComponent(result?.profileTarget || 'bookings'))} onRetry={() => { setStep(1); setResult(null); }} /> }
        </main>

        {step < 4 && (
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-4 md:px-7">
            <button type="button" onClick={step === 1 ? onClose : () => setStep(step - 1)} className="h-11 rounded-2xl bg-[#F4F1EA] px-5 text-sm font-black text-[#2C1E15]">{step === 1 ? 'Hủy' : 'Quay lại'}</button>
            {step < 3 && <button type="button" onClick={goNext} disabled={isSubmitting} className="h-11 rounded-2xl bg-[#2C3E2B] px-6 text-sm font-black text-white shadow-lg disabled:opacity-60">{isSubmitting ? 'Đang xử lý...' : 'Tiếp tục'}</button>}
            {step === 3 && <button type="button" onClick={submitBooking} disabled={isSubmitting} className="h-11 rounded-2xl bg-[#2C3E2B] px-6 text-sm font-black text-white shadow-lg transition hover:bg-[#223322] disabled:opacity-60">{isSubmitting ? 'Đang xử lý...' : 'Đặt phòng'}</button>}
          </footer>
        )}
      </div>
    </ModalPortal>
  );
}
