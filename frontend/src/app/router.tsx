import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { HomePage } from '../pages/home/HomePage';
import { CollectionsPage } from '../pages/collections/CollectionsPage';
import { DrawingPage } from '../pages/drawing/DrawingPage';
import { HistoryPage } from '../pages/history/HistoryPage';
import { HistoryRoomPage } from '../pages/history/HistoryRoomPage';
import { RoomPage } from '../pages/rooms/RoomPage';
import { RoomResultsPage } from '../pages/rooms/RoomResultsPage';


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
        path: 'collections',
        element: <CollectionsPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      {
        path: 'history/:id',
        element: <HistoryRoomPage />,
      },
      {
        path: 'drawing',
        element: <DrawingPage />,
      },
      {
        path: 'rooms/:id',
        element: <RoomPage />,
      },
      {
        path: 'rooms/:id/results',
        element: <RoomResultsPage />,
      },
      {
        path: 'rooms/:id/drawing',
        element: <DrawingPage />,
      },
      {
        path: 'rooms/:id/drawing_res',
        element: <RoomResultsPage />,
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
