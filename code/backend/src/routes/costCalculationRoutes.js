const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const CostCalculationController = require('../controllers/CostCalculationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Middleware d'authentification pour toutes les routes
//router.use(authMiddleware.verifyToken);
router.use(authMiddleware.authenticate);

// Validation des paramètres de calcul de coût
const validateCostParams = [
  body('origin_country').notEmpty().withMessage('Pays d\'origine requis'),
  body('destination_country').notEmpty().withMessage('Pays de destination requis'),
  body('transport_mode').isIn(['road', 'sea', 'air', 'rail', 'multimodal']).withMessage('Mode de transport invalide'),
  body('weight').isFloat({ min: 0.1 }).withMessage('Poids doit être supérieur à 0'),
  body('volume').optional().isFloat({ min: 0 }).withMessage('Volume doit être positif'),
  body('distance').optional().isFloat({ min: 0 }).withMessage('Distance doit être positive'),
  body('pallets').optional().isInt({ min: 0 }).withMessage('Nombre de palettes doit être positif'),
  body('containers').optional().isInt({ min: 0 }).withMessage('Nombre de conteneurs doit être positif'),
  body('shipment_date').optional().isISO8601().withMessage('Date d\'expédition invalide'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Code devise invalide')
];

// Validation des paramètres de devis
const validateQuoteParams = [
  ...validateCostParams,
  body('customer_id').optional().isInt().withMessage('ID client invalide'),
  body('service_level').optional().isIn(['standard', 'express', 'economy']).withMessage('Niveau de service invalide')
];

// Routes pour le calcul des coûts

// Calculer le coût d'une commande
router.get('/orders/:id/cost',
  param('id').isInt().withMessage('ID de commande invalide'),
  CostCalculationController.calculateOrderCost
);

// Calculer le coût d'une expédition
router.get('/shipments/:id/cost',
  param('id').isInt().withMessage('ID d\'expédition invalide'),
  CostCalculationController.calculateShipmentCost
);

// Calculer le coût d'un segment
router.get('/segments/:id/cost',
  param('id').isInt().withMessage('ID de segment invalide'),
  CostCalculationController.calculateSegmentCost
);

// Calculer le coût basé sur des paramètres
router.post('/calculate',
  validateCostParams,
  CostCalculationController.calculateCostFromParams
);

// Comparer les options de transport
router.post('/compare',
  validateCostParams,
  CostCalculationController.compareTransportOptions
);

// Générer un devis détaillé
router.post('/quote',
  validateQuoteParams,
  CostCalculationController.generateDetailedQuote
);

// Calculer le coût basé sur un contrat
router.post('/contracts/:contract_id/calculate',
  param('contract_id').isInt().withMessage('ID de contrat invalide'),
  validateCostParams,
  CostCalculationController.calculateContractBasedCost
);

// Simuler différents scénarios de coût
router.post('/simulate',
  body('base_params').isObject().withMessage('Paramètres de base requis'),
  body('scenarios').isArray().withMessage('Scénarios doivent être un tableau'),
  CostCalculationController.simulateCostScenarios
);

// Calculer les économies potentielles
router.post('/savings',
  body('current_cost').isFloat({ min: 0 }).withMessage('Coût actuel doit être positif'),
  body('shipment_params').isObject().withMessage('Paramètres d\'expédition requis'),
  CostCalculationController.calculatePotentialSavings
);

// Obtenir l'historique des calculs
router.get('/history',
  query('order_id').optional().isInt().withMessage('ID de commande invalide'),
  query('shipment_id').optional().isInt().withMessage('ID d\'expédition invalide'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite doit être entre 1 et 100'),
  CostCalculationController.getCostCalculationHistory
);

// Valider les paramètres de calcul
router.post('/validate',
  CostCalculationController.validateCostParameters
);

// Estimer le temps de transit
router.post('/transit-time',
  body('transport_mode').isIn(['road', 'sea', 'air', 'rail', 'multimodal']).withMessage('Mode de transport invalide'),
  body('distance').isFloat({ min: 0.1 }).withMessage('Distance doit être supérieure à 0'),
  body('origin_country').notEmpty().withMessage('Pays d\'origine requis'),
  body('destination_country').notEmpty().withMessage('Pays de destination requis'),
  CostCalculationController.estimateTransitTime
);

// Routes spécialisées pour différents modes de transport

// Calculer le coût pour transport routier
router.post('/road/calculate',
  body('origin_country').notEmpty().withMessage('Pays d\'origine requis'),
  body('destination_country').notEmpty().withMessage('Pays de destination requis'),
  body('weight').isFloat({ min: 0.1 }).withMessage('Poids requis'),
  body('distance').isFloat({ min: 0.1 }).withMessage('Distance requise'),
  body('vehicle_type').optional().isIn(['van', 'truck', 'trailer']).withMessage('Type de véhicule invalide'),
  (req, res, next) => {
    req.body.transport_mode = 'road';
    next();
  },
  CostCalculationController.calculateCostFromParams
);

// Calculer le coût pour transport maritime
router.post('/sea/calculate',
  body('origin_country').notEmpty().withMessage('Pays d\'origine requis'),
  body('destination_country').notEmpty().withMessage('Pays de destination requis'),
  body('weight').isFloat({ min: 0.1 }).withMessage('Poids requis'),
  body('containers').isInt({ min: 1 }).withMessage('Nombre de conteneurs requis'),
  body('container_type').optional().isIn(['20ft', '40ft', '40ft_hc']).withMessage('Type de conteneur invalide'),
  (req, res, next) => {
    req.body.transport_mode = 'sea';
    next();
  },
  CostCalculationController.calculateCostFromParams
);

// Calculer le coût pour transport aérien
router.post('/air/calculate',
  body('origin_country').notEmpty().withMessage('Pays d\'origine requis'),
  body('destination_country').notEmpty().withMessage('Pays de destination requis'),
  body('weight').isFloat({ min: 0.1 }).withMessage('Poids requis'),
  body('volume').isFloat({ min: 0.1 }).withMessage('Volume requis'),
  body('service_type').optional().isIn(['standard', 'express', 'next_day']).withMessage('Type de service invalide'),
  (req, res, next) => {
    req.body.transport_mode = 'air';
    next();
  },
  CostCalculationController.calculateCostFromParams
);

// Calculer le coût pour transport ferroviaire
router.post('/rail/calculate',
  body('origin_country').notEmpty().withMessage('Pays d\'origine requis'),
  body('destination_country').notEmpty().withMessage('Pays de destination requis'),
  body('weight').isFloat({ min: 0.1 }).withMessage('Poids requis'),
  body('wagon_type').optional().isIn(['container', 'bulk', 'tanker']).withMessage('Type de wagon invalide'),
  (req, res, next) => {
    req.body.transport_mode = 'rail';
    next();
  },
  CostCalculationController.calculateCostFromParams
);

// Calculer le coût pour transport multimodal
router.post('/multimodal/calculate',
  body('origin_country').notEmpty().withMessage('Pays d\'origine requis'),
  body('destination_country').notEmpty().withMessage('Pays de destination requis'),
  body('weight').isFloat({ min: 0.1 }).withMessage('Poids requis'),
  body('segments').isArray({ min: 2 }).withMessage('Au moins 2 segments requis pour multimodal'),
  body('segments.*.transport_mode').isIn(['road', 'sea', 'air', 'rail']).withMessage('Mode de transport de segment invalide'),
  (req, res, next) => {
    req.body.transport_mode = 'multimodal';
    next();
  },
  CostCalculationController.calculateCostFromParams
);

// Routes pour l'optimisation des coûts

// Optimiser le coût d'une expédition existante
router.post('/optimize/:shipment_id',
  param('shipment_id').isInt().withMessage('ID d\'expédition invalide'),
  async (req, res) => {
    try {
      // Récupérer l'expédition existante
      const Shipment = require('../models/Shipment');
      const shipment = await Shipment.query().findById(req.params.shipment_id);
      
      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Expédition non trouvée'
        });
      }

      // Paramètres basés sur l'expédition existante
      const shipmentParams = {
        origin_country: shipment.origin_country,
        destination_country: shipment.destination_country,
        transport_mode: shipment.transport_mode,
        weight: shipment.total_weight,
        volume: shipment.total_volume,
        distance: shipment.total_distance,
        shipment_date: shipment.planned_pickup_date,
        tenant_id: req.user.tenant_id
      };

      const comparison = await CostCalculationController.compareTransportOptions(shipmentParams);
      
      res.json({
        success: true,
        data: {
          current_shipment: shipment,
          optimization_options: comparison,
          potential_savings: comparison.recommended_option ? 
            Math.max(0, shipment.estimated_cost - comparison.recommended_option.total_cost) : 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Analyser les tendances de coûts
router.get('/analytics/trends',
  query('start_date').optional().isISO8601().withMessage('Date de début invalide'),
  query('end_date').optional().isISO8601().withMessage('Date de fin invalide'),
  query('transport_mode').optional().isIn(['road', 'sea', 'air', 'rail', 'multimodal']).withMessage('Mode de transport invalide'),
  async (req, res) => {
    try {
      // Cette fonctionnalité nécessiterait une analyse des données historiques
      // Pour l'instant, retourner une structure d'exemple
      const trends = {
        period: {
          start_date: req.query.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: req.query.end_date || new Date().toISOString()
        },
        transport_mode: req.query.transport_mode || 'all',
        trends: {
          average_cost_per_kg: 2.5,
          cost_trend: 'stable', // 'increasing', 'decreasing', 'stable'
          fuel_impact: 15.2, // percentage
          seasonal_variation: 8.5 // percentage
        },
        message: 'Analyse des tendances à implémenter avec des données historiques'
      };

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;

