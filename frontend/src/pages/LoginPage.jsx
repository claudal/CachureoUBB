import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginEncargadoSchema } from '../schemas/auth.schema';
import { useState } from 'react';
import { useAuth } from '../context/AutenticacionContext';
import { useNavigate } from 'react-router-dom';


export default function EncargadoLoginPage() {
    const [apiError, setApiError] = useState(null);
    const { loginEncargadoOficina } = useAuth();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting}
    } = useForm({resolver: zodResolver(LoginEncargadoSchema)});
    const onSubmit = async (data) => {
        setApiError(null);
        try{
            await loginEncargadoOficina(data)
            navigate('encargadoOficina/inicio');
        } catch(err) {
            setApiError(err.message);
        }
    }
    return (
        <div>
            <header>
                <h1>
                    Iniciar sesión
                </h1>
            </header>
            {
                apiError && (
                    <div>
                        <p>{apiError}</p>
                    </div>
                )
            }
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>
                        Ingrese su rut
                    </label>
                    <input type="text" placeholder="12345678-9" {...register("rut")} />
                    {
                        errors.rut && (
                            <p>
                                {errors.rut.message}
                            </p>
                        )
                    }
                </div>
                <div>
                    <label>
                        Ingrese su contraseña
                    </label>
                    <input type="password" placeholder="••••••••" {...register("clave")}/>
                    {
                        errors.clave && (
                            <p>
                                {errors.clave.message}
                            </p>
                        )
                    }
                </div>
                <button type="submit">
                    Ingresar
                </button>
            </form>
            <footer>
                ¿Olvidaste tu contraseña? <span>Solicita la recuperación</span>
            </footer>
        </div>
    );
}