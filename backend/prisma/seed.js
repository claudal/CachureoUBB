import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker'; // datos de prueba
import * as rutjs from "rut.js";
import { hashSync } from "bcrypt"; // crear contraseñas de prueba
import { BCRYPT_SALT_ROUNDS } from '../src/config/auth.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando datos anteriores...');

  await prisma.alertaBusqueda.deleteMany();
  await prisma.persona.deleteMany();
  await prisma.estadoAlerta.deleteMany();
  await prisma.rolPersona.deleteMany();

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

  console.log('=> Creando roles de personas');
  const rolesPersonas = {
    usuario: await prisma.rolPersona.create({
        data: {
          id: 1,
          nombre: "Usuario"
        },
      }),
    encargado: await prisma.rolPersona.create({
        data: {
          id: 2,
          nombre: "Encargado de objetos"
        },
      })
  }

  console.log('--- Seed base completado :V ---');

  if(process.env.NODE_ENV !== 'development')
    return;

  const contrasena = "123456";

  console.log('=> Creando encargados');
  const rutEncargados = ['20000000', '20000001', '20000002']; // sin código verificador 
  const encargados = await Promise.all(
    rutEncargados.map((rut) =>
      prisma.persona.create({
        data: {
          rut: rut.concat(rutjs.getCheckDigit(rut)),
          nombre: faker.person.fullName(),
          contrasena: hashSync(contrasena,BCRYPT_SALT_ROUNDS),
          id_rol: rolesPersonas.encargado.id
        },
      })
    )
  );

  console.log('=> Creando usuarios');
  const rutUsuarios = ['21000000', '21000001', '21000002', '21000003', '21000004', '21000005', '21000006', '21000007', '21000008']; //TODO: poner rut válidos de prueba
  const usuarios = await Promise.all(
    rutUsuarios.map((rut) =>
      prisma.persona.create({
        data: {
          rut: rut.concat(rutjs.getCheckDigit(rut)),
          nombre: faker.person.fullName(),
          contrasena: hashSync(contrasena,BCRYPT_SALT_ROUNDS),
          id_rol: rolesPersonas.usuario.id
        },
      })
    )
  );

  console.log('=> Creando solicitudes abiertas...');
  for (const usuario of usuarios) {
    const cantidadAlertasAbiertas = faker.number.int({ min: 0, max: 3 });
    for (let i = 0; i < cantidadAlertasAbiertas; i++) {
      await prisma.alertaBusqueda.create({
        data: {
          rut_autor: usuario.rut,
          fecha_creacion: faker.date.recent({days:{min:0,max:255}}),
          descripcion: faker.lorem.sentences(2),
          id_estado: estadosAlerta.abierto.id
        },
      });
    }
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