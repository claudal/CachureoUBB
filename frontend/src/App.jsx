import './App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import TestAuditPage from './pages/TestAuditPage';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestAuditPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
