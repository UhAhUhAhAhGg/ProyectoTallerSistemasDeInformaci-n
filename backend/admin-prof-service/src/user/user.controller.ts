/**
 * User Controller - Capa de controladores
 * 
 * Responsabilidades:
 * - Manejar requests HTTP
 * - Parsear parámetros y body
 * - Llamar a servicios
 * - Enviar respuestas
 */

import { Request, Response } from "express";
import { ResponseHelper } from "../utils/response.helper";
import { UserService } from "./user.service";
import { UpdateProfileDto, UpdateRoleDto } from "./user.types";

export class UserController {
  /**
   * GET /api/users/profile
   * Obtener perfil del usuario autenticado
   */
  static getProfile(req: Request, res: Response): void {
    try {
      if (!req.user) {
        ResponseHelper.unauthorized(res);
        return;
      }

      console.log(`[CONTROLLER] Obteniendo perfil del usuario ${req.user.id}`);

      const user = UserService.getProfile(req.user.id);

      ResponseHelper.success(res, 
        {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile
        },
        "Perfil obtenido exitosamente"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      console.error("[CONTROLLER] Error al obtener perfil:", message);

      if (message.includes("no encontrado")) {
        ResponseHelper.notFound(res, message);
      } else {
        ResponseHelper.serverError(res, message);
      }
    }
  }

  /**
   * PUT /api/users/profile
   * Actualizar perfil del usuario autenticado
   */
  static updateProfile(req: Request, res: Response): void {
    try {
      if (!req.user) {
        ResponseHelper.unauthorized(res);
        return;
      }

      console.log(`[CONTROLLER] Actualizando perfil del usuario ${req.user.id}`);

      const data: UpdateProfileDto = req.body;

      // Validar que al menos un campo sea enviado
      if (!data.vivienda && !data.tiempo && !data.experiencia && !data.preferencias) {
        ResponseHelper.validationError(res, "Debe enviar al menos un campo para actualizar");
        return;
      }

      const user = UserService.updateProfile(req.user.id, data);

      ResponseHelper.success(res,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile
        },
        "Perfil actualizado exitosamente"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      console.error("[CONTROLLER] Error al actualizar perfil:", message);

      if (message.includes("no encontrado")) {
        ResponseHelper.notFound(res, message);
      } else if (message.includes("debe ser")) {
        ResponseHelper.validationError(res, message);
      } else {
        ResponseHelper.serverError(res, message);
      }
    }
  }

  /**
   * GET /api/users
   * Obtener todos los usuarios (solo admin)
   */
  static getAllUsers(req: Request, res: Response): void {
    try {
      if (!req.user) {
        ResponseHelper.unauthorized(res);
        return;
      }

      console.log(`[CONTROLLER] Obteniendo lista de usuarios (usuario ${req.user.id})`);

      const users = UserService.getAllUsers();

      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }));

      ResponseHelper.success(res,
        {
          total: formattedUsers.length,
          users: formattedUsers
        },
        "Usuarios obtenidos exitosamente"
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      console.error("[CONTROLLER] Error al obtener usuarios:", message);
      ResponseHelper.serverError(res, message);
    }
  }

  /**
   * PUT /api/users/:id/role
   * Cambiar rol de un usuario (solo admin)
   */
  static updateRole(req: Request, res: Response): void {
    try {
      if (!req.user) {
        ResponseHelper.unauthorized(res);
        return;
      }

      const userId = parseInt(req.params.id, 10);
      console.log(`[CONTROLLER] Actualizando rol del usuario ${userId}`);

      if (isNaN(userId)) {
        ResponseHelper.validationError(res, "ID de usuario inválido");
        return;
      }

      const data: UpdateRoleDto = req.body;

      if (!data.role) {
        ResponseHelper.validationError(res, "El campo 'role' es requerido");
        return;
      }

      const user = UserService.updateUserRole(userId, data);

      ResponseHelper.success(res,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        `Rol actualizado a '${user.role}' exitosamente`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      console.error("[CONTROLLER] Error al actualizar rol:", message);

      if (message.includes("no encontrado")) {
        ResponseHelper.notFound(res, message);
      } else if (message.includes("no válido") || message.includes("requerido")) {
        ResponseHelper.validationError(res, message);
      } else {
        ResponseHelper.serverError(res, message);
      }
    }
  }

  /**
   * GET /api/users/role/:role
   * Obtener usuarios por rol (solo admin)
   */
  static getUsersByRole(req: Request, res: Response): void {
    try {
      if (!req.user) {
        ResponseHelper.unauthorized(res);
        return;
      }

      const role = req.params.role;
      console.log(`[CONTROLLER] Obteniendo usuarios con rol '${role}'`);

      const users = UserService.getUsersByRole(role as any);

      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }));

      ResponseHelper.success(res,
        {
          role,
          total: formattedUsers.length,
          users: formattedUsers
        },
        `Usuarios con rol '${role}' obtenidos exitosamente`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      console.error("[CONTROLLER] Error al obtener usuarios por rol:", message);

      if (message.includes("no válido")) {
        ResponseHelper.validationError(res, message);
      } else {
        ResponseHelper.serverError(res, message);
      }
    }
  }
}
