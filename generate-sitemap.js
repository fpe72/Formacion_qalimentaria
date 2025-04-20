const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const path = require('path');

// Dominio de producción:
const sitemap = new SitemapStream({ hostname: 'https://formacion.qalimentaria.es' });

// Define tus rutas manualmente:
const urls = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/login', changefreq: 'monthly', priority: 0.8 },
  { url: '/register', changefreq: 'monthly', priority: 0.8 },
  // Añade aquí más rutas si las tienes
];

urls.forEach(route => sitemap.write(route));
sitemap.end();

// Ruta absoluta al archivo dentro de /frontend/public/
const outputPath = path.resolve(__dirname, 'frontend/public/sitemap.xml');

streamToPromise(sitemap).then(data => {
  createWriteStream(outputPath).end(data);
  console.log('✅ sitemap.xml generado en:', outputPath);
});
