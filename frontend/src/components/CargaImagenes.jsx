import { ImagePlusIcon, XIcon } from "lucide-react";
import { Attachment, AttachmentAction, AttachmentActions, AttachmentGroup, AttachmentMedia, AttachmentTrigger } from "./ui/attachment";
import { Field, FieldDescription, FieldError, FieldLabel } from "./ui/field";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import VisorImagen from "./ui/visor-imagen";
import { urlFoto } from "../utils/foto.utils.js";

function MiniaturaFoto({ archivo, onQuitar, onClick }) {
  const [sinVistaPrevia, setSinVistaPrevia] = useState(false);
  const [srcPreview, setSrcPreview] = useState('');

  const esArchivoLocal = archivo instanceof File;
  // Soporta tanto 'name' (File) como propiedades de la API ('nombre' o fallback)
  const nombreFoto = esArchivoLocal 
    ? archivo.name 
    : `Foto ${archivo?.id}`;

  useEffect(() => {
    if (!archivo) return;

    if (esArchivoLocal) {
      // 1. Archivo subido localmente por el input
      const urlTemporal = URL.createObjectURL(archivo);
      setSrcPreview(urlTemporal);
      return () => URL.revokeObjectURL(urlTemporal);
    } else {
      // 2. Foto proveniente del backend: aplicamos el helper de URL para completar el dominio/base
      const urlCompleta = urlFoto(archivo.url);
      setSrcPreview(urlCompleta);
    }
  }, [archivo, esArchivoLocal]);

  return (
    <Attachment orientation="vertical">
      <AttachmentMedia variant="image">
        {!sinVistaPrevia && srcPreview ? (
          <img
            src={srcPreview}
            alt={nombreFoto}
            className="h-full w-full object-cover cursor-pointer"
            onError={() => setSinVistaPrevia(true)} // Si la URL falla (404/cors), pasa a mostrar solo el texto
            onClick={() => onClick({ url: srcPreview, nombre: nombreFoto })}
          />
        ) : (
          <span className="line-clamp-3 break-all p-1 text-center text-xs text-muted-foreground">
            {nombreFoto}
          </span>
        )}
      </AttachmentMedia>
      <AttachmentActions>
        <AttachmentAction
          onClick={onQuitar}
          aria-label={`Eliminar ${nombreFoto}`}
          className="rounded-full bg-muted p-1 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
        >
          <XIcon />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  );
}

export default function CargaImagenes({field, fieldState, max}){
  const inputFotos = useRef(null);

  function agregarFotos(evento) {
    const nuevas = Array.from(evento.target.files ?? []);
    const disponible = max - field.value.length;
    if(nuevas.length <= disponible)
      field.onChange([...field.value, ...nuevas]);
    else
      field.onChange([...field.value, ...nuevas.slice(0,disponible)]);
    // permite volver a elegir el mismo archivo después de quitarlo
    evento.target.value = '';
  };
  
  const quitarFoto = (indice) => field.onChange(field.value.filter((_, i) => i !== indice));

  const [fotoAbierta, setFotoAbierta] = useState(null);

  return (
    <Field data-invalid={fieldState.invalid}>
      <VisorImagen url={fotoAbierta?.url} nombre={fotoAbierta?.name} absolute={true} onOpenChange={()=>setFotoAbierta(null)}/>
      <FieldLabel htmlFor={id}>{etiqueta} ({field.value.length} de {max})</FieldLabel>
      <Input
        ref={(elemento) => { inputFotos.current = elemento; field.ref(elemento); }}
        id={id}
        type="file"
        accept="image/*,.heic,.heif"
        multiple={max > 1}
        className="sr-only"
        onChange={agregarFotos}
        onBlur={field.onBlur}
      />
      <div>
        <AttachmentGroup>
          {field.value.map((foto, indice) => (
            <MiniaturaFoto
              onClick={setFotoAbierta}
              key={foto.id ? `api-${foto.id}` : `${foto.name}-${foto.lastModified}-${indice}`}
              archivo={foto}
              onQuitar={() => quitarFoto(indice)}
            />
          ))}
          {field.value.length < max && (
            <Button
              type="button"
              variant="outline"
              className="h-24 w-24 flex-col"
              onClick={() => inputFotos.current?.click()}
            >
              <ImagePlusIcon className="size-6!" />
              Agregar
            </Button>
          )}
        </AttachmentGroup>
      </div>
      <FieldDescription>{descripcion ?? `Al menos una foto. JPG, PNG, WEBP o HEIC, de hasta ${max} MB cada una.`}</FieldDescription>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}