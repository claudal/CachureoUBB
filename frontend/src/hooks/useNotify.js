import { toast } from "../components/ui/toast"

export function useNotify() {
  const exito = (mensaje) => {
    toast.add({ type: "success", title: mensaje })
  }

  const error = (mensaje) => {
    toast.add({ type: "error", title: mensaje, priority: "high" })
  }

  const info = (mensaje) => {
    toast.add({ type: "info", title: mensaje })
  }

  return { exito, error, info }
}