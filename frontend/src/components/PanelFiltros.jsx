
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '../components/ui/drawer.js';
import { useState } from 'react';
import { Button } from './ui/button.js';
import { useForm } from 'react-hook-form';
import { XIcon } from 'lucide-react';

const ID_FILTRO = "form-filtros";

export function PanelFiltro({controlador,children}){
    return (
        <Drawer
            open={controlador.abierto}
            onOpenChange={controlador.setAbierto}
            swipeDirection="right"
        >
            <DrawerContent>
                <DrawerHeader className="p-4 shrink-0">
                    <DrawerTitle className="font-semibold text-lg">Filtros</DrawerTitle>
                </DrawerHeader>
                <form
                    id={ID_FILTRO}
                    onSubmit={controlador.onSubmit}
                    className='flex-1 overflow-y-auto p-4'
                >
                    {children}
                </form>
                <DrawerFooter className="shrink-0 border-t p-4">
                    <Button
                        type="submit"
                        form={ID_FILTRO}
                        disabled={controlador.formulario.formState.isSubmitting}
                    >
                        Aplicar filtros
                    </Button>
                    <DrawerClose render={<Button variant="outline"><XIcon />Cancelar</Button>} />
                </DrawerFooter>

            </DrawerContent>
        </Drawer>
    )
}

export function usePanelFiltro(defaultValues,onSubmit){
    const [abierto, setAbierto] = useState(false);
    const formulario = useForm({
        defaultValues
    });

    function onSubmitFiltro(data){
        onSubmit(data);
        setAbierto(false);
    }

    return {
        abierto,
        setAbierto,
        formulario,
        control: formulario.control,
        idForm: ID_FILTRO,
        onSubmit: formulario.handleSubmit(onSubmitFiltro)
    }
}