import { useEffect, useState, useCallback } from 'react'

export function useFetch(fn,filtros) {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('');

  const recargar = useCallback(() => {
    setCargando(true)
    fn(filtros).then(setDatos).catch(e => setError(e.message)).finally(() => setCargando(false))
  }, [fn,filtros])

  useEffect(() => { recargar() }, [recargar])

  return { datos, cargando, error, recargar }
}