import React, { Suspense, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Outlet } from 'react-router-dom';
import LoadingState from './components/shared/LoadingState';
import AppNav from './components/layout/AppNav';
import MobileDrawer from './components/layout/MobileDrawer';
import AppFooter from './components/layout/AppFooter';
import AppSidebar from './components/layout/AppSidebar';
import { ROUTE_TO_TAB, type ActiveTab } from './router/constants';
import { LandingRoute, renderModuleRoutes, renderLegacyRedirects } from './router/routes';
import { analytics } from './services/analyticsService';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useViewerLocation } from './hooks/useViewerLocation';
import { getCivilDateForOffset } from '@/utils/geo';

// ══════════════════════════════════════════════════════════
// App Layout — wraps the main app modules with nav/sidebar
// ══════════════════════════════════════════════════════════

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setViewerLocation = useAppStore((s) => s.setViewerLocation);
  const viewerLocation = useViewerLocation();
  const initialSelectedDateRef = useRef<Date>(selectedDate);
  const hasAppliedViewerLocationRef = useRef(false);

  useEffect(() => {
    useAuthStore.getState().rehydrate();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'auth_user' || event.key === 'auth_user_session_initialized') {
        useAuthStore.getState().rehydrate();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Track page view on route change
  useEffect(() => {
    analytics.trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    setViewerLocation(viewerLocation);
  }, [setViewerLocation, viewerLocation]);

  useEffect(() => {
    if (
      viewerLocation &&
      Number.isFinite(viewerLocation.timezoneOffsetHours) &&
      !hasAppliedViewerLocationRef.current &&
      initialSelectedDateRef.current &&
      selectedDate.getFullYear() === initialSelectedDateRef.current.getFullYear() &&
      selectedDate.getMonth() === initialSelectedDateRef.current.getMonth() &&
      selectedDate.getDate() === initialSelectedDateRef.current.getDate()
    ) {
      hasAppliedViewerLocationRef.current = true;
      setSelectedDate(getCivilDateForOffset(new Date(), viewerLocation.timezoneOffsetHours));
    }
  }, [selectedDate, setSelectedDate, viewerLocation]);

  const activeTab: ActiveTab = ROUTE_TO_TAB[location.pathname] || 'am-lich';
  const isFullPage =
    location.pathname === '/app/cai-dat' ||
    location.pathname === '/app/dang-nhap' ||
    location.pathname === '/app/dang-ky';

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-sans text-text-primary-light dark:text-text-primary-dark transition-colors duration-300 antialiased relative">
      {/* Skip-to-content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold"
      >
        Chuyển đến nội dung chính
      </a>

      {/* Navigation */}
      <AppNav />

      {/* Mobile slide-out drawer */}
      <MobileDrawer />

      <main
        id="main-content"
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full relative z-10 scroll-mt-20"
        aria-label="Nội dung chính"
      >
        {isFullPage ? (
          /* Full-page routes with back-navigation */
          <div>
            {location.pathname !== '/app/cai-dat' && (
              <button
                onClick={() => navigate('/app/am-lich')}
                className="inline-flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-xl text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="material-icons-round text-lg">arrow_back</span>
                Quay lại ứng dụng
              </button>
            )}
            <Suspense fallback={<LoadingState />}>
              <Outlet />
            </Suspense>
          </div>
        ) : (
          /* Module tab routes: with sidebar */
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar — now autonomous, handles its own state */}
            <AppSidebar activeTab={activeTab} />

            {/* Main Content Area — Route-based rendering */}
            <div className="flex-1 w-full min-w-0">
              <Outlet />
            </div>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Root App Component — Top-Level Routing
// ══════════════════════════════════════════════════════════

function App() {
  return (
    <Routes>
      {/* Landing page — standalone, no app chrome */}
      <Route path="/" element={<LandingRoute />} />

      {/* Main app — with nav, sidebar, footer */}
      <Route path="/app" element={<AppLayout />}>
        {renderModuleRoutes()}
      </Route>

      {/* Legacy redirects */}
      {renderLegacyRedirects()}
    </Routes>
  );
}

export default App;
