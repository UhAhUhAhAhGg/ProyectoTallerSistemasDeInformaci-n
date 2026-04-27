import { Request, Response, NextFunction } from 'express';
import { forbidden } from '../utils/response.helper';

export interface GatewayUser {
  id: number;
  role: 'superadmin' | 'admin' | 'worker' | 'adoptante';
  refugioId: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: GatewayUser;
    }
  }
}

export const extractUser = (req: Request, res: Response, next: NextFunction): void => {
  const id = req.headers['x-user-id'];
  const role = req.headers['x-user-role'];
  const refugioId = req.headers['x-shelter-id'];

  if (!id || !role) {
    forbidden(res, 'Faltan headers de autenticación');
    return;
  }

  req.user = {
    id: Number(id),
    role: role as GatewayUser['role'],
    refugioId: refugioId ? Number(refugioId) : null,
  };

  next();
};

export const requireRole = (...roles: GatewayUser['role'][]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      forbidden(res, 'No tienes permiso para esta acción');
      return;
    }
    next();
  };
