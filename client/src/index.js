import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import './i18n/i18n';

// Prevent duplicate custom element registration errors
if (window.customElements) {
  const originalDefine = window.customElements.define;
  window.customElements.define = function(name, constructor, options) {
    if (window.customElements.get(name)) {
      console.debug(`Custom element ${name} already defined, skipping registration`);
      return;
    }
    try {
      return originalDefine.call(this, name, constructor, options);
    } catch (error) {
      if (error.name === 'NotSupportedError' || error.message.includes('already been defined')) {
        console.debug(`Caught duplicate registration error for ${name}, safely ignoring`);
        return;
      }
      throw error;
    }
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();