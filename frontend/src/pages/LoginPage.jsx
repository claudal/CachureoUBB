import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { login } from '../services/autenticacion';


export default function LoginPage() {
  const navigate = useNavigate();

  // Estados del formulario
  const [formData, setFormData] = useState({
    rut: '',
    contrasena: '',
  });

  // Estados de interfaz
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error al modificar campos
    if (error) setError('');
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const respuesta = await login(formData.rut,formData.contrasena);

      if (respuesta.token) {
        localStorage.setItem('token', respuesta.token);

        if(respuesta.persona.rol === 2){
          navigate('/encargado/principal');
        } else 
          navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Credenciales inválidas. Por favor intente de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Iniciar Sesión</h2>
        <p style={styles.subtitle}>Sistema de Gestión de Alertas</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="rut" style={styles.label}>
              RUT (Sin puntos ni guión)
            </label>
            <input
              id="rut"
              type="text"
              name="rut"
              value={formData.rut}
              onChange={handleChange}
              placeholder="Ej: 12345678"
              required
              style={styles.input}
              disabled={cargando}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="contrasena" style={styles.label}>
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={styles.input}
              disabled={cargando}
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              ...styles.button,
              opacity: cargando ? 0.7 : 1,
              cursor: cargando ? 'not-allowed' : 'pointer',
            }}
          >
            {cargando ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Estilos básicos en llanos CSS-in-JS para facilitar la importación directa
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f6f8',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '32px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    color: '#1a202c',
    textAlign: 'center',
  },
  subtitle: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#718096',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4a5568',
  },
  input: {
    padding: '10px 12px',
    fontSize: '15px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  button: {
    marginTop: '8px',
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#3182ce',
    border: 'none',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  errorBox: {
    backgroundColor: '#fed7d7',
    color: '#9b2c2c',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '16px',
    textAlign: 'center',
  },
};