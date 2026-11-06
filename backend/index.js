import 'dotenv/config';
import express from 'express';
import { router } from './src/routes/index.routes.js';
import { prisma } from './src/config/prisma.js';
import { errorHandler, notFoundHandler } from './src/middlewares/error.middleware.js';

import cors from 'cors';

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use('/imagen', express.static('./uploads'));

app.use(notFoundHandler);

app.use(errorHandler);

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('=> Conexión a PostgreSQL establecida');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('=> Error al iniciar el servidor o conectar a PostgreSQL:', error);
    process.exit(1);
  }
}

bootstrap();