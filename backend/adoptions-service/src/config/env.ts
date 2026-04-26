import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3004,
  DB: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'ref-taller',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },
  SERVICES: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3005',
  },
};
