import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const EMAIL_FROM = `"CachureoUBB" <${process.env.SMTP_USER}>`;

transporter.verify((error) => {
  if (error) {
    console.error('Error al conectar con el servidor SMTP:', error);
  } else {
    console.log('Servidor SMTP listo para enviar correos');
  }
});