import { Dialog, DialogContent } from "./dialog"
import { urlFoto } from '../../utils/urlFoto.js';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter } from './drawer.js';
import { Button } from './button.js';
import { ArrowRightCircleIcon } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile.js';

export default function VisorImagen({imagen, onOpenChange}){
    const isMobile = useIsMobile();

    if(isMobile)
        return (
            <Drawer 
                open={Boolean(imagen)}
                onOpenChange={onOpenChange}
                swipeDirection="down"
                showSwipeHandle
                snapPoints={["31rem",1]}
            >
                <DrawerContent>
                    <div className="flex-1 min-h-0 w-full flex items-center justify-center p-2 overflow-hidden">
                    <img
                        src={urlFoto(imagen?.url)}
                        alt={`Imagen ${imagen?.id}`}
                        className="h-full w-full object-contain"
                    />
                    </div>
                    <DrawerFooter>
                    <DrawerClose render={<Button variant="outline">Cerrar<ArrowRightCircleIcon/></Button>}/>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        )

    return (
        <Dialog open={Boolean(imagen)} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[90vw] sm:h-[90vh] flex flex-col p-6 overflow-hidden">
                <div className="flex-1 min-h-0 w-full flex items-center justify-center p-2 overflow-hidden">
                <img
                    src={urlFoto(imagen?.url)}
                    alt={`Imagen ${imagen?.id}`}
                    className="h-full w-full object-contain"
                />
                </div>
            </DialogContent>
        </Dialog>
    )
}