import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login, loginWithGoogle } from '../services/authService';
import { useAuth } from './useAuth';
import { validateLoginForm } from '../utils/validate';

const initialForm = { email: '', password: '', rememberMe: false };
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '';

function getRedirectPath(roleName, requestedRedirect) {
  const role = String(roleName || '').toUpperCase();
  if (role === 'ADMIN') return '/admin';
  if (role === 'HOST') return '/host';
  if (requestedRedirect && requestedRedirect.startsWith('/')) return requestedRedirect;
  return '/';
}

function firstError(errors) {
  return Object.values(errors).find(Boolean) || '';
}

export function useLoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: saveLoginSession } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: '' }));
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    window.setTimeout(() => setToast((currentToast) => ({ ...currentToast, show: false })), 2500);
  };

  const completeLogin = (authResponse) => {
    saveLoginSession(authResponse, form.rememberMe);
    showToast('success', 'Chào mừng ' + (authResponse.fullName || 'bạn') + ' quay lại Cozygo.');
    window.setTimeout(() => {
      navigate(getRedirectPath(authResponse.roleName, searchParams.get('redirect')));
    }, 700);
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    const nextErrors = validateLoginForm(form);
    setErrors(nextErrors);
    const message = firstError(nextErrors);
    if (message) {
      showToast('error', message);
      return;
    }

    setIsSubmitting(true);
    try {
      const authResponse = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      completeLogin(authResponse);
    } catch (error) {
      showToast('error', error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitGoogleLogin = async (credential) => {
    if (!googleClientId) {
      showToast('error', 'Chưa cấu hình đăng nhập Google. Bạn vẫn có thể đăng nhập bằng email và mật khẩu.');
      return;
    }

    if (!credential) {
      showToast('error', 'Không nhận được thông tin xác thực từ Google.');
      return;
    }

    setIsSubmitting(true);
    try {
      const authResponse = await loginWithGoogle({ credential });
      completeLogin(authResponse);
    } catch (error) {
      const message = error.message === 'Google Client ID has not been configured'
        ? 'Backend chưa cấu hình GOOGLE_CLIENT_ID. Đăng nhập email vẫn dùng được.'
        : error.message || 'Không đăng nhập được bằng Google.';
      showToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    errors,
    form,
    googleClientId,
    isSubmitting,
    showPassword,
    toast,
    setShowPassword,
    submitGoogleLogin,
    submitLogin,
    updateField,
  };
}

