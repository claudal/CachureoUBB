import { PrismaClient } from '@prisma/client';
import { fa, faker } from '@faker-js/faker'; // datos de prueba
import * as rutjs from "rut.js";
import { hashSync } from "bcrypt"; // crear contraseñas de prueba
import { BCRYPT_SALT_ROUNDS } from '../src/config/auth.js';

const prisma = new PrismaClient();

const ESTADOS_OBJETO = [
  { id: 1, nombre: "Sin entrega" },
  { id: 2, nombre: "Entregado" },
  { id: 3, nombre: "Caducado" },
  { id: 4, nombre: "Derivado" }
];

const ESTADOS_ALERTA = [
  { id: 1, nombre: "Abierto" },
  { id: 2, nombre: "Cerrado" },
  { id: 3, nombre: "Rectificado" }
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
  "Tecnología (valiosa)",
  "Joya",
  "Credenciales",
  "Mochila (con cosas)",
  "Teléfono",
  "Tablet",
  "Laptop"
];

/**
 * Crea (o actualiza) los registros que el sistema necesita para funcionar.
 * Se ejecuta en cualquier entorno y se puede correr varias veces sin duplicar datos.
 */
async function crearCatalogos() {
  console.log('=> Creando estados de objeto');
  const estadosObjeto = await Promise.all(
    ESTADOS_OBJETO.map(({ id, nombre }) =>
      prisma.estadoObjeto.upsert({ where: { id }, update: { nombre }, create: { id, nombre } })
    )
  );

  console.log('=> Creando estados de alerta');
  const estadosAlerta = await Promise.all(
    ESTADOS_ALERTA.map(({ id, nombre }) =>
      prisma.estadoAlerta.upsert({ where: { id }, update: { nombre }, create: { id, nombre } })
    )
  );

  console.log('=> Creando etiquetas de objeto');
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

  return { estadosObjeto, estadosAlerta, etiquetasNormales, etiquetasValiosas };
}

async function limpiarDatosPrueba() {
  // el orden importa: primero lo que depende de otras tablas
  try {
    await prisma.administrador.deleteMany();
    await prisma.objetoPerdido.deleteMany();
    await prisma.foto.deleteMany();
    await prisma.alertaBusqueda.deleteMany();
    await prisma.etiquetaObjeto.deleteMany();
    await prisma.encargadoOficina.deleteMany();
    await prisma.oficina.deleteMany();
    await prisma.campus.deleteMany();
  } catch (err){
    console.warn('=> No se pudieron borrar todos los datos anteriores:', err.message);
  }
}

async function main() {
  const esDesarrollo = process.env.NODE_ENV === 'development';

  if(!esDesarrollo)
    return;

  if(esDesarrollo)
    await limpiarDatosPrueba();

  const { estadosAlerta, etiquetasValiosas, etiquetasNormales } = await crearCatalogos();

  console.log('=> Creando administrador')
  const administrador = await prisma.administrador.create({
    data: {
      correo: "cachureoubb@gmail.com",
      clave: hashSync("123456",BCRYPT_SALT_ROUNDS)
    }
  });

  console.log('=> Creando fotos');
  const nombreFotos = [
    "test0.jpg",
    "test1.jpg",
    "test2.jpg",
    "test3.jpg"
  ];
  const fotos = await Promise.all(
    nombreFotos.map((nombre) =>
      prisma.foto.create({
        data: {
          url: nombre
        }
      })
    )
  );

  console.log('=> Creando campus');
  const nombreCampus = ['Concepción', 'La Castilla', 'Fernando May'];
  const campus = await Promise.all(
    nombreCampus.map((nombre) =>
      prisma.campus.create({
        data: {
          nombre,
          direccion: faker.location.direction()
        },
      })
    )
  );

  const oficinas = [];
  for(let campu of campus){
    for(let i = 0;i<10;++i){
      oficinas.push(await prisma.oficina.create({
        data:{
          nombre: faker.book.title(),
          descripcion: faker.lorem.sentence(),
          idCampus: campu.id,
          fotos: {createMany: {data: faker.helpers.arrayElements(fotos,{min: 1, max: 3}).map((foto)=> ({idFoto: foto.id}))}}
        }
      }))
    }
  }

  await prisma.estadoObjeto.deleteMany();
  
  const estadosOjeto = {
    sinEntrega: await prisma.estadoObjeto.create({
        data: {
          id: 1,
          nombre: "Sin entrega"
        },
      })
  }

  console.log('=> Creando objetos perdidos');
  const objetos = []
  for(let oficina of oficinas){
    for(let i = 0;i<10;++i){
      let valioso;
      let etiquetas;
      if(Math.random() < 0.5){
        valioso = true;
        etiquetas = faker.helpers.arrayElements(etiquetasValiosas,{min:1,max:3})
      } else {
        valioso = false
        etiquetas = faker.helpers.arrayElements(etiquetasNormales,{min:1,max:3})
      }
      objetos.push(await prisma.objetoPerdido.create({
        data: {
          idOficina: oficina.id,
          idEstado: estadosOjeto.sinEntrega.id,
          nombre: faker.lorem.sentence({min:1,max:4}),
          descripcion: faker.lorem.words({min:5,max:55}),
          valioso: valioso,
          etiquetas: {createMany: {data: etiquetas.map((etiqueta)=> ({idEtiqueta: etiqueta.id}))}},
          fotos: {createMany: {data: faker.helpers.arrayElements(fotos,{min: 1, max: 3}).map((foto)=> ({idFoto: foto.id}))}}
        }
      }))
    }
  }

  const clave = "123456";

  console.log('=> Creando encargados');
  const rutEncargados = ['20000000', '20000001', '20000002']; // sin código verificador
  const encargados = await Promise.all(
    rutEncargados.map((rut) =>
      prisma.encargadoOficina.create({
        data: {
          rut: rut.concat(rutjs.getCheckDigit(rut)),
          correoContacto: faker.internet.email(),
          nombre: faker.person.fullName(),
          clave: hashSync(clave,BCRYPT_SALT_ROUNDS),
          idOficina: faker.helpers.arrayElement(oficinas).id
        }
      })
    )
  );

  const estadoAlertaAbierto = estadosAlerta.find((estado) => estado.nombre === "Abierto");

  console.log('=> Creando alertas de búsqueda abiertas');
  for(let i = 0;i<30;++i){
    const alerta = await prisma.alertaBusqueda.create({
      data: {
        idEstado: estadoAlertaAbierto.id,
        idCampus: faker.helpers.arrayElement(campus).id,
        nombre: faker.lorem.sentence({min:1,max:4}),
        descripcion: faker.lorem.paragraphs({min:2,max:15})
      }
    })
    const listaFotos = faker.helpers.arrayElements(fotos,{min:1,max:3});
    for(const foto of listaFotos) await prisma.fotoAlerta.create({
      data: {
        idAlerta: alerta.id,
        idFoto: foto.id
      }
    })
    const listaEtiquetas = faker.helpers.arrayElements(etiquetasValiosas,{min:1,max:3});
    for(const etiqueta of listaEtiquetas) await prisma.alertaTieneEtiqueta.create({
      data:{
        idEtiqueta: etiqueta.id,
        idAlerta: alerta.id
      }
    })
  }

  console.log('--- Seed de prueba completado :V ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
