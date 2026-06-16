import { Navigate, Route, Routes } from 'react-router-dom';
import AdaptacionSeguimientoPage from './pages/AdaptacionSeguimientoPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdoptanteDashboard from './pages/AdoptanteDashboard';
import AdoptanteProfilePage from './pages/AdoptanteProfilePage';
import CatalogPage from './pages/CatalogPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import GestionMascotasPage from './pages/GestionMascotasPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MatchingPage from './pages/MatchingPage';
import MisSolicitudesPage from './pages/MisSolicitudesPage';
import NormasPoliticasPage from './pages/NormasPoliticasPage';
import NotificacionesPage from './pages/NotificacionesPage';
import RefugioDashboard from './pages/RefugioDashboard';
import RefugioProfilePage from './pages/RefugioProfilePage';
import RegisterPage from './pages/registro/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SolicitudesRefugioPage from './pages/SolicitudesRefugioPage';

// ── Helpers ──────────────────────────────────────────────────────────────────

const getPayload = (): { rol?: string } | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

// ── Guardas de ruta ───────────────────────────────────────────────────────────

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const payload = getPayload();
  if (!payload) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RoleRoute = ({
  rol,
  children,
}: {
  rol: 'adoptante' | 'refugio' | 'administrador';
  children: React.ReactNode;
}) => {
  const payload = getPayload();
  if (!payload) return <Navigate to="/login" replace />;
  if (payload.rol !== rol) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      {/* ── Públicas ─────────────────────────────────────────────────────── */}
      <Route path="/"                  element={<HomePage />} />
      <Route path="/login"             element={<LoginPage />} />
      <Route path="/register"          element={<RegisterPage />} />
      <Route path="/catalogo"          element={<CatalogPage />} />
      <Route path="/normas-politicas"  element={<NormasPoliticasPage />} />
      <Route path="/forgot-password"   element={<ForgotPasswordPage />} />
      <Route path="/reset-password"    element={<ResetPasswordPage />} />

      {/* ── Completar perfil (requiere sesión) ───────────────────────────── */}
      <Route
        path="/completar-perfil/adoptante"
        element={
          <RoleRoute rol="adoptante">
            <AdoptanteProfilePage />
          </RoleRoute>
        }
      />
      <Route
        path="/completar-perfil/refugio"
        element={
          <RoleRoute rol="refugio">
            <RefugioProfilePage />
          </RoleRoute>
        }
      />

      {/* ── Dashboards (protegidos por rol) ──────────────────────────────── */}
      <Route
        path="/dashboard/adoptante"
        element={
          <RoleRoute rol="adoptante">
            <AdoptanteDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/dashboard/refugio"
        element={
          <RoleRoute rol="refugio">
            <RefugioDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute rol="administrador">
            <AdminDashboard />
          </RoleRoute>
        }
      />

      {/* ── Refugio — gestión ────────────────────────────────────────────── */}
      <Route
        path="/refugio/mascotas"
        element={
          <RoleRoute rol="refugio">
            <GestionMascotasPage />
          </RoleRoute>
        }
      />
      <Route
        path="/refugio/adopciones"
        element={
          <RoleRoute rol="refugio">
            <SolicitudesRefugioPage />
          </RoleRoute>
        }
      />

      {/* ── Adoptante — historial ────────────────────────────────────────── */}
      <Route
        path="/mis-solicitudes"
        element={
          <RoleRoute rol="adoptante">
            <MisSolicitudesPage />
          </RoleRoute>
        }
      />

      {/* ── Compartida ───────────────────────────────────────────────────── */}
      <Route
        path="/matching"
        element={
          <RoleRoute rol="adoptante">
            <MatchingPage />
          </RoleRoute>
        }
      />
      <Route
        path="/notificaciones"
        element={
          <PrivateRoute>
            <NotificacionesPage />
          </PrivateRoute>
        }
      />

      {/* ── Adaptación / Seguimiento ─────────────────────────────────────── */}
      <Route
        path="/adaptacion-seguimiento"
        element={
          <PrivateRoute>
            <AdaptacionSeguimientoPage />
          </PrivateRoute>
        }
      />

      {/* ── Legacy: /admin → /admin/dashboard ────────────────────────────── */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* ── 404 ──────────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}