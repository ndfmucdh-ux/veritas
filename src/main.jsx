import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import '@/styles/layout-nav.css'

// bfcache: never use unload/beforeunload. pagehide/pageshow keep the page eligible.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Restored from back/forward cache: let components re-sync if they need to.
    window.dispatchEvent(new CustomEvent('bfcache-restore'));
  }
});

// iOS Safari ignores user-scalable=no: block pinch gestures explicitly.
['gesturestart', 'gesturechange', 'gestureend'].forEach((n) =>
  document.addEventListener(n, (e) => e.preventDefault(), { passive: false })
);
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)