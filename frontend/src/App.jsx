import { Route, Routes, BrowserRouter } from 'react-router-dom';
import TestAuditPage from './pages/TestAuditPage';
import EncargadoLoginPage from './pages/LoginPage';
import AlertasAbiertasPage from './pages/AlertasAbiertasPage';
import InicioPage from './pages/InicioPage';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestAuditPage />} />
        <Route path="/login" element={<EncargadoLoginPage />} />
        <Route path="/inicio" element={<InicioPage />} />
        <Route path="/encargado/principal" element={<AlertasAbiertasPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
