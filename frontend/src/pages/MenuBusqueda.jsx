import { useState } from "react";
import PantallaUsuario from "../components/PantallaUsuario";
import { BellIcon, PillBottleIcon } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { useAlertaLocal } from "../hooks/useAlertaLocal";
import { useEffect } from "react";
import { buscarNovedad } from "../services/alertaBusquedaService";

export default function MenuBusquedaPage(){
    const alerta = useAlertaLocal();
    const novedades = useFetch(()=>buscarNovedad(alerta.id),[alerta.id]);
    const [secciones, setSecciones] = useState([
        {
            texto: "Buscar objetos",
            nombre:"/menuBusqueda",
            icono: PillBottleIcon
        },
        {
            texto: "Administrar alerta de búsqueda",
            nombre:"alertaBusqueda",
            icono: BellIcon
        }
    ]);
    
    useEffect(() => {
        if(!novedades.datos?.novedad)
            return;
        setSecciones(([
            {
                texto: "Buscar objetos",
                nombre:"/menuBusqueda",
                icono: PillBottleIcon
            },
            {
                texto: "Administrar alerta de búsqueda",
                nombre:"alertaBusqueda",
                icono: BellIcon,
                notificacion: true
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
