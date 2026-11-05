import { API_URL } from '../api/config.js';

const BASE = API_URL;

async function pedir(ruta, opciones = {}) {
  const headers = { ...opciones.headers };
  // con FormData el navegador pone el Content-Type (multipart con su boundary)
  if (!(opciones.body instanceof FormData))
    headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('token');
  if(token)
    headers.authorization = `Bearer ${token}`;

  const res = await fetch(BASE + ruta, {
    ...opciones,
    headers
  });
  // si el servidor responde algo que no es JSON (p. ej. un error 500 en HTML) no se cae aquí
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(datos.error || 'Algo salio mal');
    error.detalles = datos.detalles;
    error.status = res.status;
    throw error;
  }
  return datos
}

export const api = {
  get:  ruta => pedir(ruta),
  post: (ruta, cuerpo) => pedir(ruta, { method: 'POST', body: JSON.stringify(cuerpo) }),
  postForm: (ruta, formData) => pedir(ruta, { method: 'POST', body: formData }),
  put: (ruta, cuerpo) => pedir(ruta, { method: 'PUT', body: JSON.stringify(cuerpo) }),
  putForm: (ruta, formData) => pedir(ruta, { method: 'PUT', body: formData }),
  delete: (ruta) => pedir(ruta, { method: 'DELETE' })
}
