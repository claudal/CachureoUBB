import { Route, Routes, BrowserRouter } from 'react-router-dom';
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

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<TestAuditPage />} />
          <Route path="/login" element={<EncargadoLoginPage />} />
          <Route path="/menuBusqueda" element={<MenuBusquedaPage />}>
            <Route
              index
              element={<BuscarObjetos />} />
            <Route
              path="administrarAlerta"
              element={<BuscarObjetos />} //TODO: Cambiar a componente de administrar alerta
            />
          </Route>
          <Route path='/menuOficina' element={
            <ProtectedRoute>
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
