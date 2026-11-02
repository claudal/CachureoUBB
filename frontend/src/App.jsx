import { Route, Routes, BrowserRouter } from 'react-router-dom';
import TestAuditPage from './pages/TestAuditPage';
import EncargadoLoginPage from './pages/LoginPage';
import InicioPage from './pages/InicioPage';
import { AuthProvider } from './context/AutenticacionContext';
import MenuOficinaPage from './pages/MenuOficina';
import ProtectedRoute from './pages/ProtectedRoute';

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<TestAuditPage />} />
          <Route path="/login" element={<EncargadoLoginPage />} />
          <Route path='/menuOficina' element={
            <ProtectedRoute>
              <MenuOficinaPage/>
            </ProtectedRoute>
          }>
            <Route
              index
              element={<InicioPage />}
            />
            <Route
              path="atenderAlertas"
              element={<InicioPage />}
            />
            <Route
              path="perfil"
              element={<InicioPage />}
            />
            <Route
              path="entregas"
              element={<InicioPage />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
