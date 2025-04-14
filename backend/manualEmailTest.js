// Carga variables de entorno
require("dotenv").config();

// Importa la función para enviar email
const sendCodeEmail = require("./utils/sendEmail");

// Cambia este email por uno real tuyo para probar
const destinatario = "fernando.palacios@coitim.es"; // 👈 cámbialo

sendCodeEmail(destinatario, "ABC123")
  .then(() => {
    console.log("✅ Email enviado correctamente a", destinatario);
  })
  .catch((error) => {
    console.error("❌ Error al enviar email:", error);
  });
