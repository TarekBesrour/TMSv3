const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");

dotenv.config();

// --- Initialisation de la connexion Knex et Objection ---
const Knex = require('knex');
const { Model } = require('objection');
const knexConfig = require('../knexfile');

const knex = Knex(knexConfig[process.env.NODE_ENV || 'development']);
Model.knex(knex);
// --- Fin initialisation ---



const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Import routes
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const carrierInvoiceRoutes = require("./routes/carrierInvoiceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const tourPlanningRoutes = require("./routes/tourPlanningRoutes");
const resourceAllocationRoutes = require("./routes/resourceAllocationRoutes");
const referenceDataRoutes = require('./routes/referenceDataRoutes');
const partnerRoutes = require('./routes/partnerRoutes');

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api", carrierInvoiceRoutes); // Using /api as base for carrier invoices
app.use("/api", paymentRoutes); // Using /api as base for payments and bank accounts
app.use("/api", adminRoutes); // Using /api as base for admin and configuration
app.use("/api", tourPlanningRoutes); // Using /api as base for tour planning
app.use("/api", resourceAllocationRoutes); // Using /api as base for resource allocation
app.use('/api/v1/references', referenceDataRoutes);
app.use('/api/v1/partners', partnerRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("TMS Backend is running!");
});

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err.message || 'Something broke!');
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

const { handleError } = require('./utils/errorHandler');
app.use(handleError);

module.exports = app;


