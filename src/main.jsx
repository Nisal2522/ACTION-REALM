import './data/seeds'; // register demo-backend starting data before anything reads it
import './data/content';
import { loadSettings } from './services/settings';
import { ensureSampleData } from './data/sampleData';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { initAnalytics } from './services/analytics';
import './index.css';
import './features.css';
import './admin/admin.css'; // last, so admin styles override shared ones

loadSettings();
ensureSampleData(); // demo orders, customers and inbox items (first run only)
initAnalytics();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <StoreProvider>
          <App />
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// Installable app (PWA): offline-capable shell. Only in production builds.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
