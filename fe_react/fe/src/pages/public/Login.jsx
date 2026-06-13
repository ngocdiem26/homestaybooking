import AuthShell from '../../components/auth/AuthShell';
import LoginForm from '../../components/auth/LoginForm';
import { useLoginForm } from '../../hooks/useLoginForm';

export default function Login() {
  const {
    form,
    isSubmitting,
    showPassword,
    toast,
    setShowPassword,
    submitLogin,
    updateField,
  } = useLoginForm();

  return (
    <AuthShell>
      <LoginForm
        form={form}
        isSubmitting={isSubmitting}
        showPassword={showPassword}
        toast={toast}
        onSubmit={submitLogin}
        onTogglePassword={() => setShowPassword((currentValue) => !currentValue)}
        onUpdateField={updateField}
      />
    </AuthShell>
  );
}
