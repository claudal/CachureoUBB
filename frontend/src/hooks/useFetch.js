import { useEffect, useState, useCallback } from 'react'

export function useFetch(fn) {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(() => {
    setCargando(true)
    fn().then(setDatos).catch(e => setError(e.message)).finally(() => setCargando(false))
  }, [fn])

  useEffect(() => { recargar() }, [recargar])

  return { datos, cargando, error, recargar }
}