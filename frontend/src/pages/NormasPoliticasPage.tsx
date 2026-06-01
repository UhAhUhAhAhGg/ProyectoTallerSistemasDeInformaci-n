import Navbar from './Navbar';
import './NormasPoliticasPage.css';

export default function NormasPoliticasPage() {
  return (
    <div className="policies-page">
      <Navbar />
      <main className="policies-shell">
        <section className="policies-hero">
          <span className="policies-kicker">Convivencia responsable</span>
          <h1>Normas y políticas de adopción</h1>
          <p>
            Estas reglas protegen a los animales, adoptantes y refugios durante todo el proceso de adopción.
          </p>
        </section>

        <section className="policies-grid" aria-label="Normas principales">
          <article>
            <h2>Para adoptantes</h2>
            <p>La información del perfil debe ser real y estar actualizada antes de enviar solicitudes.</p>
            <p>Enviar una solicitud implica compromiso para responder al refugio y continuar el seguimiento.</p>
          </article>

          <article>
            <h2>Para refugios</h2>
            <p>Solo los refugios aprobados pueden publicar mascotas disponibles para adopción.</p>
            <p>Las publicaciones deben describir salud, edad, conducta y necesidades especiales con claridad.</p>
          </article>

          <article>
            <h2>Bienestar animal</h2>
            <p>La plataforma prioriza adopciones responsables, no transacciones comerciales.</p>
            <p>Se puede pausar o dar de baja una publicación si la mascota ya no está disponible.</p>
          </article>
        </section>

        <section className="policies-panel">
          <h2>Uso de la plataforma</h2>
          <ul>
            <li>No se permite publicar animales para venta, rifa o intercambio.</li>
            <li>Las cuentas con datos falsos, maltrato reportado o spam pueden ser bloqueadas.</li>
            <li>Las decisiones de adopción corresponden al refugio responsable de cada publicación.</li>
            <li>Las notificaciones del sistema informan cambios de estado y mensajes relevantes del proceso.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
