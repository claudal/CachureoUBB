import { useState } from "react"

export function useAlertaLocal() {
  // Inicialización perezosa (solo lee localStorage en el primer render)
  const [id, set] = useState(() => localStorage.getItem("idAlerta"));

  function setIdAlerta(nuevoId) {
    set(nuevoId);
    if (nuevoId) {
      localStorage.setItem("idAlerta", nuevoId);
    } else {
      localStorage.removeItem("idAlerta");
    }
  }

  function clearIdAlerta() {
    set(null);
    localStorage.removeItem("idAlerta");
  }

  return { id, setIdAlerta, clearIdAlerta };
}