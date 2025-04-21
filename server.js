const express = require('express');
const cors = require('cors');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// ✅ Habilitar CORS solo para frontend (opcional si sirves Angular desde el mismo dominio)
app.use(cors({
  origin: 'https://infinitygym.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ✅ Proxy para API Laravel
app.use('/api', createProxyMiddleware({
  target: 'http://dev.xrom.cc:8021',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api' // deja la ruta igual, puedes ajustar si tu Laravel no usa /api
  }
}));

// 📦 Ruta al build de Angular
const appPath = path.join(__dirname, 'dist/onvert-theme');

// 📦 Servir Angular
app.use(express.static(appPath));

// 🌐 Todas las rutas al frontend redirigen a index.html
app.get('/*', (req, res) => {
  res.sendFile(path.join(appPath, 'index.html'));
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
