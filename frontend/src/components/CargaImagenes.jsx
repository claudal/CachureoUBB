import { ImagePlusIcon, XIcon } from "lucide-react";
import { Attachment, AttachmentAction, AttachmentActions, AttachmentGroup, AttachmentMedia } from "./ui/attachment";
import { Field, FieldDescription, FieldError, FieldLabel } from "./ui/field";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";

function MiniaturaFoto({ archivo, onQuitar }) {
  const imagen = useRef(null);
  const [sinVistaPrevia, setSinVistaPrevia] = useState(false);

  // la url temporal se crea y se libera junto con la miniatura
  useEffect(() => {
    if (!imagen.current) return;
    const url = URL.createObjectURL(archivo);
    imagen.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  return (
    <Attachment orientation="vertical">
      <AttachmentMedia variant="image">
        {!sinVistaPrevia ? (
          <img
            ref={imagen}
            alt={archivo.name}
            className="h-full w-full object-cover"
            onError={() => setSinVistaPrevia(true)}
          />
        ) : (
          // p. ej. fotos HEIC en navegadores que no las pueden mostrar
          <span className="line-clamp-3 break-all p-1 text-center text-xs text-muted-foreground">{archivo.name}</span>
        )}
      </AttachmentMedia>
      <AttachmentActions>
        <AttachmentAction
          onClick={onQuitar}
          aria-label={`Eliminar ${archivo.name}`}
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
  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="objeto-fotos">Fotos ({field.value.length} de {max})</FieldLabel>
      <Input
        ref={(elemento) => { inputFotos.current = elemento; field.ref(elemento); }}
        id="objeto-fotos"
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="sr-only"
        onChange={agregarFotos}
        onBlur={field.onBlur}
      />
      <div>
        <AttachmentGroup>
          {field.value.map((foto, indice) => (
            <MiniaturaFoto
              key={`${foto.name}-${foto.lastModified}-${indice}`}
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
      <FieldDescription>Al menos una foto. JPG, PNG, WEBP o HEIC, de hasta {max} MB cada una.</FieldDescription>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}