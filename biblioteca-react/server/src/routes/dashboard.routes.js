import { Router } from 'express';
import pool from '../config/db.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const [[libros]] = await pool.query('SELECT COUNT(*) AS total, SUM(estado = \'Disponible\') AS disponibles FROM libros');
    const [[usuarios]] = await pool.query('SELECT COUNT(*) AS total FROM usuarios');
    const [[prestamos]] = await pool.query("SELECT COUNT(*) AS total, SUM(estado = 'Activo' AND (fecha_devolucion IS NULL OR fecha_devolucion >= CURDATE())) AS activos FROM prestamos");
    return res.json({ libros, usuarios, prestamos });
  } catch (error) { return next(error); }
});

export default router;
