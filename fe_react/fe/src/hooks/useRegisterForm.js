import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import { validateRegisterForm } from '../utils/validate';

const initialForm = {
  accountType: 'guest',
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: 'female',
  address: '',
};

function toBackendRole(accountType) {
  return accountType === 'host' ? 'HOST' : 'CUSTOMER';
}

function firstError(errors) {
  return Object.values(errors).find(Boolean) || '';
}

export function useRegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const submitRegister = async (event) => {
    event.preventDefault();
    const nextErrors = validateRegisterForm(form);
    setErrors(nextErrors);
    const message = firstError(nextErrors);
    if (message) {
      showToast('error', message);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phoneNumber: form.phoneNumber.trim(),
        birthday: form.dateOfBirth,
        gender: form.gender,
        address: form.address.trim(),
        roleName: toBackendRole(form.accountType),
      });
      showToast('success', 'Đăng ký tài khoản thành công. Vui lòng đăng nhập.');
      window.setTimeout(() => navigate('/login'), 900);
    } catch (error) {
      showToast('error', error.message || 'Không tạo được tài khoản. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    errors,
    form,
    isSubmitting,
    showConfirmPassword,
    showPassword,
    toast,
    setShowConfirmPassword,
    setShowPassword,
    submitRegister,
    updateField,
  };
}

