import { Request, Response, NextFunction } from 'express';

export interface GatewayUser {
  id: number;
  role: 'administrador' | 'adoptante' | 'refugio';
  refugioId: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: GatewayUser;
    }
  }
}

/**
 * Extrae el usuario del JWT en el header Authorization.
 * Compatible con el token generado por auth-service.
 */
export const extractUser = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(403).json({ success: false, message: 'Faltan headers de autenticación' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    req.user = {
      id:        payload.id,
      role:      payload.rol,        // auth-service firma con "rol"
      refugioId: payload.id_refug ?? null,
    };

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

export const requireRole = (...roles: GatewayUser['role'][]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'No tienes permiso para esta acción' });
      return;
    }
    next();
  };

export const forbidden = (res: Response, message = 'No autorizado') =>
  res.status(403).json({ success: false, message, data: null });