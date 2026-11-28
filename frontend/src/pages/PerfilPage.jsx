import { useState } from 'react';
import { BuildingIcon, IdCardIcon, KeyRoundIcon, LogOutIcon, MailIcon, ShieldIcon, UniversityIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ItemCargando } from '../components/ui/item-cargando.jsx';
import { useAuth } from '../context/AutenticacionContext';
import { useFetch } from '../hooks/useFetch.js';
import { useNotify } from '../hooks/useNotify.js';
import { getPerfil } from '../services/autenticacion.js';
import { enviarCorreoRestablecimientoClave } from '../services/encargadoOficinaService.js';
import { formatear } from '../utils/rut.utils.js';

/**
 * Fila con un dato de la cuenta.
 *
 * @param {{Icono: import('lucide-react').LucideIcon, etiqueta: string, valor: string}} props
 */
function Dato({ Icono, etiqueta, valor }) {
  return (
    <div className="flex items-start gap-3">
      <Icono className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
        <dd className="break-words font-medium">{valor}</dd>
      </div>
    </div>
  );
}

// perfil del usuario con sesion iniciada, compartido por encargados y administrador.
export default function PerfilPage() {
  const { usuario, logout } = useAuth();
  // solo el encargado se identifica con rut, el administrador lo hace con su correo
  const esEncargado = Boolean(usuario?.rut);
  // se vuelve a pedir al servidor porque el login no entrega los nombres de oficina y campus
  const perfil = useFetch(() => getPerfil());
  const notificacion = useNotify();

  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState(null);

  function abrirConfirmacion() {
    setErrorEnvio(null);
    setConfirmacionAbierta(true);
  }

  function cambiarAbiertoConfirmacion(abierto) {
    // no se puede cerrar mientras se esta enviando el correo
    if (!abierto && !enviando)
      setConfirmacionAbierta(false);
  }

  async function restablecerClave() {
    setEnviando(true);
    setErrorEnvio(null);
    try {
      await enviarCorreoRestablecimientoClave(usuario.rut);
      notificacion.exito('Revise su correo de contacto para crear la nueva contraseña');
      setConfirmacionAbierta(false);
    } catch (err) {
      setErrorEnvio(err.message || 'No se pudo enviar el correo');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">Revise los datos de su cuenta.</p>
      </header>

      <div className="mx-auto w-full max-w-md p-4">
        <Card>
          {perfil.datos && (
            <CardHeader>
              <CardTitle className="text-lg font-semibold leading-tight">
                {esEncargado ? perfil.datos.nombre : 'Administrador'}
              </CardTitle>
            </CardHeader>
          )}

          <CardContent>
            {perfil.cargando ? (
              <ItemCargando texto="Cargando perfil..." />
            ) : perfil.error ? (
              <Alert variant="destructive">
                <AlertTitle>No se pudo cargar su perfil</AlertTitle>
                <AlertDescription>{perfil.error.mensaje}</AlertDescription>
              </Alert>
            ) : esEncargado ? (
              <>
                <dl className="space-y-3">
                  <Dato Icono={IdCardIcon} etiqueta="RUT" valor={formatear(perfil.datos.rut)} />
                  <Dato Icono={MailIcon} etiqueta="Correo de contacto" valor={perfil.datos.correoContacto} />
                  <Dato Icono={BuildingIcon} etiqueta="Oficina" valor={perfil.datos.nombreOficina} />
                  <Dato Icono={UniversityIcon} etiqueta="Campus" valor={perfil.datos.nombreCampus} />
                </dl>
                <p className="mt-4 text-xs text-muted-foreground">
                  Para cambiar su correo de contacto u oficina, comuníquese con el administrador.
                </p>
              </>
            ) : (
              <dl className="space-y-3">
                <Dato Icono={MailIcon} etiqueta="Correo" valor={perfil.datos.correo} />
                <Dato Icono={ShieldIcon} etiqueta="Rol" valor="Administrador del sistema" />
              </dl>
            )}
          </CardContent>

          {/* las acciones quedan disponibles aunque falle la carga, para poder cerrar sesion */}
          <CardFooter className="flex-col gap-2">
            {esEncargado && (
              <Button variant="outline" className="w-full" onClick={abrirConfirmacion}>
                <KeyRoundIcon />Restablecer contraseña
              </Button>
            )}
            <Button variant="destructive" className="w-full" onClick={logout}>
              <LogOutIcon />Cerrar sesión
            </Button>
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={confirmacionAbierta} onOpenChange={cambiarAbiertoConfirmacion}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <KeyRoundIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>Restablecer contraseña</AlertDialogTitle>
            <AlertDialogDescription>
              Se enviará un enlace a su correo de contacto, válido por 30 minutos, para que cree una nueva contraseña.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {errorEnvio && (
            <Alert variant="destructive">
              <AlertTitle>No se pudo enviar el correo</AlertTitle>
              <AlertDescription>{errorEnvio}</AlertDescription>
            </Alert>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" disabled={enviando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={restablecerClave} disabled={enviando}>
              {enviando ? 'Enviando...' : 'Enviar enlace'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
