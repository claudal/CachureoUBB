import { urlFoto } from '../../utils/foto.utils.js';
import { Drawer, DrawerClose, DrawerContent, DrawerFooter } from './drawer.js';
import { Button } from './button.js';
import { ArrowRightCircleIcon } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile.js';
import { ResponsiveModal } from "./responsive-modal.jsx";

export default function VisorImagen({url, nombre, onOpenChange, absolute=false}){
    const src = absolute ? url : urlFoto(url);
    return (
        <ResponsiveModal 
            open={Boolean(url)}
            onOpenChange={onOpenChange}
            drawerProps={{
                showSwipeHandle: true,
                swipeDirection: "down",
                snapPoints: ["31rem",1]
            }}
            dialogClassName="sm:max-w-[95vw] sm:h-[95vh] flex flex-col p-6 overflow-hidden"
        >
            <div className="flex-1 min-h-0 w-full flex items-center justify-center p-2 overflow-hidden">
                <img
                    src={src}
                    alt={`Imagen ${nombre}`}
                    className="h-full w-full object-contain"
                />
            </div>
        </ResponsiveModal>
    );
}