// Import de l'application Express depuis app.js
const app = require('./app');

// Port d'écoute (ex. : 3001 ou celui défini dans .env)
const PORT = process.env.PORT || 3001;

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend lancé sur http://localhost:${PORT}`);
});
