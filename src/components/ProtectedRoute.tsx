import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { LoadingState } from './States';

export function ProtectedRoute() {
  const { status } = useAppSelector((state) => state.auth);
  const location = useLocation();
  if (status === 'checking') return <LoadingState label="Comprobando tu sesión" />;
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
