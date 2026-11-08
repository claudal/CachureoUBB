import { transporter, EMAIL_FROM } from '../config/mailer.js';
import { cargarPlantillaEmail } from '../utils/templateLoader.utils.js';

const enlaceRestablecimiento = process.env.PASSWORD_RESET_URL;

function agregarToken(token){
    return `${enlaceRestablecimiento}?token=${token}`
}

export async function enviarCorreoCreacionEncargado(correo, nombre, token) {
    const enlaceActivacion = agregarToken(token);
    const html = await cargarPlantillaEmail('creacionEncargado.html',{
      NOMBRE: nombre,
      ENLACE_ACTIVACION: enlaceActivacion
    })
    return await transporter.sendMail({
      from: EMAIL_FROM,
      to: correo,
      subject: 'Activación de cuenta - Encargado de Oficina',
      html
    });
  }

export async function enviarCorreoRestablecimientoEncargado(correo, nombre, token) {
    const enlaceRestablecer = agregarToken(token);
    const html = await cargarPlantillaEmail('restablecimientoClaveEncargado.html',{
      NOMBRE: nombre,
      ENLACE_ACTIVACION: enlaceRestablecer
    })
    return await transporter.sendMail({
        from: EMAIL_FROM,
        to: correo,
        subject: 'Restablecimiento de contraseña',
        html
    });
}