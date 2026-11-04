import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel.js';
import { urlFoto } from '../utils/urlFoto.js';
import { useState } from 'react';
import VisorImagen from './ui/visor-imagen.jsx';

export default function CarruselImagenes({fotos}){
    const [fotoAbierta, setFotoAbierta] = useState(null);
    async function abrirFoto(foto){
        setFotoAbierta(foto);
    }

    if(!Boolean(fotos))
        return (<span />)

    return (
        <div>
            <VisorImagen imagen={fotoAbierta} onOpenChange={()=>setFotoAbierta(null)}/>
            <Carousel>
                <CarouselContent>
                    {fotos.map((foto) => (
                    <CarouselItem key={foto.id}>
                        <div className="relative flex items-center justify-center h-48 w-full bg-background/50 rounded-md overflow-hidden border">
                        <img
                            src={urlFoto(foto.url)}
                            alt={`Imagen ${foto.id}`}
                            className="h-full w-full object-contain p-1"
                            onClick={()=>abrirFoto(foto)}
                        />
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 h-7 w-7" />
                <CarouselNext className="right-2 h-7 w-7" />
            </Carousel>
        </div>
    )
}