/**
 * Application Route Configuration — Lịch Việt v3
 *
 * Simplified route definitions for active pages:
 * Landing, Âm Lịch, Gieo Quẻ, Tử Vi
 */

import React, { Suspense } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import LoadingState from '../components/shared/LoadingState';

// Lazy-load pages
const LandingPage = React.lazy(() => import('../components/pages/LandingPage'));
const AmLichPage = React.lazy(() => import('../components/pages/AmLichPage'));
const GieoQueView = React.lazy(() => import('../components/GieoQue/GieoQueView'));
const SettingsPage = React.lazy(() => import('../components/pages/SettingsPage'));
const UpgradePage = React.lazy(() => import('../components/pages/UpgradePage'));
const LoginPage = React.lazy(() => import('../components/pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../components/pages/RegisterPage'));
const TuViPage = React.lazy(() => import('../components/TuVi/TuViPage').then((m) => ({ default: m.TuViPage })));

// ══════════════════════════════════════════════════════════
// Landing Route (standalone, no app chrome)
// ══════════════════════════════════════════════════════════

export function LandingRoute() {
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
      <Route path="phong-thuy" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="acs" element={<Navigate to="/app/am-lich" replace />} />
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
      <Route path="bat-tu" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="chiem-tinh" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="than-so-hoc" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="hop-la" element={<Navigate to="/app/am-lich" replace />} />

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
  return (
    <>
      <Route path="/am-lich" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="/lich-dung-su" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="/phong-thuy" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="/gieo-que" element={<Navigate to="/app/gieo-que" replace />} />
      <Route path="/tu-vi" element={<Navigate to="/app/tu-vi" replace />} />
      <Route path="/bat-tu" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="/chiem-tinh" element={<Navigate to="/app/am-lich" replace />} />
      <Route path="/luc-nham" element={<Navigate to="/app/gieo-que?method=tam-thuc" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  );
}
