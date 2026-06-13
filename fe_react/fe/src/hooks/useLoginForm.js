import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { saveAuthSession } from '../services/authStorage';

const initialForm = {
  email: '',
  password: '',
  rememberMe: false,
};

function getRedirectPath(roleName) {
  const normalizedRole = roleName?.trim().toUpperCase();

  if (normalizedRole === 'ADMIN') {
    return '/admin';
  }

  if (normalizedRole === 'HOST') {
    return '/host';
  }

  return '/';
}

export function useLoginForm() {
  const navigate = useNavigate();
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

  const submitLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const authResponse = await login({
        email: form.email.trim(),
        password: form.password,
      });

      saveAuthSession(authResponse);
      showToast('success', `Chào mừng ${authResponse.fullName || 'bạn'} quay lại Cozygo.`);

      setTimeout(() => {
        navigate(getRedirectPath(authResponse.roleName));
      }, 700);
    } catch (error) {
      showToast('error', error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    showPassword,
    toast,
    setShowPassword,
    submitLogin,
    updateField,
  };
}
