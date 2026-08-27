# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:


## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

# Biblioteca

Aplicación de gestión bibliotecaria con React, Vite, Node.js, Express y MySQL.

## Configuración del backend

1. Copia `server/.env.example` como `server/.env`.
2. Completa `DB_PASSWORD` con la contraseña local de MySQL.
3. Confirma que la base de datos `biblioteca` esté disponible en `127.0.0.1:3306`.

## Arranque

En una terminal:

```powershell
cd server
npm run dev
```

En otra terminal:

```powershell
npm run dev
```

La API queda disponible en `http://localhost:3000/api` y el frontend en `http://localhost:5173`.

## Endpoints principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET|POST|PUT|DELETE /api/libros`
- `GET|POST|PUT|DELETE /api/usuarios`
- `GET|POST /api/prestamos`
- `PUT /api/prestamos/:id/devolver`
- `GET /api/dashboard`

Las rutas de gestión requieren el token Bearer entregado por el login.
