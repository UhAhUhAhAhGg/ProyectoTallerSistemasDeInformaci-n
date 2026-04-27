import { Request, Response, NextFunction } from 'express';

export interface GatewayUser {
  id: number;
  rol: 'administrador' | 'adoptante' | 'refugio';
  id_refug: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: GatewayUser;
    }
  }
}

/**
 * Extrae el usuario del JWT directamente desde el header Authorization.
 * En producción esto lo haría un API Gateway; aquí lo decodificamos nosotros.
 */
export const extractUser = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token requerido' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    req.user = {
      id: payload.id,
      rol: payload.rol,
      id_refug: payload.id_refug ?? null,
    };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

export const requireRole = (...roles: GatewayUser['rol'][]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res.status(403).json({ success: false, message: 'Sin permiso para esta acción' });
      return;
    }
    next();
  };