/**
 * User Service - Capa de lógica de negocio
 * 
 * Responsabilidades:
 * - Validaciones de negocio
 * - Orquestación de operaciones
 * - Reglas de negocio
 * - No accede directamente a BD (usa repository)
 */

import { UserRepository } from "./user.repository";
import { UpdateProfileDto, UpdateRoleDto, User, UserRole } from "./user.types";

export class UserService {
  /**
   * Obtener perfil del usuario actual
   * @param userId ID del usuario autenticado
   * @throws Error si el usuario no existe
   */
  static getProfile(userId: number): User {
    const user = UserRepository.findById(userId);
    if (!user) {
      throw new Error(`Usuario con ID ${userId} no encontrado`);
    }
    return user;
  }

  /**
   * Actualizar perfil del usuario
   * @param userId ID del usuario autenticado
   * @param data Datos a actualizar
   * @throws Error si hay validación fallida
   */
  static updateProfile(userId: number, data: UpdateProfileDto): User {
    // Validar que el usuario existe
    const user = UserRepository.findById(userId);
    if (!user) {
      throw new Error(`Usuario con ID ${userId} no encontrado`);
    }

    // Validaciones de datos
    this.validateProfileData(data);

    // Actualizar en repositorio
    const updated = UserRepository.updateProfile(userId, {
      vivienda: data.vivienda || user.profile.vivienda,
      tiempo: data.tiempo || user.profile.tiempo,
      experiencia: data.experiencia || user.profile.experiencia,
      preferencias: data.preferencias
        ? { ...user.profile.preferencias, ...data.preferencias }
        : user.profile.preferencias
    });

    if (!updated) {
      throw new Error("Error al actualizar el perfil");
    }

    return updated;
  }

  /**
   * Obtener todos los usuarios (solo admin)
   */
  static getAllUsers(): User[] {
    return UserRepository.findAll();
  }

  /**
   * Cambiar rol de un usuario (solo admin)
   * @param userId ID del usuario a modificar
   * @param data Datos del nuevo rol
   * @throws Error si hay validación fallida
   */
  static updateUserRole(userId: number, data: UpdateRoleDto): User {
    // Validar que el usuario existe
    if (!UserRepository.exists(userId)) {
      throw new Error(`Usuario con ID ${userId} no encontrado`);
    }

    // Validar rol válido
    const validRoles: UserRole[] = ["admin", "adoptante", "refugio"];
    if (!validRoles.includes(data.role)) {
      throw new Error(`Rol no válido. Roles permitidos: ${validRoles.join(", ")}`);
    }

    // Actualizar en repositorio
    const updated = UserRepository.updateRole(userId, data.role);
    if (!updated) {
      throw new Error("Error al actualizar el rol");
    }

    return updated;
  }

  /**
   * Obtener usuarios por rol
   */
  static getUsersByRole(role: UserRole): User[] {
    const validRoles: UserRole[] = ["admin", "adoptante", "refugio"];
    if (!validRoles.includes(role)) {
      throw new Error(`Rol no válido: ${role}`);
    }
    return UserRepository.findByRole(role);
  }

  /**
   * Validar datos del perfil
   * @private
   */
  private static validateProfileData(data: UpdateProfileDto): void {
    // Validar vivienda si se envía
    if (data.vivienda !== undefined) {
      if (typeof data.vivienda !== "string" || data.vivienda.trim() === "") {
        throw new Error("El campo 'vivienda' debe ser un string no vacío");
      }
    }

    // Validar tiempo si se envía
    if (data.tiempo !== undefined) {
      if (typeof data.tiempo !== "string" || data.tiempo.trim() === "") {
        throw new Error("El campo 'tiempo' debe ser un string no vacío");
      }
    }

    // Validar experiencia si se envía
    if (data.experiencia !== undefined) {
      if (typeof data.experiencia !== "string" || data.experiencia.trim() === "") {
        throw new Error("El campo 'experiencia' debe ser un string no vacío");
      }
    }

    // Validar preferencias si se envían
    if (data.preferencias !== undefined) {
      if (typeof data.preferencias !== "object" || data.preferencias === null) {
        throw new Error("El campo 'preferencias' debe ser un objeto válido");
      }

      // Validar que solo existan campos conocidos
      const camposValidos = ["especie", "tamano", "edad", "comportamiento"];
      const camposEnviados = Object.keys(data.preferencias);
      const camposInvalidos = camposEnviados.filter(c => !camposValidos.includes(c));

      if (camposInvalidos.length > 0) {
        throw new Error(`Campos de preferencias no válidos: ${camposInvalidos.join(", ")}`);
      }
    }
  }
}
