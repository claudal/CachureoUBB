import { hashSync } from "bcrypt";
import { BCRYPT_SALT_ROUNDS } from "../../src/config/auth.js";

const ESTADOS_OBJETO = [
  { id: 1, nombre: "Sin entrega" },
  { id: 2, nombre: "Entregado" }
];

const ESTADOS_ALERTA = [
  { id: 1, nombre: "Abierto" },
  { id: 2, nombre: "Cerrado" },
  { id: 3, nombre: "Rectificado" },
  { id: 4, nombre: "Vencido" }
];

const ESTADOS_ENCARGADO = [
  { id: 1, nombre: "Habilitado" },
  { id: 2, nombre: "Pendiente" },
  { id: 3, nombre: "Deshabilitado" }
];

const NOMBRE_ETIQUETAS_NORMALES = [
  // Bolsos y contenedores vacíos
  "Mochila",
  "Bolso o cartera",
  "Bananos o riñonera",
  "Estuche o cartuchera",
  "Bolsa reutilizable o de compras",

  // Vestimenta y accesorios personales
  "Ropa",
  "Polerón o chaqueta",
  "Calzado o zapatillas",
  "Gorro, jockey o sombrero",
  "Bufanda, cuello o guantes",
  "Cinturón",
  "Lentes de sol",
  "Accesorios para el cabello", // pinches, cintillos, colets

  // Vida universitaria y estudio
  "Útiles de estudio",
  "Libros o apuntes",
  "Carpeta o archivador",
  "Calculadora científica",
  "Materiales de arte o arquitectura", // reglas, tubos portaplanos, pinceles
  "Delantal o bata de laboratorio",
  "Gafas de seguridad o EPP",

  // Tecnología básica / accesorios
  "Tecnología",
  "Cargador o cable",
  "Adaptador o pendrive",
  "Audífonos (básicos o con cable)",
  "Funda o carcasa",
  "Mouse o teclado",

  // Alimentación e hidratación
  "Botella o termo",
  "Tupper o lonchera",
  "Taza o vaso térmico",
  "Cubiertos reutilizables",

  // Llaves y varios cotidianos
  "Llaves",
  "Llavero o lanyard",
  "Candado",
  "Paraguas",
  "Cosméticos o artículos de higiene", // bloqueador, bálsamo, alcohol gel
  "Libro recreativo o revista",

  // Deporte y recreación
  "Artículos deportivos",
  "Balón o pelota",
  "Mat de yoga o colchoneta",
  "Toalla deportiva",

  // Visitantes, familias y mascotas
  "Accesorios de mascota", // correas, arneses, bozales, juguetes de perro
  "Plato o botella para mascota",
  "Juguetes o artículos escolares", // peluches, láminas, materiales de excursión
  "Artículos de bebé", // mamaderas, chupetes, mantas, pañalera
  "Coche o silla de paseo",
  "Silla plegable o manta de picnic",

  // Comodín
  "Otros objetos",
];

const NOMBRE_ETIQUETAS_VALIOSAS = [
  // Tecnología de alto valor
  "Tecnología (de valor)", // notebooks, tablets, consolas portátiles
  "Teléfono celular",
  "Smartwatch o pulsera inteligente",
  "Audífonos (inalámbricos o de gama alta)",
  "Cámara fotográfica o lentes",
  "Disco duro externo",
  "E-reader (Kindle o similar)",

  // Joyería y relojería
  "Joya", // anillos, cadenas, pulseras, aros
  "Reloj",

  // Documentación e identidad
  "Credenciales", // TNE, pase escolar, credencial universitaria/funcionario
  "Documentos o identificación", // cédula de identidad, pasaporte, licencia
  "Tarjetas bancarias o de transporte", // débito, crédito, Bip!/tarjeta local
  "Certificados o documentos legales", // carpetas con trámites, recetas médicas

  // Bolsos con contenido crítico y dinero
  "Mochila (con cosas)",
  "Bolso o cartera (con cosas)",
  "Billetera o monedero",
  "Dinero en efectivo",
  "Chequera o vales",

  // Movilidad y transporte
  "Llaves de vehículo", // auto o moto (con chip/control)
  "Bicicleta",
  "Scooter eléctrico o monopatín",
  "Skate o longboard",
  "Casco o protecciones",

  // Salud y accesibilidad
  "Lentes ópticos",
  "Medicamentos o inhaladores",
  "Audífonos medicados o prótesis",
  "Bastón o artículo ortopédico",

  // Equipamiento especializado de alto costo
  "Instrumento musical",
  "Herramientas especializadas o testers",
  "Equipo de laboratorio o medición",
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