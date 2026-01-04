import { Navigate } from 'react-router-dom';
import { useAuthHook } from '@/pages/auth/hooks/AuthHook';
import { DEFAULT_HOME_PATH } from '@/lib/storage';

interface PublicRouteProps {
  element: JSX.Element;
}

export default function PublicRoute({ element }: PublicRouteProps) {
  const { auth } = useAuthHook();

  if (auth) {
    return <Navigate to={DEFAULT_HOME_PATH} replace />;
  }

  return element;
}
