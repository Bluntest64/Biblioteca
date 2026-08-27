import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/auth.routes.js';
import librosRoutes from './routes/libros.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import prestamosRoutes from './routes/prestamos.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => res.json({
  message: 'API de Biblioteca funcionando correctamente.',
  frontend: 'http://localhost:5173',
  health: '/api/health',
}));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/libros', librosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/prestamos', prestamosRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((error, req, res, _next) => {
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Ya existe un registro con esos datos.' });
  console.error(error);
  return res.status(500).json({ message: 'Error interno del servidor.' });
});

export default app;
