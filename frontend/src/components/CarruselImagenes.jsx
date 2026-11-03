import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel.js';
import { urlFoto } from '../utils/urlFoto.js';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter } from '../components/ui/drawer.js';
import { useState } from 'react';
import { Button } from './ui/button.js';
import { ArrowRightCircleIcon } from 'lucide-react';

export function CarruselImagenes({fotos, swipeDirection}){
    const [fotoAbierta, setFotoAbierta] = useState(null);
    async function abrirFoto(foto){
        setFotoAbierta(foto);
    }

    if(!Boolean(fotos))
        return (<span />)

    return (
        <div>
            <Drawer open={Boolean(fotoAbierta)} onOpenChange={() => setFotoAbierta(null)} swipeDirection={swipeDirection}>
                <DrawerContent>
                    <div className="flex-1 min-h-0 flex items-center justify-center p-4">
                    <img
                        src={urlFoto(fotoAbierta?.url)}
                        alt={`Imagen ${fotoAbierta?.id}`}
                        className="max-h-full max-w-full w-auto h-auto object-contain rounded-md shadow-sm"
                    />
                    </div>
                    <DrawerFooter>
                    <DrawerClose render={<Button variant="outline">Cerrar<ArrowRightCircleIcon/></Button>}/>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
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