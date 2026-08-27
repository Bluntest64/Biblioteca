import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { apiFetch } from "../services/api";
import { LIBROS_ACTUALIZADOS } from "../services/eventos";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [pulso, setPulso] = useState(false);
  const anteriorRef = useRef(null);
  const sesionIniciada = sessionStorage.getItem('biblioteca_sesion') === 'activa';
  const usuario = JSON.parse(localStorage.getItem('biblioteca_usuario') || 'null');

  useEffect(() => {
    if (!sesionIniciada) return undefined;

    const cargarDisponibilidad = () => {
      apiFetch('/dashboard')
        .then((data) => {
          const disponibles = Number(data?.libros?.disponibles || 0);
          const total = Number(data?.libros?.total || 0);
          if (anteriorRef.current !== null && anteriorRef.current !== disponibles) {
            setPulso(true);
            setTimeout(() => setPulso(false), 900);
          }
          anteriorRef.current = disponibles;
          setDisponibilidad({ disponibles, total });
        })
        .catch(() => {});
    };

    cargarDisponibilidad();
    window.addEventListener(LIBROS_ACTUALIZADOS, cargarDisponibilidad);
    return () => window.removeEventListener(LIBROS_ACTUALIZADOS, cargarDisponibilidad);
  }, [sesionIniciada, location.pathname]);

  const cerrarSesion = () => {
    sessionStorage.removeItem('biblioteca_sesion');
    localStorage.removeItem('biblioteca_usuario');
    setMenuAbierto(false);
    navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        <div className="logo">
        <div className="logo-icon">B</div>

        <div>
            <h2>Biblioteca</h2>
            <span className="logo-tag">EL FERRY</span>
        </div>
        </div>

        {sesionIniciada && <div className="nav-links" aria-label="Navegación principal">

          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Inicio</NavLink>

          <NavLink to="/usuario" className={({ isActive }) => isActive ? 'active' : ''}>Usuarios</NavLink>

          <NavLink to="/prestamos" className={({ isActive }) => isActive ? 'active' : ''}>Préstamos</NavLink>

          <NavLink to="/catalogo" className={({ isActive }) => isActive ? 'active' : ''}>Catálogo</NavLink>
        </div>}

        <div className="nav-right">
          {sesionIniciada && disponibilidad && (
            <div className={`disponibilidad-badge${pulso ? ' pulso' : ''}`} title="Libros disponibles para préstamo en este momento">
              <span className="disponibilidad-icon" aria-hidden="true">📖</span>
              <div className="disponibilidad-texto">
                <strong>{disponibilidad.disponibles}</strong>
                <small>disponibles</small>
              </div>
            </div>
          )}

          {sesionIniciada ? (
            <div className="session-menu">
              <button
                className="session-logo"
                type="button"
                aria-label="Abrir menú de sesión"
                aria-expanded={menuAbierto}
                onClick={() => setMenuAbierto(!menuAbierto)}
              >
                <span>{usuario?.nombre?.charAt(0).toUpperCase() || 'U'}</span>
                <i className="status-dot"></i>
              </button>
              {menuAbierto && (
                <div className="session-dropdown">
                  <strong>{usuario?.nombre || 'Usuario'}</strong>
                  <small>Sesión iniciada</small>
                  <button type="button" onClick={cerrarSesion}>Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : location.pathname !== '/login' && location.pathname !== '/registro' ? (
            <div className="nav-status">Acceso requerido</div>
          ) : null}
        </div>

    </div>
    </nav>
);
}

export default Navbar;
