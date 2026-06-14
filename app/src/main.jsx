import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

// HashRouter keeps every route on the same document URL (only the #fragment
// changes). This is what makes an installed iOS PWA stay full-screen when you
// move between pages, path-based routing makes iOS treat other pages as
// "out of scope" and reopens them in an in-app browser (the "Done" bar).
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);

// Fade out and remove the boot splash once the app has mounted.
requestAnimationFrame(() => {
  const splash = document.getElementById('app-splash');
  if (!splash) return;
  splash.classList.add('hide');
  splash.addEventListener('transitionend', () => splash.remove(), { once: true });
  setTimeout(() => splash.remove(), 600);
});
