import { useState } from "react";
import PantallaUsuario from "../components/PantallaUsuario";
import { BellIcon, User, PillBottleIcon, Book } from "lucide-react";

export default function MenuOficinaPage(){
    const [secciones, setSecciones] = useState([
        {
            texto: "Ver objetos",
            nombre:"/menuOficina",
            icono: PillBottleIcon
        },
        {
            texto: "Atender alertas",
            nombre:"atenderAlertas",
            icono: BellIcon
        },
        {
            texto: "Entregas",
            nombre:"entregas",
            icono: Book
        },
        {
            texto: "Perfil",
            nombre:"perfil",
            icono: User,
            notificacion: true
        }
    ])
    
    function onClick(nombre) {
        setSecciones(secciones.map((item)=>(item.nombre === nombre ? {...item,notificacion: false} : item)))
    }

    return (
        <PantallaUsuario menuItems={secciones} onClick={onClick} />
    )
}
