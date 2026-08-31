# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

# Biblioteca

Aplicación de gestión bibliotecaria con React, Vite, Node.js, Express y MySQL.

El backend vive en un proyecto aparte: `biblioteca-backend/` (junto a esta carpeta, no dentro de ella).

## Configuración del backend

1. Ve a `../biblioteca-backend` y copia `.env.example` como `.env`.
2. Completa `DB_PASSWORD` con la contraseña local de MySQL.
3. Corre el script de esquema: `migrations/001_esquema_biblioteca.sql`.
4. Crea el primer administrador: `node scripts/crear-admin.js "Tu Nombre" tu@correo.com tuclave123`.

## Configuración del frontend

Este proyecto ya trae un `.env` con `VITE_API_URL=http://localhost:3001/api`, apuntando al puerto por defecto de `biblioteca-backend`. Si cambias el `PORT` allá, actualiza este valor.

## Arranque

En una terminal (desde `biblioteca-backend/`):

```powershell
npm run dev
```

En otra terminal (desde esta carpeta):

```powershell
npm run dev
```

La API queda disponible en `http://localhost:3001/api` y el frontend en `http://localhost:5173`.

## Endpoints principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET|POST|PUT|DELETE /api/libros`
- `GET|POST|PUT|DELETE /api/usuarios`
- `GET|POST /api/prestamos`
- `PUT /api/prestamos/:id/devolver`
- `GET /api/dashboard`

Las rutas de gestión requieren el token Bearer entregado por el login. Algunas (gestionar libros, ver el directorio de usuarios, devolver préstamos) requieren rol Bibliotecario o Administrador — una cuenta registrada por `/auth/register` siempre nace con rol "Usuario".
