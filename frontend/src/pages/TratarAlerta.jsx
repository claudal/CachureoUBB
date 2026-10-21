import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as alertaBusquedaService from '../services/alertaBusquedaService.js';

export default function TratarAlertaPage() {
  const { id } = useParams(); // Extract el :id de la URL
  const navigate = useNavigate();

  const [alerta, setAlerta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const obtenerDetalle = async () => {
      try {
        setCargando(true);
        // Llamada a tu servicio backend pasándole el id
        const datos = await alertaBusquedaService.buscarPorId(id);
        setAlerta(datos);
      } catch (err) {
        setError(JSON.stringify(err) || 'Error al obtener los detalles de la alerta');
      } finally {
        setCargando(false);
      }
    };

    if (id) obtenerDetalle();
  }, [id]);

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/alertas')}>
          Volver a la lista
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Botón para regresar a la lista */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/alertas')}
        sx={{ mb: 3 }}
      >
        Volver a la lista
      </Button>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Chip label={alerta.prioridad || 'NORMAL'} color="primary" />
          <Typography variant="caption" color="text.secondary">
            ID: #{alerta.id}
          </Typography>
        </Box>

        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          {alerta.titulo}
        </Typography>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
          Creada el: {new Date(alerta.fecha_creacion || alerta.createdAt).toLocaleString()}
        </Typography>

        <Typography variant="body1" paragraph>
          {alerta.descripcion}
        </Typography>
      </Paper>
    </Container>
  );
}