import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "./button";
import { ButtonGroup } from "./button-group";

export function Paginacion({onBack, onFoward, disabledFoward, disabledBack}){
    return (
        <ButtonGroup>
            <Button variant='outline' disabled={ disabledBack } onClick={onBack}>
            <ArrowLeftIcon /> Retroceder página
            </Button>
            <Button variant='outline' disabled={ disabledFoward } onClick={onFoward}>
            Avanzar página <ArrowRightIcon /> 
            </Button>
        </ButtonGroup>
    );
}