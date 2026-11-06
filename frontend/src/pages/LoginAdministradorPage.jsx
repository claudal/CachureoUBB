import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginAdministradorSchema } from '../schemas/auth.schema';
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
} from "../components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../components/ui/field"
import { Input } from "../components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { UserIcon } from 'lucide-react';

export default function LoginAdministradorPage() {
    const [apiError, setApiError] = useState(null);
    const { loginAdministrador } = useAuth();
    const navigate = useNavigate();
    const formulario = useForm({
        resolver: zodResolver(LoginAdministradorSchema),
        defaultValues: {
            correo: "",
            clave: ""
        }
    });
    const onSubmit = async (data) => {
        setApiError(null);
        try{
            await loginAdministrador(data)
            navigate('/menuAdministrador',{relative:false});
        } catch(err) {
            setApiError(err.message);
        }
    }
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full sm:max-w-md">
                <CardHeader>
                    <CardTitle>Iniciar sesión como Administrador</CardTitle>
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
                        name="correo"
                        control={formulario.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="form-correo">
                                Correo electrónico
                            </FieldLabel>
                            <Input
                                {...field}
                                id="form-correo"
                                type='email'
                                aria-invalid={fieldState.invalid}
                                placeholder="correo@dominio.com"
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
                        onClick={() => navigate("../")}
                    >
                    <UserIcon className="h-4 w-4" />
                        Iniciar sesión como Encargado de Oficina
                    </Button>
                </CardFooter>
            </Card>
        </div>
  );
}