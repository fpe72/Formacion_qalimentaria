const axios = require('axios');

async function validateEmailWithMailboxlayer(email) {
  try {
    const access_key = process.env.MAILBOXLAYER_API_KEY;

    const response = await axios.get(`http://apilayer.net/api/check`, {
      params: {
        access_key,
        email,
        smtp: 1,
        format: 1
      }
    });

    const { format_valid, smtp_check, score } = response.data;

    // Puedes ajustar estos criterios según tu exigencia
    return format_valid && smtp_check && score > 0.5;

  } catch (error) {
    console.error('❌ Error al validar email con Mailboxlayer:', error.message);
    return false; // En caso de error asumimos que no es válido
  }
}

module.exports = validateEmailWithMailboxlayer;
