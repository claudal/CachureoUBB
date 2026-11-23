import { useState } from "react";
import { Trash2Icon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

// mismo maximo que el backend (cerrarAlertaBusquedaSchema)
const MAXIMO_MOTIVO = 500;

/**
 * Boton que abre una confirmacion para eliminar la alerta, con un motivo opcional.
 * El dialogo queda abierto mientras se envia y muestra el error si falla.
 *
 * @param {{onConfirmar: (motivo: string) => Promise<void>}} props
 *   onConfirmar debe lanzar un error si no se pudo eliminar, si termina bien el dialogo se cierra.
 */
export default function DialogoEliminarAlerta({ onConfirmar }) {
  const [abierto, setAbierto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  function cambiarAbierto(valor) {
    // no se puede cerrar mientras se esta eliminando
    if (enviando) return;
    setAbierto(valor);
    if (valor) {
      setMotivo("");
      setError(null);
    }
  }

  async function confirmar() {
    setEnviando(true);
    setError(null);
    try {
      await onConfirmar(motivo);
      setAbierto(false);
    } catch (err) {
      setError(err.message || "No se pudo eliminar la alerta");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AlertDialog open={abierto} onOpenChange={cambiarAbierto}>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <Trash2Icon className="h-4 w-4 mr-2" />
            Eliminar alerta
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Eliminar alerta de búsqueda</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Está seguro de que desea eliminar su alerta? Los encargados de oficina dejarán de verla
            y no podrá recuperarla.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Field>
          <FieldLabel htmlFor="motivo-eliminar-alerta">Motivo (opcional)</FieldLabel>
          <Textarea
            id="motivo-eliminar-alerta"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={MAXIMO_MOTIVO}
            disabled={enviando}
            placeholder="Por ejemplo: ya encontré mi objeto"
            className="min-h-20"
          />
          <FieldDescription className="text-right">
            {motivo.length}/{MAXIMO_MOTIVO}
          </FieldDescription>
        </Field>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={enviando}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={confirmar} disabled={enviando}>
            {enviando ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
