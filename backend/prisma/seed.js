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
    await prisma.etiquetaObjeto.deleteMany();
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
        descripcion: faker.lorem.paragraph()
      }
    })
    let idEtiqueta = faker.helpers.arrayElement(etiquetasValiosos).id
    await prisma.alertaTieneEtiqueta.create({
      data:{
        idEtiqueta: idEtiqueta,
        idAlerta: alerta.id
      }
    })
    let idEtiqueta2 = faker.helpers.arrayElement(etiquetasValiosos).id
    if(Math.random() < 0.7 && idEtiqueta2 !== idEtiqueta) await prisma.alertaTieneEtiqueta.create({
      data:{
        idEtiqueta: idEtiqueta2,
        idAlerta: alerta.id
      }
    })
    let idEtiqueta3 = faker.helpers.arrayElement(etiquetasValiosos).id
    if(Math.random() < 0.5 && idEtiqueta3 !== idEtiqueta2 && idEtiqueta3 !== idEtiqueta) await  prisma.alertaTieneEtiqueta.create({
      data:{
        idEtiqueta: idEtiqueta3,
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