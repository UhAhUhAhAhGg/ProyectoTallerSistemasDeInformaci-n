/**
 * Response Helper - Utilidades para respuestas consistentes
 * 
 * Proporciona métodos para enviar respuestas estructuradas
 * a través de toda la API
 */

import { Response } from "express";
import { ApiResponse } from "../user/user.types";

export class ResponseHelper {
  /**
   * Enviar respuesta exitosa
   */
  static success<T = any>(
    res: Response,
    data: T,
    message: string = "Operación exitosa",
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Enviar respuesta de error
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    error?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error: error || message
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Validación fallida (400)
   */
  static validationError(res: Response, message: string): Response {
    return this.error(res, message, 400);
  }

  /**
   * No autorizado (401)
   */
  static unauthorized(res: Response, message: string = "No autorizado"): Response {
    return this.error(res, message, 401);
  }

  /**
   * Acceso prohibido (403)
   */
  static forbidden(res: Response, message: string = "Acceso prohibido"): Response {
    return this.error(res, message, 403);
  }

  /**
   * No encontrado (404)
   */
  static notFound(res: Response, message: string = "Recurso no encontrado"): Response {
    return this.error(res, message, 404);
  }

  /**
   * Error interno (500)
   */
  static serverError(res: Response, message: string = "Error interno del servidor", error?: string): Response {
    return this.error(res, message, 500, error);
  }
}
