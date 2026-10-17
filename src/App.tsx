import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useRefreshMutation } from './app/api';
import { sessionCleared, sessionReceived } from './app/authSlice';
import { useAppDispatch } from './app/hooks';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingState } from './components/States';

const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const BookDetailPage = lazy(() => import('./pages/BookDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoansPage = lazy(() => import('./pages/LoansPage'));
const ReservationsPage = lazy(() => import('./pages/ReservationsPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ReadingPage = lazy(() => import('./pages/ReadingPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
let sessionCheckStarted = false;

export default function App() {
  const dispatch = useAppDispatch(); const [refresh] = useRefreshMutation();
  useEffect(() => {
    if (sessionCheckStarted) return;
    sessionCheckStarted = true;
    refresh().unwrap().then((session) => dispatch(sessionReceived(session))).catch(() => dispatch(sessionCleared()));
  }, [dispatch, refresh]);
  return <Suspense fallback={<LoadingState label="Preparando NexoLibris" />}><Routes><Route element={<AppLayout />}>
    <Route index element={<HomePage />} /><Route path="catalog" element={<CatalogPage />} /><Route path="books/:workId" element={<BookDetailPage />} /><Route path="login" element={<LoginPage />} /><Route path="register" element={<RegisterPage />} /><Route path="about" element={<AboutPage />} />
    <Route element={<ProtectedRoute />}><Route path="dashboard" element={<DashboardPage />} /><Route path="loans" element={<LoansPage />} /><Route path="reservations" element={<ReservationsPage />} /><Route path="wishlist" element={<WishlistPage />} /><Route path="reading" element={<ReadingPage />} /><Route path="notifications" element={<NotificationsPage />} /><Route path="account" element={<AccountPage />} /></Route>
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes></Suspense>;
}
