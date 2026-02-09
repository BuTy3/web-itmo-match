import '../bugsnag';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import AppThemeProvider from './shared/ui/theme/ThemeProvider';
import App from './App';
import { initMetrika } from './shared/lib/analytics/metrika';
import './index.css';

initMetrika();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppThemeProvider>
        <App />
      </AppThemeProvider>
    </Provider>
  </React.StrictMode>,
);
