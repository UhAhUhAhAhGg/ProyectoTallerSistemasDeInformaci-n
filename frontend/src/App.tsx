import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage               from './pages/HomePage';
import LoginPage              from './pages/LoginPage';
import RegisterPage           from './pages/registro/RegisterPage';
import AdoptanteProfilePage   from './pages/AdoptanteProfilePage';
import RefugioProfilePage     from './pages/RefugioProfilePage';
import AdoptanteDashboard     from './pages/AdoptanteDashboard';
import RefugioDashboard       from './pages/RefugioDashboard';
import AdminDashboard         from './pages/admin/AdminDashboard';
import CatalogPage            from './pages/CatalogPage';
import GestionMascotasPage    from './pages/GestionMascotasPage';
import SolicitudesRefugioPage from './pages/SolicitudesRefugioPage';
import MisSolicitudesPage     from './pages/MisSolicitudesPage';
import NotificacionesPage     from './pages/NotificacionesPage';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Decodifica el payload del JWT almacenado en localStorage. */
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

/** Redirige a /login si no hay sesión activa. */
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const payload = getPayload();
  if (!payload) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/** Permite acceso solo al rol indicado; si no coincide redirige a /. */
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
      <Route path="/"         element={<HomePage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/catalogo" element={<CatalogPage />} />

      {/* ── Completar perfil (requiere sesión) ───────────────────────────── */}
      <Route
        path="/completar-perfil/adoptante"
        element={
          <PrivateRoute>
            <AdoptanteProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/completar-perfil/refugio"
        element={
          <PrivateRoute>
            <RefugioProfilePage />
          </PrivateRoute>
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
        path="/notificaciones"
        element={
          <PrivateRoute>
            <NotificacionesPage />
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