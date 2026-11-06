import { useEffect, useState, useCallback } from 'react'

export function useFetch(fn,deps=[],defaultData=null) {
  const [datos, setDatos] = useState(defaultData)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(() => {
    let cancelado = false
    setCargando(true)
    setError('')

    fn()
      .then((respuesta) => {
        if (!cancelado) setDatos(respuesta)
      })
      .catch((e) => {
        if (!cancelado) setError(e.message || 'Error al cargar los datos')
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })

    return () => {
      cancelado = true
    }
  }, deps) // Se vuelve a ejecutar solo cuando los elementos dentro de 'deps' cambian

  useEffect(() => {
    const cleanup = recargar()
    return cleanup
  }, [recargar])

  return { datos, cargando, error, recargar, setDatos }
}