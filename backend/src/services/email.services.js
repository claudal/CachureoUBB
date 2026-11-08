import { transporter, EMAIL_FROM } from '../config/mailer.js';

const enlaceRestablecimiento = process.env.PASSWORD_RESET_URL;

function agregarToken(token){
    return `${enlaceRestablecimiento}?token=${token}`
}

export function enviarCorreoCreacionEncargado(correo, nombre, token) {
    const enlaceActivacion = agregarToken(token);
    console.log(enlaceActivacion)
    return transporter.sendMail({
      from: EMAIL_FROM,
      to: correo,
      subject: 'Activación de cuenta - Encargado de Oficina',
      html: `
        <h2>Hola, ${nombre}</h2>
        <p>Has sido registrado como encargado de oficina.</p>
        <p>Haz clic en el siguiente enlace para crear tu contraseña (válido por 24 horas):</p>
        <a href="${enlaceActivacion}">${enlaceActivacion}</a>
      `,
    });
  }

export function enviarCorreoRestablecimiento(correo, nombre, token) {
    const enlaceRestablecer = agregarToken(token);
    return transporter.sendMail({
        from: EMAIL_FROM,
        to: correo,
        subject: 'Restablecimiento de contraseña',
        html: `
        <h2>Hola, ${nombre}</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace (válido por 30 minutos):</p>
        <a href="${enlaceRestablecer}">Restablecer contraseña</a>
        `,
    });
}