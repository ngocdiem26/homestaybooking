import AuthShell from '../../components/auth/AuthShell';
import LoginForm from '../../components/auth/LoginForm';
import { useLoginForm } from '../../hooks/useLoginForm';

export default function Login() {
  const {
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
  } = useLoginForm();

  return (
    <AuthShell>
      <LoginForm
        errors={errors}
        form={form}
        googleClientId={googleClientId}
        isSubmitting={isSubmitting}
        showPassword={showPassword}
        toast={toast}
        onGoogleCredential={submitGoogleLogin}
        onSubmit={submitLogin}
        onTogglePassword={() => setShowPassword((currentValue) => !currentValue)}
        onUpdateField={updateField}
      />
    </AuthShell>
  );
}
