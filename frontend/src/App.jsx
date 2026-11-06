import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import TestAuditPage from './pages/TestAuditPage';
import EncargadoLoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AutenticacionContext';
import MenuOficinaPage from './pages/MenuOficina';
import ProtectedRoute from './pages/ProtectedRoute';
import AtenderAlertasPage from './pages/AtenderAlertas';
import RegistrarObjetoPage from './pages/RegistrarObjeto';
import ObjetosOficinaPage from './pages/ObjetosOficina';
import MenuBusquedaPage from './pages/MenuBusqueda';
import BuscarObjetos from './pages/BuscarObjetos';
import CrearAlertaPage from './pages/CrearAlerta';
import AlertaBusquedaPage from './pages/AlertaBusquedaPage';

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<EncargadoLoginPage />} />
          <Route path="/menuBusqueda" element={<MenuBusquedaPage />}>
            <Route
              index
              element={<BuscarObjetos />} />
            <Route
              path="alertaBusqueda"
            >
              <Route
              index
              element={<AlertaBusquedaPage />} />
              <Route
              path="crear"
              element={<CrearAlertaPage />} />
               {/* TODO: crear redirección a editar alerta, se reutiliza la página de CrearAlerta con otra ruta y la ID de la alerta */}
            </Route>
          </Route>
          <Route path='/menuOficina' element={
            <ProtectedRoute type="encargado">
              <MenuOficinaPage/>
            </ProtectedRoute>
          }>
            <Route
              index
              element={<ObjetosOficinaPage />}
            />
            <Route
              path="registrarObjeto"
              element={<RegistrarObjetoPage />}
            />
            <Route
              path="editarObjeto/:id"
              element={<RegistrarObjetoPage />}
            />
            <Route
              path="atenderAlertas"
              element={<AtenderAlertasPage />}
            />
            <Route
              path="perfil"
              element={<ObjetosOficinaPage />}
            />
            <Route
              path="entregas"
              element={<ObjetosOficinaPage />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/menuBusqueda" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
