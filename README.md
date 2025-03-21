A continuación se muestra un **README actualizado y detallado** para el proyecto, que refleja la arquitectura, el estado actual del desarrollo y las principales funcionalidades implementadas. Puedes copiar y pegar este texto en tu archivo `README.md` en la raíz del repositorio a 21_03_2025

---

# Formacion QAlimentaria

Este proyecto consiste en una **plataforma de formación en seguridad alimentaria** desarrollada para la empresa *QAlimentaria*. Consta de un **backend** hecho con Node.js, Express y MongoDB (Mongoose), y un **frontend** creado en React con TailwindCSS. El objetivo principal es brindar a los usuarios (trabajadores de las empresas auditadas) un acceso seguro y estructurado a módulos de formación, así como mantener un registro de su progreso en cada curso.

---

## 1. Características Principales

1. **Registro y autenticación de usuarios**  
   - Utiliza JWT para manejo de tokens.  
   - Encripta contraseñas con `bcrypt`.
   - Almacena usuarios en MongoDB Atlas.

2. **Gestión de roles (admin, user)**  
   - Usuarios con rol `admin` pueden crear y, próximamente, editar/eliminar módulos.  
   - Los usuarios con rol `user` (por defecto) pueden visualizar módulos y registrar su progreso.

3. **Creación y visualización de módulos de formación**  
   - Los módulos se guardan en la colección `Module` (campos: `title`, `description`, `content`, `order`, etc.).  
   - El frontend los muestra en tarjetas y permite “entrar” al contenido del módulo.

4. **Registro de progreso**  
   - Cada usuario registra la finalización de un módulo en la colección `Progress`, junto con la fecha de completado.
   - Una vista de “Progreso” permite a cada usuario ver qué módulos ha completado.

5. **Frontend con React + TailwindCSS**  
   - Diseño responsivo y sencillo de mantener.  
   - Manejo de rutas con React Router (Home, Login, Register, Modules, Progreso, etc.).

---

## 2. Requisitos y Tecnologías

### 2.1 Requisitos

- **Node.js** (>= 14.x)
- **npm** o **yarn**
- **MongoDB Atlas** (o una instancia local de MongoDB)
- **Configuración de variables de entorno** (archivo `.env` en el backend y/o frontend)

### 2.2 Tecnologías Empleadas

- **Backend**: Node.js, Express, Mongoose, JWT, bcrypt
- **Frontend**: React (Create React App), TailwindCSS, React Router, Context API
- **Base de Datos**: MongoDB (conexión preferente a MongoDB Atlas)

---

## 3. Estructura de Archivos

```bash
Formacion_qalimentaria/
│  README.md               # (Este archivo)
│  package.json            # Dependencias y scripts del proyecto raíz (si los hubiera)
│  ...
│
├─ backend/
│  ├─ models/
│  │  ├─ User.js           # Esquema de usuario (nombre, apellidos, email, password, role, etc.)
│  │  ├─ Module.js         # Esquema de módulo de formación
│  │  └─ Progress.js       # Esquema para registrar progreso de usuario
│  ├─ index.js             # Config principal de Express, conexión a MongoDB, rutas
│  ├─ package.json         # Dependencias y scripts específicos del backend
│  └─ ...
│
└─ frontend/
   ├─ public/              # Archivos públicos (index.html, favicon, etc.)
   ├─ src/
   │  ├─ pages/            # Páginas principales de la app (Login, Register, ModulesView, etc.)
   │  ├─ components/       # Componentes reutilizables (Navegación, tarjetas, etc.)
   │  ├─ context/          # Context API (ej. AuthContext para autenticación)
   │  ├─ hooks/            # Hooks personalizados (p.ej. useIdleTimer)
   │  ├─ assets/           # Imágenes, logos
   │  └─ ...
   ├─ tailwind.config.js   # Config de Tailwind
   ├─ package.json         # Dependencias y scripts específicos del frontend
   └─ ...
```

---

## 4. Instalación y Configuración

