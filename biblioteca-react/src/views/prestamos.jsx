import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { notificarLibrosActualizados } from '../services/eventos';
import Modal from '../components/Modal';
import { FormularioPrestamo } from '../components/CrudForms';

function Prestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [usuarios, setUsuarios] = useState([]);
  const [libros, setLibros] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    apiFetch('/prestamos')
      .then(setPrestamos)
      .catch(() => setPrestamos([]))
      .finally(() => setCargandoLista(false));
  }, []);

  useEffect(() => {
    Promise.all([apiFetch('/usuarios'), apiFetch('/libros')]).then(([usuariosApi, librosApi]) => { setUsuarios(usuariosApi); setLibros(librosApi); }).catch(() => {});
  }, []);

  const cargarPrestamos = async () => setPrestamos(await apiFetch('/prestamos'));

  const guardarPrestamo = async (datos) => {
    setCargando(true);
    try {
      const respuesta = await apiFetch('/prestamos', { method: 'POST', body: JSON.stringify(datos) });
      setMensaje(respuesta.message);
      setModalAbierto(false);
      await cargarPrestamos();
      setLibros(await apiFetch('/libros'));
      notificarLibrosActualizados();
    } catch (error) { setMensaje(error.message); } finally { setCargando(false); }
  };

  const devolverPrestamo = async (id) => {
    try {
      const respuesta = await apiFetch(`/prestamos/${id}/devolver`, { method: 'PUT' });
      setMensaje(respuesta.message);
      await cargarPrestamos();
      setLibros(await apiFetch('/libros'));
      notificarLibrosActualizados();
    } catch (error) { setMensaje(error.message); }
  };

  const prestamosFiltrados = prestamos.filter((prestamo) => {
    if (filtroEstado === 'todos') return true;
    return prestamo.estado.toLowerCase() === filtroEstado.toLowerCase();
  });

  const contadores = {
    total: prestamos.length,
    activos: prestamos.filter((p) => p.estado === 'Activo').length,
    vencidos: prestamos.filter((p) => p.estado === 'Vencido').length,
    proximosAVencer: prestamos.filter((p) => p.estado === 'Activo' && p.diasRestantes <= 7).length,
  };

  return (
    <section className="dashboard">
      {/* Encabezado */}
      <div className="dashboard-header">
        <div>
          <span className="welcome-label">PRÉSTAMOS</span>
          <h1>
            Gestión de
            <span> Préstamos de Libros</span>
          </h1>
          <p>
            Monitorea todos los préstamos activos, registra nuevos préstamos y
            controla las devoluciones con facilidad.
          </p>
        </div>

        <div className="spotlight-card">
          <span className="spotlight-label">PRÉSTAMOS ACTIVOS</span>
          <div className="spotlight-value">
            <strong>{contadores.activos}</strong>
          </div>
          <small>{contadores.proximosAVencer} próximos a vencer</small>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div>
            <span>PRÉSTAMOS TOTALES</span>
            <h2>{contadores.total}</h2>
            <p>En el registro</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div>
            <span>PRÉSTAMOS ACTIVOS</span>
            <h2>{contadores.activos}</h2>
            <p>En circulación</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">⏰</div>
          <div>
            <span>PRÓXIMOS A VENCER</span>
            <h2>{contadores.proximosAVencer}</h2>
            <p>En los próximos 7 días</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div>
            <span>VENCIDOS</span>
            <h2>{contadores.vencidos}</h2>
            <p>Requieren atención</p>
          </div>
        </div>
      </div>

      {/* Filtros y Acciones */}
      <div className="content-grid content-grid-igual">
        <div className="panel toolbar-panel">
          <div className="panel-header">
            <span>FILTROS</span>
            <h3>Filtrar préstamos</h3>
          </div>

          <div className="filtro-grid filtro-grid-simple">
            <div className="filtro-campo">
              <label htmlFor="estado-prestamo">ESTADO</label>
              <select id="estado-prestamo" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="todos">Todos los préstamos</option>
                <option value="activo">Activos</option>
                <option value="vencido">Vencidos</option>
              </select>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span>ACCIONES</span>
            <h3>Opciones rápidas</h3>
          </div>

          <div className="actions actions-flush">
            <button className="action action-button" type="button" onClick={() => setModalAbierto(true)}>
              <div className="action-icon">➕</div>
              <div>
                <strong>Nuevo Préstamo</strong>
                <p>Registrar un nuevo préstamo</p>
              </div>
              <span>→</span>
            </button>

            <button className="action action-button" type="button" onClick={() => { const activo = prestamos.find((prestamo) => prestamo.estado === 'Activo'); if (activo) devolverPrestamo(activo.id); }}>
              <div className="action-icon">↩️</div>
              <div>
                <strong>Registrar Devolución</strong>
                <p>Marcar libro como devuelto</p>
              </div>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Préstamos */}
      <div className="panel">
        <div className="panel-header">
          <span>LISTADO</span>
          <h3>Préstamos registrados ({prestamosFiltrados.length})</h3>
        </div>

        <div className="tabla-contenedor">
          {cargandoLista ? (
            <p className="tabla-vacia">Cargando préstamos...</p>
          ) : prestamosFiltrados.length === 0 ? (
            <p className="tabla-vacia">No hay préstamos con ese estado.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Libro</th>
                    <th>Usuario</th>
                    <th className="col-centro">Fecha préstamo</th>
                    <th className="col-centro">Vencimiento</th>
                    <th className="col-centro">Días restantes</th>
                    <th className="col-centro">Acción</th>
                    <th className="col-centro">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamosFiltrados.map((prestamo) => (
                    <tr key={prestamo.id}>
                      <td><strong>{prestamo.libro}</strong></td>
                      <td>{prestamo.usuario}</td>
                      <td className="col-centro">{prestamo.fechaPrestamo}</td>
                      <td className="col-centro">{prestamo.fechaVencimiento}</td>
                      <td className="col-centro">
                        <span className={`badge ${prestamo.diasRestantes < 0 ? 'badge-danger' : prestamo.diasRestantes <= 7 ? 'badge-warning' : 'badge-success'}`}>
                          {prestamo.diasRestantes < 0
                            ? `${Math.abs(prestamo.diasRestantes)} d. atraso`
                            : `${prestamo.diasRestantes} días`}
                        </span>
                      </td>
                      <td className="col-centro">
                        {prestamo.estado === 'Activo' && <button type="button" className="table-action" onClick={() => devolverPrestamo(prestamo.id)}>Devolver</button>}
                      </td>
                      <td className="col-centro">
                        <span className={`badge ${prestamo.estado === 'Vencido' ? 'badge-danger' : 'badge-success'}`}>
                          {prestamo.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="library-message">
          <strong>📌 Recordatorio:</strong>
          <p>
            Asegúrate de revisar regularmente los préstamos próximos a vencer.
            Notifica a los usuarios sobre sus vencimientos próximos.
          </p>
        </div>
      </div>
      {mensaje && <p className="auth-feedback auth-success">{mensaje}</p>}
      {modalAbierto && <Modal titulo="Nuevo préstamo" onClose={() => setModalAbierto(false)}><FormularioPrestamo usuarios={usuarios} libros={libros} onSubmit={guardarPrestamo} cargando={cargando} /></Modal>}
    </section>
  );
}

export default Prestamos;
