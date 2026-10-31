import { Route, Routes, BrowserRouter } from 'react-router-dom';
import TestAuditPage from './pages/TestAuditPage';
import EncargadoLoginPage from './pages/LoginPage';
import AlertasAbiertasPage from './pages/AlertasAbiertasPage';
import InicioPage from './pages/InicioPage';
import { AuthProvider } from './context/AutenticacionContext';

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<TestAuditPage />} />
          <Route path="/login" element={<EncargadoLoginPage />} />
          <Route path="/inicio" element={<InicioPage />} />
          <Route path="/encargado/principal" element={<AlertasAbiertasPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
