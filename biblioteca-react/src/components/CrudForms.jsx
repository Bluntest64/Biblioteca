import { useState } from 'react';

function FormularioUsuario({ inicial = {}, onSubmit, cargando }) {
  const [datos, setDatos] = useState({
    nombre: inicial.nombre || '',
    correo: inicial.correo || '',
    telefono: inicial.telefono || '',
    contrasena: '',
    rol: inicial.rol || 'Usuario',
  });
  const cambiar = (event) => setDatos({ ...datos, [event.target.name]: event.target.value });
  return (
    <form className="crud-form" onSubmit={(event) => { event.preventDefault(); onSubmit(datos); }}>
      <Campo label="Nombre" name="nombre" value={datos.nombre} onChange={cambiar} />
      <Campo label="Correo" name="correo" type="email" value={datos.correo} onChange={cambiar} />
      <Campo label="Teléfono" name="telefono" value={datos.telefono} onChange={cambiar} required={false} />
      {!inicial.id_usuario && <Campo label="Contraseña" name="contrasena" type="password" value={datos.contrasena} onChange={cambiar} required />}
      <label className="auth-field">
        <span>Rol</span>
        <select name="rol" value={datos.rol} onChange={cambiar}>
          <option value="Usuario">Usuario</option>
          <option value="Bibliotecario">Bibliotecario</option>
          <option value="Administrador">Administrador</option>
        </select>
      </label>
      <button className="auth-button" type="submit" disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar usuario'}</button>
    </form>
  );
}

function FormularioLibro({ inicial = {}, onSubmit, cargando }) {
  const añoActual = new Date().getFullYear();
  const [datos, setDatos] = useState({
    titulo: inicial.titulo || '',
    autor: inicial.autor || '',
    categoria: inicial.categoria || '',
    año: inicial.año || '',
    estado: inicial.estado || 'disponible',
  });
  const cambiar = (event) => setDatos({ ...datos, [event.target.name]: event.target.value });
  return (
    <form className="crud-form" onSubmit={(event) => { event.preventDefault(); onSubmit({ ...datos, año: datos.año ? Number(datos.año) : null }); }}>
      <Campo label="Título" name="titulo" value={datos.titulo} onChange={cambiar} />
      <Campo label="Autor" name="autor" value={datos.autor} onChange={cambiar} />
      <Campo label="Categoría" name="categoria" value={datos.categoria} onChange={cambiar} required={false} />
      <label className="auth-field">
        <span>Año de publicación</span>
        <input name="año" type="number" min="1" max={añoActual} placeholder={String(añoActual)} value={datos.año} onChange={cambiar} />
      </label>
      <label className="auth-field">
        <span>Estado</span>
        <select name="estado" value={datos.estado} onChange={cambiar}>
          <option value="disponible">Disponible</option>
          <option value="prestado">Prestado</option>
        </select>
      </label>
      <button className="auth-button" type="submit" disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar libro'}</button>
    </form>
  );
}

// El backend acepta varios libros por préstamo (id_libros: [...]), pero
// aquí mantenemos la experiencia simple de "un libro por préstamo": el
// select es único y al enviar lo empaquetamos en un arreglo de un elemento.
//
// Si `mostrarSelectorUsuario` es false (porque quien tiene la sesión es
// un 'Usuario' normal y no puede ver la lista de usuarios), se oculta ese
// campo por completo: el backend ya toma el id del usuario logueado
// automáticamente cuando el rol es 'Usuario'.
function FormularioPrestamo({ usuarios, libros, mostrarSelectorUsuario = true, onSubmit, cargando }) {
  const [datos, setDatos] = useState({ id_usuario: '', id_libro: '', fecha_devolucion: '' });
  const cambiar = (event) => setDatos({ ...datos, [event.target.name]: event.target.value });
  const librosDisponibles = libros.filter((libro) => libro.estado === 'disponible');

  const enviar = (event) => {
    event.preventDefault();
    onSubmit({
      ...(mostrarSelectorUsuario ? { id_usuario: datos.id_usuario } : {}),
      id_libros: [Number(datos.id_libro)],
      fecha_devolucion: datos.fecha_devolucion || null,
    });
  };

  return (
    <form className="crud-form" onSubmit={enviar}>
      {mostrarSelectorUsuario && (
        <label className="auth-field">
          <span>Usuario</span>
          <select name="id_usuario" value={datos.id_usuario} onChange={cambiar} required>
            <option value="">Selecciona un usuario</option>
            {usuarios.map((usuario) => <option key={usuario.id_usuario} value={usuario.id_usuario}>{usuario.nombre}</option>)}
          </select>
        </label>
      )}
      <label className="auth-field">
        <span>Libro disponible ({librosDisponibles.length})</span>
        <select name="id_libro" value={datos.id_libro} onChange={cambiar} required>
          <option value="">Selecciona un libro</option>
          {librosDisponibles.map((libro) => <option key={libro.id_libro} value={libro.id_libro}>{libro.titulo}</option>)}
        </select>
      </label>
      <Campo label="Fecha de vencimiento" name="fecha_devolucion" type="date" value={datos.fecha_devolucion} onChange={cambiar} required={false} />
      <button className="auth-button" type="submit" disabled={cargando || !librosDisponibles.length}>{cargando ? 'Guardando...' : 'Registrar préstamo'}</button>
    </form>
  );
}

function Campo({ label, name, type = 'text', value, onChange, required = true }) {
  return <label className="auth-field"><span>{label}</span><input name={name} type={type} value={value} onChange={onChange} required={required} /></label>;
}

export { FormularioUsuario, FormularioLibro, FormularioPrestamo };
