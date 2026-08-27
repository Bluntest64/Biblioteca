import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = Router();

function tokenPara(usuario) {
  return jwt.sign(
    { id: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo },
    process.env.JWT_SECRET,
    { expiresIn: '8h' },
  );
}

router.post('/register', async (req, res, next) => {
  try {
    const { nombre, correo, telefono, contrasena } = req.body;
    if (!nombre || !correo || !telefono || !contrasena || contrasena.length < 6) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios y la contraseña debe tener 6 caracteres.' });
    }

    const [existentes] = await pool.query('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);
    if (existentes.length) return res.status(409).json({ message: 'El correo ya está registrado.' });

    const hash = await bcrypt.hash(contrasena, 12);
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, telefono, `contraseña`) VALUES (?, ?, ?, ?)',
      [nombre, correo, telefono, hash],
    );
    return res.status(201).json({ id: resultado.insertId, message: 'Usuario registrado correctamente.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { nombre, contrasena } = req.body;
    const [filas] = await pool.query('SELECT * FROM usuarios WHERE nombre = ?', [nombre]);
    const usuario = filas[0];
    const coincide = usuario && await bcrypt.compare(contrasena || '', usuario.contraseña);

    if (!coincide) return res.status(401).json({ message: 'El nombre o la contraseña no son correctos.' });
    return res.json({ token: tokenPara(usuario), usuario: { id: usuario.id_usuario, nombre: usuario.nombre, correo: usuario.correo, telefono: usuario.telefono } });
  } catch (error) {
    return next(error);
  }
});

export default router;
