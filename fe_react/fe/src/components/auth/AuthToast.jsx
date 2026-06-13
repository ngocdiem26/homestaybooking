export default function AuthToast({ toast }) {
  if (!toast.show) {
    return null;
  }

  const isError = toast.type === 'error';

  return (
    <div className={`absolute bottom-4 left-6 right-6 p-4 rounded-xl shadow-2xl border flex items-center justify-between z-50 ${
      isError
        ? 'bg-red-600 border-red-400/20 text-white'
        : 'bg-[#2C3E2B] border-white/10 text-[#F4F1EA]'
    }`}>
      <div className="flex items-center space-x-3 text-xs sm:text-sm">
        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <i className={`fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-check'} ${isError ? 'text-white' : 'text-green-400'}`}></i>
        </span>
        <p className="font-medium text-left">{toast.message}</p>
      </div>
    </div>
  );
}
