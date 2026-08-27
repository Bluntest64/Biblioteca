import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';

const USUARIO_KEY = 'biblioteca_usuario';

function Registro() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({
    nombre: '',
    contrasena: '',
    telefono: '',
    correo: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (event) => {
    setFormulario({ ...formulario, [event.target.name]: event.target.value });
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formulario.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formulario),
      });
      navigate('/login', { state: { registroExitoso: true } });
    } catch (registroError) {
      setError(registroError.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <FormularioAuth
      etiqueta="NUEVO USUARIO"
      titulo={<>Crea tu cuenta de <span>Biblioteca</span></>}
      descripcion="Registra tus datos para acceder al sistema de gestión bibliotecaria."
      onSubmit={handleSubmit}
      boton={cargando ? 'Registrando...' : 'Crear cuenta'}
      deshabilitado={cargando}
      error={error}
      pie={<>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></>}
    >
      <Campo label="Nombre" name="nombre" value={formulario.nombre} onChange={handleChange} />
      <Campo label="Contraseña" name="contrasena" type="password" value={formulario.contrasena} onChange={handleChange} />
      <Campo label="Teléfono" name="telefono" type="tel" value={formulario.telefono} onChange={handleChange} />
      <Campo label="Correo" name="correo" type="email" value={formulario.correo} onChange={handleChange} />
    </FormularioAuth>
  );
}

function Login() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState({ nombre: '', contrasena: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const registroExitoso = window.history.state?.usr?.registroExitoso;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCargando(true);
    try {
      const respuesta = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(datos),
      });
      sessionStorage.setItem('biblioteca_token', respuesta.token);
      sessionStorage.setItem('biblioteca_sesion', 'activa');
      localStorage.setItem(USUARIO_KEY, JSON.stringify(respuesta.usuario));
      navigate('/');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <FormularioAuth
      etiqueta="ACCESO DE USUARIO"
      titulo={<>Bienvenido de <span>nuevo</span></>}
      descripcion="Inicia sesión con tu nombre de usuario y contraseña para continuar."
      onSubmit={handleSubmit}
      boton={cargando ? 'Ingresando...' : 'Iniciar sesión'}
      deshabilitado={cargando}
      error={error}
      aviso={registroExitoso ? 'Registro completado. Ahora puedes iniciar sesión.' : ''}
      pie={<>¿Todavía no tienes una cuenta? <Link to="/registro">Regístrate</Link></>}
    >
      <Campo label="Nombre de usuario" name="nombre" value={datos.nombre} onChange={(event) => setDatos({ ...datos, nombre: event.target.value })} />
      <Campo label="Contraseña" name="contrasena" type="password" value={datos.contrasena} onChange={(event) => setDatos({ ...datos, contrasena: event.target.value })} />
    </FormularioAuth>
  );
}

function FormularioAuth({ etiqueta, titulo, descripcion, onSubmit, boton, deshabilitado, error, aviso, pie, children }) {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-intro">
          <span className="welcome-label">{etiqueta}</span>
          <h1>{titulo}</h1>
          <p>{descripcion}</p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {children}
          {error && <p className="auth-feedback auth-error">{error}</p>}
          {aviso && <p className="auth-feedback auth-success">{aviso}</p>}
          <button className="auth-button" type="submit" disabled={deshabilitado}>{boton}</button>
          <p className="auth-switch">{pie}</p>
        </form>
      </section>
    </main>
  );
}

function Campo({ label, name, type = 'text', value, onChange }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <input name={name} type={type} value={value} onChange={onChange} required />
    </label>
  );
}

export { Login, Registro };