import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// bfcache: never use unload/beforeunload. pagehide/pageshow keep the page eligible.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Restored from back/forward cache: let components re-sync if they need to.
    window.dispatchEvent(new CustomEvent('bfcache-restore'));
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)