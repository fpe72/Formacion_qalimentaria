# Resumen del Proyecto: Aplicación de Formación en Seguridad Alimentaria

## 1. Objetivo del Proyecto

La aplicación está diseñada para gestionar la formación en seguridad alimentaria de los trabajadores de las empresas auditadas por Qalimetaria. El sistema tiene las siguientes funcionalidades principales:

- **Registro de usuarios:** Los trabajadores se registran y sus datos se almacenan en MongoDB Atlas.
- **Login y autenticación:** Se utiliza JWT para autenticar a los usuarios y proteger rutas sensibles.
- **Gestión del progreso:** Se registran y muestran los módulos completados por cada usuario.
- **Gestión de módulos de formación:** Los módulos (o capítulos) de la formación se cargan en el sistema.  
  *Nota:* Solo los administradores podrán crear o modificar módulos, mientras que los usuarios (alumnos) podrán consultarlos y registrar su progreso.

## 2. Arquitectura y Tecnología

### Backend
- **Lenguaje y Framework:** Node.js con Express.
- **Base de Datos:** MongoDB Atlas (usando Mongoose para la interacción).
- **Autenticación:** JWT para la creación y validación de tokens.
- **Endpoints Implementados:**
  - `GET /`: Verificación de que el backend funciona.
  - `POST /register`: Registro de usuarios.  
    - Se valida que el usuario no exista.
    - Se encripta la contraseña con bcrypt.
    - Se guarda el usuario en la base de datos.
  - `POST /login`: Inicio de sesión.
    - Se busca el usuario por email.
    - Se compara la contraseña (bcrypt).
    - Se genera un token JWT con expiración de 1 hora.
  - `GET /modules`: Lista de módulos (ordenados por el campo `order`).
  - `POST /progress`: Registro de progreso del usuario (requiere token).
    - Se guarda el ID del módulo completado junto con el email del usuario.
  - `GET /progress`: Obtención del progreso del usuario (requiere token).
    - Se utiliza `populate` para traer la información del módulo.
  - `GET /protected`: Ruta protegida para pruebas, que devuelve la información del usuario autenticado.

### Modelos de Mongoose
- **User:** Define un usuario con campos: `email`, `password` (encriptada), `name`, y en el futuro se añadirá un campo `role` para distinguir administradores de usuarios.
- **Module:** Define un módulo con campos: `title`, `description`, `content` y `order`.
- **Progress:** Registra el avance del usuario con campos: `userEmail`, `module` (referencia a Module) y `dateCompleted`.

### Frontend
- **Framework:** React (creado con Create React App).
- **Navegación:** React Router para gestionar las rutas.
- **Páginas/Campos Implementados:**
  - **Home:** Página de inicio.
  - **Login:** Formulario para iniciar sesión.
  - **Register:** Formulario para registro de nuevos usuarios.
  - **Protected:** Ejemplo de página protegida (accesible solo con token).
  - **ProgressView:** Componente para visualizar el progreso del usuario en una tabla.

## 3. Flujo de la Aplicación

1. **Registro de Usuarios:**
   - El usuario se registra desde la interfaz (Register).
   - La información se guarda en MongoDB Atlas a través del endpoint `POST /register`.

2. **Inicio de Sesión:**
   - El usuario se logea desde la interfaz (Login).
   - Se genera y devuelve un token JWT que se almacena en `localStorage`.
   - Este token se usa para acceder a rutas protegidas y registrar progreso.

3. **Gestión del Progreso:**
   - El usuario puede registrar el avance al completar un módulo mediante `POST /progress`.
   - El progreso registrado se consulta con `GET /progress` y se muestra en el componente `ProgressView`.

4. **Gestión de Módulos (futuro):**
   - Los módulos de formación se crean y gestionan mediante un endpoint (por ejemplo, `POST /modules`) y serán visibles para todos los usuarios.
   - Solo los administradores podrán crear o modificar módulos, mediante la verificación de roles (se implementará agregando un campo `role` en el modelo User y un middleware adicional).

## 4. Roles y Seguridad

- **Usuarios vs Administradores:**
  - Actualmente, no se distingue entre usuarios y administradores en el sistema.
  - En el futuro se implementará un sistema de roles, donde:
    - Los administradores podrán crear, editar y eliminar módulos.
    - Los usuarios (alumnos) podrán ver los módulos y registrar su progreso.
  - Se utilizará un middleware (`adminMiddleware`) que verifique el rol incluido en el token JWT.

## 5. Próximos Pasos

1. **Implementar Roles en el Modelo User:**
   - Añadir un campo `role` (por ejemplo, con valor `'user'` por defecto y `'admin'` para administradores).

2. **Crear Endpoint para Módulos:**
   - Crear `POST /modules` para que solo administradores puedan agregar nuevos módulos.
   - Crear una interfaz en el frontend para listar y, eventualmente, crear módulos (si el usuario es admin).

3. **Diseño Personalizado:**
   - Refinar el diseño del frontend utilizando CSS, frameworks (Bootstrap, Tailwind, etc.) o Styled Components para alinear la interfaz con la identidad corporativa de Qalimetaria.

## 6. Consideraciones Adicionales

- **Ambiente de Desarrollo vs Producción:**
  - En desarrollo, se usan puertos públicos (por ejemplo, 3000 para el frontend y 5000 para el backend) mediante Codespaces.
  - En producción, se recomienda utilizar contenedores, balanceadores de carga y reverse proxies para gestionar los puertos y asegurar el entorno.

- **Rendimiento y Contexto del Chat:**
  - El chat se puede volver lento a medida que crece el historial. Es recomendable mantener resúmenes y documentos de referencia actualizados en el repositorio para no depender únicamente del chat.

---

## Conclusión

Este documento resume el estado actual del proyecto y las decisiones tomadas hasta ahora. Puedes utilizarlo para mantener un registro y continuar el desarrollo en nuevos hilos o conversaciones, sin perder el contexto acumulado.




