import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

/**
 * Verifica el JWT firmado por auth-service y carga el usuario en req.user.
 */
export const extractUser = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token requerido' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: number;
      rol: GatewayUser['rol'];
      id_refug?: number | null;
    };

    req.user = {
      id:       payload.id,
      rol:      payload.rol,
      id_refug: payload.id_refug ?? null,
    };

    next();
  } catch (err) {
    const message =
      err instanceof jwt.TokenExpiredError ? 'Token expirado' :
      err instanceof jwt.JsonWebTokenError ? 'Token inválido' :
      'No autorizado';
    res.status(401).json({ success: false, message });
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