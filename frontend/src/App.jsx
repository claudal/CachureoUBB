import './App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import TestAuditPage from './pages/TestAuditPage';
import LoginPage from './pages/LoginPage';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestAuditPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
