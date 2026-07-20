import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import AuthToast from './AuthToast';

const SHOW_GOOGLE_LOGIN = false;

function GoogleSignInButton({ clientId, disabled, onCredential }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!clientId || !buttonRef.current || !onCredential) {
      return undefined;
    }

    let cancelled = false;

    const renderButton = () => {
      if (cancelled || !buttonRef.current || !window.google?.accounts?.id) {
        return;
      }

      buttonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(response?.credential),
        ux_mode: 'popup',
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        width: buttonRef.current.offsetWidth || 320,
      });
    };

    if (window.google?.accounts?.id) {
      renderButton();
    } else {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

      if (existingScript) {
        existingScript.addEventListener('load', renderButton, { once: true });
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = renderButton;
        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential]);

  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-xs font-bold text-gray-400"
      >
        Chưa cấu hình Google Client ID
      </button>
    );
  }

  return (
    <div
      ref={buttonRef}
      className={disabled ? 'pointer-events-none opacity-60' : ''}
      aria-disabled={disabled}
    />
  );
}

export default function LoginForm({
  form,
  googleClientId,
  isSubmitting,
  showPassword,
  toast,
  onGoogleCredential,
  onSubmit,
  onTogglePassword,
  onUpdateField,
}) {
  return (
    <>
      <div className="fade-in-active flex-grow flex flex-col justify-center">
        <div className="flex items-center justify-start mb-6">
          <Logo />
        </div>

        <div className="mb-5 text-left">
          <h3 className="font-classic text-2xl font-bold text-[#2C1E15] mb-1">
            Chào mừng quay về nhà!
          </h3>
          <p className="text-xs text-gray-500">
            Đăng nhập để tiếp tục lên lịch cho những chuyến đi ấm áp.
          </p>
        </div>

        <form className="space-y-4 text-left" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">
              Email của bạn
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <i className="fa-regular fa-envelope text-xs"></i>
              </span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => onUpdateField('email', event.target.value)}
                placeholder="nhaminh@gmail.com"
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] focus:ring-1 focus:ring-[#2C3E2B] transition-all text-gray-800"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600">
              Mật khẩu
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <i className="fa-solid fa-lock text-xs"></i>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(event) => onUpdateField('password', event.target.value)}
                placeholder="********"
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#2C3E2B] focus:ring-1 focus:ring-[#2C3E2B] transition-all text-gray-800"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 cursor-pointer hover:text-gray-600 bg-transparent border-0"
                onClick={onTogglePassword}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <label className="flex items-center text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(event) => onUpdateField('rememberMe', event.target.checked)}
                className="rounded border-gray-300 text-[#2C3E2B] mr-2 accent-[#2C3E2B]"
              />
              Ghi nhớ tôi
            </label>
           
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#2C3E2B] hover:bg-[#1a291b] disabled:bg-gray-400 disabled:cursor-not-allowed text-[#F4F1EA] font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-200 text-xs mt-2 flex items-center justify-center space-x-2"
          >
            <span>{isSubmitting ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}</span>
          </button>

          {SHOW_GOOGLE_LOGIN && (
            <>
              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-gray-200"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">hoặc</span>
                <span className="h-px flex-1 bg-gray-200"></span>
              </div>

              <GoogleSignInButton
                clientId={googleClientId}
                disabled={isSubmitting}
                onCredential={onGoogleCredential}
              />
            </>
          )}
        </form>

        <p className="text-center text-[11px] text-gray-400 mt-5">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-[#6E473B] font-bold cursor-pointer hover:underline">
            Tạo tài khoản ngay
          </Link>
        </p>
      </div>

      <AuthToast toast={toast} />

      <div className="mt-4 pt-3 border-t border-gray-200/50 text-center flex items-center justify-between text-[11px] text-gray-400 font-medium italic flex-shrink-0">
        <span>© 2026 Cozygo</span>
        <span className="text-[#6E473B]">Chuyến đi ấm áp bên gia đình</span>
      </div>
    </>
  );
}
