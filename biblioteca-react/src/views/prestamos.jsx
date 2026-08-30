import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { notificarLibrosActualizados } from '../services/eventos';
import Modal from '../components/Modal';
import { FormularioPrestamo } from '../components/CrudForms';

// El backend guarda el estado tal cual ('activo' | 'devuelto' | 'atrasado')
// pero no recalcula automáticamente si un préstamo activo ya venció: eso
// se decide aquí, comparando fecha_devolucion con hoy. Así el badge de
// "Vencido" siempre refleja la fecha real, aunque nadie haya tocado el
// registro en el backend.
function calcularDiasRestantes(fechaDevolucion) {
  if (!fechaDevolucion) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const vencimiento = new Date(fechaDevolucion);
  return Math.round((vencimiento - hoy) / 86400000);
}

function estadoMostrado(prestamo, diasRestantes) {
  if (prestamo.estado === 'devuelto') return 'Devuelto';
  if (diasRestantes !== null && diasRestantes < 0) return 'Vencido';
  return 'Activo';
}

function Prestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [usuarios, setUsuarios] = useState([]);
  const [puedeElegirUsuario, setPuedeElegirUsuario] = useState(true);
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
    // GET /usuarios solo lo pueden ver Bibliotecario/Administrador. Si el
    // usuario logueado tiene rol "Usuario" normal, el backend responde
    // 403 aquí: en ese caso el formulario de préstamo simplemente oculta
    // el selector de usuario (el backend ya asume que el préstamo es
    // para quien tiene la sesión iniciada).
    apiFetch('/usuarios')
      .then((data) => { setUsuarios(data); setPuedeElegirUsuario(true); })
      .catch(() => { setUsuarios([]); setPuedeElegirUsuario(false); });
    apiFetch('/libros').then(setLibros).catch(() => setLibros([]));
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

  const prestamosConEstado = prestamos.map((prestamo) => {
    const diasRestantes = calcularDiasRestantes(prestamo.fecha_devolucion);
    return { ...prestamo, diasRestantes, estadoMostrado: estadoMostrado(prestamo, diasRestantes) };
  });

  const prestamosFiltrados = prestamosConEstado.filter((prestamo) => {
    if (filtroEstado === 'todos') return true;
    return prestamo.estadoMostrado.toLowerCase() === filtroEstado.toLowerCase();
  });

  const contadores = {
    total: prestamosConEstado.length,
    activos: prestamosConEstado.filter((p) => p.estadoMostrado === 'Activo').length,
    vencidos: prestamosConEstado.filter((p) => p.estadoMostrado === 'Vencido').length,
    proximosAVencer: prestamosConEstado.filter((p) => p.estadoMostrado === 'Activo' && p.diasRestantes <= 7).length,
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
                <option value="devuelto">Devueltos</option>
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
                <p>{puedeElegirUsuario ? 'Registrar un nuevo préstamo' : 'Pedir un libro prestado'}</p>
              </div>
              <span>→</span>
            </button>

            <button className="action action-button" type="button" onClick={() => { const activo = prestamosConEstado.find((prestamo) => prestamo.estadoMostrado === 'Activo'); if (activo) devolverPrestamo(activo.id_prestamo); }}>
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
                    <tr key={prestamo.id_prestamo}>
                      <td><strong>{prestamo.libros || '—'}</strong></td>
                      <td>{prestamo.usuario}</td>
                      <td className="col-centro">{prestamo.fecha_prestamo}</td>
                      <td className="col-centro">{prestamo.fecha_devolucion || '—'}</td>
                      <td className="col-centro">
                        {prestamo.diasRestantes === null ? (
                          <span className="badge badge-neutral">Sin fecha</span>
                        ) : (
                          <span className={`badge ${prestamo.diasRestantes < 0 ? 'badge-danger' : prestamo.diasRestantes <= 7 ? 'badge-warning' : 'badge-success'}`}>
                            {prestamo.diasRestantes < 0
                              ? `${Math.abs(prestamo.diasRestantes)} d. atraso`
                              : `${prestamo.diasRestantes} días`}
                          </span>
                        )}
                      </td>
                      <td className="col-centro">
                        {prestamo.estadoMostrado !== 'Devuelto' && <button type="button" className="table-action" onClick={() => devolverPrestamo(prestamo.id_prestamo)}>Devolver</button>}
                      </td>
                      <td className="col-centro">
                        <span className={`badge ${prestamo.estadoMostrado === 'Vencido' ? 'badge-danger' : prestamo.estadoMostrado === 'Devuelto' ? 'badge-neutral' : 'badge-success'}`}>
                          {prestamo.estadoMostrado}
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
      {modalAbierto && <Modal titulo="Nuevo préstamo" onClose={() => setModalAbierto(false)}><FormularioPrestamo usuarios={usuarios} libros={libros} mostrarSelectorUsuario={puedeElegirUsuario} onSubmit={guardarPrestamo} cargando={cargando} /></Modal>}
    </section>
  );
}

export default Prestamos;
