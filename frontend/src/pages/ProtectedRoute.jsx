import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AutenticacionContext';

export function ProtectedRoute({ children }) {
  const autenticacion = useAuth();

  if (autenticacion.cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-base animate-pulse">
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (!autenticacion.sesionIniciada)
    return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;