import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AutenticacionContext';

export function ProtectedRoute({ children, type }) {
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

  if(type === "administrador" && !autenticacion.usuario.correo)
    return <Navigate to="/menuOficina" replace />;

  if(type === "encargado" && !autenticacion.usuario.rut)
    return <Navigate to="/menuAdministrador" replace />;


  return children;
}

export default ProtectedRoute;