### 4.1 Clonar el Repositorio

```bash
git clone https://github.com/usuario/Formacion_qalimentaria.git
cd Formacion_qalimentaria
```

### 4.2 Backend

1. **Entrar en la carpeta `backend`**:
   ```bash
   cd backend
   ```
2. **Instalar dependencias**:
   ```bash
   npm install
   ```
3. **Configurar variables de entorno** en un archivo `.env`:
   ```bash
   # Ejemplo de .env
   MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/miBaseDatos
   JWT_SECRET=miSuperSecreto
   PORT=5000  # Puerto donde correrá el servidor
   ```
4. **Iniciar el servidor**:
   ```bash
   npm start
   ```
   Por defecto, se levantará en `http://localhost:5000/` (o el puerto que hayas indicado).

### 4.3 Frontend

1. **Entrar en la carpeta `frontend`**:
   ```bash
   cd ../frontend
   ```
2. **Instalar dependencias**:
   ```bash
   npm install
   ```
3. **Configurar variables de entorno** (opcional) en un archivo `.env`, por ejemplo:
   ```bash
   REACT_APP_API_URL=http://localhost:5000
   ```
   Esto permite referirte a la URL del backend desde tu código React, usando `process.env.REACT_APP_API_URL`.
4. **Iniciar la aplicación React**:
   ```bash
   npm start
   ```
   Se abrirá en `http://localhost:3000/` (por defecto).

---

## 5. Modelos y Estructura de Datos

### 5.1 User

```js
{
  name: String,
  firstSurname: String,
  secondSurname: String,
  dni: String,
  email: { type: String, unique: true },
  password: String,             // Encriptada con bcrypt
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}
```

### 5.2 Module

```js
{
  title: String,
  description: String,
  content: String,   // Texto o HTML, dependiendo de cómo se quiera renderizar
  order: Number
}
```

### 5.3 Progress

```js
{
  userEmail: { type: String, ref: 'User' },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  dateCompleted: Date
}
```

---

## 6. Principales Endpoints de la API (Backend)

> **Nota**: Se asume que la URL base es `http://localhost:5000` en desarrollo.

### 6.1 Autenticación y Usuarios

- **POST** `/register`  
  Registra un nuevo usuario.  
  **Body** (JSON):  
  ```json
  {
    "name": "Juan",
    "firstSurname": "Pérez",
    "secondSurname": "García",
    "dni": "12345678X",
    "email": "juan@example.com",
    "password": "miPass123",
    "role": "admin"     // Opcional, por defecto "user"
  }
  ```
- **POST** `/login`  
  Inicia sesión y devuelve un token JWT.  
  **Body** (JSON):
  ```json
  {
    "email": "juan@example.com",
    "password": "miPass123"
  }
  ```
  **Respuesta**:
  ```json
  {
    "token": "xxxxx.yyyyy.zzzzz"
  }
  ```

### 6.2 Módulos de Formación

- **GET** `/modules`  
  Devuelve la lista de módulos disponibles (ordenados por `order`).  
  **Cabecera**: `Authorization: Bearer <token>`

- **POST** `/modules` *(solo admin)*  
  Crea un nuevo módulo en la base de datos.  
  **Cabecera**: `Authorization: Bearer <token>` (debe ser admin)  
  **Body** (JSON):
  ```json
  {
    "title": "Título Módulo",
    "description": "Breve descripción",
    "content": "<p>Contenido extenso en HTML</p>",
    "order": 1
  }
  ```

- *(Opcional a implementar)* **PUT** `/modules/:id`  
  Edita un módulo existente *(requiere admin)*.

- *(Opcional a implementar)* **DELETE** `/modules/:id`  
  Elimina un módulo *(requiere admin)*.

### 6.3 Progreso

- **POST** `/progress`  
  Registra la finalización de un módulo por parte del usuario autenticado.  
  **Cabecera**: `Authorization: Bearer <token>`  
  **Body** (JSON):
  ```json
  {
    "moduleId": "604b2f..."
  }
  ```
  La API guarda la fecha y el email del usuario, creando un documento en `Progress`.

