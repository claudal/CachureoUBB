import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listar } from '../services/objetoPerdidoService';

export default function InicioPage() {
  const navigate = useNavigate();
  const [objetos, setObjetos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listar()
      .then(data => {
        setObjetos(data);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error al obtener objetos", err);
        setCargando(false);
      });
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Inicio</h1>
        <p style={styles.subtitle}>Gestión y visualización de objetos</p>
      </header>

      <main style={styles.main}>
        <section style={styles.actionSection}>
          <button
            style={styles.primaryButton}
            onClick={() => navigate('/nueva_alerta')}
          >
            + Crear Nueva Alerta
          </button>
        </section>

        <section style={styles.listSection}>
          <h2 style={styles.sectionTitle}>Listado de Objetos Perdidos</h2>
          <div style={styles.grid}>
            {cargando ? (
              <p style={styles.loadingText}>Cargando objetos...</p>
            ) : objetos.length === 0 ? (
              <p style={styles.loadingText}>No hay objetos registrados.</p>
            ) : (
              objetos.map(obj => (
                <div key={obj.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{obj.nombre}</h3>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: obj.estado?.nombre === 'Entregado' ? '#c6f6d5' : '#fed7d7',
                      color: obj.estado?.nombre === 'Entregado' ? '#22543d' : '#742a2a',
                    }}>
                      {obj.estado?.nombre || 'Desconocido'}
                    </span>
                  </div>
                  <div style={styles.cardBody}>
                    <p style={styles.cardText}>
                      <strong>Descripción:</strong> {obj.descripcion}
                    </p>
                    <p style={styles.cardText}>
                      <strong>Fecha ingreso:</strong> {new Date(obj.fecha_ingreso).toLocaleDateString()}
                    </p>
                    {obj.encargado && (
                      <p style={styles.cardText}>
                        <strong>Encargado:</strong> {obj.encargado.nombre}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f4f6f8',
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '24px 32px',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    color: '#2d3748',
    fontWeight: '700',
  },
  subtitle: {
    margin: '8px 0 0',
    fontSize: '16px',
    color: '#718096',
  },
  main: {
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  actionSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '24px',
  },
  primaryButton: {
    backgroundColor: '#3182ce',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(49, 130, 206, 0.2)',
    transition: 'transform 0.2s, backgroundColor 0.2s',
  },
  listSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '22px',
    color: '#2d3748',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '20px',
    backgroundColor: '#ffffff',
    transition: 'box-shadow 0.2s',
    ':hover': {
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    }
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '18px',
    color: '#2d3748',
    fontWeight: '600',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  cardBody: {
    color: '#4a5568',
  },
  cardText: {
    margin: '4px 0',
    fontSize: '14px',
  },
  loadingText: {
    color: '#718096',
    fontSize: '16px',
  },
};
