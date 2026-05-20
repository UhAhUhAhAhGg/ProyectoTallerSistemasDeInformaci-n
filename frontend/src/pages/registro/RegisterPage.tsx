import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import RegisterAdoptanteMF from "./RegisterAdoptanteMF";
import RegisterRefugioMF from "./RegisterRefugioMF";
import "./RegisterPage.css";

type Rol = "adoptante" | "refugio" | null;

const RegisterPage: React.FC = () => {
  const location = useLocation();
  const initialRole = (location.state as { role?: Rol } | null)?.role ?? null;
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol>(initialRole);

  const handleSuccess = () => {};

  if (rolSeleccionado === "adoptante") {
    return <RegisterAdoptanteMF onSuccess={handleSuccess} />;
  }

  if (rolSeleccionado === "refugio") {
    return <RegisterRefugioMF onSuccess={handleSuccess} />;
  }

  return (
    <div className="register-shell">
      <div className="register-shell__card">
        <div className="register-shell__logo">
          <span className="register-shell__paw">🐾</span>
          <h1 className="register-shell__title">Crear cuenta</h1>
          <p className="register-shell__subtitle">
            Elige como quieres registrarte en PetMatch.
          </p>
        </div>

        <div className="register-shell__options">
          <button
            className="register-shell__option register-shell__option--adoptante"
            onClick={() => setRolSeleccionado("adoptante")}
          >
            <span className="register-shell__option-icon">👤</span>
            <span className="register-shell__option-label">Soy adoptante</span>
            <span className="register-shell__option-desc">
              Quiero encontrar una mascota para adoptar.
            </span>
          </button>

          <button
            className="register-shell__option register-shell__option--refugio"
            onClick={() => setRolSeleccionado("refugio")}
          >
            <span className="register-shell__option-icon">🏠</span>
            <span className="register-shell__option-label">Soy refugio</span>
            <span className="register-shell__option-desc">
              Represento una organizacion o refugio de animales.
            </span>
          </button>
        </div>

        <p className="register-shell__login">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="register-shell__login-link">
            Inicia sesion
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
