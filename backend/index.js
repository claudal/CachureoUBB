import 'dotenv/config';
import express from 'express';
import { router } from './src/routes/index.routes.js';


const PORT = process.env.PORT;
const app = express();

app.use(express.json());

app.use("/api",router);

app.listen(PORT, ()=> {
    console.log(`Servidor corriendo en ${PORT}`);
})