const BASE = import.meta.env.VITE_API_URL;

async function pedir(ruta, opciones = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token');
  if(token)
    headers.authorization = `Bearer ${token}`;

  const res = await fetch(BASE + ruta, {
    headers,
    ...opciones
  });
  const datos = await res.json();
  if (!res.ok) {
    const error = new Error(datos.error || 'Algo salio mal');
    error.detalles = datos.detalles;
    throw error;
  }
  return datos
}

export const api = {
  get:  ruta => pedir(ruta),
  post: (ruta, cuerpo) => pedir(ruta, { method: 'POST', body: JSON.stringify(cuerpo) }),
  put: (ruta, cuerpo) => pedir(ruta, { method: 'PUT', body: JSON.stringify(cuerpo) }),
  delete: (ruta) => pedir(ruta, { method: 'DELETE' })
}