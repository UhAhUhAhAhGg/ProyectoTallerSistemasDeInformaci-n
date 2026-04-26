/**
 * Configuración de variables de entorno
 */

import dotenv from "dotenv";

dotenv.config();

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || "3002", 10),
  NODE_ENV: (process.env.NODE_ENV || "development") as "development" | "production",
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info"
};

/**
 * Validar que las variables requeridas existan
 */
export const validateEnv = (): void => {
  if (!env.PORT) {
    throw new Error("PORT env variable is required");
  }
  console.log(`[ENV] Configuración cargada - PORT: ${env.PORT}, ENV: ${env.NODE_ENV}`);
};
