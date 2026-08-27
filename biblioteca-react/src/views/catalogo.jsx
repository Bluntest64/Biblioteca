import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { notificarLibrosActualizados } from '../services/eventos';
import Modal from '../components/Modal';
import { FormularioLibro } from '../components/CrudForms';

function Catalogo() {
  const [libros, setLibros] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  useEffect(() => {
    apiFetch('/libros')
      .then(setLibros)
      .catch(() => setLibros([]))
      .finally(() => setCargandoLista(false));
  }, []);

  const [filtro, setFiltro] = useState('');
  const [ordenar, setOrdenar] = useState('titulo');
  const [modal, setModal] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const recargarLibros = async () => {
    const actualizados = await apiFetch('/libros');
    setLibros(actualizados);
    notificarLibrosActualizados();
  };

  const guardarLibro = async (datos) => {
    setCargando(true);
    try {
      const respuesta = await apiFetch(modal.libro ? `/libros/${modal.libro.id}` : '/libros', { method: modal.libro ? 'PUT' : 'POST', body: JSON.stringify(datos) });
      setMensaje(respuesta.message);
      setModal(null);
      await recargarLibros();
    } catch (error) { setMensaje(error.message); } finally { setCargando(false); }
  };

  const eliminarLibro = async (id) => {
    if (!window.confirm('¿Eliminar este libro?')) return;
    try {
      const respuesta = await apiFetch(`/libros/${id}`, { method: 'DELETE' });
      setMensaje(respuesta.message);
      await recargarLibros();
    } catch (error) { setMensaje(error.message); }
  };

  const librosFiltrados = libros
    .filter((libro) =>
      libro.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
      libro.autor.toLowerCase().includes(filtro.toLowerCase()) ||
      libro.categoria.toLowerCase().includes(filtro.toLowerCase())
    )
    .sort((a, b) => {
      if (ordenar === 'titulo') {
        return a.titulo.localeCompare(b.titulo);
      } else if (ordenar === 'autor') {
        return a.autor.localeCompare(b.autor);
      } else if (ordenar === 'disponibles') {
        return b.disponibles - a.disponibles;
      }
      return 0;
    });

  const disponiblesTotal = libros.reduce((sum, l) => sum + Number(l.disponibles || 0), 0);

  return (
    <section className="dashboard">
      {/* Encabezado */}
      <div className="dashboard-header">
        <div>
          <span className="welcome-label">CATÁLOGO</span>
          <h1>
            Explora nuestro
            <span> Catálogo de Libros</span>
          </h1>
          <p>
            Consulta la colección completa de libros disponibles en la
            biblioteca. Busca por título, autor o categoría.
          </p>
        </div>

        <div className="spotlight-card">
          <span className="spotlight-label">LIBROS EN CATÁLOGO</span>
          <div className="spotlight-value">
            <strong>{libros.length}</strong>
          </div>
          <small>{disponiblesTotal} disponibles ahora</small>
        </div>
      </div>

      {/* Filtros */}
      <div className="panel toolbar-panel">
        <div className="panel-header">
          <span>HERRAMIENTAS</span>
          <h3>Filtros y búsqueda</h3>
        </div>

        <div className="filtro-grid">
          <div className="filtro-campo">
            <label htmlFor="filtro-catalogo">BUSCAR LIBRO</label>
            <input
              id="filtro-catalogo"
              type="text"
              placeholder="Busca por título, autor o categoría..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          <div className="filtro-campo">
            <label htmlFor="orden-catalogo">ORDENAR POR</label>
            <select id="orden-catalogo" value={ordenar} onChange={(e) => setOrdenar(e.target.value)}>
              <option value="titulo">Título (A-Z)</option>
              <option value="autor">Autor (A-Z)</option>
              <option value="disponibles">Más disponibles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Libros */}
      <div className="panel">
        <div className="panel-header panel-header-row">
          <div>
            <span>RESULTADOS</span>
            <h3>Libros encontrados ({librosFiltrados.length})</h3>
          </div>
          <button className="auth-button compact-button" type="button" onClick={() => setModal({ tipo: 'nuevo' })}>+ Registrar libro</button>
        </div>

        <div className="tabla-contenedor">
          {cargandoLista ? (
            <p className="tabla-vacia">Cargando catálogo...</p>
          ) : librosFiltrados.length === 0 ? (
            <p className="tabla-vacia">No se encontraron libros con esos criterios.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Autor</th>
                    <th className="col-centro">Categoría</th>
                    <th className="col-centro">Año</th>
                    <th className="col-centro">Disponibles</th>
                    <th className="col-centro">Total</th>
                    <th className="col-centro">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {librosFiltrados.map((libro) => (
                    <tr key={libro.id}>
                      <td><strong>{libro.titulo}</strong></td>
                      <td>{libro.autor}</td>
                      <td className="col-centro">{libro.categoria}</td>
                      <td className="col-centro">{libro.año}</td>
                      <td className="col-centro">
                        <span className={`badge ${libro.disponibles > 0 ? 'badge-success' : 'badge-danger'}`}>
                          {libro.disponibles}
                        </span>
                      </td>
                      <td className="col-centro">{libro.total}</td>
                      <td className="col-centro">
                        <button type="button" className="table-action" onClick={() => setModal({ tipo: 'editar', libro })}>Editar</button>
                        <button type="button" className="table-action danger" onClick={() => eliminarLibro(libro.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {mensaje && <p className="auth-feedback auth-success">{mensaje}</p>}
      {modal && <Modal titulo={modal.libro ? 'Editar libro' : 'Registrar libro'} onClose={() => setModal(null)}><FormularioLibro inicial={modal.libro} onSubmit={guardarLibro} cargando={cargando} /></Modal>}
    </section>
  );
}

export default Catalogo;
