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
import { AlertCircleIcon, CheckCircle2Icon, CheckIcon, Loader2Icon, ShieldIcon } from 'lucide-react';
import { enviarCorreoRestablecimientoClave } from '../services/encargadoOficinaService.js';

function EnviarCorreoReestablecimiento(){

    const formulario = useForm({
        resolver: zodResolver(RutRestablecimientoSchema),
        defaultValues: {
            rut: ""
        }
    });

    const [exito,setExito] = useState(false);
    const [cargando,setCargando] = useState(false);
    const [apiError,setApiError] = useState(false);

    async function onSubmit(data){
        setExito(false);
        setApiError(false);
        try {
            await enviarCorreoRestablecimientoClave(data.rut);
            setExito(true);
        } catch(err) {
            setApiError(err.message);
        }
    }

    return (
        <Dialog>
        <DialogTrigger render={
            <Button variant="link" className="p-0 h-auto font-normal text-muted-foreground hover:text-primary">
            ¿Se le olvidó su contraseña?
            </Button>} />

        <DialogContent className="sm:max-w-md">
            <DialogHeader>
            <DialogTitle>Restablecer contraseña</DialogTitle>
            <DialogDescription>
                Ingrese el RUT de su usuario. Si está registrado, le enviaremos un enlace a su correo de contacto para crear una nueva clave.
            </DialogDescription>
            </DialogHeader>

            {/* Mensaje de Error Global de la API */}
            {apiError && (
                <Alert variant="destructive" className="my-2 w-full max-w-full overflow-hidden wrap-break-word">
                    <AlertCircleIcon className="h-4 w-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                        <AlertTitle>Error al solicitar el reestablecimiento</AlertTitle>
                        <AlertDescription className="wrap-break-word text-sm">
                            {apiError}
                        </AlertDescription>
                    </div>
                </Alert>
            )}

            {/* Estado de Éxito */}
            {exito ? (
            <Alert variant="default" className="border-green-500/50 bg-green-50 dark:bg-green-950/20 text-green-900 dark:text-green-300 my-2">
                <CheckCircle2Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="font-semibold text-green-800 dark:text-green-200">¡Petición enviada!</AlertTitle>
                <AlertDescription>
                Si el RUT ingresado corresponde a un usuario registrado, se ha enviado un correo con las instrucciones necesarias.
                </AlertDescription>
            </Alert>
            ) : (
            /* Formulario estándar */
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
        </DialogContent>
        </Dialog>
    )
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
                    <EnviarCorreoReestablecimiento />
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