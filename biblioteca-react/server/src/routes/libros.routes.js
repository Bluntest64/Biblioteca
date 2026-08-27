import { Router } from 'express';
import pool from '../config/db.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const [filas] = await pool.query("SELECT id_libro AS id, titulo, autor, categoria, año, estado, (estado = 'Disponible') AS disponibles, 1 AS total FROM libros ORDER BY titulo");
    return res.json(filas);
  } catch (error) { return next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { titulo, autor, categoria, año, estado = 'Disponible' } = req.body;
    if (!titulo || !autor || !categoria || !año) return res.status(400).json({ message: 'Título, autor, categoría y año son obligatorios.' });
    const [resultado] = await pool.query('INSERT INTO libros (titulo, autor, categoria, año, estado) VALUES (?, ?, ?, ?, ?)', [titulo, autor, categoria, año, estado]);
    return res.status(201).json({ id: resultado.insertId, message: 'Libro creado correctamente.' });
  } catch (error) { return next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { titulo, autor, categoria, año, estado } = req.body;
    const [resultado] = await pool.query('UPDATE libros SET titulo = ?, autor = ?, categoria = ?, año = ?, estado = ? WHERE id_libro = ?', [titulo, autor, categoria, año, estado, req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ message: 'Libro no encontrado.' });
    return res.json({ message: 'Libro actualizado correctamente.' });
  } catch (error) { return next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [resultado] = await pool.query('DELETE FROM libros WHERE id_libro = ?', [req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ message: 'Libro no encontrado.' });
    return res.json({ message: 'Libro eliminado correctamente.' });
  } catch (error) { return next(error); }
});

export default router;
