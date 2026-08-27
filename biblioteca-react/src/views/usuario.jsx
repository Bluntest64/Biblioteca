import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import Modal from '../components/Modal';
import { FormularioUsuario } from '../components/CrudForms';

function Usuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  useEffect(() => {
    apiFetch('/usuarios')
      .then(setUsuarios)
      .catch(() => setUsuarios([]))
      .finally(() => setCargandoLista(false));
  }, []);

  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const guardarUsuario = async (datos) => {
    setCargando(true);
    try {
      const respuesta = await apiFetch(modal.usuario ? `/usuarios/${modal.usuario.id}` : '/usuarios', { method: modal.usuario ? 'PUT' : 'POST', body: JSON.stringify(datos) });
      setMensaje(respuesta.message);
      setModal(null);
      setUsuarios(await apiFetch('/usuarios'));
    } catch (error) { setMensaje(error.message); } finally { setCargando(false); }
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try { const respuesta = await apiFetch(`/usuarios/${id}`, { method: 'DELETE' }); setMensaje(respuesta.message); setUsuarios(await apiFetch('/usuarios')); } catch (error) { setMensaje(error.message); }
  };

  const usuariosFiltrados = usuarios
    .filter((usuario) => {
      const cumpleFiltro = filtroEstado === 'todos' || usuario.estado === filtroEstado;
      const cumpleBusqueda =
        usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.email.toLowerCase().includes(busqueda.toLowerCase());
      return cumpleFiltro && cumpleBusqueda;
    });

  const contadores = {
    total: usuarios.length,
    activos: usuarios.filter((u) => u.estado === 'Activo').length,
    inactivos: usuarios.filter((u) => u.estado === 'Inactivo').length,
    conPrestamos: usuarios.filter((u) => u.prestamosActivos > 0).length,
  };

  return (
    <section className="dashboard">
      {/* Encabezado */}
      <div className="dashboard-header">
        <div>
          <span className="welcome-label">USUARIOS</span>
          <h1>
            Gestión de
            <span> Usuarios de la Biblioteca</span>
          </h1>
          <p>
            Administra la información de los usuarios registrados, monitorea sus
            préstamos activos y controla su estado en el sistema.
          </p>
        </div>

        <div className="spotlight-card">
          <span className="spotlight-label">USUARIOS ACTIVOS</span>
          <div className="spotlight-value">
            <strong>{contadores.activos}</strong>
          </div>
          <small>{contadores.conPrestamos} con préstamos</small>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <span>USUARIOS TOTALES</span>
            <h2>{contadores.total}</h2>
            <p>Registrados en el sistema</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div>
            <span>USUARIOS ACTIVOS</span>
            <h2>{contadores.activos}</h2>
            <p>Con estado activo</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">📚</div>
          <div>
            <span>CON PRÉSTAMOS ACTIVOS</span>
            <h2>{contadores.conPrestamos}</h2>
            <p>Tienen libros en préstamo</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⊘</div>
          <div>
            <span>USUARIOS INACTIVOS</span>
            <h2>{contadores.inactivos}</h2>
            <p>Sin actividad reciente</p>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="panel toolbar-panel">
        <div className="panel-header">
          <span>HERRAMIENTAS</span>
          <h3>Filtros y búsqueda</h3>
        </div>

        <div className="filtro-grid">
          <div className="filtro-campo">
            <label htmlFor="buscar-usuario">BUSCAR USUARIO</label>
            <input
              id="buscar-usuario"
              type="text"
              placeholder="Busca por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filtro-campo">
            <label htmlFor="filtro-estado-usuario">FILTRAR ESTADO</label>
            <select id="filtro-estado-usuario" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos los usuarios</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="content-grid content-grid-igual">
        <div className="panel">
          <div className="panel-header">
            <span>ACCIONES RÁPIDAS</span>
            <h3>Funciones disponibles</h3>
          </div>

          <div className="actions">
            <button className="action action-button" type="button" onClick={() => setModal({ tipo: 'nuevo' })}>
              <div className="action-icon">➕</div>
              <div>
                <strong>Nuevo Usuario</strong>
                <p>Registrar un nuevo usuario en el sistema</p>
              </div>
              <span>→</span>
            </button>

            <button className="action action-button" type="button" onClick={() => usuarios[0] && setModal({ tipo: 'editar', usuario: usuarios[0] })}>
              <div className="action-icon">✏️</div>
              <div>
                <strong>Editar Información</strong>
                <p>Modificar datos de usuario existente</p>
              </div>
              <span>→</span>
            </button>

            <button className="action action-button" type="button" onClick={() => setFiltroEstado('Activo')}>
              <div className="action-icon">📊</div>
              <div>
                <strong>Ver Historial</strong>
                <p>Consultar préstamos anteriores</p>
              </div>
              <span>→</span>
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span>INFORMACIÓN ÚTIL</span>
            <h3>Tips de gestión</h3>
          </div>

          <div className="actions">
            <div className="action">
              <div className="action-icon">ℹ️</div>
              <div>
                <strong>Información de contacto</strong>
                <p>Teléfono y email de cada usuario</p>
              </div>
              <span>?</span>
            </div>

            <div className="action">
              <div className="action-icon">⏱️</div>
              <div>
                <strong>Fecha de registro</strong>
                <p>Identifica usuarios nuevos</p>
              </div>
              <span>?</span>
            </div>

            <div className="action">
              <div className="action-icon">📌</div>
              <div>
                <strong>Préstamos activos</strong>
                <p>Monitorea los libros en posesión</p>
              </div>
              <span>?</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="panel">
        <div className="panel-header">
          <span>DIRECTORIO</span>
          <h3>Usuarios registrados ({usuariosFiltrados.length})</h3>
        </div>

        <div className="tabla-contenedor">
          {cargandoLista ? (
            <p className="tabla-vacia">Cargando usuarios...</p>
          ) : usuariosFiltrados.length === 0 ? (
            <p className="tabla-vacia">No se encontraron usuarios con esos criterios.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th className="col-centro">Préstamos activos</th>
                    <th className="col-centro">Estado</th>
                    <th className="col-centro">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usr) => (
                    <tr key={usr.id}>
                      <td><strong>{usr.nombre}</strong></td>
                      <td>{usr.email}</td>
                      <td>{usr.telefono}</td>
                      <td className="col-centro">
                        <span className={`badge ${usr.prestamosActivos > 0 ? 'badge-info' : 'badge-neutral'}`}>
                          {usr.prestamosActivos}
                        </span>
                      </td>
                      <td className="col-centro">
                        <span className={`badge ${usr.estado === 'Activo' ? 'badge-success' : 'badge-neutral'}`}>
                          {usr.estado}
                        </span>
                      </td>
                      <td className="col-centro">
                        <button type="button" className="table-action" onClick={() => setModal({ tipo: 'editar', usuario: usr })}>Editar</button>
                        <button type="button" className="table-action danger" onClick={() => eliminarUsuario(usr.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="library-message">
          <strong>💡 Sugerencia:</strong>
          <p>
            Revisa periódicamente a los usuarios con préstamos activos para
            asegurar que devuelvan los libros a tiempo.
          </p>
        </div>
      </div>
      {mensaje && <p className="auth-feedback auth-success">{mensaje}</p>}
      {modal && <Modal titulo={modal.usuario ? 'Editar usuario' : 'Nuevo usuario'} onClose={() => setModal(null)}><FormularioUsuario inicial={modal.usuario} onSubmit={guardarUsuario} cargando={cargando} /></Modal>}
    </section>
  );
}

export default Usuario;
