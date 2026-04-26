/**
 * User Routes - Definición de rutas
 * 
 * Prefijo: /api/users
 * Rutas disponibles:
 * - GET /profile - Obtener perfil del usuario autenticado
 * - PUT /profile - Actualizar perfil del usuario autenticado
 * - GET / - Obtener todos los usuarios (admin only)
 * - PUT /:id/role - Cambiar rol de usuario (admin only)
 * - GET /role/:role - Obtener usuarios por rol (admin only)
 */

import { Router } from "express";
import { checkRole } from "../middlewares/role.middleware";
import { UserController } from "./user.controller";

const router = Router();

// ========== RUTAS DE PERFIL ==========

/**
 * GET /api/users/profile
 * Obtener perfil del usuario autenticado
 * Acceso: Cualquier usuario autenticado
 */
router.get("/profile", UserController.getProfile);

/**
 * PUT /api/users/profile
 * Actualizar perfil del usuario autenticado
 * Acceso: Cualquier usuario autenticado (adoptante, refugio, admin)
 */
router.put("/profile", UserController.updateProfile);

// ========== RUTAS DE ADMINISTRACIÓN ==========

/**
 * GET /api/users
 * Obtener lista de todos los usuarios
 * Acceso: Solo admin
 */
router.get("/", checkRole("admin"), UserController.getAllUsers);

/**
 * PUT /api/users/:id/role
 * Cambiar rol de un usuario
 * Acceso: Solo admin
 * 
 * Body esperado:
 * {
 *   "role": "admin" | "adoptante" | "refugio"
 * }
 */
router.put("/:id/role", checkRole("admin"), UserController.updateRole);

/**
 * GET /api/users/role/:role
 * Obtener usuarios filtrados por rol
 * Acceso: Solo admin
 */
router.get("/role/:role", checkRole("admin"), UserController.getUsersByRole);

export default router;
