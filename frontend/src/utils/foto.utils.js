import { IMAGEN_URL } from "../api/config"

export const urlFoto = (url) => `${IMAGEN_URL}/${url}`;

// algunos navegadores dejan vacío el tipo de las fotos HEIC de iPhone y el backend las rechazaría
export function conTipoHeic(foto){
    if (foto.type || !/\.(heic|heif)$/i.test(foto.name))
        return foto;
    const tipo = /\.heif$/i.test(foto.name) ? 'image/heif' : 'image/heic';
    return new File([foto], foto.name, { type: tipo });
}