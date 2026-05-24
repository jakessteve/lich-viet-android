import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/fonts.css';
import './index.css';

import { analytics } from '@/services/analyticsService';
import { initWebVitals } from '@/utils/webVitals';
import { scheduleSwissEphemerisInit } from '@/services/astronomy/swissEphemeris';

// Initialize services
analytics.init();
initWebVitals();
scheduleSwissEphemerisInit();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
