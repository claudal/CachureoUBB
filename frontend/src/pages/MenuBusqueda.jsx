import { useState } from "react";
import PantallaUsuario from "../components/PantallaUsuario";
import { BellIcon, PillBottleIcon } from "lucide-react";

export default function MenuBusquedaPage(){
    const [secciones, setSecciones] = useState([
        {
            texto: "Buscar objetos",
            nombre:"/menuBusqueda",
            icono: PillBottleIcon
        },
        {
            texto: "Administrar alerta de búsqueda",
            nombre:"administrarAlerta",
            icono: BellIcon
        }
    ])
    
    function onClick(nombre) {
        setSecciones(secciones.map((item)=>(item.nombre === nombre ? {...item,notificacion: false} : item)))
    }

    return (
        <PantallaUsuario menuItems={secciones} onClick={onClick} />
    )
}
