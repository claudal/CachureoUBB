import { PrismaClient } from '@prisma/client';
import { fa, faker } from '@faker-js/faker'; // datos de prueba
import * as rutjs from "rut.js";
import { hashSync } from "bcrypt"; // crear contraseñas de prueba
import { BCRYPT_SALT_ROUNDS } from '../src/config/auth.js';

const prisma = new PrismaClient();

async function main() {

  if(process.env.NODE_ENV !== 'development')
    return;

  try {
    await prisma.foto.deleteMany();
    await prisma.etiquetaObjeto.deleteMany();
    await prisma.objetoPerdido.deleteMany();
    await prisma.alertaBusqueda.deleteMany();
    await prisma.encargadoOficina.deleteMany();
    await prisma.oficina.deleteMany();
    await prisma.campus.deleteMany();
  } catch (err){}

  console.log('=> Creando etiquetas de objeto');
  const nombreEtiquetasNormales = [
    "Mochila vacía",
    "Ropa",
    "Estuche",
    "Útiles de estudio",
    "Tecnología",
    "Calculadora",
    "Audífonos"
  ];
  const etiquetasNormales = await Promise.all(
    nombreEtiquetasNormales.map((nombre) =>
      prisma.etiquetaObjeto.create({
        data: {
          nombre,
          valioso: false
        }
      })
    )
  );

  
  const nombreEtiquetasValiosos = [
    "Tecnología (valiosa)",
    "Joya",
    "Credenciales",
    "Mochila (con cosas)",
    "Teléfono",
    "Tablet",
    "Laptop"
  ];
  const etiquetasValiosos = await Promise.all(
    nombreEtiquetasValiosos.map((nombre) =>
      prisma.etiquetaObjeto.create({
        data: {
          nombre,
          valioso: true
        }
      })
    )
  );

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
          idCampus: campu.id
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
        etiquetas = faker.helpers.arrayElements(etiquetasValiosos,{min:1,max:3})
      } else {
        valioso = false
        etiquetas = faker.helpers.arrayElements(etiquetasNormales,{min:1,max:3})
      }
      objetos.push(await prisma.objetoPerdido.create({
        data: {
          idOficina: oficina.id,
          idEstado: estadosOjeto.sinEntrega.id,
          nombre: faker.lorem.sentence({min:1,max:4}),
          descripcion: faker.lorem.paragraphs({min:2,max:15}),
          esValioso: valioso,
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

  await prisma.estadoAlerta.deleteMany();

  console.log('=> Creando estados de alerta');
  const estadosAlerta = {
    abierto: await prisma.estadoAlerta.create({
        data: {
          id: 1,
          nombre: "Abierto"
        },
      }),
    cerrado: await prisma.estadoAlerta.create({
        data: {
          id: 2,
          nombre: "Cerrado"
        },
      }),
    rectificado: await prisma.estadoAlerta.create({
        data: {
          id: 3,
          nombre: "Rectificado"
        },
      })
  }

  console.log('=> Creando alertas de búsqueda abiertas');
  for(let i = 0;i<30;++i){
    const alerta = await prisma.alertaBusqueda.create({
      data: {
        idEstado: estadosAlerta.abierto.id,
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
    const listaEtiquetas = faker.helpers.arrayElements(etiquetasValiosos,{min:1,max:3});
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