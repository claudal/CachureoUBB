import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "./item"
import { Spinner } from "./spinner"

export function ItemCargando({className,texto="Cargando..."}) {
  return (
    <Item variant="outline" className={className}>
      <ItemMedia>
        <Spinner />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="line-clamp-1">{texto}</ItemTitle>
      </ItemContent>
    </Item>
  )
}
