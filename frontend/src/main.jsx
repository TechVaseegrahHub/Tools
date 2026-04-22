import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css' // Import Tailwind styles
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
// Register service worker and cleanup old ones
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 1. Unregister all old service workers
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => {
        reg.unregister().then(() => console.log('PWA: Old SW unregistered'));
      });
    });

    // 2. Clear all caches
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name).then(() => console.log('PWA: Cache cleared:', name));
      });
    });

    // 3. Register the new service worker
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('PWA: Service Worker registered', reg))
      .catch(err => console.error('PWA: Service Worker registration failed', err));
  });
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
