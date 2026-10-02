import './App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import TestAuditPage from './pages/TestAuditPage';
import LoginPage from './pages/LoginPage';
import AtenderAlertasPage from './pages/AtenderAlertasPage';
import TratarAlertaPage from './pages/TratarAlerta';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestAuditPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/atenderAlertas" element={<AtenderAlertasPage />} />
        <Route path="/tratarAlerta/:id" element={<TratarAlertaPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
