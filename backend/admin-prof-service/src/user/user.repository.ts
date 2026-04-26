/**
 * User Repository - Capa de acceso a datos
 * 
 * Responsabilidades:
 * - Operaciones CRUD básicas
 * - Acceso a la base de datos en memoria
 * - No contiene lógica de negocio
 */

import { database } from "../config/database";
import { User, UserRole } from "./user.types";

export class UserRepository {
  /**
   * Obtener usuario por ID
   */
  static findById(id: number): User | undefined {
    return database.getUserById(id);
  }

  /**
   * Obtener todos los usuarios
   */
  static findAll(): User[] {
    return database.getAllUsers();
  }

  /**
   * Guardar usuario (crear o actualizar)
   */
  static save(user: User): User {
    return database.saveUser(user);
  }

  /**
   * Verificar si usuario existe
   */
  static exists(id: number): boolean {
    return database.userExists(id);
  }

  /**
   * Actualizar rol de usuario
   */
  static updateRole(id: number, role: UserRole): User | null {
    const user = database.getUserById(id);
    if (!user) return null;

    user.role = role;
    return this.save(user);
  }

  /**
   * Actualizar perfil de usuario
   */
  static updateProfile(id: number, profileData: Partial<User["profile"]>): User | null {
    const user = database.getUserById(id);
    if (!user) return null;

    user.profile = {
      ...user.profile,
      ...profileData
    };

    return this.save(user);
  }

  /**
   * Obtener usuarios por rol
   */
  static findByRole(role: UserRole): User[] {
    return this.findAll().filter(user => user.role === role);
  }

  /**
   * Contar total de usuarios
   */
  static count(): number {
    return this.findAll().length;
  }
}
