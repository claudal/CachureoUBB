import { hashSync } from "bcrypt";
import { BCRYPT_SALT_ROUNDS } from "../../src/config/auth.js";
import * as rutjs from "rut.js";
import { faker } from "@faker-js/faker";

/**
 * 
 * @param {import("@prisma/client").PrismaClient} prisma 
 */
export async function runDevSeed(prisma,{ estadosAlerta, etiquetasValiosas, etiquetasNormales }) {
    console.log('Generando datos de prueba...');

    
    console.log('\t- Creando fotos');
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

    console.log('\t- Creando campus');
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

    console.log('\t- Creando oficinas');
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

    console.log('\t- Creando objetos perdidos');
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

    console.log('\t- Creando encargados');
    const rutEncargados = ['20000000', '20000001', '20000002']; // sin código verificador
    const encargados = await Promise.all(
        rutEncargados.map((rut) =>
        prisma.encargadoOficina.create({
            data: {
            rut: rut.concat(rutjs.getCheckDigit(rut)),
            correoContacto: faker.internet.email(),
            nombre: faker.person.fullName(),
            clave: hashSync(clave,BCRYPT_SALT_ROUNDS),
            idOficina: faker.helpers.arrayElement(oficinas).id,
            idEstado: 1
            }
        })
        )
    );

    const estadoAlertaAbierto = estadosAlerta.find((estado) => estado.nombre === "Abierto");

    console.log('\t- Creando alertas de búsqueda abiertas');
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