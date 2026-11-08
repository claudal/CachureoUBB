import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircleIcon, ArrowRightCircleIcon, PackageCheckIcon, ShieldCheckIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
} from '@/components/ui/alert-dialog';
import { ResponsiveModal } from './ui/responsive-modal.jsx';
import CargaImagenes from './CargaImagenes.jsx';
import { crearRegistrarEntregaSchema, MAXIMO_FOTOS_ENTREGA } from '../schemas/entrega.schema.js';
import { TAMANO_MAXIMO_FOTO_MB } from '../schemas/objetoPerdido.schema.js';
import * as objetoPerdidoService from '../services/objetoPerdidoService.js';
import { formatear, validar } from '../utils/rut.utils.js';
import { useNotify } from '../hooks/useNotify.js';

const ID_FORMULARIO = 'form-registrar-entrega';
const defaultValues = {
  rutReclamante: '',
  nombreReclamante: '',
  caracteristicaVerificacion: '',
  comentarios: '',
  fotos: []
};

/**
 * Modal para entregar un objeto "Sin entrega" a quien lo reclama.
 * Primero valida el formulario, luego pide confirmar con un resumen (la entrega no se puede deshacer)
 * y recien ahi la registra en el backend.
 *
 * @param {{
 *   objeto: {id: number, nombre: string, valioso: boolean} | null,
 *   open: boolean,
 *   onOpenChange: (abierto: boolean) => void,
 *   onEntregado?: (entrega: object) => void
 * }} props
 */
