import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker'; // datos de prueba

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando datos anteriores...');

  await prisma.alertaBusqueda.deleteMany();
  await prisma.persona.deleteMany();
  await prisma.estadoAlerta.deleteMany();
  await prisma.rolPersona.deleteMany();

  console.log('=> Creando estados de alerta');
  const nombresEstadoAlerta = ['Abierto', 'Cerrado', 'Rectificado'];
  const estadosAlerta = await Promise.all(
    nombresEstadoAlerta.map((nombre) =>
      prisma.estadoAlerta.create({
        data: {
          nombre
        },
      })
    )
  );

  console.log('=> Creando roles de personas');
  const nombresRolesPersonas = ['Encargado de Objetos', 'Usuario'];
  const rolesPersonas = await Promise.all(
    nombresRolesPersonas.map((nombre) =>
      prisma.rolPersona.create({
        data: {
          nombre
        },
      })
    )
  );

  console.log('--- Seed base completado :V ---');

  if(process.env.NODE_ENV !== 'development')
    return;

  console.log('=> Creando encargados');
  const rutEncargados = ["123456789", '999999999', '000000000']; //TODO: poner rut válidos de prueba
  const encargados = await Promise.all(
    rutEncargados.map((rut) =>
      prisma.persona.create({
        data: {
          rut,
          nombre: faker.person.fullName(),
          contrasena: "admin",
          id_rol: rolesPersonas[0].id
        },
      })
    )
  );

  console.log('=> Creando usuarios');
  const rutUsuarios = ["123456788", '999999998', '000000008']; //TODO: poner rut válidos de prueba
  const usuarios = await Promise.all(
    rutUsuarios.map((rut) =>
      prisma.persona.create({
        data: {
          rut,
          nombre: faker.person.fullName(),
          contrasena: "admin",
          id_rol: rolesPersonas[1].id
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
          id_estado: estadosAlerta[0].id
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