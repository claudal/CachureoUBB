/**
 * 
 * @param {import("@prisma/client").PrismaClient} prisma 
 */
export async function runClearSeed(prisma) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('No se puede ejecutar clear en producción.');
    }

    console.log('Limpiando datos de desarrollo...');
    try {
        await prisma.entrega.deleteMany();
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