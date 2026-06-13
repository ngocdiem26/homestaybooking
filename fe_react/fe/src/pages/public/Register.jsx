import AuthShell from '../../components/auth/AuthShell';
import RegisterForm from '../../components/auth/RegisterForm';
import { useRegisterForm } from '../../hooks/useRegisterForm';

export default function Register() {
  const {
    form,
    isSubmitting,
    showConfirmPassword,
    showPassword,
    toast,
    setShowConfirmPassword,
    setShowPassword,
    submitRegister,
    updateField,
  } = useRegisterForm();

  return (
    <AuthShell>
      <RegisterForm
        form={form}
        isSubmitting={isSubmitting}
        showConfirmPassword={showConfirmPassword}
        showPassword={showPassword}
        toast={toast}
        onSubmit={submitRegister}
        onToggleConfirmPassword={() => setShowConfirmPassword((currentValue) => !currentValue)}
        onTogglePassword={() => setShowPassword((currentValue) => !currentValue)}
        onUpdateField={updateField}
      />
    </AuthShell>
  );
}
