require('dotenv').config(); // Carga las variables de entorno desde .env
const { createServer } = require('http');
const next = require('next');

// Determina si estamos en modo producción
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Base de datos (ejemplo)
const DATABASE_URL = process.env.DATABASE_URL;

console.log("Puerto:", PORT);
console.log("Base de Datos:", DATABASE_URL);

// Iniciar el servidor
app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Maneja todas las solicitudes con Next.js
    handle(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Servidor listo en http://localhost:${PORT}`);
  });
});