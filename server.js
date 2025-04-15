// server.js
const { exec } = require('child_process');

exec('npm start', (err, stdout, stderr) => {
  if (err) {
    console.error('Error al iniciar la app:', err);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});
