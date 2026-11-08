import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginEncargadoSchema, RutRestablecimientoSchema } from '../schemas/autenticacion.schema.js';
import { useState } from 'react';
import { useAuth } from '../context/AutenticacionContext';
import { useNavigate } from 'react-router-dom';

import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog.js"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { AlertCircleIcon, ArrowLeftIcon, CheckCircle2Icon, MailWarningIcon, ShieldIcon } from 'lucide-react';
import { enviarCorreoRestablecimientoClave } from '../services/encargadoOficinaService.js';
import { buscarContacto } from '../services/administradorService.js';

export function EnviarCorreoRestablecimiento() {
  const [open, setOpen] = useState(false);
  const [exito, setExito] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [contacto, setContacto] = useState(null);
  const [cargandoContacto, setCargandoContacto] = useState(false);

  const formulario = useForm({
    resolver: zodResolver(RutRestablecimientoSchema),
    defaultValues: { rut: '' }
  });

  // Limpia el estado completo cuando el diálogo se abre o cierra
  const handleOpenChange = (nuevoEstado) => {
    setOpen(nuevoEstado);
    if (!nuevoEstado) {
      formulario.reset();
      setExito(false);
      setApiError(null);
      setContacto(null);
      setCargandoContacto(false);
    }
  };

  async function onClickContacto() {
    setApiError(null);
    setExito(false);
    setCargandoContacto(true);
    try {
      const data = await buscarContacto();
      setContacto(data);
    } catch (err) {
      setApiError(err.message || 'No se pudo obtener la información de contacto');
    } finally {
      setCargandoContacto(false);
    }
  }

  async function onSubmit(data) {
    setExito(false);
    setApiError(null);
    try {
      await enviarCorreoRestablecimientoClave(data.rut);
      setExito(true);
    } catch (err) {
      setApiError(err.message || 'Ocurrió un error al procesar la solicitud');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={
        <Button variant="link" className="p-0 h-auto font-normal text-muted-foreground hover:text-primary">
          ¿Se le olvidó su contraseña?
        </Button>
      }>
        
      </DialogTrigger>

      <DialogContent className="sm:max-w-md w-[90vw] max-w-md overflow-hidden">
        {contacto ? (
          /* VISTA: INFORMACIÓN DE CONTACTO */
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MailWarningIcon className="h-5 w-5 text-amber-500 shrink-0" />
                Contacto con el administrador
              </DialogTitle>
              <DialogDescription className="pt-2 text-left space-y-2">
                <span>
                  Si ya no tiene acceso a su correo registrado, comuníquese directamente con el administrador del sistema al correo:
                </span>
                <strong className="block text-foreground font-medium text-base bg-muted p-2 rounded-md break-all">
                  {contacto.correo}
                </strong>
                <span>
                  Solicite la actualización de su dirección de correo. Una vez actualizada, podrá volver a solicitar el restablecimiento de su contraseña.
                </span>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-4 border-t">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setContacto(null)}
                className="gap-1"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Volver
              </Button>
              <DialogClose render={
                <Button variant="outline">Cerrar</Button>
              }>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          /* VISTA: FORMULARIO PRINCIPAL DE RESTABLECIMIENTO */
          <>
            <DialogHeader>
              <DialogTitle>Restablecer contraseña</DialogTitle>
              <DialogDescription>
                Ingrese el RUT de su usuario. Si está registrado, le enviaremos un enlace a su correo de contacto para crear una nueva clave.
              </DialogDescription>
            </DialogHeader>

            {/* Alerta de Error API */}
            {apiError && (
              <Alert variant="destructive" className="my-2 w-full max-w-full overflow-hidden break-words">
                <AlertCircleIcon className="h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <AlertTitle>Error al solicitar el restablecimiento</AlertTitle>
                  <AlertDescription className="break-words text-sm">
                    {apiError}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Mensaje de Éxito */}
            {exito ? (
              <Alert 
                variant="default" 
                className="my-2 w-full max-w-full overflow-hidden break-words border-green-500/50 bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-300"
              >
                <CheckCircle2Icon className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                <div className="min-w-0 flex-1">
                  <AlertTitle className="font-semibold text-green-800 dark:text-green-200">¡Petición enviada!</AlertTitle>
                  <AlertDescription className="break-words text-sm">
                    Si el RUT ingresado corresponde a un usuario registrado, se ha enviado un correo con las instrucciones necesarias.
                  </AlertDescription>
                </div>
              </Alert>
            ) : (
              /* Formulario */
              <form id="form-restablecimiento" onSubmit={formulario.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <FieldGroup>
                  <Controller
                    name="rut"
                    control={formulario.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-restablecimiento-rut">
                          RUT del Encargado
                        </FieldLabel>
                        <Input
                          {...field}
                          id="form-restablecimiento-rut"
                          aria-invalid={fieldState.invalid}
                          placeholder="11.111.111-1"
                          autoComplete="username"
                          disabled={formulario.formState.isSubmitting}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>

                {/* Enlace alternativo para contacto con administrador (menos invasivo) */}
                <div className="text-xs text-right">
                  <button
                    type="button"
                    onClick={onClickContacto}
                    disabled={formulario.formState.isSubmitting || cargandoContacto}
                    className="text-muted-foreground underline hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    ¿No tiene acceso a su correo?
                  </button>
                </div>
              </form>
            )}

            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <DialogClose render={
                <Button variant="outline" type="button">
                  {exito ? 'Cerrar' : 'Cancelar'}
                </Button>
              }>
              </DialogClose>

              {!exito && (
                <Button
                  type="submit"
                  form="form-restablecimiento"
                  disabled={formulario.formState.isSubmitting}
                >
                  {formulario.formState.isSubmitting ? (
                    'Enviando...'
                  ) : (
                    'Enviar solicitud'
                  )}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function LoginEncargadoPage() {
    const [apiError, setApiError] = useState(null);
    const { loginEncargadoOficina } = useAuth();
    const navigate = useNavigate();
    const formulario = useForm({
        resolver: zodResolver(LoginEncargadoSchema),
        defaultValues: {
            rut: "",
            clave: ""
        }
    });
    const onSubmit = async (data) => {
        setApiError(null);
        try{
            await loginEncargadoOficina(data)
            navigate('/menuOficina',{relative:false});
        } catch(err) {
            setApiError(err.message);
        }
    }
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full sm:max-w-md">
                <CardHeader>
                    <CardTitle>Iniciar sesión como Encargado de Oficina</CardTitle>
                    <CardDescription>
                    Ingrese sus credenciales.
                    </CardDescription>
                    {apiError && (
                        <Alert variant="destructive">
                            <AlertTitle>Error al ingresar</AlertTitle>
                            <AlertDescription>{apiError}</AlertDescription>
                        </Alert>
                    )}
                </CardHeader>
                <CardContent>
                    <form id="form-rhf" onSubmit={formulario.handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Controller
                        name="rut"
                        control={formulario.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-rut">
                                Rut
                            </FieldLabel>
                            <Input
                                {...field}
                                id="form-rut"
                                aria-invalid={fieldState.invalid}
                                placeholder="11.111.111-1"
                                autoComplete="on"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                            </Field>
                        )}
                        />
                        <Controller
                        name="clave"
                        control={formulario.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-clave">
                                Contraseña
                            </FieldLabel>
                            <Input
                                {...field}
                                type="password"
                                id="form-clave"
                                aria-invalid={fieldState.invalid}
                                placeholder="•••••••"
                                autoComplete="off"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                            </Field>
                        )}
                        />
                    </FieldGroup>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    {/* Botón principal de login */}
                    <Button
                    type="submit"
                    form="form-rhf"
                    className="w-full"
                    disabled={formulario.formState.isSubmitting}
                    >
                    {formulario.formState.isSubmitting ? "Ingresando..." : "Ingresar"}
                    </Button>
                    <EnviarCorreoRestablecimiento />
                    {/* Divisor con texto */}
                    <div className="relative w-full my-1">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                            ¿Otro tipo de usuario?
                            </span>
                        </div>
                    </div>

                    {/* Acceso para Administrador */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full gap-2 text-xs"
                        onClick={() => navigate("administrador")}
                    >
                    <ShieldIcon className="h-4 w-4" />
                        Iniciar sesión como Administrador
                    </Button>
                </CardFooter>
            </Card>
        </div>
  );
}