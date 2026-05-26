import cors from 'cors';
import express from 'express';
import { connectDB } from './config/database';
import { ENV } from './config/env';
import observacionRoutes from './observaciones/observacion.routes';
import solicitudRoutes from './solicitudes/solicitud.routes';

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'adoptions-service', status: 'ok' });
});

app.use('/solicitudes', solicitudRoutes);
app.use('/observaciones', observacionRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

const start = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`[adoptions-service] corriendo en el puerto ${ENV.PORT}`);
  });
};

start();