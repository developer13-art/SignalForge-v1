/**
 * Application Entry Point
 *
 * Bootstraps the React application: attaches the root component to the
 * DOM, imports the global stylesheets, and enables strict mode for
 * development. All global providers live inside `App.jsx` so that the
 * tree can be swapped in tests.
 *
 * @module client/src/main
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import './index.css';
import './styles/globals.css';
import './styles/variables.css';
import './styles/animations.css';
import './styles/themes/dark.css';
import './styles/themes/light.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container not found in index.html');
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    root.unmount();
  });
}