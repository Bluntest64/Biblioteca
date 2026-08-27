import { Router } from 'express';
import pool from '../config/db.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const [filas] = await pool.query(`SELECT p.id_prestamo AS id, u.nombre AS usuario, p.id_usuario, p.fecha_prestamo AS fechaPrestamo, p.fecha_devolucion AS fechaVencimiento, CASE WHEN p.estado = 'Activo' AND p.fecha_devolucion < CURDATE() THEN 'Vencido' ELSE p.estado END AS estado, DATEDIFF(p.fecha_devolucion, CURDATE()) AS diasRestantes, GROUP_CONCAT(l.titulo SEPARATOR ', ') AS libro FROM prestamos p LEFT JOIN usuarios u ON u.id_usuario = p.id_usuario LEFT JOIN detalle_prestamo d ON d.id_prestamo = p.id_prestamo LEFT JOIN libros l ON l.id_libro = d.id_libro GROUP BY p.id_prestamo ORDER BY p.fecha_prestamo DESC`);
    return res.json(filas);
  } catch (error) { return next(error); }
});

router.post('/', async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id_usuario, id_libro, fecha_devolucion } = req.body;
    if (!id_usuario || !id_libro) return res.status(400).json({ message: 'Usuario y libro son obligatorios.' });
    await connection.beginTransaction();
    const [libros] = await connection.query("SELECT id_libro FROM libros WHERE id_libro = ? AND estado = 'Disponible' FOR UPDATE", [id_libro]);
    if (!libros.length) { await connection.rollback(); return res.status(409).json({ message: 'El libro no está disponible.' }); }
    const [prestamo] = await connection.query("INSERT INTO prestamos (id_usuario, fecha_prestamo, fecha_devolucion, estado) VALUES (?, CURDATE(), ?, 'Activo')", [fecha_devolucion || null]);
    await connection.query('INSERT INTO detalle_prestamo (id_prestamo, id_libro) VALUES (?, ?)', [prestamo.insertId, id_libro]);
    await connection.query("UPDATE libros SET estado = 'Prestado' WHERE id_libro = ?", [id_libro]);
    await connection.commit();
    return res.status(201).json({ id: prestamo.insertId, message: 'Préstamo creado correctamente.' });
  } catch (error) { await connection.rollback(); return next(error); }
  finally { connection.release(); }
});

router.put('/:id/devolver', async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [detalles] = await connection.query('SELECT id_libro FROM detalle_prestamo WHERE id_prestamo = ?', [req.params.id]);
    const [resultado] = await connection.query("UPDATE prestamos SET estado = 'Devuelto', fecha_devolucion = CURDATE() WHERE id_prestamo = ? AND estado = 'Activo'", [req.params.id]);
    if (!resultado.affectedRows) { await connection.rollback(); return res.status(404).json({ message: 'Préstamo activo no encontrado.' }); }
    for (const detalle of detalles) await connection.query("UPDATE libros SET estado = 'Disponible' WHERE id_libro = ?", [detalle.id_libro]);
    await connection.commit();
    return res.json({ message: 'Devolución registrada correctamente.' });
  } catch (error) { await connection.rollback(); return next(error); }
  finally { connection.release(); }
});

export default router;
