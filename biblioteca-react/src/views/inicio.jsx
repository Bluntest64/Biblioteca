function Inicio() {
  return (
    <section className="dashboard">
      {/* Encabezado */}
      <div className="dashboard-header">
        <div>
          <span className="welcome-label">BIENVENIDO</span>
          <h1>
            Tu Sistema de
            <span> Gestión de Biblioteca</span>
          </h1>
          <p>
            Accede a todas las funciones para gestionar libros, usuarios y
            préstamos de manera efectiva. Consulta el estado actual de tu
            biblioteca y mantén un control completo.
          </p>
        </div>

        <div className="date-card">
          <span>ESTADO DEL SISTEMA</span>
          <strong>Operativo</strong>
          <small>Todos los servicios disponibles</small>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div>
            <span>LIBROS TOTALES</span>
            <h2>128</h2>
            <p>En tu catálogo</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <span>USUARIOS REGISTRADOS</span>
            <h2>64</h2>
            <p>Activos en el sistema</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📤</div>
          <div>
            <span>PRÉSTAMOS ACTIVOS</span>
            <h2>23</h2>
            <p>En circulación</p>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">⚠️</div>
          <div>
            <span>VENCIMIENTOS PRÓXIMOS</span>
            <h2>5</h2>
            <p>Próximos 7 días</p>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="content-grid">
        {/* Panel de Acciones Rápidas */}
        <div className="panel">
          <div className="panel-header">
            <span>ACCIONES RÁPIDAS</span>
            <h3>Funciones principales</h3>
          </div>

          <div className="actions">
            <div className="action">
              <div className="action-icon">📚</div>
              <div>
                <strong>Catálogo de Libros</strong>
                <p>Consulta y administra el catálogo completo</p>
              </div>
              <span>→</span>
            </div>

            <div className="action">
              <div className="action-icon">📝</div>
              <div>
                <strong>Registrar Préstamo</strong>
                <p>Crear nuevo registro de préstamo</p>
              </div>
              <span>→</span>
            </div>

            <div className="action">
              <div className="action-icon">👤</div>
              <div>
                <strong>Gestionar Usuarios</strong>
                <p>Administra cuentas de usuarios</p>
              </div>
              <span>→</span>
            </div>

            <div className="action">
              <div className="action-icon">📊</div>
              <div>
                <strong>Ver Reportes</strong>
                <p>Analítica y estadísticas del sistema</p>
              </div>
              <span>→</span>
            </div>
          </div>
        </div>

        {/* Panel de Información */}
        <div className="panel">
          <div className="panel-header">
            <span>INFORMACIÓN ÚTIL</span>
            <h3>Tips y ayuda</h3>
          </div>

          <div className="actions">
            <div className="action">
              <div className="action-icon">ℹ️</div>
              <div>
                <strong>¿Cómo registrar un libro?</strong>
                <p>Accede a la sección de libros y usa el formulario</p>
              </div>
              <span>?</span>
            </div>

            <div className="action">
              <div className="action-icon">✓</div>
              <div>
                <strong>Préstamos completados</strong>
                <p>Marca como devuelto cuando sea necesario</p>
              </div>
              <span>?</span>
            </div>

            <div className="action">
              <div className="action-icon">⏰</div>
              <div>
                <strong>Gestión de plazos</strong>
                <p>Recibe alertas de préstamos próximos a vencer</p>
              </div>
              <span>?</span>
            </div>

            <div className="action">
              <div className="action-icon">📞</div>
              <div>
                <strong>Soporte y contacto</strong>
                <p>¿Necesitas ayuda? Contáctanos</p>
              </div>
              <span>?</span>
            </div>
          </div>

          <div className="library-message">
            <strong>💡 Consejo:</strong>
            <p>
              Revisa regularmente los préstamos próximos a vencer para evitar
              atrasos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Inicio; 