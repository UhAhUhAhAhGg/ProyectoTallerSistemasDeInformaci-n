/**
 * Role Middleware - Control de acceso basado en roles (RBAC)
 * 
 * Middleware para proteger rutas según el rol del usuario
 */

import { NextFunction, Request, Response } from "express";
import { AuthenticatedUser, UserRole } from "../user/user.types";
import { ResponseHelper } from "../utils/response.helper";

/**
 * Extender tipo Request para agregar usuario autenticado
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware de autenticación simulada
 * En producción, esto verificaría un JWT
 */
export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Simulación: usuario con ID 1 es admin
    // En un request real, vendría del JWT
    req.user = {
      id: 1,
      role: "admin" // Cambiar aquí para probar con otros roles
    };

    console.log(`[AUTH] Usuario autenticado: ID=${req.user.id}, Role=${req.user.role}`);
    next();
  } catch (error) {
    console.error("[AUTH] Error en autenticación:", error);
    ResponseHelper.unauthorized(res, "Fallo en autenticación");
  }
};

/**
 * Middleware de autorización por rol
 * Verifica que el usuario tenga el rol requerido
 */
export const checkRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        console.log("[AUTHORIZATION] Usuario no autenticado");
        ResponseHelper.unauthorized(res);
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        console.log(
          `[AUTHORIZATION] Usuario ${req.user.id} con rol ${req.user.role} intenta acceder a ruta que requiere: ${allowedRoles.join(", ")}`
        );
        ResponseHelper.forbidden(
          res,
          `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(", ")}`
        );
        return;
      }

      console.log(`[AUTHORIZATION] Usuario ${req.user.id} autorizado con rol ${req.user.role}`);
      next();
    } catch (error) {
      console.error("[AUTHORIZATION] Error en autorización:", error);
      ResponseHelper.serverError(res);
    }
  };
};

/**
 * Middleware para verificar que el usuario accede solo a su propio recurso
 * (o que es admin)
 */
export const checkOwnerOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      ResponseHelper.unauthorized(res);
      return;
    }

    const userId = parseInt(req.params.id || req.user.id.toString(), 10);

    // Admin puede acceder a cualquier usuario
    if (req.user.role === "admin") {
      next();
      return;
    }

    // No-admin solo puede acceder a su propio perfil
    if (req.user.id !== userId) {
      console.log(
        `[AUTHORIZATION] Usuario ${req.user.id} intenta acceder a usuario ${userId}`
      );
      ResponseHelper.forbidden(res, "Solo puedes acceder a tu propio perfil");
      return;
    }

    next();
  } catch (error) {
    console.error("[AUTHORIZATION] Error:", error);
    ResponseHelper.serverError(res);
  }
};
