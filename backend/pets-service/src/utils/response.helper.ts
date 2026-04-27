import { Response } from 'express';

export const ok = (res: Response, data: unknown, message = 'OK') =>
  res.status(200).json({ success: true, message, data });

export const created = (res: Response, data: unknown, message = 'Creado') =>
  res.status(201).json({ success: true, message, data });

export const badRequest = (res: Response, message: string) =>
  res.status(400).json({ success: false, message, data: null });

export const forbidden = (res: Response, message = 'No autorizado') =>
  res.status(403).json({ success: false, message, data: null });

export const notFound = (res: Response, message = 'No encontrado') =>
  res.status(404).json({ success: false, message, data: null });

export const serverError = (res: Response, message = 'Error interno') =>
  res.status(500).json({ success: false, message, data: null });