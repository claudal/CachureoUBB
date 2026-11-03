import { SearchSlashIcon } from "lucide-react"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "./item"

export function ItemSinDatos({className, titulo="Sin datos",descripcion="Pruebe con cambiar los filtros"}) {
  return (
    <Item variant="outline" className={className}>
      <ItemMedia>
        <SearchSlashIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="line-clamp-1">{titulo}</ItemTitle>
        <ItemDescription className="line-clamp-1">{descripcion}</ItemDescription>
      </ItemContent>
    </Item>
  )
}
