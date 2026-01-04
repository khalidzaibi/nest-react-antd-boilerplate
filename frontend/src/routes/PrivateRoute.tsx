import { Navigate, useLocation } from 'react-router-dom';
import { useAuthHook } from '@/pages/auth/hooks/AuthHook';

interface PrivateRouteProps {
  element: JSX.Element;
}

export default function PrivateRoute({ element }: PrivateRouteProps) {
  const { auth } = useAuthHook();
  const location = useLocation();

  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return element;
}
