import { Pool } from 'pg';
import { ENV } from './env';

export const pool = new Pool(ENV.DB);

export const connectDB = async (): Promise<void> => {
    const client = await pool.connect();
    console.log('[adoptions-service] PostgreSQL conectado');
    client.release();
};
