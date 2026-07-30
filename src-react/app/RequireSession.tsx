import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSessionStore } from '../stores/session';

export function RequireSession() {
  const settings = useSessionStore((state) => state.settings);
  const location = useLocation();

  if (!settings) {
    return <Navigate replace to="/connect" state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
