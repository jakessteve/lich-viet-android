import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/fonts.css';
import './index.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import { analytics } from '@/services/analyticsService';
import { initWebVitals } from '@/utils/webVitals';
import { scheduleSwissEphemerisInit } from '@/services/astronomy/swissEphemeris';

// Initialize services
analytics.init();
initWebVitals();
scheduleSwissEphemerisInit();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary viewName="Ứng dụng (Lỗi nghiêm trọng)">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
