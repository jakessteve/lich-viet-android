import React, { Suspense, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Outlet } from 'react-router-dom';
import LoadingState from './components/shared/LoadingState';
import AppNav from './components/layout/AppNav';
import MobileDrawer from './components/layout/MobileDrawer';
import AppFooter from './components/layout/AppFooter';
import AppSidebar from './components/layout/AppSidebar';
import ScrollToTopButton from './components/shared/ScrollToTopButton';
import { ROUTE_TO_TAB, type ActiveTab } from './router/constants';
import { LandingRoute, renderModuleRoutes, renderLegacyRedirects, saveCurrentRoute } from './router/routes';
import { analytics } from './services/analyticsService';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import { useViewerLocation } from './hooks/useViewerLocation';
import { getCivilDateForOffset } from '@/utils/geo';
import { ArrowLeft } from 'lucide-react';

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

    const flushRoute = () => {
      saveCurrentRoute(window.location.pathname, window.location.search);
    };

    window.addEventListener('storage', handleStorage);
    document.addEventListener('visibilitychange', flushRoute);
    window.addEventListener('pagehide', flushRoute);
    window.addEventListener('beforeunload', flushRoute);

    return () => {
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', flushRoute);
      window.removeEventListener('pagehide', flushRoute);
      window.removeEventListener('beforeunload', flushRoute);
    };
  }, []);

  // Track page view and persist route on route change
  useEffect(() => {
    analytics.trackPageView(location.pathname + location.search);
    saveCurrentRoute(location.pathname, location.search);
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
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-sans text-text-primary-light dark:text-text-primary-dark antialiased relative">
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
          <div key={location.pathname} className="animate-page-enter">
            {location.pathname !== '/app/cai-dat' && (
              <button
                onClick={() => navigate('/app/am-lich')}
                className="inline-flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-xl text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại ứng dụng
              </button>
            )}
            <Suspense fallback={<LoadingState />}>
              <Outlet />
            </Suspense>
          </div>
        ) : activeTab === 'am-lich' ? (
          /* Am Lich module tab route: with sidebar */
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Sidebar — now autonomous, handles its own state */}
            <div className="w-full md:w-auto shrink-0 order-1 md:order-1">
              <AppSidebar activeTab={activeTab} />
            </div>

            {/* Main Content Area */}
            <div key={location.pathname} className="flex-1 w-full min-w-0 order-2 md:order-2 animate-page-enter">
              <Outlet />
            </div>
          </div>
        ) : (
          /* Non-calendar feature routes: Clean full-width workspace */
          <div key={location.pathname} className="w-full min-w-0 animate-page-enter">
            <Outlet />
          </div>
        )}
      </main>

      <AppFooter />
      <ScrollToTopButton />
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
