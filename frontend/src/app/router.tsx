import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { HomePage } from '../pages/home/HomePage';
import CollectionsPage from '../pages/collections/CollectionsPage';
import { DrawingPage } from '../pages/drawing/DrawingPage';
import { HistoryPage } from '../pages/history/HistoryPage';
import { HistoryRoomPage } from '../pages/history/HistoryRoomPage';


const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'collections/*',
        element: <CollectionsPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      {
        path: 'history/:id_room',
        element: <HistoryRoomPage />,
      },
      {
        path: 'histore',
        element: <HistoryPage />,
      },
      {
        path: 'histore/:id_room',
        element: <HistoryRoomPage />,
      },
      {
        path: 'drawing',
        element: <DrawingPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
