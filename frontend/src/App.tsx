// filepath: src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdoptanteProfilePage from './pages/AdoptanteProfilePage';
import RefugioProfilePage from './pages/RefugioProfilePage';
import AdoptanteDashboard from './pages/AdoptanteDashboard';
import RefugioDashboard from './pages/RefugioDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Inicio */}
        <Route path="/" element={<HomePage />} />

        {/* Autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Completar perfiles */}
        <Route path="/completar-perfil/adoptante" element={<AdoptanteProfilePage />} />
        <Route path="/completar-perfil/refugio" element={<RefugioProfilePage />} />

        {/* Dashboards */}
        <Route path="/dashboard/adoptante" element={<AdoptanteDashboard />} />
        <Route path="/dashboard/refugio" element={<RefugioDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;