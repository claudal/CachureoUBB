# CachureoUBB

Sistema web para la gestión de objetos perdidos y alertas de búsqueda dentro de la Universidad del Bío-Bío.

La plataforma permite registrar objetos encontrados por las oficinas de objetos perdidos, publicar alertas de búsqueda realizadas por la comunidad universitaria, coordinar reuniones entre usuarios y encargados, y gestionar el proceso completo de recuperación de pertenencias.

Proyecto desarrollado para la asignatura de Ingeniería de Software de Ingeniería Civil en Informática de la Universidad del Bío-Bío.

## Funcionalidades

### Público

- Publicar alertas de búsqueda.
- Consultar objetos perdidos disponibles.
- Administrar alerta de búsqueda de objeto valioso propio.

### Encargado de oficina

- Administrar objetos perdidos guardados en una oficina.
- Atender alertas de búsqueda de objetos valiosos.
- Registrar entregas de objetos.

### Administrador

- Administrar encargados de oficina.
- Consultar reportes de alertas cerradas.
- Administrar oficinas de objetos perdidos y campus de la universidad.

## Tecnologías utilizadas

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT
- Zod
- Nodemailer
- Rut.js

### Frontend

- React 19
- React Router DOM 7
- React Hook Form
- Tailwind CSS 4
- shadcn/ui
- lucide-react
- Rut.js

### Infraestructura

- SMTP
- PostgreSQL

---

## Puesta de Producción en Marcha

### 1. Backend

1. Entre a la carpeta `backend` e instale las dependencias:
   ```bash
   cd backend
   npm install
   ```

2. Configure las variables de entorno creando un archivo `.env` a partir de `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Asegúrese de que las credenciales ingresadas sean válidas:
   ```env
   DATABASE_URL="postgresql://usuario_db:password_db@ip_db:puerto_db/nombre_db?schema=public" 
   PORT=3000 #puerto servidor backend

   #envío automático de correos
   SMTP_HOST=dominio-smtp
   SMTP_PORT=puerto-smtp
   SMTP_USER=tu-correo@dominio.com
   SMTP_PASS=tu-contrasena-de-aplicacion

   #Credenciales para administrar dentro de la APP (crea/actualiza automáticamente el administrador)  
   ADMIN_EMAIL=correo-administrador
   ADMIN_PASSWORD=contraseña-administrador #mínimo 6 carácteres

   #Enlace para la recuperación de contraseñas desde el frontend
   PASSWORD_RESET_URL="<dominio>/restablecerClave"

   #   production      Modo producción (seed de prisma solo crea los regístros necesarios)
   #   development     Modo desarrollo (seed de prisma también crea datos de prueba)
   NODE_ENV=production

   JWT_SECRET=<codigo secreto>
   ```

3. Genere el cliente de Prisma y aplique las migraciones para crear las tablas en PostgreSQL:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

4. Genere los datos esenciales para la ejecución de la APP y el usuario administrador por defecto a partir de las credenciales ingresadas en .env
   ```bash
   npm db:seed:prod
   ```

5. Inicie el servidor backend en modo producción
   a. Localmente
      ```bash
      npm run start
      ```
      La API estará activa en `http://localhost:3000`.
   b. En un servidor (requiere la librería PM2 en el sistema)
      ```bash
      pm2 start index.js --name backend
      pm2 save
      ```
      La API estará activa en `http://ip_servidor:<tu_puerto_externo_backend(80)>`.

---

### 2. Frontend


1. En una nueva terminal, entre a la carpeta `frontend` e instale las dependencias:
   ```bash
   cd frontend
   npm install
   ```

2. Configure las variables de entorno creando un archivo `.env` a partir de `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Asegúrese de que los enlaces sean correctos:
   ```env
   VITE_API_URL=<url>/api #enlace a la API del backend
   VITE_IMAGE_URL=<url>/imagen #enlace de donde el frontend cargará las imágenes del backend
   ```

3. Compile la página web e inicie el servidor frontend en modo producción
   ```bash
   npm run build
   ```
   a. Localmente
      ```bash
      npm run preview
      ```
      La página web estará activa en `http://localhost:4173`.
   b. En un servidor (requiere la librería PM2 en el sistema)
      ```bash
      pm2 start npm --name frontend -- run preview
      pm2 save
      ```
      La página web estará activa en `http://ip_servidor:<tu_puerto_externo_frontend(443)>`.

---

## Estructura del Proyecto

