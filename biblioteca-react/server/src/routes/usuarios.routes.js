import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const [filas] = await pool.query(`SELECT u.id_usuario AS id, u.nombre, u.correo AS email, u.telefono, COUNT(CASE WHEN p.estado = 'Activo' THEN 1 END) AS prestamosActivos, 'Activo' AS estado FROM usuarios u LEFT JOIN prestamos p ON p.id_usuario = u.id_usuario GROUP BY u.id_usuario ORDER BY u.nombre`);
    return res.json(filas);
  } catch (error) { return next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { nombre, correo, telefono, contrasena = 'biblioteca123' } = req.body;
    if (!nombre || !correo || !telefono) return res.status(400).json({ message: 'Nombre, correo y teléfono son obligatorios.' });
    const hash = await bcrypt.hash(contrasena, 12);
    const [resultado] = await pool.query('INSERT INTO usuarios (nombre, correo, telefono, `contraseña`) VALUES (?, ?, ?, ?)', [nombre, correo, telefono, hash]);
    return res.status(201).json({ id: resultado.insertId, message: 'Usuario creado correctamente.' });
  } catch (error) { return next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { nombre, correo, telefono } = req.body;
    const [resultado] = await pool.query('UPDATE usuarios SET nombre = ?, correo = ?, telefono = ? WHERE id_usuario = ?', [nombre, correo, telefono, req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ message: 'Usuario no encontrado.' });
    return res.json({ message: 'Usuario actualizado correctamente.' });
  } catch (error) { return next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [resultado] = await pool.query('DELETE FROM usuarios WHERE id_usuario = ?', [req.params.id]);
    if (!resultado.affectedRows) return res.status(404).json({ message: 'Usuario no encontrado.' });
    return res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) { return next(error); }
});

export default router;
