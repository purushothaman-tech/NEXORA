import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';

// Gracefully handle Vite development HMR WebSocket disconnection errors
// In reverse proxy and containerized preview environments (e.g. Cloud Run, single port 3000),
// Vite dev-only WebSocket transport disconnections must not surface as unhandled application rejections.
if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : (reason?.message || '');
    if (
      msg.includes('WebSocket closed without opened') ||
      msg.includes('failed to connect to websocket') ||
      msg.includes('vite:ws')
    ) {
      event.preventDefault();
      // Keep console clean and prevent unhandled promise rejection alerts
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
