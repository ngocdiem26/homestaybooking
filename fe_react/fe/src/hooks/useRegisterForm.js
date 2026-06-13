import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

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

export function useRegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
  };

  const submitRegister = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      showToast('error', 'Mật khẩu nhập lại chưa khớp.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phoneNumber: form.phoneNumber.trim(),
        roleName: toBackendRole(form.accountType),
      });

      showToast('success', 'Đăng ký tài khoản thành công. Vui lòng đăng nhập để tiếp tục.');

      setTimeout(() => {
        navigate('/login');
      }, 900);
    } catch (error) {
      showToast('error', error.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
