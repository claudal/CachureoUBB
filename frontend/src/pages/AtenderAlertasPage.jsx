import {
  Container,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  Chip,
  Icon,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useState, useEffect, useCallback } from 'react';
import * as alertaBusquedaService from '../services/alertaBusquedaService.js';
import { useNavigate } from 'react-router-dom';

export default function AtenderAlertasPage() {
  const navigate = useNavigate();
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
  const registrarLectura = async (idAlerta) => {
    try {
        // Agregar marcador (POST /api/alertas/:id/marcador)
        await alertaBusquedaService.registrarLectura(idAlerta);
    } catch (err) {
      alert(`No se pudo registrar la lectura: ${err.message}`);
    }
  };

    // Alternar el estado de marcador de una alerta (POST / DELETE subrecurso)
  const abrirAlerta = async (alerta) => {
    try {
        // Agregar marcador (POST /api/alertas/:id/marcador)
        if(!alerta.leida)
          await registrarLectura(alerta.id);
        console.log("xd")
        navigate(`/tratarAlerta/${alerta.id}`);
    } catch (err) {
    }
  };

return (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    {/* Encabezado y Selector de Modo */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 4,
        pb: 2,
        borderBottom: 1,
        borderColor: 'divider',
      }} 
    >
      <Box>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Alertas Abiertas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestión y seguimiento de alertas del sistema
        </Typography>
      </Box>

      <ToggleButtonGroup
        value={filtro}
        exclusive
        onChange={(e, nuevoFiltro) => nuevoFiltro && setFiltro(nuevoFiltro)}
        color="primary"
        size="small"
      >
        <ToggleButton value="TODAS">Todas</ToggleButton>
        <ToggleButton value="MARCADAS">
          <StarIcon sx={{ mr: 0.5, fontSize: 18, color: '#f59e0b' }} />
          Marcadas
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>

    {/* Banner de Errores */}
    {error && (
      <Alert severity="error" sx={{ mb: 4 }}>
        <AlertTitle>Error</AlertTitle>
        {error}
        {detallesError.length > 0 && (
          <List dense disablePadding sx={{ mt: 1 }}>
            {detallesError.map((det, index) => (
              <ListItem key={index} disableGutters dense>
                <ListItemText
                  primary={`${det.path ? det.path.join('.') + ': ' : ''}${det.message}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Alert>
    )}

    {/* Estado de Carga */}
    {cargando ? (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Consultando servidor ({filtro.toLowerCase()})...
        </Typography>
      </Box>
    ) : (
      /* Grilla de Alertas */
      <main>
        {alertas.length === 0 ? (
          <Box
            sx={{
              p: 6,
              textAlign: 'center',
              bgcolor: 'action.hover',
              borderRadius: 2,
              color: 'text.secondary',
            }}
          >
            <Typography variant="h6">
              No hay alertas {filtro === 'MARCADAS' ? 'marcadas' : 'abiertas'} disponibles.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {alertas.map((alerta) => (
              <Grid xs={12} sm={6} md={4} key={alerta.id.toString()}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    bgcolor: alerta.leida ? 'action.hover' : 'background.paper',
                    opacity: alerta.leida ? 0.85 : 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { boxShadow: 3 },
                  }}
                >
                  <CardActionArea
                    onClick={() => abrirAlerta(alerta)}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Chip
                          label={alerta.prioridad || 'NORMAL'}
                          color={getPrioridadColor(alerta.prioridad)}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />

                        {/* Botón de estrella con e.stopPropagation() */}
                        <Icon
                          color="warning"
                          size="small"
                          aria-label={alerta.marcada ? 'Quitar marcador' : 'Marcar alerta'}
                        >
                          {alerta.marcada ? <StarIcon /> : <StarBorderIcon />}
                        </Icon>
                      </Box>

                      <Typography
                        variant="h6"
                        component="h2"
                        gutterBottom
                        fontWeight={alerta.leida ? 'regular' : 'bold'}
                        color={alerta.leida ? 'text.secondary' : 'text.primary'}
                      >
                        {alerta.titulo}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {alerta.descripcion}
                      </Typography>
                    </CardContent>
                  </CardActionArea>

                  <CardActions
                    sx={{
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1.5,
                      borderTop: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {new Date(alerta.fecha_creacion).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      ID: #{alerta.id}
                    </Typography>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </main>
    )}
  </Container>
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