const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "qalimentaria-es.correoseguro.dinaserver.com",
  port: 465,
  secure: true, // Usamos SSL
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

async function sendCodeEmail(email, code) {
  const mailOptions = {
    from: '"Formación Qalimentaria" <info@qalimentaria.es>',
    to: email,
    subject: "Tu código de acceso al curso",
    html: `
      <p>Hola,</p>
      <p>Gracias por realizar el pago de tu formación.</p>
      <p>Tu código de acceso es: <strong>${code}</strong></p>
      <p>Usa este código para registrarte en la plataforma.</p>
      <p>Un saludo,<br/>El equipo de Qalimentaria.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado a:", email);
  } catch (error) {
    console.error("❌ Error al enviar el email:", error);
    throw error;
  }
}

module.exports = sendCodeEmail;
