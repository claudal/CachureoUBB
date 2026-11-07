
import { useState } from 'react';
import { Button } from './ui/button.js';
import { useForm } from 'react-hook-form';
import { XIcon } from 'lucide-react';
import { ResponsiveModal } from './ui/responsive-modal.jsx';

const ID_FILTRO = "form-filtros";

export function PanelFiltro({controlador,children}){
    return (
        <ResponsiveModal
            open={controlador.abierto}
            onOpenChange={controlador.setAbierto}
            title="Filtros"
            closeButton={<Button variant="outline"><XIcon />Cancelar</Button>}
            footer={<Button
                        type="submit"
                        form={ID_FILTRO}
                        disabled={controlador.formulario.formState.isSubmitting}
                    >
                        Aplicar filtros
                    </Button>}
        >
            <form
                id={ID_FILTRO}
                onSubmit={controlador.onSubmit}
                className='flex-1 overflow-y-auto p-4'
            >
                {children}
            </form>
        </ResponsiveModal>
        
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