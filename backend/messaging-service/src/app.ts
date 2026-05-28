import express from 'express';
import cors    from 'cors';
import { ENV }       from './config/env';
import { connectDB } from './config/database';
import mensajeRoutes from './mensajes/mensaje.routes';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'messaging-service', status: 'ok', port: ENV.PORT });
});

app.use('/', mensajeRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

const start = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║       MESSAGING-SERVICE INICIADO         ║
╠══════════════════════════════════════════╣
║  Puerto: ${ENV.PORT}                          ║
║  Health: http://localhost:${ENV.PORT}/health  ║
║                                          ║
║  Endpoints:                              ║
║    POST   /mensajes                      ║
║    GET    /conversaciones                ║
║    GET    /conversaciones/:id/mensajes   ║
║    PATCH  /conversaciones/:id/leidos     ║
║    GET    /no-leidos                     ║
╚══════════════════════════════════════════╝
    `);
  });
};

start();
