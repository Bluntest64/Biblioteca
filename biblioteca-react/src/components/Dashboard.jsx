import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../services/api';
import { LIBROS_ACTUALIZADOS } from '../services/eventos';

function Dashboard() {
  const [estadisticas, setEstadisticas] = useState({ libros: { total: 0, disponibles: 0 }, usuarios: { total: 0 }, prestamos: { total: 0, activos: 0 } });
  const [pulso, setPulso] = useState(false);
  const anteriorRef = useRef(null);

  useEffect(() => {
    const cargar = () => {
      apiFetch('/dashboard').then((data) => {
        const disponibles = Number(data?.libros?.disponibles || 0);
        if (anteriorRef.current !== null && anteriorRef.current !== disponibles) {
          setPulso(true);
          setTimeout(() => setPulso(false), 900);
        }
        anteriorRef.current = disponibles;
        setEstadisticas(data);
      }).catch(() => {});
    };
    cargar();
    window.addEventListener(LIBROS_ACTUALIZADOS, cargar);
    return () => window.removeEventListener(LIBROS_ACTUALIZADOS, cargar);
  }, []);

  const porcentajeDisponible = estadisticas.libros.total
    ? Math.round((estadisticas.libros.disponibles / estadisticas.libros.total) * 100)
    : 0;
  const porcentajePrestado = 100 - porcentajeDisponible;
  const porcentajeUsuariosConPrestamo = estadisticas.usuarios.total
    ? Math.round((estadisticas.prestamos.activos / estadisticas.usuarios.total) * 100)
    : 0;

  return (
    <section className="dashboard">

      {/* Encabezado */}
      <div className="dashboard-header">

        <div>
          <span className="welcome-label">PANEL PRINCIPAL</span>

          <h1>
            Gestiona tu biblioteca
            <span> de forma sencilla.</span>
          </h1>

          <p>
            Consulta el catálogo, administra usuarios y controla
            los préstamos desde un solo lugar.
          </p>
        </div>

        <div className="spotlight-card">
          <span className="spotlight-label">EN ESTE MOMENTO</span>
          <div className="spotlight-value">
            <strong className={pulso ? 'pulso' : ''}>{estadisticas.libros.disponibles}</strong>
            <em>de {estadisticas.libros.total}</em>
          </div>
          <small>libros disponibles para préstamo</small>
        </div>

      </div>


      {/* Estadísticas */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">📚</div>

          <div>
            <span>LIBROS</span>
            <h2>{estadisticas.libros.total}</h2>
            <p>En el catálogo</p>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">👤</div>

          <div>
            <span>USUARIOS</span>
            <h2>{estadisticas.usuarios.total}</h2>
            <p>Registrados</p>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">🔖</div>

          <div>
            <span>PRÉSTAMOS</span>
            <h2>{estadisticas.prestamos.activos}</h2>
            <p>Actualmente activos</p>
          </div>
        </div>


        <div className={`stat-card highlight${pulso ? ' pulso' : ''}`}>
          <div className="stat-icon">✓</div>

          <div>
            <span>DISPONIBLES</span>
            <h2>{estadisticas.libros.disponibles}</h2>
            <p>Libros disponibles</p>
          </div>
        </div>

      </div>


      {/* Sección inferior */}
      <div className="content-grid">

        {/* Acciones */}
        <div className="panel">

          <div className="panel-header">
            <div>
              <span>GESTIÓN</span>
              <h3>Acciones rápidas</h3>
            </div>
          </div>


          <div className="actions">

            <Link to="/catalogo" className="action">
              <div className="action-icon">+</div>

              <div>
                <strong>Registrar libro</strong>
                <p>Añadir un nuevo libro al catálogo</p>
              </div>

              <span>→</span>
            </Link>


            <Link to="/usuario" className="action">
              <div className="action-icon">+</div>

              <div>
                <strong>Nuevo usuario</strong>
                <p>Registrar un usuario en el sistema</p>
              </div>

              <span>→</span>
            </Link>


            <Link to="/prestamos" className="action">
              <div className="action-icon">↗</div>

              <div>
                <strong>Gestionar préstamos</strong>
                <p>Consultar préstamos activos</p>
              </div>

              <span>→</span>
            </Link>

          </div>

        </div>


        {/* Estado */}
        <div className="panel">

          <div className="panel-header">
            <div>
              <span>RESUMEN</span>
              <h3>Estado de la biblioteca</h3>
            </div>
          </div>


          <div className="progress-item">

            <div className="progress-info">
              <span>Disponibilidad del catálogo</span>
              <strong>{porcentajeDisponible}%</strong>
            </div>

            <div className="progress">
              <div className="progress-bar" style={{ width: `${porcentajeDisponible}%` }}></div>
            </div>

          </div>


          <div className="progress-item">

            <div className="progress-info">
              <span>Libros prestados</span>
              <strong>{porcentajePrestado}%</strong>
            </div>

            <div className="progress">
              <div className="progress-bar" style={{ width: `${porcentajePrestado}%` }}></div>
            </div>

          </div>


          <div className="progress-item">

            <div className="progress-info">
              <span>Usuarios con préstamo activo</span>
              <strong>{porcentajeUsuariosConPrestamo}%</strong>
            </div>

            <div className="progress">
              <div className="progress-bar" style={{ width: `${porcentajeUsuariosConPrestamo}%` }}></div>
            </div>

          </div>


          <div className="library-message">
            <strong>Todo funcionando correctamente</strong>

            <p>
              No hay incidencias registradas en el sistema.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}

export default Dashboard;
