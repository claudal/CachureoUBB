import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker'; // datos de prueba
import * as rutjs from "rut.js";
import { hashSync } from "bcrypt"; // crear contraseñas de prueba
import { BCRYPT_SALT_ROUNDS } from '../src/config/auth.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando datos anteriores...');

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

  console.log('--- Seed base completado :V ---');

  if(process.env.NODE_ENV !== 'development')
    return;

  await prisma.encargadoOficina.deleteMany();
  await prisma.oficina.deleteMany();
  await prisma.campus.deleteMany();

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