import { useEffect, useState } from "react";
import PantallaUsuario from "../components/PantallaUsuario";
import { BellIcon, User, PillBottleIcon, Book } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { buscarNovedades } from "../services/encargadoOficinaService";

export default function MenuOficinaPage(){
    const novedades = useFetch(()=>buscarNovedades());
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
            icono: User
        }
    ]);

    useEffect(() => {
        if(!novedades.datos)
            return;
        setSecciones(([
            {
                texto: "Ver objetos",
                nombre:"/menuOficina",
                icono: PillBottleIcon
            },
            {
                texto: "Atender alertas",
                nombre:"atenderAlertas",
                icono: BellIcon,
                notificacion: novedades.datos?.modificacionAlerta
            },
            {
                texto: "Entregas",
                nombre:"entregas",
                icono: Book
            },
            {
                texto: "Perfil",
                nombre:"perfil",
                icono: User
            }
        ]));
    }, [novedades.datos]);
    
    function onClick(nombre) {
        setSecciones(secciones.map((item)=>(item.nombre === nombre ? {...item,notificacion: false} : item)))
    }

    return (
        <PantallaUsuario menuItems={secciones} onClick={onClick} />
    )
}
