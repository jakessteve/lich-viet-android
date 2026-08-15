/**
 * Application Route Configuration — Lịch Việt v3
 *
 * Simplified route definitions for active pages:
 * Landing, Âm Lịch, Gieo Quẻ, Tử Vi
 */

import React, { Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { ErrorBoundary } from '../components/ErrorBoundary';
import LoadingState from '../components/shared/LoadingState';

export const LAST_ACTIVE_ROUTE_KEY = 'lichviet_last_active_route';

export function getSavedRoute(): string {
  try {
    const saved = localStorage.getItem(LAST_ACTIVE_ROUTE_KEY);
    if (saved && saved.startsWith('/app') && saved !== '/app' && saved !== '/app/') {
      return saved;
    }
  } catch {
    // ignore
  }
  return '/app/am-lich';
}

export function saveCurrentRoute(pathname: string, search: string = ''): void {
  try {
    const fullPath = pathname + (search || '');
    if (pathname.startsWith('/app') && pathname !== '/app' && pathname !== '/app/') {
      localStorage.setItem(LAST_ACTIVE_ROUTE_KEY, fullPath);
    }
  } catch {
    // ignore
  }
}

// Lazy-load pages
const LandingPage = React.lazy(() => import('../components/pages/LandingPage'));
const AmLichPage = React.lazy(() => import('../components/pages/AmLichPage'));
const GieoQueView = React.lazy(() => import('../components/GieoQue/GieoQueView'));
const SettingsPage = React.lazy(() => import('../components/pages/SettingsPage'));
const UpgradePage = React.lazy(() => import('../components/pages/UpgradePage'));
const LoginPage = React.lazy(() => import('../components/pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../components/pages/RegisterPage'));
const TuViPage = React.lazy(() => import('../components/TuVi/TuViPage').then((m) => ({ default: m.TuViPage })));
const ElectionPage = React.lazy(() => import('../components/Election/ElectionPage').catch(() => ({ default: () => <div className="p-4 text-center">Đang phát triển Ngày Tốt...</div> })));
const WesternAstrologyPage = React.lazy(() => import('../components/Astrology/Western/WesternAstrologyPage').catch(() => ({ default: () => <div className="p-4 text-center">Đang phát triển Chiêm Tinh Tây Phương...</div> })));
const VedicAstrologyPage = React.lazy(() => import('../components/Astrology/Vedic/VedicAstrologyPage').catch(() => ({ default: () => <div className="p-4 text-center">Đang phát triển Chiêm Tinh Ấn Độ...</div> })));
const SynastryPage = React.lazy(() => import('../components/Astrology/Synastry/SynastryPage').catch(() => ({ default: () => <div className="p-4 text-center">Đang phát triển Hợp Lá Số...</div> })));

// ══════════════════════════════════════════════════════════
// Landing Route (standalone, no app chrome)
// ══════════════════════════════════════════════════════════

export function LandingRoute() {
  const isNative = Capacitor.isNativePlatform();

  // On native Android/iOS app, always keep/restore current in-app route instead of showing web marketing landing page
  if (isNative) {
    const targetRoute = getSavedRoute();
    return <Navigate to={targetRoute} replace />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <LandingPage />
    </Suspense>
  );
}

// ══════════════════════════════════════════════════════════
// App Module Routes (rendered inside AppLayout's <Outlet />)
// ══════════════════════════════════════════════════════════

export function renderModuleRoutes() {
  return (
    <>
      {/* Default redirect */}
      <Route index element={<Navigate to="/app/am-lich" replace />} />

      {/* Module tabs */}
      <Route
        path="am-lich"
        element={
          <ErrorBoundary viewName="Âm Lịch">
            <Suspense fallback={<LoadingState />}>
              <div className="animate-fade-scale">
                <AmLichPage />
              </div>
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route path="lich-dung-su" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="acs" element={<Navigate to="/app/am-lich" replace />} />
      <Route
        path="ngay-tot"
        element={
          <ErrorBoundary viewName="Ngày Tốt">
            <Suspense fallback={<LoadingState />}>
              <div className="animate-fade-scale">
                <ElectionPage />
              </div>
            </Suspense>
          </ErrorBoundary>
        }
      />
      <Route
        path="gieo-que"
        element={
          <ErrorBoundary viewName="Gieo Quẻ — Mai Hoa & Tam Thức">
            <div className="animate-fade-scale">
              <Suspense fallback={<LoadingState />}>
                <GieoQueView />
              </Suspense>
            </div>
          </ErrorBoundary>
        }
      />
      <Route path="luc-nham" element={<Navigate to="/app/gieo-que?method=tam-thuc" replace />} />

      {/* Legacy redirects for removed features */}
      <Route path="hang-ngay" element={<Navigate to="/app/am-lich" replace />} />
      <Route
        path="tu-vi"
        element={
          <ErrorBoundary viewName="Tử Vi — Tử Vi Đẩu Số">
            <div className="animate-fade-scale">
              <Suspense fallback={<LoadingState />}>
                <TuViPage />
              </Suspense>
            </div>
          </ErrorBoundary>
        }
      />
      <Route
        path="chiem-tinh"
        element={<Navigate to="/app/chiem-tinh/tay-phuong" replace />}
      />
      <Route
        path="chiem-tinh/tay-phuong"
        element={
          <ErrorBoundary viewName="Chiêm Tinh Tây Phương">
            <div className="animate-fade-scale">
              <Suspense fallback={<LoadingState />}>
                <WesternAstrologyPage />
              </Suspense>
            </div>
          </ErrorBoundary>
        }
      />
      <Route
        path="chiem-tinh/vedic"
        element={
          <ErrorBoundary viewName="Chiêm Tinh Ấn Độ">
            <div className="animate-fade-scale">
              <Suspense fallback={<LoadingState />}>
                <VedicAstrologyPage />
              </Suspense>
            </div>
          </ErrorBoundary>
        }
      />
      <Route
        path="chiem-tinh/hop-la"
        element={
          <ErrorBoundary viewName="Hợp Lá Số">
            <div className="animate-fade-scale">
              <Suspense fallback={<LoadingState />}>
                <SynastryPage />
              </Suspense>
            </div>
          </ErrorBoundary>
        }
      />
      <Route path="bat-tu" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="than-so-hoc" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="hop-la" element={<Navigate to="/app/chiem-tinh/hop-la" replace />} />

      {/* Settings page */}
      <Route
        path="cai-dat"
        element={
          <Suspense fallback={<LoadingState />}>
            <SettingsPage />
          </Suspense>
        }
      />

      {/* Upgrade status page */}
      <Route
        path="nang-cap"
        element={
          <Suspense fallback={<LoadingState />}>
            <UpgradePage />
          </Suspense>
        }
      />

      {/* Auth pages */}
      <Route
        path="dang-nhap"
        element={
          <Suspense fallback={<LoadingState />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="dang-ky"
        element={
          <Suspense fallback={<LoadingState />}>
            <RegisterPage />
          </Suspense>
        }
      />

      {/* Catch-all for invalid /app/* routes */}
      <Route path="*" element={<Navigate to="/app/am-lich" replace />} />
    </>
  );
}

// ══════════════════════════════════════════════════════════
// Legacy Redirects (old routes → new /app/* paths)
// ══════════════════════════════════════════════════════════

export function renderLegacyRedirects() {
  const isNative = Capacitor.isNativePlatform();
  const fallback = isNative ? getSavedRoute() : '/';

  return (
    <>
      <Route path="/am-lich" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="/lich-dung-su" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="/gieo-que" element={<Navigate to="/app/gieo-que" replace />} />
      <Route path="/tu-vi" element={<Navigate to="/app/tu-vi" replace />} />
      <Route path="/bat-tu" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="/chiem-tinh" element={<Navigate to="/app/chiem-tinh" replace />} />
      <Route path="/luc-nham" element={<Navigate to="/app/gieo-que?method=tam-thuc" replace />} />
      <Route path="*" element={<Navigate to={fallback} replace />} />
    </>
  );
}
