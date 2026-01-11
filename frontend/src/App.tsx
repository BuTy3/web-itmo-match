import { useEffect } from 'react';
import { AppRouter } from './app/router';
import { ensureMetrika, trackTotalTime } from './shared/metrics/metrika';

console.log('VITE_API_URL =', import.meta.env.VITE_API_URL);


const App = () => {
  useEffect(() => {
    ensureMetrika();
    const startTime = Date.now();

    const handleSessionEnd = () => {
      const seconds = Math.round((Date.now() - startTime) / 1000);
      trackTotalTime(seconds);
    };

    window.addEventListener('beforeunload', handleSessionEnd);
    window.addEventListener('pagehide', handleSessionEnd);

    return () => {
      window.removeEventListener('beforeunload', handleSessionEnd);
      window.removeEventListener('pagehide', handleSessionEnd);
    };
  }, []);

  return <AppRouter />;
};

export default App;
