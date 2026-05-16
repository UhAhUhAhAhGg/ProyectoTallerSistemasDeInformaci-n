import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { connectDB } from './config/database';
import animalRoutes      from './animales/Animal.routes';
import publicacionRoutes from './publicaciones/Publicacion.routes';
import catalogoRoutes    from './catalogo/Catalogo.routes';
import recomendacionRoutes from './recomendaciones/Recomendacion.routes';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Health
app.get('/health', (_req, res) => {
  res.json({ service: 'pets-service', status: 'ok', port: ENV.PORT });
});

// Rutas
app.use('/animales',     animalRoutes);
app.use('/publicaciones', publicacionRoutes);
app.use('/catalogo',     catalogoRoutes);
app.use('/recomendaciones', recomendacionRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

const start = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║         PETS-SERVICE INICIADO             ║
╠═══════════════════════════════════════════╣
║  Puerto:  ${ENV.PORT}                          ║
║  Health:  http://localhost:${ENV.PORT}/health  ║
║                                           ║
║  Endpoints:                               ║
║    GET    /catalogo             (público) ║
║    GET    /catalogo/refugios    (público) ║
║    GET    /animales/razas       (público) ║
║    GET    /animales/especies    (público) ║
║    POST   /animales             (refugio) ║
║    PUT    /animales/:id         (refugio) ║
║    POST   /publicaciones        (refugio) ║
║    PUT    /publicaciones/:id    (refugio) ║
║    PATCH  /publicaciones/:id/estado       ║
║    PATCH  /publicaciones/:id/baja         ║
╚═══════════════════════════════════════════╝
    `);
  });
};

start();
