import { useState } from "react";
import PantallaUsuario from "../components/PantallaUsuario";
import { UserIcon, UserGroupIcon, BuildingIcon, UniversityIcon } from "lucide-react";

export default function MenuAdministradorPage(){
    const [secciones, setSecciones] = useState([
        {
            texto: "Encargados de oficina",
            nombre:"/menuAdministrador",
            icono: UserGroupIcon
        },
        {
            texto: "Oficinas de la universidad",
            nombre:"oficinas",
            icono: BuildingIcon
        },
        {
            texto: "Campus de la universidad",
            nombre:"campus",
            icono: UniversityIcon
        },
        {
            texto: "Perfil",
            nombre:"perfil",
            icono: UserIcon
        }
    ])
    
    function onClick(nombre) {
        setSecciones(secciones.map((item)=>(item.nombre === nombre ? {...item,notificacion: false} : item)))
    }

    return (
        <PantallaUsuario menuItems={secciones} onClick={onClick} />
    )
}
