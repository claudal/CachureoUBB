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
                    <CardTitle>Iniciar sesión</CardTitle>
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
                <CardFooter>
                    <Field orientation="horizontal">
                    <Button type="submit" form="form-rhf" disabled={formulario.formState.isSubmitting}>
                        {formulario.formState.isSubmitting ? "Ingresando..." : "Ingresar"}
                    </Button>
                    </Field>
                </CardFooter>
            </Card>
        </div>
  );
}