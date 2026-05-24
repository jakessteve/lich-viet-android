import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { AuthProvider } from '../../types/auth';
import SuccessToast from '../shared/SuccessToast';

// ══════════════════════════════════════════════════════════
// RegisterPage — Email + Social (Google, Facebook) signup
// ══════════════════════════════════════════════════════════

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, socialLogin, isLoading, isAuthenticated } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [socialLoading, setSocialLoading] = useState<AuthProvider | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleSocialLogin = useCallback(
    async (provider: AuthProvider) => {
      setSocialLoading(provider);
      setError('');
      const result = await socialLogin(provider);
      setSocialLoading(null);
      if (result.success) {
        navigate('/app/am-lich', { replace: true });
      } else if (result.error) {
        setError(result.error);
      }
    },
    [socialLogin, navigate],
  );

  // Auto-trigger social login from query param
  useEffect(() => {
    const social = searchParams.get('social') as AuthProvider | null;
    if (social && (social === 'google' || social === 'facebook')) {
      handleSocialLogin(social);
    }
  }, [searchParams, handleSocialLogin]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/am-lich', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const passwordStrength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!displayName.trim()) {
      setError('Vui lòng nhập tên hiển thị.');
      return;
    }
    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (!agreeTerms) {
      setError('Vui lòng đồng ý với điều khoản sử dụng.');
      return;
    }

    const result = await register({
      displayName: displayName.trim(),
      email: email.trim(),
      password,
    });

    if (result.success) {
      setToastMsg(`Chào mừng ${displayName.trim()}! Tài khoản đã được tạo thành công.`);
      setShowToast(true);
      setTimeout(() => navigate('/app/am-lich', { replace: true }), 1500);
    } else if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 sm:mt-16 px-4 animate-fade-in-up">
      <SuccessToast message={toastMsg} visible={showToast} onHide={() => setShowToast(false)} />
      <div className="glass-card p-7 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-mystery-purple/15 to-mystery-blue/10 dark:from-mystery-purple/12 dark:to-mystery-blue/8 flex items-center justify-center">
            <span className="material-icons-round text-3xl text-mystery-purple dark:text-mystery-purple-light">
              person_add
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Tạo tài khoản</h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1.5">
            Đồng bộ dữ liệu & trải nghiệm cá nhân hóa
          </p>
        </div>

        {/* Demo disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/20 mb-5">
          <span className="material-icons-round text-sm text-amber-500 dark:text-amber-400 mt-0.5 shrink-0">info</span>
          <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300/80">
            <strong>Demo:</strong> Dữ liệu lưu trên trình duyệt (localStorage). Không nên dùng mật khẩu thật.
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Display name */}
          <div>
            <label
              htmlFor="reg-name"
              className="text-sm font-semibold tracking-wide text-text-secondary-light dark:text-text-secondary-dark block mb-1.5"
            >
              Tên hiển thị
            </label>
            <div className="relative">
              <span className="material-icons-round text-lg text-text-secondary-light/60 dark:text-text-secondary-dark/60 absolute left-3 top-1/2 -translate-y-1/2">
                badge
              </span>
              <input
                id="reg-name"
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setError('');
                }}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/30 dark:border-border-dark/30 text-sm focus:ring-2 focus:ring-mystery-purple/30 dark:focus:ring-mystery-purple-light/30 outline-none transition-all placeholder:text-text-secondary-light/60 dark:placeholder:text-text-secondary-dark/60"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="reg-email"
              className="text-sm font-semibold tracking-wide text-text-secondary-light dark:text-text-secondary-dark block mb-1.5"
            >
              Email
            </label>
            <div className="relative">
              <span className="material-icons-round text-lg text-text-secondary-light/60 dark:text-text-secondary-dark/60 absolute left-3 top-1/2 -translate-y-1/2">
                mail
              </span>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="email@example.com"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/30 dark:border-border-dark/30 text-sm focus:ring-2 focus:ring-mystery-purple/30 dark:focus:ring-mystery-purple-light/30 outline-none transition-all placeholder:text-text-secondary-light/60 dark:placeholder:text-text-secondary-dark/60"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="reg-password"
              className="text-sm font-semibold tracking-wide text-text-secondary-light dark:text-text-secondary-dark block mb-1.5"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <span className="material-icons-round text-lg text-text-secondary-light/60 dark:text-text-secondary-dark/60 absolute left-3 top-1/2 -translate-y-1/2">
                lock
              </span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Ít nhất 6 ký tự"
                autoComplete="new-password"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/30 dark:border-border-dark/30 text-sm focus:ring-2 focus:ring-mystery-purple/30 dark:focus:ring-mystery-purple-light/30 outline-none transition-all placeholder:text-text-secondary-light/60 dark:placeholder:text-text-secondary-dark/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light/60 dark:text-text-secondary-dark/60 hover:text-text-primary-light dark:hover:text-white transition-colors"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <span className="material-icons-round text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="mt-2 animate-scale-in">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                        level <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${passwordStrength.textColor}`}>{passwordStrength.label}</p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label
              htmlFor="reg-confirm"
              className="text-sm font-semibold tracking-wide text-text-secondary-light dark:text-text-secondary-dark block mb-1.5"
            >
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <span className="material-icons-round text-lg text-text-secondary-light/60 dark:text-text-secondary-dark/60 absolute left-3 top-1/2 -translate-y-1/2">
                lock_reset
              </span>
              <input
                id="reg-confirm"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border text-sm focus:ring-2 outline-none transition-all placeholder:text-text-secondary-light/60 dark:placeholder:text-text-secondary-dark/60 ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-red-300 dark:border-red-700/50 focus:ring-red-500/20'
                    : confirmPassword && confirmPassword === password
                      ? 'border-green-300 dark:border-green-700/50 focus:ring-green-500/20'
                      : 'border-border-light/30 dark:border-border-dark/30 focus:ring-mystery-purple/30 dark:focus:ring-mystery-purple-light/30'
                }`}
              />
              {confirmPassword && (
                <span
                  className={`material-icons-round text-lg absolute right-3 top-1/2 -translate-y-1/2 ${
                    confirmPassword === password ? 'text-good dark:text-good-dark' : 'text-bad dark:text-bad-dark'
                  }`}
                >
                  {confirmPassword === password ? 'check_circle' : 'cancel'}
                </span>
              )}
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                setError('');
              }}
              className="mt-0.5 w-4 h-4 rounded border-border-light/50 dark:border-border-dark/40 text-mystery-purple focus:ring-mystery-purple/30 dark:focus:ring-mystery-purple-light/30"
            />
            <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
              Tôi đồng ý với{' '}
              <button type="button" className="text-gold dark:text-gold-dark font-semibold hover:underline">
                Điều khoản sử dụng
              </button>{' '}
              và{' '}
              <button type="button" className="text-gold dark:text-gold-dark font-semibold hover:underline">
                Chính sách bảo mật
              </button>
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/15 border border-red-200/50 dark:border-red-800/30 animate-scale-in">
              <span className="material-icons-round text-sm text-red-500 dark:text-red-400">error</span>
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-mystery-purple to-mystery-blue text-white font-semibold text-sm shadow-lg shadow-mystery-purple/15 dark:shadow-mystery-purple/25 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-interact"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang tạo tài khoản...
              </span>
            ) : (
              'Tạo tài khoản'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border-light/40 dark:bg-border-dark/30" />
          <span className="text-xs uppercase tracking-widest font-bold text-text-secondary-light/60 dark:text-text-secondary-dark/60">
            hoặc đăng ký nhanh
          </span>
          <div className="flex-1 h-px bg-border-light/40 dark:bg-border-dark/30" />
        </div>

        {/* Social login buttons — after the form */}
        <div className="space-y-2.5">
          <SocialButton
            provider="google"
            label="Tiếp tục với Google"
            onClick={() => handleSocialLogin('google')}
            loading={socialLoading === 'google'}
            disabled={isLoading || !!socialLoading}
          />
          <SocialButton
            provider="facebook"
            label="Tiếp tục với Facebook"
            onClick={() => handleSocialLogin('facebook')}
            loading={socialLoading === 'facebook'}
            disabled={isLoading || !!socialLoading}
          />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-text-secondary-light dark:text-text-secondary-dark mt-5">
          Đã có tài khoản?{' '}
          <button
            onClick={() => navigate('/app/dang-nhap')}
            className="font-semibold text-gold dark:text-gold-dark hover:underline"
          >
            Đăng nhập
          </button>
        </p>
      </div>

      {/* Back to app */}
      <div className="text-center mt-4 mb-8">
        <button
          onClick={() => navigate('/app/am-lich')}
          className="text-sm text-text-secondary-light/60 dark:text-text-secondary-dark/60 hover:text-text-primary-light dark:hover:text-white transition-colors inline-flex items-center gap-1"
        >
          <span className="material-icons-round text-sm">arrow_back</span>
          Quay lại ứng dụng
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Password Strength Calculator
// ══════════════════════════════════════════════════════════

function getPasswordStrength(password: string): { level: number; label: string; color: string; textColor: string } {
  if (!password) return { level: 0, label: '', color: '', textColor: '' };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1)
    return { level: 1, label: 'Yếu', color: 'bg-red-400 dark:bg-red-500', textColor: 'text-red-500 dark:text-red-400' };
  if (score <= 2)
    return {
      level: 2,
      label: 'Trung bình',
      color: 'bg-amber-400 dark:bg-amber-500',
      textColor: 'text-amber-500 dark:text-amber-400',
    };
  if (score <= 3)
    return {
      level: 3,
      label: 'Khá',
      color: 'bg-blue-400 dark:bg-blue-500',
      textColor: 'text-blue-500 dark:text-blue-400',
    };
  return {
    level: 4,
    label: 'Mạnh',
    color: 'bg-emerald-400 dark:bg-emerald-500',
    textColor: 'text-emerald-500 dark:text-emerald-400',
  };
}

// ══════════════════════════════════════════════════════════
// Social Button — Branded Google/Facebook buttons
// ══════════════════════════════════════════════════════════

function SocialButton({
  provider,
  label,
  onClick,
  loading,
  disabled,
}: {
  provider: 'google' | 'facebook';
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const icons: Record<string, React.ReactNode> = {
    google: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
    ),
    facebook: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  };

  const styles: Record<string, string> = {
    google:
      'bg-white dark:bg-white/8 border border-border-light/50 dark:border-border-dark/30 text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-white/12 hover:shadow-md',
    facebook:
      'bg-[#1877F2]/8 dark:bg-[#1877F2]/10 border border-[#1877F2]/20 dark:border-[#1877F2]/15 text-[#1877F2] dark:text-[#5B9EF4] hover:bg-[#1877F2]/15 dark:hover:bg-[#1877F2]/18 hover:shadow-md',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 btn-interact disabled:opacity-50 disabled:cursor-not-allowed ${styles[provider]}`}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        icons[provider]
      )}
      {label}
    </button>
  );
}
