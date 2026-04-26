import express from 'express';
import { ENV } from './config/env';
import { connectDB } from './config/database';
import solicitudRoutes from './solicitudes/solicitud.routes';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'adoptions-service', status: 'ok' });
});

app.use('/solicitudes', solicitudRoutes);

const start = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`[adoptions-service] corriendo en el puerto ${ENV.PORT}`);
  });
};

start();
