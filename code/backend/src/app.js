const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");



dotenv.config();

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

// Basic route for testing
app.get("/", (req, res) => {
  res.send("TMS Backend is running!");
});

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


