import { createContext, useContext, useState, useEffect } from 'react';
import * as services from '../services/autenticacion.js';


const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCargando(false);
        return;
      }

      try {
        const userData = await services.getPerfil();
        setUsuario(userData);
      } catch (error) {
        console.error('Error al restaurar sesión:', error);
        localStorage.removeItem('token');
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    checkAuth();
  }, []);

  const loginEncargadoOficina = async (credenciales) => {
    const data = await services.loginEncargadoOficina(credenciales);
    localStorage.setItem('token', data.token);
    setUsuario(data.usuario);
    return data.usuario;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUsuario(null);
  };

  const value = {
    usuario,
    cargando,
    sesionIniciada: Boolean(usuario),
    loginEncargadoOficina,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;