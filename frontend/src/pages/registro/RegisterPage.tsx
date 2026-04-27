import React, { useState } from "react";
import RegisterAdoptanteMF from "./RegisterAdoptanteMF";
import RegisterRefugioMF from "./RegisterRefugioMF";
import "./RegisterPage.css";

type Rol = "adoptante" | "refugio" | null;

const RegisterPage: React.FC = () => {
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol>(null);

  const handleSuccess = () => {
    window.location.href = "/login";
  };

  const handleSwitch = (nuevoRol: Rol) => {
    setRolSeleccionado(nuevoRol);
  };

  if (rolSeleccionado === "adoptante") {
    return (
      <RegisterAdoptanteMF
        onSuccess={handleSuccess}
        onCancel={() => setRolSeleccionado(null)}
        onSwitchToRefugio={() => handleSwitch("refugio")}
      />
    );
  }

  if (rolSeleccionado === "refugio") {
    return (
      <RegisterRefugioMF
        onSuccess={handleSuccess}
        onCancel={() => setRolSeleccionado(null)}
        onSwitchToAdoptante={() => handleSwitch("adoptante")}
      />
    );
  }

  return (
    <div className="register-shell">
      <div className="register-shell__card">
        <div className="register-shell__logo">
          <span className="register-shell__paw">🐾</span>
          <h1 className="register-shell__title">Crear Cuenta</h1>
          <p className="register-shell__subtitle">
            ¿Cómo deseas registrarte en la plataforma?
          </p>
        </div>

        <div className="register-shell__options">
          <button
            className="register-shell__option register-shell__option--adoptante"
            onClick={() => setRolSeleccionado("adoptante")}
          >
            <span className="register-shell__option-icon">👤</span>
            <span className="register-shell__option-label">Soy Adoptante</span>
            <span className="register-shell__option-desc">
              Quiero encontrar una mascota para adoptar
            </span>
          </button>

          <button
            className="register-shell__option register-shell__option--refugio"
            onClick={() => setRolSeleccionado("refugio")}
          >
            <span className="register-shell__option-icon">🏠</span>
            <span className="register-shell__option-label">Soy Refugio</span>
            <span className="register-shell__option-desc">
              Represento una organización o refugio de animales
            </span>
          </button>
        </div>

        <p className="register-shell__login">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="register-shell__login-link">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;