export default function RegistrarEntrega({ objeto, open, onOpenChange, onEntregado }) {
  const notification = useNotify();
  const [apiError, setApiError] = useState(null);
  // datos ya validados que esperan la confirmacion del encargado
  const [porConfirmar, setPorConfirmar] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const valioso = Boolean(objeto?.valioso);
  // el schema cambia segun el objeto: si es valioso exige caracteristica o foto
  const schema = useMemo(() => crearRegistrarEntregaSchema({ valioso }), [valioso]);
  const formulario = useForm({ resolver: zodResolver(schema), defaultValues });

  // al cerrar se limpia todo, asi la proxima vez (con este u otro objeto) el formulario parte vacio
  function limpiar() {
    formulario.reset(defaultValues);
    setApiError(null);
    setPorConfirmar(null);
  }

  function cambiarApertura(abierto) {
    // mientras se registra la entrega no se deja cerrar el modal
    if (enviando) return;
    if (!abierto) limpiar();
    onOpenChange(abierto);
  }

  async function confirmarEntrega() {
    setEnviando(true);
    setApiError(null);
    try {
      const entrega = await objetoPerdidoService.registrarEntrega(objeto.id, porConfirmar);
      notification.exito(`"${objeto.nombre}" se entregó correctamente`);
      limpiar();
      onOpenChange(false);
      onEntregado?.(entrega);
    } catch (err) {
      // los errores de validacion del backend se muestran en su campo
      err.detalles?.forEach(({ campo, mensaje }) => {
        if (campo in formulario.getValues())
          formulario.setError(campo, { message: mensaje });
      });
      notification.error('Error al registrar la entrega');
      setApiError(err.message);
      setPorConfirmar(null);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <ResponsiveModal
        open={open}
        onOpenChange={cambiarApertura}
        drawerProps={{ swipeDirection: 'left' }}
        title="Registrar entrega"
        description={
          <span>
            Objeto: <span className="font-semibold text-foreground">{objeto?.nombre}</span>
          </span>
        }
        footer={
          <Button
            type="submit"
            form={ID_FORMULARIO}
            size="lg"
            className="w-full sm:w-auto"
            disabled={enviando}
          >
            Continuar<PackageCheckIcon />
          </Button>
        }
        closeButton={<Button variant="outline" size="lg" disabled={enviando}>Cancelar<ArrowRightCircleIcon /></Button>}
      >
        <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {apiError && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertTitle>No se pudo registrar la entrega</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <form id={ID_FORMULARIO} onSubmit={formulario.handleSubmit(setPorConfirmar)} noValidate>
            <FieldGroup>
              <Controller
                name="rutReclamante"
                control={formulario.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="entrega-rut">RUT de quien retira</FieldLabel>
                    <Input
                      {...field}
                      // al salir del campo se muestra con puntos y guion, para revisarlo mas facil
                      onBlur={() => {
                        if (validar(field.value))
                          field.onChange(formatear(field.value));
                        field.onBlur();
                      }}
                      id="entrega-rut"
                      aria-invalid={fieldState.invalid}
                      placeholder="12.345.678-9"
                      autoComplete="off"
                      inputMode="text"
                      className="h-10"
                    />
                    <FieldDescription>Puede escribirlo con o sin puntos y guion.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="nombreReclamante"
                control={formulario.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="entrega-nombre">Nombre completo de quien retira</FieldLabel>
                    <Input
                      {...field}
                      id="entrega-nombre"
                      aria-invalid={fieldState.invalid}
                      placeholder="Ana Pérez Soto"
                      autoComplete="off"
                      className="h-10"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {valioso && (
                <Alert>
                  <ShieldCheckIcon className="h-4 w-4" />
                  <AlertTitle>Objeto de valor: se requiere verificación</AlertTitle>
                  <AlertDescription>
                    Antes de entregarlo, pida a la persona un detalle que solo el dueño conocería
                    o tome una foto de la verificación. Ingrese al menos uno de los dos.
                  </AlertDescription>
                </Alert>
              )}

              <Controller
                name="caracteristicaVerificacion"
                control={formulario.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="entrega-caracteristica">
                      Característica de verificación{!valioso && ' (opcional)'}
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="entrega-caracteristica"
                      aria-invalid={fieldState.invalid}
                      placeholder="Ej: tiene un sticker de la UBB en la tapa, la clave de desbloqueo es..."
                      className="min-h-24"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="fotos"
                control={formulario.control}
                render={({ field, fieldState }) => (
                  <CargaImagenes
                    field={field}
                    fieldState={fieldState}
                    max={MAXIMO_FOTOS_ENTREGA}
                    id="entrega-foto"
                    etiqueta={`Foto de verificación${valioso ? '' : ' (opcional)'}`}
                    descripcion={`${valioso ? 'Obligatoria si no ingresa una característica.' : 'Opcional.'} JPG, PNG, WEBP o HEIC, de hasta ${TAMANO_MAXIMO_FOTO_MB} MB.`}
                  />
                )}
              />

              <Controller
                name="comentarios"
                control={formulario.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="entrega-comentarios">Comentarios (opcional)</FieldLabel>
                    <Textarea
                      {...field}
                      id="entrega-comentarios"
                      aria-invalid={fieldState.invalid}
                      placeholder="Cualquier detalle de la entrega que quiera dejar registrado."
                      className="min-h-20"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>
      </ResponsiveModal>

      <AlertDialog open={Boolean(porConfirmar)} onOpenChange={(abierto) => !abierto && !enviando && setPorConfirmar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <PackageCheckIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Confirmar la entrega?</AlertDialogTitle>
            <AlertDialogDescription>
              Revise los datos. Una vez registrada, la entrega no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {porConfirmar && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Objeto</dt>
              <dd className="font-medium break-words">{objeto?.nombre}</dd>
              <dt className="text-muted-foreground">Retira</dt>
              <dd className="font-medium break-words">{porConfirmar.nombreReclamante}</dd>
              <dt className="text-muted-foreground">RUT</dt>
              <dd className="font-medium">{formatear(porConfirmar.rutReclamante)}</dd>
              {porConfirmar.caracteristicaVerificacion && (
                <>
                  <dt className="text-muted-foreground">Verificación</dt>
                  <dd className="break-words line-clamp-3">{porConfirmar.caracteristicaVerificacion}</dd>
                </>
              )}
              {porConfirmar.fotos.length > 0 && (
                <>
                  <dt className="text-muted-foreground">Foto</dt>
                  <dd>Adjunta</dd>
                </>
              )}
            </dl>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={enviando}>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarEntrega} disabled={enviando}>
              {enviando ? 'Registrando...' : 'Confirmar entrega'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
