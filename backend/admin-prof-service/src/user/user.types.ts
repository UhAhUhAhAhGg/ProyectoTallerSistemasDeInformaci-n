/**
 * Tipos y interfaces del dominio User
 */

/**
 * Roles válidos en el sistema
 */
export type UserRole = "admin" | "adoptante" | "refugio";

/**
 * Preferencias de adopción del usuario
 */
export interface UserPreferences {
  especie: string;      // Especie preferida (perro, gato, etc.)
  tamano: string;       // Tamaño preferido (pequeño, mediano, grande)
  edad: string;         // Edad preferida (cachorro, joven, adulto, senior)
  comportamiento: string; // Comportamiento preferido (tranquilo, activo, etc.)
}

/**
 * Perfil del usuario adoptante
 */
export interface UserProfile {
  vivienda: string;           // Tipo de vivienda (casa, departamento, etc.)
  tiempo: string;             // Disponibilidad (bajo, medio, alto)
  experiencia: string;        // Experiencia con mascotas (baja, media, alta)
  preferencias: UserPreferences;
}

/**
 * Usuario completo en el sistema
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos para crear/actualizar perfil
 */
export interface UpdateProfileDto {
  vivienda?: string;
  tiempo?: string;
  experiencia?: string;
  preferencias?: Partial<UserPreferences>;
}

/**
 * Datos para cambiar rol (solo admin)
 */
export interface UpdateRoleDto {
  role: UserRole;
}

/**
 * Respuesta de API genérica
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Usuario autenticado simulado en el request
 */
export interface AuthenticatedUser {
  id: number;
  role: UserRole;
}