```text
CachureoUBB/
├── backend/
│   ├── prisma/
│   │   ├── migrations/                      # Historial de migraciones SQL
│   │   ├── seeders/                         # Generadores de datos para seed.js
│   │   ├── schema.prisma                    # Modelos de base de datos (User y Task)
│   │   └── seed.js                          # Semilla que orquesta la generación de datos en la base
│   ├── src/
│   │   ├── config/                          # Configuraciones del programa (Cliente Prisma, carga de imágenes, envío de correos, etc.)
│   │   ├── controllers/                     # Controladores de los endpoints (alertas, entregas, objetos, autenticación, etc.)
│   │   ├── middlewares/                     # Ejecuciones previas compartidas entre varios endpoints (autenticación, verificación de valores, etc.)
│   │   ├── routes/                          # Rutas de los endpoints
│   │   │   ├── administrador.routes.js      # Endpoint de administradores (/administrador)
│   │   │   ├── alertaBusqueda.routes.js     # Endpoint de alertas de búsqueda (/alertasBusqueda)
│   │   │   ├── autenticacion.routes.js      # Endpoint de autenticación y manejo de sesión (/autenticacion)
│   │   │   ├── campus.routes.js             # Endpoint de los campus de la universidad (/campus)
│   │   │   ├── encargadoOficina.routes.js   # Endpoint de los encargados de oficinas de objetos perdidos (/encargadoOficina)
│   │   │   ├── etiquetaObjeto.routes.js     # Endpoint de etiquetas de objetos (/etiquetaObjeto)
│   │   │   ├── index.routes.js              # Enrutador principal (/api)
│   │   │   └── objetoPerdido.routes.js      # Endpoint de objetos perdidos (/objetoPerdido)
│   │   ├── schemas/                         # Esquemas Zod del backend
│   │   ├── services/                        # Lógica de negocio, consultas con Prisma y envío de correos
│   │   ├── templates/                       # Plantillas HTML para los correos automatizados
│   │   └── utils/                           # Herramientas sencillas (manejo de rango de fechas, formateo de rut, etc.)
│   ├── uploads/                             # Contenedor de imágenes que se mostrarán en frontend
│   ├── .env.example
│   ├── .gitignore
│   ├── index.js                             # Entrada principal de Express
│   ├── package-lock.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── config.js                    # Configuración de los enlaces a la api y carga de imágenes
│   │   ├── components/                      # Componentes que se reutilizan en varias páginas
│   │   │   └── ui/                          # Componentes de interfaz que se reutilizan en varias páginas y otros componentes
│   │   ├── context/                         # AuthContext (sesión persistente con JWT)
│   │   ├── hooks/                           # Herramientas que persisten entre renderizados
│   │   ├── lib/
│   │   │   └── utils.ts                     # Configuración para componentes UI de shadcn/ui
│   │   ├── pages/                           # Páginas de la página web
│   │   ├── schemas/                         # Esquemas Zod para formularios
│   │   ├── services/                        # Conexiones a la api
│   │   ├── utils/                           # Herramientas sencillas (formateo de carga de imágenes y formateo de rut)
│   │   ├── App.jsx                          # Enrutador principal (React Router DOM)
│   │   ├── index.css                        # Configuración de Tailwind CSS
│   │   └── main.jsx                         # Punto de entrada de React
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## Endpoints de la API (`/api`)

### Administración (`/api/administrador`)

| Método | Endpoint | Acceso | Descripción |
|----------|----------|----------|----------|
| `GET` | `/api/administrador/contacto` | Público | Obtener la información de contacto de la administración (correo electrónico administrador). |
| `GET` | `/api/administrador/alertasCerradas` | Administrador | Obtener el historial de alertas de búsqueda cerradas por sus creadores, incluyendo el motivo de cierre. |

---

### Alertas de Búsqueda (`/api/alertasBusqueda`)

#### Gestión de alertas

| Método | Endpoint | Acceso | Descripción |
|----------|----------|----------|----------|
| `POST` | `/api/alertasBusqueda` | Público | Crear una nueva alerta de búsqueda, incluyendo fotografías del objeto perdido. |
| `GET` | `/api/alertasBusqueda` | Encargado | Listar alertas de búsqueda según los filtros especificados. |
| `GET` | `/api/alertasBusqueda/avisosCierre` | Encargado | Obtener las notificaciones de solicitudes de cierre pendientes de revisión. |
| `GET` | `/api/alertasBusqueda/:id` | Público | Obtener el detalle de una alerta de búsqueda activa. |
| `PUT` | `/api/alertasBusqueda/:id` | Público | Actualizar la información de una alerta de búsqueda existente. |
| `DELETE` | `/api/alertasBusqueda/:id` | Público | Solicitar el cierre de una alerta de búsqueda indicando el motivo correspondiente. |

#### Marcadores

| Método | Endpoint | Acceso | Descripción |
|----------|----------|----------|----------|
| `POST` | `/api/alertasBusqueda/:id/marcadores` | Encargado | Marcar una alerta como destacada o relevante para seguimiento. |
| `DELETE` | `/api/alertasBusqueda/:id/marcadores` | Encargado | Eliminar el marcador asociado a una alerta. |

#### Avisos de cierre

| Método | Endpoint | Acceso | Descripción |
|----------|----------|----------|----------|
| `DELETE` | `/api/alertasBusqueda/:id/avisoCierre` | Encargado | Marcar como revisado o eliminar el aviso de cierre asociado a una alerta. |

#### Lecturas

| Método | Endpoint | Acceso | Descripción |
|----------|----------|----------|----------|
| `POST` | `/api/alertasBusqueda/:id/lecturas` | Encargado | Registrar la lectura o revisión de una alerta de búsqueda. |

#### Solicitudes de detalles

| Método | Endpoint | Acceso | Descripción |
|----------|----------|----------|----------|
| `POST` | `/api/alertasBusqueda/:id/solicitudesDetalles` | Encargado | Solicitar información adicional sobre una alerta de búsqueda. |
| `GET` | `/api/alertasBusqueda/:id/solicitudesDetalles/novedad` | Público | Consultar si existen novedades relacionadas con solicitudes de detalles de la alerta. |

#### Reuniones

| Método | Endpoint | Acceso | Descripción |
|----------|----------|----------|----------|
| `POST` | `/api/alertasBusqueda/:id/reuniones` | Encargado | Registrar una reunión asociada a una alerta de búsqueda. |

---

### Autenticación (`/api/autenticacion`)

| Método | Endpoint | Acceso | Descripción |
|----------|----------|----------|----------|
| `POST` | `/api/autenticacion/login/encargadoOficina` | Público | Iniciar sesión como encargado de oficina y obtener credenciales de acceso. |
| `POST` | `/api/autenticacion/login/administrador` | Público | Iniciar sesión como administrador y obtener credenciales de acceso. |
| `POST` | `/api/autenticacion/restablecerClave` | Público | Restablecer la contraseña de un usuario. |
| `GET` | `/api/autenticacion/perfil` | Autenticado | Obtener el perfil del usuario autenticado. |

---

### Campus (`/api/campus`)

| Método | Endpoint | Acceso | Descripción |
|----------|----------|----------|----------|
| `GET` | `/api/campus` | Público | Obtener la lista de campus disponibles. |
| `GET` | `/api/campus/:id/oficinas` | Administrador | Obtener las oficinas asociadas a un campus específico. |

---

### Encargados de Oficina (`/api/encargadoOficina`)

| Método | Endpoint | Acceso | Descripción |
|----------|----------|----------|----------|
| `GET` | `/api/encargadoOficina` | Administrador | Listar encargados de oficina aplicando filtros de búsqueda. |
| `POST` | `/api/encargadoOficina` | Administrador | Crear un nuevo encargado de oficina. |
| `POST` | `/api/encargadoOficina/:rut/reenviarCorreoCreacion` | Administrador | Reenviar el correo de creación de cuenta a un encargado. |
| `POST` | `/api/encargadoOficina/:rut/enviarCorreoRestablecimientoClave` | Público | Enviar un correo para restablecimiento de contraseña a un encargado. |

---

### Etiquetas de Objetos (`/api/etiquetaObjeto`)

| Método | Endpoint | Acceso | Descripción |
|----------|----------|----------|----------|
| `GET` | `/api/etiquetaObjeto` | Público | Obtener el catálogo de etiquetas de objetos disponibles, con posibilidad de aplicar filtros. |

---

### Objetos Perdidos (`/api/objetoPerdido`)

#### Gestión de objetos perdidos

| Método | Endpoint | Acceso | Descripción |
|----------|----------|----------|----------|
| `POST` | `/api/objetoPerdido` | Encargado | Registrar un nuevo objeto perdido encontrado en una oficina, incluyendo fotografías. |
| `GET` | `/api/objetoPerdido/publico` | Público | Consultar los objetos perdidos disponibles para visualización pública. |
| `GET` | `/api/objetoPerdido/oficina` | Encargado | Obtener los objetos perdidos registrados en la oficina del usuario autenticado. |
| `GET` | `/api/objetoPerdido/:id` | Encargado | Obtener el detalle de un objeto perdido específico. |
| `PUT` | `/api/objetoPerdido/:id` | Encargado | Actualizar la información de un objeto perdido. |
| `DELETE` | `/api/objetoPerdido/:id` | Encargado | Eliminar un registro de objeto perdido. |

#### Entregas

| Método | Endpoint | Acceso | Descripción |
|----------|----------|----------|----------|
| `POST` | `/api/objetoPerdido/:id/entrega` | Encargado | Registrar la entrega de un objeto perdido a su propietario, incluyendo evidencia fotográfica de la entrega. |

---

### Roles de acceso utilizados

| Rol | Descripción |
|------|-------------|
| Público | No requiere autenticación. |
| Autenticado | Requiere autenticación (encargado o administrador). |
| Encargado | Requiere autenticación como encargado de oficina. |
| Administrador | Requiere autenticación como administrador del sistema. |

---

## Modo de desarrollo

### 1. Backend

1. Realice los pasos 1 y 2 para la puesta en marcha de producción en el backend

2. Cambie el entorno de node (.env) al modo desarrollo
   ```env
   NODE_ENV=development
   ```

3. Genere el cliente de Prisma y aplique las migraciones en modo desarrollo
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

4. Genere los datos de prueba
   ```bash
   npm db:seed:dev
   ```

5. Inicie el servidor backend en modo desarrollo
   ```bash
   npm run dev
   ```

### 2. Frontend
1. Realice los pasos 1 y 2 para la puesta en marcha de producción en el frontend

2. Inicie el servidor frontend en modo desarrollo
   ```bash
   npm run dev
   ```

---

## Autores

Desarrollado por estudiantes de Ingeniería Civil en Informática de la Universidad del Bío-Bío.

### Integrantes

- Claudio Gaete Flores
- Juan Loyola Lagos