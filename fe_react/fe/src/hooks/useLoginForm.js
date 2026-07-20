import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { login, loginWithGoogle } from '../services/authService';
import { useAuth } from './useAuth';

const initialForm = {
  email: '',
  password: '',
  rememberMe: false,
};

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function getRedirectPath(roleName, requestedRedirect) {
  const normalizedRole = roleName?.trim().toUpperCase();

  if (normalizedRole === 'ADMIN') {
    return '/admin';
  }

  if (normalizedRole === 'HOST') {
    return '/host';
  }

  if (requestedRedirect?.startsWith('/')) {
    return requestedRedirect;
  }

  return '/';
}

export function useLoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: saveLoginSession } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const completeLogin = (authResponse) => {
    saveLoginSession(authResponse, form.rememberMe);
    showToast('success', `Chào mừng ${authResponse.fullName || 'bạn'} quay lại Cozygo.`);

    setTimeout(() => {
      navigate(getRedirectPath(authResponse.roleName, searchParams.get('redirect')));
    }, 700);
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const authResponse = await login({
        email: form.email.trim(),
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
    if (!credential) {
      showToast('error', 'Không nhận được thông tin đăng nhập từ Google.');
      return;
    }

    setIsSubmitting(true);

    try {
      const authResponse = await loginWithGoogle({ credential });
      completeLogin(authResponse);
    } catch (error) {
      showToast('error', error.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
