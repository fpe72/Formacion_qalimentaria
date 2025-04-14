const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendAccessCodeEmail(to, code) {
  const mailOptions = {
    from: `"Formación Qalimentaria" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Tu código de acceso a Formación Qalimentaria",
    text: `Gracias por registrarte. Tu código de acceso es: ${code}`,
    html: `<p>Gracias por registrarte en <strong>Formación Qalimentaria</strong>.</p>
           <p><strong>Tu código de acceso es:</strong> <code>${code}</code></p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado:", info.response);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
}

module.exports = sendAccessCodeEmail;
