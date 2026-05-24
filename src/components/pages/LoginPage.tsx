import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import SuccessToast from '../shared/SuccessToast';

// ══════════════════════════════════════════════════════════
// LoginPage — Email/password login with optional 2FA
// ══════════════════════════════════════════════════════════

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/app/am-lich', { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Vui lòng nhập tên đăng nhập hoặc email.');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    const result = await login({ email: email.trim(), password });

    if (!result.success && result.error) {
      setError(result.error);
    } else if (result.success) {
      setShowToast(true);
      setTimeout(() => navigate('/app/am-lich', { replace: true }), 1200);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 sm:mt-20 px-4 animate-fade-in-up">
      <SuccessToast
        message="Đăng nhập thành công. Chào mừng trở lại!"
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
      <div className="glass-card p-7 sm:p-8">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold/15 to-amber-500/10 dark:from-gold-dark/12 dark:to-amber-400/8 flex items-center justify-center">
            <span className="material-icons-round text-3xl text-gold dark:text-gold-dark">lock_open</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Đăng nhập</h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1.5">
            Đăng nhập để đồng bộ dữ liệu & cá nhân hóa
          </p>
        </div>

        {/* Demo disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/20 mb-5">
          <span className="material-icons-round text-sm text-amber-500 dark:text-amber-400 mt-0.5 shrink-0">info</span>
          <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300/80">
            <strong>Demo:</strong> Xác thực được lưu trên trình duyệt (localStorage). Không dùng mật khẩu thật.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username / Email */}
          <div>
            <label
              htmlFor="login-email"
              className="text-sm font-semibold tracking-wide text-text-secondary-light dark:text-text-secondary-dark block mb-1.5"
            >
              Tên đăng nhập / Email
            </label>
            <div className="relative">
              <span className="material-icons-round text-lg text-text-secondary-light/60 dark:text-text-secondary-dark/60 absolute left-3 top-1/2 -translate-y-1/2">
                person
              </span>
              <input
                id="login-email"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="username hoặc email@example.com"
                autoComplete="username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/30 dark:border-border-dark/30 text-sm focus:ring-2 focus:ring-gold/30 dark:focus:ring-gold-dark/30 outline-none transition-all placeholder:text-text-secondary-light/60 dark:placeholder:text-text-secondary-dark/60"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className="text-sm font-semibold tracking-wide text-text-secondary-light dark:text-text-secondary-dark block mb-1.5"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <span className="material-icons-round text-lg text-text-secondary-light/60 dark:text-text-secondary-dark/60 absolute left-3 top-1/2 -translate-y-1/2">
                lock
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light/30 dark:border-border-dark/30 text-sm focus:ring-2 focus:ring-gold/30 dark:focus:ring-gold-dark/30 outline-none transition-all placeholder:text-text-secondary-light/60 dark:placeholder:text-text-secondary-dark/60"
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
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-gold dark:text-gold-dark hover:underline font-medium"
              onClick={() =>
                setError(
                  'Đặt lại mật khẩu chưa khả dụng trong bản lưu cục bộ. Hãy tạo tài khoản mới nếu bạn đang dùng bản demo.',
                )
              }
            >
              Quên mật khẩu?
            </button>
          </div>

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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold to-amber-600 dark:from-gold-dark dark:to-amber-500 text-white font-semibold text-sm shadow-lg shadow-gold/15 dark:shadow-gold-dark/20 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn-interact"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang đăng nhập...
              </span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border-light/40 dark:bg-border-dark/30" />
          <span className="text-xs uppercase tracking-widest font-bold text-text-secondary-light/60 dark:text-text-secondary-dark/60">
            hoặc
          </span>
          <div className="flex-1 h-px bg-border-light/40 dark:bg-border-dark/30" />
        </div>

        {/* Social login */}
        <div className="space-y-2.5">
          <SocialButton
            provider="google"
            label="Đăng nhập với Google"
            onClick={() => navigate('/app/dang-ky?social=google')}
          />
          <SocialButton
            provider="facebook"
            label="Đăng nhập với Facebook"
            onClick={() => navigate('/app/dang-ky?social=facebook')}
          />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-text-secondary-light dark:text-text-secondary-dark mt-6">
          Chưa có tài khoản?{' '}
          <button
            onClick={() => navigate('/app/dang-ky')}
            className="font-semibold text-gold dark:text-gold-dark hover:underline"
          >
            Đăng ký ngay
          </button>
        </p>
      </div>

      {/* Back to app */}
      <div className="text-center mt-4">
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
// Social Button — Branded Google/Facebook buttons
// ══════════════════════════════════════════════════════════

function SocialButton({
  provider,
  label,
  onClick,
}: {
  provider: 'google' | 'facebook';
  label: string;
  onClick: () => void;
}) {
  const icons: Record<string, React.ReactNode> = {
    google: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none">
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
      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  };

  const styles: Record<string, string> = {
    google:
      'bg-white dark:bg-white/8 border border-border-light/50 dark:border-border-dark/30 text-text-primary-light dark:text-text-primary-dark hover:bg-gray-50 dark:hover:bg-white/12',
    facebook:
      'bg-[#1877F2]/8 dark:bg-[#1877F2]/10 border border-[#1877F2]/20 dark:border-[#1877F2]/15 text-[#1877F2] dark:text-[#5B9EF4] hover:bg-[#1877F2]/15 dark:hover:bg-[#1877F2]/18',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 btn-interact ${styles[provider]}`}
    >
      {icons[provider]}
      {label}
    </button>
  );
}
