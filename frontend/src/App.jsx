import './App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import TestAuditPage from './pages/TestAuditPage';
import LoginPage from './pages/LoginPage';
import AlertasAbiertasPage from './pages/AlertasAbiertasPage';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestAuditPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/encargado/principal" element={<AlertasAbiertasPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
