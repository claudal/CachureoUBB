import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RestablecerClaveSchema } from '../schemas/autenticacion.schema.js';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "../components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert.js"
import { restablecerClave } from '../services/autenticacion.js';

export default function RestablecerClavePage() {
    const [apiError, setApiError] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const formulario = useForm({
        resolver: zodResolver(RestablecerClaveSchema),
        defaultValues: {
            claveNueva: "",
            claveRepetida: "",
            token
        }
    });
    const onSubmit = async (data) => {
        setApiError(null);
        try{
            await restablecerClave(data)
            navigate('/login',{relative:false});
        } catch(err) {
            setApiError(err.message);
        }
    }
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full sm:max-w-md">
                <CardHeader>
                    <CardTitle>Restablecer contraseña</CardTitle>
                    <CardDescription>
                    Restablezca la contraseña de su usuario.
                    </CardDescription>
                    {apiError && (
                        <Alert variant="destructive">
                            <AlertTitle>Error al reestablecer</AlertTitle>
                            <AlertDescription>{apiError}</AlertDescription>
                        </Alert>
                    )}
                </CardHeader>
                <CardContent>
                    <form id="form-rhf" onSubmit={formulario.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                            name="claveNueva"
                            control={formulario.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-claveNueva">
                                    Contraseña nueva
                                </FieldLabel>
                                <Input
                                    {...field}
                                    type="password"
                                    id="form-claveNueva"
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
                            <Controller
                            name="claveRepetida"
                            control={formulario.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="form-claveRepetida">
                                    Repita su contraseña
                                </FieldLabel>
                                <Input
                                    {...field}
                                    type="password"
                                    id="form-claveRepetida"
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
                            <Controller
                            name="token"
                            control={formulario.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                <Input
                                    {...field}
                                    hidden={true}
                                    type="text"
                                    id="form-token"
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
                    <Button
                    type="submit"
                    form="form-rhf"
                    className="w-full"
                    disabled={formulario.formState.isSubmitting}
                    >
                    {formulario.formState.isSubmitting ? "Reestableciendo..." : "Reestablecer"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
  );
}