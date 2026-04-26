/**
 * Base de datos en memoria (mock)
 * 
 * En producción, esto se reemplazaría con una base de datos real
 * (MongoDB, PostgreSQL, etc.)
 */

import { User, UserRole } from "../user/user.types";

/**
 * Almacenamiento de usuarios en memoria
 * Se reinicia cuando el servicio se reinicia
 */
class InMemoryDatabase {
  private users: Map<number, User> = new Map();

  constructor() {
    // Inicializar con datos de prueba
    this.initializeDefaultData();
  }

  /**
   * Inicializar con datos por defecto
   */
  private initializeDefaultData(): void {
    const defaultUsers: User[] = [
      {
        id: 1,
        name: "Juan Pérez",
        email: "juan@example.com",
        role: "admin",
        profile: {
          vivienda: "departamento",
          tiempo: "medio",
          experiencia: "media",
          preferencias: {
            especie: "perro",
            tamano: "mediano",
            edad: "joven",
            comportamiento: "tranquilo"
          }
        },
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15")
      },
      {
        id: 2,
        name: "María García",
        email: "maria@example.com",
        role: "adoptante",
        profile: {
          vivienda: "casa",
          tiempo: "alto",
          experiencia: "baja",
          preferencias: {
            especie: "gato",
            tamano: "pequeno",
            edad: "cachorro",
            comportamiento: "activo"
          }
        },
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01")
      },
      {
        id: 3,
        name: "Refugio Central",
        email: "refugio@example.com",
        role: "refugio",
        profile: {
          vivienda: "instalacion",
          tiempo: "alto",
          experiencia: "alta",
          preferencias: {
            especie: "mixto",
            tamano: "mixto",
            edad: "mixto",
            comportamiento: "mixto"
          }
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01")
      }
    ];

    defaultUsers.forEach(user => {
      this.users.set(user.id, user);
    });

    console.log("[DATABASE] Base de datos inicializada con 3 usuarios de prueba");
  }

  /**
   * Obtener usuario por ID
   */
  getUserById(id: number): User | undefined {
    return this.users.get(id);
  }

  /**
   * Obtener todos los usuarios
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Guardar/actualizar usuario
   */
  saveUser(user: User): User {
    user.updatedAt = new Date();
    this.users.set(user.id, user);
    return user;
  }

  /**
   * Verificar si existe un usuario
   */
  userExists(id: number): boolean {
    return this.users.has(id);
  }

  /**
   * Obtener estadísticas
   */
  getStats(): { totalUsers: number; usersByRole: Record<UserRole, number> } {
    const users = Array.from(this.users.values());
    const usersByRole: Record<UserRole, number> = {
      admin: 0,
      adoptante: 0,
      refugio: 0
    };

    users.forEach(user => {
      usersByRole[user.role]++;
    });

    return {
      totalUsers: users.length,
      usersByRole
    };
  }
}

// Singleton
export const database = new InMemoryDatabase();
