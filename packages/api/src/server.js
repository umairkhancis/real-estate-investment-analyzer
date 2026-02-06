/**
 * Real Estate Investment Calculator - REST API Server
 *
 * Provides HTTP endpoints for real estate investment calculations
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { RealEstateCalculator } from '@real-estate-calc/core';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const calculator = new RealEstateCalculator();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// API Key Authentication Middleware
const API_KEYS = new Set(process.env.API_KEYS?.split(',') || ['demo-key-12345']);

function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      error: 'Missing API Key',
      message: 'Please provide an API key via X-API-Key header or apiKey query parameter'
    });
  }

  if (!API_KEYS.has(apiKey)) {
    return res.status(403).json({
      error: 'Invalid API Key',
      message: 'The provided API key is not valid'
    });
  }

  next();
}

// Load OpenAPI spec
let openApiSpec;
try {
  openApiSpec = JSON.parse(readFileSync(join(__dirname, 'openapi.json'), 'utf8'));
} catch (error) {
  console.warn('OpenAPI spec not found, API docs will not be available');
}

// Swagger documentation
if (openApiSpec) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
}

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Info endpoint (no auth required)
app.get('/api', (req, res) => {
  res.json({
    name: 'Real Estate Investment Calculator API',
    version: '1.0.0',
    description: 'REST API for real estate investment analysis',
    documentation: '/api/docs',
    endpoints: {
      'POST /api/calculate/ready': 'Calculate ready property investment',
      'POST /api/calculate/offplan': 'Calculate off-plan property investment',
      'POST /api/calculate/offplan-with-mortgage': 'Calculate off-plan with mortgage continuation',
      'GET /health': 'Health check endpoint'
    },
    authentication: 'API Key required via X-API-Key header'
  });
});

// Ready Property Calculation Endpoint
app.post('/api/calculate/ready', authenticateApiKey, (req, res) => {
  try {
    const {
      propertySize,
      totalValue,
      downPaymentPercent = 25,
      registrationFeePercent = 4,
      tenure = 25,
      discountRate = 4,
      rentalROI = 6,
      serviceChargesPerSqFt = 10,
      exitValue
    } = req.body;

    // Validation
    if (!propertySize || !totalValue) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'propertySize and totalValue are required'
      });
    }

    const inputs = {
      propertySize: Number(propertySize),
      totalValue: Number(totalValue),
      downPaymentPercent: Number(downPaymentPercent),
      registrationFeePercent: Number(registrationFeePercent),
      tenure: Number(tenure),
      discountRate: Number(discountRate),
      rentalROI: Number(rentalROI),
      serviceChargesPerSqFt: Number(serviceChargesPerSqFt),
      exitValue: Number(exitValue || totalValue * 1.2)
    };

    const results = calculator.calculateReadyProperty(inputs);

    res.json({
      success: true,
      inputs,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Calculation error',
      message: error.message
    });
  }
});

// Off-Plan Property Calculation Endpoint
app.post('/api/calculate/offplan', authenticateApiKey, (req, res) => {
  try {
    const {
      size,
      totalValue,
      downPaymentPercent = 10,
      installmentPercent = 1,
      paymentFrequencyMonths = 3,
      constructionTenureYears = 3,
      handoverPaymentPercent = 10,
      expectedValue,
      discountRate = 4
    } = req.body;

    // Validation
    if (!size || !totalValue) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'size and totalValue are required'
      });
    }

    const inputs = {
      size: Number(size),
      totalValue: Number(totalValue),
      downPaymentPercent: Number(downPaymentPercent),
      installmentPercent: Number(installmentPercent),
      paymentFrequencyMonths: Number(paymentFrequencyMonths),
      constructionTenureYears: Number(constructionTenureYears),
      handoverPaymentPercent: Number(handoverPaymentPercent),
      expectedValue: Number(expectedValue || totalValue * 1.2),
      discountRate: Number(discountRate)
    };

    const results = calculator.calculateOffplan(inputs);

    res.json({
      success: true,
      inputs,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Calculation error',
      message: error.message
    });
  }
});

// Off-Plan with Mortgage Continuation Endpoint
app.post('/api/calculate/offplan-with-mortgage', authenticateApiKey, (req, res) => {
  try {
    const { offplanInputs, mortgageInputs } = req.body;

    // Validation
    if (!offplanInputs || !mortgageInputs) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both offplanInputs and mortgageInputs are required'
      });
    }

    const results = calculator.calculateOffplanWithMortgage(offplanInputs, mortgageInputs);

    res.json({
      success: true,
      inputs: { offplanInputs, mortgageInputs },
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Calculation error',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Real Estate Calculator API running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔑 Default API Key: demo-key-12345`);
});

export default app;
