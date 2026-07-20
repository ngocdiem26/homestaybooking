import { HiCheck, HiCreditCard, HiShieldCheck, HiUser, HiCheckCircle } from 'react-icons/hi2';

const steps = [
  { label: 'Thông tin KH', icon: HiUser },
  { label: 'Xác nhận', icon: HiShieldCheck },
  { label: 'Thanh toán', icon: HiCreditCard },
  { label: 'Kết quả', icon: HiCheckCircle },
];

export default function BookingStepIndicator({ currentStep }) {
  return (
    <div className="border-b border-gray-100 bg-white px-5 pb-4 pt-2 md:px-7">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-center">
        {steps.map(({ label, icon: Icon }, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          const isDone = step < currentStep;
          return (
            <div key={label} className="flex min-w-0 flex-1 items-center last:flex-none">
              <div className="flex min-w-[88px] flex-col items-center gap-2 text-center sm:min-w-[128px] sm:flex-row sm:justify-center sm:text-left">
                <div className={
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm transition ' +
                  (isDone
                    ? 'border-[#2C3E2B] bg-[#2C3E2B] text-white'
                    : isActive
                      ? 'border-[#2C3E2B] bg-white text-[#2C3E2B] shadow-sm'
                      : 'border-gray-200 bg-white text-gray-400')
                }>
                  {isDone ? <HiCheck className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={(isActive || isDone ? 'text-[#2C1E15]' : 'text-gray-400') + ' hidden text-xs font-black sm:inline'}>
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={(isDone ? 'bg-[#2C3E2B]' : 'bg-gray-200') + ' mx-2 h-px flex-1 sm:mx-3'} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}