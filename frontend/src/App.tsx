// frontend/src/App.tsx
import { Routes, Route } from 'react-router-dom';
import HomePage               from './pages/HomePage';
import LoginPage              from './pages/LoginPage';
import RegisterPage           from './pages/RegisterPage';
import AdoptanteProfilePage   from './pages/AdoptanteProfilePage';
import RefugioProfilePage     from './pages/RefugioProfilePage';
import AdoptanteDashboard     from './pages/AdoptanteDashboard';
import RefugioDashboard       from './pages/RefugioDashboard';
import AdminDashboard         from './pages/AdminDashboard';
import CatalogPage            from './pages/CatalogPage';
import GestionMascotasPage    from './pages/GestionMascotasPage.tsx';
import SolicitudesRefugioPage from './pages/SolicitudesRefugioPage.tsx';
import MisSolicitudesPage     from './pages/MisSolicitudesPage.tsx';
import NotificacionesPage     from './pages/NotificacionesPage.tsx';

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/"                           element={<HomePage />} />
      <Route path="/login"                      element={<LoginPage />} />
      <Route path="/register"                   element={<RegisterPage />} />
      <Route path="/catalogo"                   element={<CatalogPage />} />

      {/* Completar perfil */}
      <Route path="/completar-perfil/adoptante" element={<AdoptanteProfilePage />} />
      <Route path="/completar-perfil/refugio"   element={<RefugioProfilePage />} />

      {/* Dashboards */}
      <Route path="/dashboard/adoptante"        element={<AdoptanteDashboard />} />
      <Route path="/dashboard/refugio"          element={<RefugioDashboard />} />
      <Route path="/admin/dashboard"            element={<AdminDashboard />} />

      {/* Refugio — gestión */}
      <Route path="/refugio/mascotas"           element={<GestionMascotasPage />} />
      <Route path="/refugio/adopciones"         element={<SolicitudesRefugioPage />} />

      {/* Adoptante — historial */}
      <Route path="/mis-solicitudes"            element={<MisSolicitudesPage />} />

      {/* Compartida */}
      <Route path="/notificaciones"             element={<NotificacionesPage />} />
    </Routes>
  );
}
