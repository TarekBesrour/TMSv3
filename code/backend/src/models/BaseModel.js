// BaseModel.js
// Classe de base pour tous les modèles Objection.js
const { Model } = require('objection');

class BaseModel extends Model {
  // Ajoutez ici des méthodes ou hooks communs à tous les modèles si besoin
  
  // Méthodes utilitaires ou hooks communs à tous les modèles peuvent être ajoutés ici

  // Exemple : méthode pour cacher certains champs lors de la sérialisation
  $formatJson(json) {
    json = super.$formatJson(json);
    // Supprimer des champs sensibles si besoin, ex :
    // delete json.password;
    return json;
  }
}


module.exports = BaseModel;
