📁 Estructura del proyecto
Raíz del proyecto (Formacion_qalimentaria-main/):

.gitignore

README.md

package.json, package-lock.json

🔧 Backend (backend/)
Archivo principal: index.js — Define las rutas y la lógica del servidor Express.

Modelos Mongoose:

FinalExam.js: Exámenes finales (preguntas, título, etc.)

Module.js: Módulos de formación

Progress.js: Progreso del usuario

User.js: Usuarios registrados

Pruebas: test.rest — contiene ejemplos de peticiones API para pruebas.

Dependencias: package.json y package-lock.json

🎨 Frontend (frontend/)
Proyecto basado en React + Tailwind.

public/index.html: Punto de entrada del HTML.

tailwind.config.js y postcss.config.js: Configuración de estilos.

package.json: Configuración y dependencias del frontend.


✅ Tecnologías y configuración
Framework principal: Express

Base de datos: MongoDB (via Mongoose)

Autenticación: JWT

Seguridad de contraseñas: bcrypt

Middleware CORS y manejo de JSON

Soporte para variables de entorno con dotenv

Integración con OpenAI API (ya importada pero aún no se ha visto su uso)

🔐 Middlewares personalizados
authMiddleware: Verifica que el token JWT sea válido y lo asigna a req.user.

adminMiddleware: Solo permite el acceso a usuarios con role === 'admin'.

🚀 Rutas disponibles (hasta ahora vistas)
GET / — Ruta básica para verificar que el backend está corriendo.

POST /register — Registro de usuario. Requiere todos los campos y verifica que el email no esté repetido.

POST /login — Inicio de sesión. Verifica credenciales y devuelve un token JWT.


🧠 FUNCIONALIDAD COMPLETA DEL BACKEND
📦 Modelos utilizados:
Importa los siguientes modelos de Mongoose:

User: Usuarios del sistema.

Module: Módulos del curso.

Progress: Progreso del usuario en los módulos.

FinalExam: Examen final generado.

🔐 Autenticación
POST /register: Crea un nuevo usuario.

POST /login: Devuelve un token JWT si las credenciales son correctas.

📚 GESTIÓN DE MÓDULOS
🔹 GET /modules
Acceso restringido con authMiddleware

Devuelve todos los módulos de formación.

🔹 POST /modules (solo admin)
Permite a un administrador subir módulos con HTML y título.

Los módulos se almacenan en la colección Module.

🔹 GET /modules/:id
Devuelve un módulo específico por ID.

📈 PROGRESO DEL USUARIO
🔹 POST /progress
Guarda el avance de un usuario sobre un módulo específico (userId, moduleId, progressPercentage).

Si ya existe, lo actualiza; si no, lo crea.

🔹 GET /progress/:moduleId
Devuelve el progreso de un módulo específico para el usuario autenticado.

🧪 EXAMEN FINAL
🔹 POST /generate-final-exam (solo admin)
Genera preguntas automáticamente usando la API de OpenAI a partir del contenido de los módulos.

Crea un examen final (FinalExam) con title y questions.

🔹 GET /final-exams
Lista todos los exámenes finales existentes.

🔹 GET /final-exam/:id
Devuelve un examen específico por ID.

🔹 PATCH /final-exam/:id
Permite actualizar el título o las preguntas de un examen existente.

🔹 DELETE /final-exam/:id
Elimina un examen final por ID.

🧠 RELACIONES ENTRE COMPONENTES
Componente	Relación clave
User	Guarda nombre, apellidos, email, password y dni.
Module	Contiene el contenido de formación en HTML.
Progress	Une a un userId con un moduleId y un progreso.
FinalExam	Generado desde los módulos, contiene preguntas AI.
🛠️ FUNCIONALIDADES DESTACADAS
Usa OpenAI para generar preguntas de examen automáticamente desde los contenidos.

Autenticación JWT con protección por rol para rutas críticas (adminMiddleware).

Permite edición directa de preguntas y título de un examen.


📁 ESTRUCTURA DEL FRONTEND
Raíz frontend/
package.json, tailwind.config.js, postcss.config.js: configuración general del entorno React + Tailwind.

public/index.html: punto de entrada HTML.

📁 src/ — Lógica principal de React
🧩 Componentes compartidos (src/components/)
Layout.js: plantilla principal con cabecera, pie y navegación.

Navigation.js: menú de navegación dinámico.

ModuleCard.js: tarjeta resumen para mostrar un módulo.

ModuleDetail.jsx: vista de detalle de módulo con estilo propio (ModuleDetail.css).

IdleTimer.js: probablemente controla la sesión inactiva (junto a un hook propio).

🌍 Páginas del sistema (src/pages/)
Página	Funcionalidad
Login.js, Register.js	Autenticación
Home.js	Inicio
ModulesView.js	Lista todos los módulos
ModuleContent.js	Muestra el contenido HTML del módulo
ProgressView.js	Muestra el progreso del usuario
FinalExam.js	Vista para realizar el examen final
CreateFinalExam.js, EditFinalExam.js, EditExam.js	Crear/editar exámenes
FinalExamList.js	Lista de exámenes disponibles
CreateModule.js	Página para admins para subir módulos
Protected.js	Protege rutas que requieren autenticación
🧠 Contexto (src/context/)
AuthContext.js: gestiona la autenticación global (token, usuario, login/logout).

🧩 Hooks personalizados (src/hooks/)
useIdleTimer.js: hook para controlar la inactividad y cerrar sesión automáticamente si el usuario está inactivo.

🔄 FLUJO FUNCIONAL DEL FRONTEND
🧑‍💼 Registro / Login
Register.js y Login.js envían peticiones a /register y /login.

El AuthContext guarda el token JWT.

Rutas protegidas (Protected.js) usan ese contexto.

📚 Visualización de módulos
ModulesView.js muestra todos los módulos (GET /modules).

Al hacer clic en uno, ModuleContent.js carga su contenido y guarda el progreso (POST /progress).

📈 Progreso
ProgressView.js muestra el avance en cada módulo (GET /progress/:moduleId).

🧪 Examen final
El admin crea un examen con CreateFinalExam.js (POST /generate-final-exam).

Se listan todos en FinalExamList.js.

El alumno accede a /final-exam y ve el examen activo en FinalExam.js.

🛠 Edición de exámenes
EditFinalExam.js y EditExam.js permiten modificar preguntas y títulos (PATCH /final-exam/:id).

🔗 RELACIÓN FRONTEND - BACKEND
Frontend	Backend
Register.js	POST /register
Login.js	POST /login
ModulesView.js	GET /modules
ModuleContent.js	GET /modules/:id, POST /progress
ProgressView.js	GET /progress/:moduleId
CreateFinalExam.js	POST /generate-final-exam
FinalExamList.js	GET /final-exams
FinalExam.js	GET /final-exam/:id
EditFinalExam.js	PATCH /final-exam/:id
EditExam.js	PATCH /final-exam/:id
CreateModule.js	POST /modules
✅ CONCLUSIÓN
Este proyecto tiene una estructura clara y bien organizada tanto en backend como frontend. Está orientado a formación online, permitiendo subir módulos HTML, llevar el progreso de los alumnos y evaluar mediante exámenes generados por IA.