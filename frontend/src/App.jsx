import { useState, useEffect } from 'react';
import { API_URL } from './api/config.js';
import './App.css';

function App() {
  const [objetos, setObjetos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resObjetos, resPersonas] = await Promise.all([
          fetch(`${API_URL}/objetos`),
          fetch(`${API_URL}/personas`)
        ]);

        const dataObjetos = await resObjetos.json();
        const dataPersonas = await resPersonas.json();

        setObjetos(dataObjetos);
        setPersonas(dataPersonas);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>CachureoUBB - Panel Principal</h1>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Objetos Perdidos</h2>
        {objetos.length === 0 ? (
          <p>No hay objetos registrados.</p>
        ) : (
          <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Encargado (RUT)</th>
                <th>Fecha Ingreso</th>
              </tr>
            </thead>
            <tbody>
              {objetos.map(obj => (
                <tr key={obj.id}>
                  <td>{obj.id}</td>
                  <td>{obj.nombre}</td>
                  <td>{obj.descripcion}</td>
                  <td>{obj.estado?.nombre || 'Desconocido'}</td>
                  <td>{obj.rut_encargado}</td>
                  <td>{new Date(obj.fecha_ingreso).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Personas Registradas</h2>
        {personas.length === 0 ? (
          <p>No hay personas registradas.</p>
        ) : (
          <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th>RUT</th>
                <th>Nombre</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {personas.map(persona => (
                <tr key={persona.rut}>
                  <td>{persona.rut}</td>
                  <td>{persona.nombre}</td>
                  <td>{persona.rol?.nombre || 'Desconocido'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;
