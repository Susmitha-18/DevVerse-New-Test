/**
 * React Renderer Entry Point
 *
 * WHY: This is where React mounts into the DOM.
 * It imports global styles first (order matters for CSS cascade),
 * then mounts the App component into #root.
 *
 * This file replaces the scaffold's renderer.ts — we use .tsx
 * because it contains JSX (the ReactDOM.createRoot call).
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

// ─── Mount React ──────────────────────────────────────────────────────────────

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    '[DevVerse] Failed to find #root element. ' +
    'Make sure index.html contains <div id="root"></div>.',
  );
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
