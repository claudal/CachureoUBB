import { PrismaClient } from '@prisma/client';
import { runSetupSeed } from './seeders/setup.seeder.js';
import { runClearSeed } from './seeders/clear.seeder.js';
import { runDevSeed } from './seeders/dev.seeder.js';

const prisma = new PrismaClient();

async function main() {

  const args = process.argv.slice(2);
  // ejecución setup
  const data = await runSetupSeed(prisma);

  if(process.env.NODE_ENV !== 'development')
    return;

  if(args.includes('--clean'))
    await runClearSeed(prisma);

  if(args.includes('--dev'))
    await runDevSeed(prisma,data);

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
