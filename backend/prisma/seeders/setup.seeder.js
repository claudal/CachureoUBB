import { hashSync } from "bcrypt";
import { BCRYPT_SALT_ROUNDS } from "../../src/config/auth.js";

const ESTADOS_OBJETO = [
  { id: 1, nombre: "Sin entrega" },
  { id: 2, nombre: "Entregado" }
];

const ESTADOS_ALERTA = [
  { id: 1, nombre: "Abierto" },
  { id: 2, nombre: "Cerrado" },
  { id: 3, nombre: "Rectificado" }
];

const ESTADOS_ENCARGADO = [
  { id: 1, nombre: "Habilitado" },
  { id: 2, nombre: "Pendiente" },
  { id: 3, nombre: "Deshabilitado" }
];

const NOMBRE_ETIQUETAS_NORMALES = [
  "Mochila vacía",
  "Ropa",
  "Estuche",
  "Útiles de estudio",
  "Tecnología",
  "Calculadora",
  "Audífonos"
];

const NOMBRE_ETIQUETAS_VALIOSAS = [
  "Tecnología (de valor)",
  "Joya",
  "Credenciales",
  "Mochila (con cosas)",
  "Teléfono",
  "Tablet",
  "Laptop"
];

/**
 * 
 * @param {import("@prisma/client").PrismaClient} prisma 
 */
export async function runSetupSeed(prisma) {
    console.log('Ejecutando setup...');

    console.log('\t- Creando usuario administrador');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const oldAdmin = await prisma.administrador.findFirst();
    if(oldAdmin) //Si existía un administrador, actualiza su correo y/o contraseña
        await prisma.administrador.update({
            where: {
                correo: oldAdmin.correo
            },
            data: {
                correo: adminEmail,
                clave: hashSync(adminPassword,BCRYPT_SALT_ROUNDS)
            }
        })
    else  //Si no existía, lo crea
        await prisma.administrador.create({
            data: {
                correo: adminEmail,
                clave: hashSync(adminPassword,BCRYPT_SALT_ROUNDS)
            }
        });

    console.log('\t- Creando estados de encargado');
    const estadosEncargado = await Promise.all(
    ESTADOS_ENCARGADO.map(({ id, nombre }) =>
        prisma.estadoEncargado.upsert({ where: { id }, update: { nombre }, create: { id, nombre } })
    )
    );

    console.log('\t- Creando estados de objeto');
    const estadosObjeto = await Promise.all(
    ESTADOS_OBJETO.map(({ id, nombre }) =>
        prisma.estadoObjeto.upsert({ where: { id }, update: { nombre }, create: { id, nombre } })
    )
    );

    console.log('\t- Creando estados de alerta');
    const estadosAlerta = await Promise.all(
    ESTADOS_ALERTA.map(({ id, nombre }) =>
        prisma.estadoAlerta.upsert({ where: { id }, update: { nombre }, create: { id, nombre } })
    )
    );

    console.log('\t- Creando etiquetas de objeto');
    // nombre no es único en la tabla, así que se busca antes de crear para no duplicar
    const crearEtiqueta = async (nombre, valioso) =>
    (await prisma.etiquetaObjeto.findFirst({ where: { nombre } })) ??
    prisma.etiquetaObjeto.create({ data: { nombre, valioso } });

    const etiquetasNormales = await Promise.all(
    NOMBRE_ETIQUETAS_NORMALES.map((nombre) => crearEtiqueta(nombre, false))
    );
    const etiquetasValiosas = await Promise.all(
    NOMBRE_ETIQUETAS_VALIOSAS.map((nombre) => crearEtiqueta(nombre, true))
    );

    return { estadosObjeto, estadosAlerta, etiquetasNormales, etiquetasValiosas, estadosEncargado };
}