- **GET** `/progress`  
  Devuelve el progreso del usuario autenticado. Incluye información de cada módulo (usando `populate`).  
  **Cabecera**: `Authorization: Bearer <token>`

### 6.4 Rutas de Ejemplo Protegidas

- **GET** `/protected`  
  Retorna un mensaje o la información básica del usuario autenticado para fines de prueba.  
  **Cabecera**: `Authorization: Bearer <token>`

---

## 7. Flujo Básico de la Aplicación

1. **Registro**: Un nuevo usuario completa el formulario de registro en la ruta `/register`.  
2. **Inicio de sesión**: El usuario se loguea y recibe un token JWT.  
3. **Acceso a módulos**: Desde el frontend, el usuario ve la lista de módulos (`GET /modules`).  
4. **Completar un módulo**: Al finalizar el módulo, el usuario registra su progreso (`POST /progress`).  
5. **Ver Progreso**: El usuario puede consultar la ruta `/progress` para ver qué módulos ha completado.  
6. **Panel de administración**: Un usuario con rol `admin` puede crear nuevos módulos (`POST /modules`).

---

## 8. Frontend: Estructura y Páginas Clave

- **`src/pages/Login.js`**: Página para inicio de sesión.  
- **`src/pages/Register.js`**: Página de registro (pide email, contraseña, nombre, apellidos, DNI, etc.).  
- **`src/pages/ModulesView.js`**: Muestra los módulos existentes (token requerido).  
- **`src/pages/ProgressView.js`**: Muestra los módulos que el usuario ha completado (token requerido).  
- **`src/pages/CreateModule.js`**: Form para crear nuevos módulos (solo admin).  
- **`src/components/ModuleCard.js`**: Tarjeta individual para mostrar detalles de cada módulo.  
- **`src/components/Module1/`**: Ejemplo de lecciones estáticas (prototipo).

Dentro de la carpeta `context/` se encuentra `AuthContext.js`, donde se maneja la lógica de autenticación (almacenamiento de token, logout, etc.) usando Context API de React.

---

## 9. Próximos Pasos

1. **Completar CRUD de módulos**: Implementar las rutas `PUT /modules/:id` y `DELETE /modules/:id` con verificación de rol `admin`.  
2. **Sincronizar lecciones estáticas**: Mover la lógica o contenido de `Module1/` al backend para que el contenido sea **dinámico**.  
3. **Mejorar la UI**: Añadir edición y eliminación de módulos en el frontend para administradores.  
4. **Panel de Administración**:  
   - Listar todos los usuarios y su progreso.  
   - Posibilidad de cambiar roles o eliminar usuarios. *(Solo si es un requerimiento.)*  
5. **Optimizar validaciones** (frontend y backend):  
   - Formatos de DNI, contraseñas más seguras, correos válidos, etc.  
6. **Pruebas unitarias e integrales**: Implementar tests en Jest (frontend) y algún framework de pruebas en Node (Mocha, Jest, etc.) para el backend.

---

## 10. Contribuciones

¡Las contribuciones son bienvenidas!  
- Si encuentras errores o deseas proponer mejoras, abre un **Issue** en el repositorio.  
- Para contribuciones mayores, por favor haz un **fork** del proyecto y envía un **Pull Request** para su revisión.

---

## 11. Licencia

> *(Incluir si aplica)*

Este proyecto está bajo la licencia MIT o la que corresponda. Incluye aquí los términos completos si se requiere.

---

## 12. Contacto

Para cualquier duda o consulta, puedes contactar con el equipo de QAlimentaria o con el autor principal del repositorio. ¡Gracias por utilizar la plataforma de formación!

---

**¡Listo!** Este documento describe el estado actual del proyecto, su instalación, uso y próximos pasos. Se sugiere mantenerlo actualizado a medida que el desarrollo avance.