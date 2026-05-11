# 🚀 Guía de Ejecución - Microservicios

## 📋 Resumen Rápido

Este proyecto tiene una arquitectura de microservicios con:
- **Backend**: Node.js + Express (Auth Service en puerto 3001)
- **Frontend**: React + TypeScript + Vite (puerto 5173)

---

## ⚡ OPCIÓN 1: Comando Único (Recomendado)

### Primer setup inicial:
```bash
npm run install:all
```

### Ejecutar todos los servicios a la vez:
```bash
npm run dev
```

**Esto abre ambos servicios en una sola terminal con todos los logs visibles.**

---

## 🌱 Poblar la Base de Datos

Si recreaste la base de datos o esta vacia, primero carga el esquema actual:

```text
backend/auth-service/src/config/schema.sql
```

Luego ejecuta los seeds desde la raiz del proyecto:

```bash
npm run seed:admin
npm run seed:demo
```

El seed demo crea un refugio aprobado, razas, mascotas y publicaciones activas para que el catalogo tenga datos.

Credenciales de prueba:

```text
Admin:
admin@petmatch.com / Admin123456!

Refugio:
refugio.demo@petmatch.com / Refugio123456!
```

---

## ⚡ OPCIÓN 2: Scripts Batch (Windows)

Si prefieres abrir cada servicio en su propia ventana (Windows):

```bash
# Doble clic en start-services.bat
# O desde PowerShell:
.\start-services.bat
```

---

## ⚡ OPCIÓN 3: Scripts PowerShell (Windows)

```powershell
# Ejecuta el script
.\start-services.ps1
```

---

## 🔧 Todos los Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run install:all` | Instala dependencias en todos los servicios |
| `npm run dev` | Ejecuta TODOS los servicios en paralelo |
| `npm run dev:backend` | Solo backend |
| `npm run dev:frontend` | Solo frontend |
| `npm run seed:admin` | Crea el usuario administrador |
| `npm run seed:demo` | Crea refugio demo, razas, mascotas y publicaciones |
| `npm run build` | Compilar frontend para producción |
| `npm run start` | Ejecutar servicios en modo producción |

---

## 📍 Puertos

- **Backend (Auth Service)**: `http://localhost:3001`
- **Frontend (Vite)**: `http://localhost:5173`

---

## 🔌 Conectar Frontend con Backend

En tu frontend (React), cuando hagas llamadas a la API:

```typescript
// src/services/api.ts (ejemplo)
const API_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api'
  : '/api';

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};
```

---

## 🎓 ¿Por qué NO necesitamos Docker para desarrollo?

| Aspecto | npm/concurrently | Docker |
|--------|-----------------|--------|
| **Setup** | 2 minutos | 10+ minutos |
| **Overhead** | Mínimo | Alto (virtualización) |
| **Velocidad** | Rápido | Más lento |
| **Desarrollo** | Ideal | Mejor para CI/CD |

**Docker es mejor para:** Producción, CI/CD pipelines, equipos grandes. **concurrently es mejor para:** Desarrollo local, prototipado rápido.

---

## 📦 ¿Qué es concurrently?

Es una herramienta que ejecuta múltiples comandos en paralelo en la misma terminal. Así no necesitas abrir 2+ terminales manualmente.

```bash
# Sin concurrently (necesitas 2 terminales):
Terminal 1: npm run dev:backend
Terminal 2: npm run dev:frontend

# Con concurrently (1 terminal):
npm run dev
```

---

## 🆘 Troubleshooting

### "npm command not found"
- Instala Node.js desde https://nodejs.org/

### "Puerto 3001 ya está en uso"
- Cambia el puerto en `backend/auth-service/.env`:
  ```
  PORT=3002
  ```

### "Puerto 5173 ya está en uso"
- En `frontend/vite.config.ts`, añade:
  ```typescript
  export default {
    server: {
      port: 5174
    }
  }
  ```

---

## 🚀 Próximos Pasos

1. **Instala dependencias:** `npm run install:all`
2. **Levanta los servicios:** `npm run dev`
3. **Abre en el navegador:** `http://localhost:5173`
4. **Empieza a desarrollar!**

---

## 📚 Recursos para Aprender

- **Express (Backend)**: https://expressjs.com/es/
- **React (Frontend)**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/es/
- **Vite (build tool)**: https://vitejs.dev/
