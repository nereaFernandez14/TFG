const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;
const DIST_FOLDER = path.join(process.cwd(), 'dist/proyecto/browser');

app.use(express.static(DIST_FOLDER));

app.get('*', (req, res) => {
  const indexHtml = fs.readFileSync(path.join(DIST_FOLDER, 'index.html')).toString();
  res.status(200).send(indexHtml);
});

app.listen(PORT, () => {
  console.log(`Servidor SSR corriendo en http://localhost:${PORT}`);
});