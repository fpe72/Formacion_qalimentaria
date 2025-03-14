const express = require('express');
const cors = require('cors');
const app = express();

// Permitir CORS y parsear JSON
app.use(cors());
app.use(express.json());

// Puerto del servidor
const PORT = process.env.PORT || 5000;

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend de Formacion Qalimentaria');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
