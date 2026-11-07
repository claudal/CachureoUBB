import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "./ui/combobox.js"
import { useFetch } from "../hooks/useFetch.js";


export default function Selector({
  id,
  onSelect,
  value = null,
  invalid = false,
  fn,
  deps=[],
  textoCargando,
  textoNoDatos,
  textoVacio,
  ...props
}) {
  const { datos, cargando } = useFetch(fn, deps, []);

  const objetoSeleccionado =
    typeof value === 'object' && value !== null
      ? value
      : datos?.find((c) => String(c.id) === String(value)) ?? null;

  return (
    <Combobox
      {...props}
      id={id}
      items={datos}
      disabled={cargando}

      value={objetoSeleccionado}
      onValueChange={(objetoSeleccionado) => {
        if (objetoSeleccionado) {
          onSelect?.(objetoSeleccionado.id);
        } else {
          onSelect?.(null);
        }
      }}
      itemToStringValue={(objeto) => String(objeto?.id ?? '')}
      itemToStringLabel={(objeto) => objeto?.nombre ?? ''}
    >
      <ComboboxInput
        placeholder={cargando ? textoCargando : textoVacio}
        aria-invalid={invalid}
      />
      <ComboboxContent>
        <ComboboxEmpty>
          {cargando ? textoCargando : textoNoDatos}
        </ComboboxEmpty>
        <ComboboxList>
          {(objeto) => (
            <ComboboxItem key={objeto.id} value={objeto}>
              {objeto.nombre}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}