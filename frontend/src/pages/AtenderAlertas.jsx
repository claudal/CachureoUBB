import * as alertaBusquedaService from '../services/alertaBusquedaService.js';
import { useFetch } from '../hooks/useFetch.js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card.js';
import { Badge } from '../components/ui/badge.js'
import { AlertCircle, EyeIcon } from 'lucide-react';



export default function AtenderAlertasPage() {
  const alertas = useFetch(alertaBusquedaService.listar);
  if (alertas.cargando){
    return (<h1>Cargando</h1>);
  }
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
      {alertas.datos.map((alerta)=>{
        return (
            <Card size="default" >
              <CardHeader>
                <CardTitle>
                  {alerta.nombre}
                  <span className='p-1'>
                    {alerta.leida ? 
                      (<Badge variant="secondary"><EyeIcon/>Leída</Badge>) : 
                      (alerta.marcada && (<Badge variant="default"><AlertCircle />Actualizada</Badge>))
                    }
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{alerta.descripcion}</CardDescription>
              </CardContent>
            </Card>
        )
      })}
    </div>
  )
  /*const [alertas, setAlertas] = useState([]);
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
      const datos = await alertaBusquedaService.listar({idEstado: 1,marcado:filtro === 'MARCADAS'});
      
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

    // Alternar el estado de marcador de una alerta (POST / DELETE subrecurso)
  const registrarLectura = async (idAlerta) => {
    try {
        // Agregar marcador (POST /api/alertas/:id/marcador)
        await alertaBusquedaService.registrarLectura(idAlerta);

        setAlertas((prev) =>
            prev.map((alerta) =>
              alerta.id === idAlerta ? { ...alerta, leida: true } : alerta
            )
          );
    } catch (err) {
      alert(`No se pudo registrar la lectura: ${err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Alertas Abiertas</h1>
          <p style={styles.subtitle}>Gestión y seguimiento de alertas del sistema</p>
        </div>

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

      {cargando ? (
        <div style={styles.loadingState}>
          <div style={styles.spinner}></div>
          <p>Consultando servidor ({filtro.toLowerCase()})...</p>
        </div>
      ) : (
        <main>
          {alertas.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No hay alertas {filtro === 'MARCADAS' ? 'marcadas' : 'abiertas'} disponibles.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {alertas.map((alerta) => (
                <article
                  key={alerta.id}
                  onClick={() => !alerta.leida && registrarLectura(alerta.id)}
                  style={{
                    ...styles.card,
                    backgroundColor: alerta.leida ? '#f0f2f5' : '#ffffff', // Tono más gris si está leída
                    cursor: alerta.leida ? 'default' : 'pointer',
                    opacity: alerta.leida ? 0.85 : 1, // Opcional: atenúa ligeramente la tarjeta
                  }}
                >
                  <div style={styles.cardHeader}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor: getPrioridadColor(alerta.prioridad),
                      }}
                    >
                      {alerta.prioridad || 'NORMAL'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Evita que el clic en la estrella active el click de la tarjeta (marcar como leída)
                        toggleMarcador(alerta.id, alerta.marcada);
                      }}
                      style={styles.starBtn}
                      title={alerta.marcada ? 'Quitar marcador' : 'Marcar alerta'}
                    >
                      {alerta.marcada ? '★' : '☆'}
                    </button>
                  </div>

                  <h3 style={{
                    ...styles.cardTitle,
                    fontWeight: alerta.leida ? 'normal' : 'bold' // Opcional: texto normal si ya se leyó
                  }}>
                    {alerta.titulo}
                  </h3>
                  
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
  );*/
}