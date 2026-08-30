import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import Modal from '../components/Modal';
import { FormularioUsuario } from '../components/CrudForms';

function formatearFecha(fecha) {
  if (!fecha) return '—';
  return String(fecha).slice(0, 10);
}

function Usuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorPermiso, setErrorPermiso] = useState('');

  useEffect(() => {
    apiFetch('/usuarios')
      .then(setUsuarios)
      .catch((error) => { setUsuarios([]); setErrorPermiso(error.message); })
      .finally(() => setCargandoLista(false));
  }, []);

  const [filtroRol, setFiltroRol] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const guardarUsuario = async (datos) => {
    setCargando(true);
    try {
      const respuesta = await apiFetch(modal.usuario ? `/usuarios/${modal.usuario.id_usuario}` : '/usuarios', { method: modal.usuario ? 'PUT' : 'POST', body: JSON.stringify(datos) });
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
      const cumpleFiltro = filtroRol === 'todos' || usuario.rol === filtroRol;
      const cumpleBusqueda =
        usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.correo.toLowerCase().includes(busqueda.toLowerCase());
      return cumpleFiltro && cumpleBusqueda;
    });

  const contadores = {
    total: usuarios.length,
    administradores: usuarios.filter((u) => u.rol === 'Administrador').length,
    bibliotecarios: usuarios.filter((u) => u.rol === 'Bibliotecario').length,
    conPrestamos: usuarios.filter((u) => Number(u.prestamos_activos) > 0).length,
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
            préstamos activos y controla su rol en el sistema.
          </p>
        </div>

        <div className="spotlight-card">
          <span className="spotlight-label">USUARIOS REGISTRADOS</span>
          <div className="spotlight-value">
            <strong>{contadores.total}</strong>
          </div>
          <small>{contadores.conPrestamos} con préstamos activos</small>
        </div>
      </div>

      {errorPermiso && (
        <p className="auth-feedback auth-error">
          No se pudo cargar el directorio de usuarios: {errorPermiso} Esta sección requiere una cuenta con rol Bibliotecario o Administrador.
        </p>
      )}

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
          <div className="stat-icon">🛡️</div>
          <div>
            <span>ADMINISTRADORES</span>
            <h2>{contadores.administradores}</h2>
            <p>Con acceso total</p>
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
          <div className="stat-icon">🗂️</div>
          <div>
            <span>BIBLIOTECARIOS</span>
            <h2>{contadores.bibliotecarios}</h2>
            <p>Gestionan el catálogo</p>
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
              placeholder="Busca por nombre o correo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="filtro-campo">
            <label htmlFor="filtro-rol-usuario">FILTRAR ROL</label>
            <select id="filtro-rol-usuario" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
              <option value="todos">Todos los roles</option>
              <option value="Usuario">Usuario</option>
              <option value="Bibliotecario">Bibliotecario</option>
              <option value="Administrador">Administrador</option>
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

            <button className="action action-button" type="button" onClick={() => setFiltroRol('Usuario')}>
              <div className="action-icon">📊</div>
              <div>
                <strong>Ver Usuarios</strong>
                <p>Filtrar solo cuentas de tipo Usuario</p>
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
                <p>Teléfono y correo de cada usuario</p>
              </div>
              <span>?</span>
            </div>

            <div className="action">
              <div className="action-icon">🛡️</div>
              <div>
                <strong>Roles del sistema</strong>
                <p>Usuario, Bibliotecario o Administrador</p>
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
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th className="col-centro">Registrado</th>
                    <th className="col-centro">Préstamos activos</th>
                    <th className="col-centro">Rol</th>
                    <th className="col-centro">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usr) => (
                    <tr key={usr.id_usuario}>
                      <td><strong>{usr.nombre}</strong></td>
                      <td>{usr.correo}</td>
                      <td>{usr.telefono || '—'}</td>
                      <td className="col-centro">{formatearFecha(usr.created_at)}</td>
                      <td className="col-centro">
                        <span className={`badge ${Number(usr.prestamos_activos) > 0 ? 'badge-info' : 'badge-neutral'}`}>
                          {usr.prestamos_activos}
                        </span>
                      </td>
                      <td className="col-centro">
                        <span className={`badge ${usr.rol === 'Administrador' ? 'badge-warning' : usr.rol === 'Bibliotecario' ? 'badge-info' : 'badge-neutral'}`}>
                          {usr.rol}
                        </span>
                      </td>
                      <td className="col-centro">
                        <button type="button" className="table-action" onClick={() => setModal({ tipo: 'editar', usuario: usr })}>Editar</button>
                        <button type="button" className="table-action danger" onClick={() => eliminarUsuario(usr.id_usuario)}>Eliminar</button>
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
