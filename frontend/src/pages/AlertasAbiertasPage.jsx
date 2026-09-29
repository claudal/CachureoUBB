import { useState, useEffect, useCallback } from 'react';
import * as alertaBusquedaService from '../services/alertaBusquedaService.js';

export default function AlertasAbiertasPage() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [detallesError, setDetallesError] = useState([]);
  
  // Modos de filtro: 'TODAS' | 'MARCADAS'
  const [filtro, setFiltro] = useState('TODAS');

  // Cargar alertas desde la API pasando la query param según el filtro
  const cargarAlertas = useCallback(async () => {
    setCargando(true);
    setError('');
    setDetallesError([]);

    try {
      const datos = await alertaBusquedaService.listar({id_estado: 1,marcado:filtro === 'MARCADAS'});
      
      setAlertas(datos);
    } catch (err) {
      setError(err.message || 'Error al obtener las alertas');
      if (err.detalles) {
        setDetallesError(err.detalles);
      }
    } finally {
      setCargando(false);
    }
  }, [filtro]); // Se ejecuta cada vez que 'filtro' cambia

  useEffect(() => {
    cargarAlertas();
  }, [cargarAlertas]);

  // Alternar el estado de marcador de una alerta (POST / DELETE subrecurso)
  const toggleMarcador = async (idAlerta, estaMarcada) => {
    try {
      if (estaMarcada) {
        // Quitar marcador (DELETE /api/alertas/:id/marcador)
        await alertaBusquedaService.quitarMarcador(idAlerta)
      } else {
        // Agregar marcador (POST /api/alertas/:id/marcador)
        await alertaBusquedaService.agregarMarcador(idAlerta);
      }

      // Actualización optimista de la interfaz local
      if (filtro === 'MARCADAS' && estaMarcada) {
        // Si estamos en la vista de "Marcadas" y se desmarca, se remueve de la lista inmediatamente
        setAlertas((prev) => prev.filter((alerta) => alerta.id !== idAlerta));
      } else {
        // Si estamos en "Todas", solo alternamos su flag 'marcada'
        setAlertas((prev) =>
          prev.map((alerta) =>
            alerta.id === idAlerta ? { ...alerta, marcada: !estaMarcada } : alerta
          )
        );
      }
    } catch (err) {
      alert(`No se pudo actualizar el marcador: ${err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      {/* Encabezado y Selector de Modo */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Alertas Abiertas</h1>
          <p style={styles.subtitle}>Gestión y seguimiento de alertas del sistema</p>
        </div>

        {/* Solo 2 Botones de Modo */}
        <div style={styles.filterContainer}>
          <button
            onClick={() => setFiltro('TODAS')}
            style={{
              ...styles.filterBtn,
              ...(filtro === 'TODAS' ? styles.filterBtnActive : {}),
            }}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro('MARCADAS')}
            style={{
              ...styles.filterBtn,
              ...(filtro === 'MARCADAS' ? styles.filterBtnActive : {}),
            }}
          >
            ★ Marcadas
          </button>
        </div>
      </header>

      {/* Control de Errores */}
      {error && (
        <div style={styles.errorBanner}>
          <strong>{error}</strong>
          {detallesError.length > 0 && (
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {detallesError.map((det, index) => (
                <li key={index}>
                  {det.path ? `${det.path.join('.')}: ` : ''}{det.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Estado de Carga */}
      {cargando ? (
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Consultando servidor ({filtro.toLowerCase()})...</p>
        </div>
      ) : (
        /* Renderizado de Alertas */
        <main>
          {alertas.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No hay alertas {filtro === 'MARCADAS' ? 'marcadas' : 'abiertas'} disponibles.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {alertas.map((alerta) => (
                <article key={alerta.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: getPrioridadColor(alerta.prioridad),
                      }}
                    >
                      {alerta.prioridad || 'NORMAL'}
                    </span>

                    {/* Botón de Estrella / Marcador */}
                    <button
                      onClick={() => toggleMarcador(alerta.id, alerta.marcada)}
                      style={styles.starBtn}
                      title={alerta.marcada ? 'Quitar marcador' : 'Marcar alerta'}
                    >
                      {alerta.marcada ? '★' : '☆'}
                    </button>
                  </div>

                  <h3 style={styles.cardTitle}>{alerta.titulo}</h3>
                  <p style={styles.cardDescription}>{alerta.descripcion}</p>

                  <div style={styles.cardFooter}>
                    <span style={styles.dateText}>
                      {new Date(alerta.fecha_creacion || alerta.createdAt).toLocaleDateString()}
                    </span>
                    <span style={styles.idText}>ID: #{alerta.id}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

// Auxiliar para prioridad
function getPrioridadColor(prioridad) {
  switch (prioridad?.toUpperCase()) {
    case 'ALTA':
    case 'CRITICA':
      return '#e53e3e';
    case 'MEDIA':
      return '#dd6b20';
    default:
      return '#3182ce';
  }
}

// Estilos
const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#2d3748',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e2e8f0',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
  },
  subtitle: {
    margin: '4px 0 0 0',
    color: '#718096',
    fontSize: '14px',
  },
  filterContainer: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#edf2f7',
    padding: '4px',
    borderRadius: '8px',
  },
  filterBtn: {
    padding: '8px 18px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#4a5568',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    backgroundColor: '#ffffff',
    color: '#2b6cb0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  badge: {
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  starBtn: {
    background: 'none',
    border: 'none',
    fontSize: '22px',
    cursor: 'pointer',
    color: '#e53e3e',
    lineHeight: 1,
    padding: 0,
  },
  cardTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
  },
  cardDescription: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: '1.4',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#a0aec0',
    paddingTop: '12px',
    borderTop: '1px solid #f7fafc',
  },
  dateText: {
    fontWeight: '500',
  },
  idText: {
    fontFamily: 'monospace',
  },
  errorBanner: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #feb2b2',
    marginBottom: '20px',
  },
  loadingState: {
    textAlign: 'center',
    padding: '40px',
    color: '#718096',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    color: '#a0aec0',
  },
};