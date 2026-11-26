import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
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
import MenuAdministradorPage from './pages/MenuAdministrador';
import LoginAdministradorPage from './pages/LoginAdministradorPage';
import LoginEncargadoPage from './pages/LoginEncargadoPage';
import AdministrarEncargadosPage from './pages/AdministrarEncargadosPage';
import CrearEncargadoPage from './pages/CrearEncargadoPage';
import AdministrarCampusPage from './pages/AdministrarCampusPage';
import AdministrarOficinasPage from './pages/AdministrarOficinasPage';
import RestablecerClavePage from './pages/ReestablecerClavePage';
import PerfilPage from './pages/PerfilPage';

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login">
            <Route index element={<LoginEncargadoPage />} />
            <Route path="administrador" element={<LoginAdministradorPage />} />
          </Route>
          <Route path="/restablecerClave" element={<RestablecerClavePage />}/>
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
              <Route
              path="editar/:id"
              element={<CrearAlertaPage />} />
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
              element={<PerfilPage />}
            />
            <Route
              path="entregas"
              element={<ObjetosOficinaPage />}
            />
          </Route>
          <Route path='/menuAdministrador' element={
            <ProtectedRoute type="administrador">
              <MenuAdministradorPage/>
            </ProtectedRoute>
          }>
            <Route
              index
              element={<AdministrarEncargadosPage />}
            />
            <Route
              path="crearEncargado"
              element={<CrearEncargadoPage />}
            />
            <Route
              path="oficinas"
              element={<AdministrarOficinasPage />}
            />
            <Route
              path="editarObjeto/:id"
              element={<RegistrarObjetoPage />}
            />
            <Route
              path="campus"
              element={<AdministrarCampusPage />}
            />
            <Route
              path="perfil"
              element={<PerfilPage />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/menuBusqueda" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
