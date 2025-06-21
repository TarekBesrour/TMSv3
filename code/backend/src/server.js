// Import des modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Chargement des variables d'environnement (.env)
dotenv.config();

// Création de l'application Express
const app = express();

// Port d'écoute (ex. : 3001 ou celui défini dans .env)
const PORT = process.env.PORT || 3001;

// Middleware pour accepter le JSON
app.use(express.json());

// Middleware pour gérer les CORS
app.use(cors());

// Route de test
app.get('/', (req, res) => {
  res.send('✅ Backend TMS opérationnel !');
});

// Exemple : inclusion de routes séparées
// const userRoutes = require('./routes/users');
// app.use('/api/users', userRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend lancé sur http://localhost:${PORT}`);
});
