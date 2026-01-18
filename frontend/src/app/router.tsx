import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { HomePage } from '../pages/home/HomePage';
import CollectionsPage from '../pages/collections/CollectionsPage';
import { DrawingPage } from '../pages/drawing/DrawingPage';
import { HistoryPage } from '../pages/history/HistoryPage';
import { HistoryRoomPage } from '../pages/history/HistoryRoomPage';
import { RoomCreatePage } from '../pages/rooms/RoomCreatePage';
import { RoomConnectPage } from '../pages/rooms/RoomConnectPage';
import { RoomVotePage } from '../pages/rooms/RoomVotePage';
import { RoomDrawingPage } from '../pages/rooms/RoomDrawingPage';
import { RoomResultsPage } from '../pages/rooms/RoomResultsPage';
import { RoomDrawingsResultsPage } from '../pages/rooms/RoomDrawingsResultsPage';


const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
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
        path: 'history/:id',
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
      {
        path: 'rooms/create',
        element: <RoomCreatePage />,
      },
      {
        path: 'rooms/connect/:id_room',
        element: <RoomConnectPage />,
      },
      {
        path: 'rooms/:id_room',
        element: <RoomVotePage />,
      },
      {
        path: 'rooms/:id_room/drowing',
        element: <RoomDrawingPage />,
      },
      {
        path: 'rooms/:id_room/results',
        element: <RoomResultsPage />,
      },
      {
        path: 'rooms/:id_room/drowing_res',
        element: <RoomDrawingsResultsPage />,
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
