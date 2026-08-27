import { useState } from 'react';

function FormularioUsuario({ inicial = {}, onSubmit, cargando }) {
  const [datos, setDatos] = useState({ nombre: inicial.nombre || '', correo: inicial.correo || inicial.email || '', telefono: inicial.telefono || '', contrasena: '' });
  const cambiar = (event) => setDatos({ ...datos, [event.target.name]: event.target.value });
  return (
    <form className="crud-form" onSubmit={(event) => { event.preventDefault(); onSubmit(datos); }}>
      <Campo label="Nombre" name="nombre" value={datos.nombre} onChange={cambiar} />
      <Campo label="Correo" name="correo" type="email" value={datos.correo} onChange={cambiar} />
      <Campo label="Teléfono" name="telefono" value={datos.telefono} onChange={cambiar} />
      {!inicial.id && <Campo label="Contraseña" name="contrasena" type="password" value={datos.contrasena} onChange={cambiar} required />}
      <button className="auth-button" type="submit" disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar usuario'}</button>
    </form>
  );
}

function FormularioLibro({ inicial = {}, onSubmit, cargando }) {
  const añoActual = new Date().getFullYear();
  const [datos, setDatos] = useState({ titulo: inicial.titulo || '', autor: inicial.autor || '', categoria: inicial.categoria || '', año: inicial.año || '', estado: inicial.estado || 'Disponible' });
  const cambiar = (event) => setDatos({ ...datos, [event.target.name]: event.target.value });
  return (
    <form className="crud-form" onSubmit={(event) => { event.preventDefault(); onSubmit({ ...datos, año: Number(datos.año) }); }}>
      <Campo label="Título" name="titulo" value={datos.titulo} onChange={cambiar} />
      <Campo label="Autor" name="autor" value={datos.autor} onChange={cambiar} />
      <Campo label="Categoría" name="categoria" value={datos.categoria} onChange={cambiar} />
      <label className="auth-field">
        <span>Año de publicación</span>
        <input name="año" type="number" min="1000" max={añoActual} placeholder={String(añoActual)} value={datos.año} onChange={cambiar} required />
      </label>
      <label className="auth-field">
        <span>Estado</span>
        <select name="estado" value={datos.estado} onChange={cambiar}>
          <option>Disponible</option>
          <option>Prestado</option>
          <option>Inactivo</option>
        </select>
      </label>
      <button className="auth-button" type="submit" disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar libro'}</button>
    </form>
  );
}

function FormularioPrestamo({ usuarios, libros, onSubmit, cargando }) {
  const [datos, setDatos] = useState({ id_usuario: '', id_libro: '', fecha_devolucion: '' });
  const cambiar = (event) => setDatos({ ...datos, [event.target.name]: event.target.value });
  const librosDisponibles = libros.filter((libro) => libro.estado === 'Disponible');
  return (
    <form className="crud-form" onSubmit={(event) => { event.preventDefault(); onSubmit(datos); }}>
      <label className="auth-field"><span>Usuario</span><select name="id_usuario" value={datos.id_usuario} onChange={cambiar} required><option value="">Selecciona un usuario</option>{usuarios.map((usuario) => <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>)}</select></label>
      <label className="auth-field">
        <span>Libro disponible ({librosDisponibles.length})</span>
        <select name="id_libro" value={datos.id_libro} onChange={cambiar} required>
          <option value="">Selecciona un libro</option>
          {librosDisponibles.map((libro) => <option key={libro.id} value={libro.id}>{libro.titulo}</option>)}
        </select>
      </label>
      <Campo label="Fecha de vencimiento" name="fecha_devolucion" type="date" value={datos.fecha_devolucion} onChange={cambiar} />
      <button className="auth-button" type="submit" disabled={cargando || !librosDisponibles.length}>{cargando ? 'Guardando...' : 'Registrar préstamo'}</button>
    </form>
  );
}

function Campo({ label, name, type = 'text', value, onChange, required = true }) {
  return <label className="auth-field"><span>{label}</span><input name={name} type={type} value={value} onChange={onChange} required={required} /></label>;
}

export { FormularioUsuario, FormularioLibro, FormularioPrestamo };
