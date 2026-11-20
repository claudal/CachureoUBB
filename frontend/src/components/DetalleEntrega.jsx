import { useState } from 'react';
import { CircleCheckIcon } from 'lucide-react';

import VisorImagen from './ui/visor-imagen.jsx';
import { urlFoto } from '../utils/foto.utils.js';
import { formatear } from '../utils/rut.utils.js';

/**
 * Datos de la entrega de un objeto ya entregado: quien lo retiro, cuando,
 * que encargado lo registro y como se verifico
 *
 * @param {{
 *   entrega: {
 *     fechaEntrega: string,
 *     caracteristicaVerificacion: string | null,
 *     comentarios: string | null,
 *     reclamante: {rut: string, nombreReclamante: string},
 *     encargado: {rut: string, nombre: string},
 *     foto: {id: number, url: string} | null
 *   } | null
 * }} props
 */
export default function DetalleEntrega({ entrega }) {
  const [fotoAbierta, setFotoAbierta] = useState(false);

  if (!entrega)
    return null;

  const fecha = new Date(entrega.fechaEntrega).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 font-semibold text-sm text-foreground">
        <CircleCheckIcon className="size-4" /> Datos de la entrega
      </span>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 p-4 border rounded-2xl text-sm">
        <dt className="text-muted-foreground">Fecha</dt>
        <dd>{fecha}</dd>

        <dt className="text-muted-foreground">Retiró</dt>
        <dd className="break-words">
          {entrega.reclamante.nombreReclamante}
          <span className="block text-muted-foreground">{formatear(entrega.reclamante.rut)}</span>
        </dd>

        <dt className="text-muted-foreground">Entregado por</dt>
        <dd className="break-words">{entrega.encargado.nombre}</dd>

        {entrega.caracteristicaVerificacion && (
          <>
            <dt className="text-muted-foreground">Verificación</dt>
            <dd className="break-words whitespace-pre-line">{entrega.caracteristicaVerificacion}</dd>
          </>
        )}

        {entrega.comentarios && (
          <>
            <dt className="text-muted-foreground">Comentarios</dt>
            <dd className="break-words whitespace-pre-line">{entrega.comentarios}</dd>
          </>
        )}

        {entrega.foto && (
          <>
            <dt className="text-muted-foreground">Foto</dt>
            <dd>
              <button
                type="button"
                onClick={() => setFotoAbierta(true)}
                className="block h-24 w-24 overflow-hidden rounded-md border cursor-pointer"
                aria-label="Ver foto de verificación"
              >
                <img
                  src={urlFoto(entrega.foto.url)}
                  alt="Foto de verificación"
                  className="h-full w-full object-cover"
                />
              </button>
            </dd>
          </>
        )}
      </dl>

      {entrega.foto && (
        <VisorImagen
          url={fotoAbierta ? entrega.foto.url : null}
          nombre="de verificación"
          onOpenChange={() => setFotoAbierta(false)}
        />
      )}
    </div>
  );
}
