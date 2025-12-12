import { AppRouter } from './app/router';

console.log('VITE_API_URL =', import.meta.env.VITE_API_URL);


const App = () => {
  return <AppRouter />;
};

export default App;
