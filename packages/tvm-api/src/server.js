/**
 * Time Value of Money Calculator - REST API Server
 *
 * Provides HTTP endpoints for TVM calculations
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { TVMCalculator } from '@tvm-calc/core';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const calculator = new TVMCalculator();

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
    name: 'Time Value of Money Calculator API',
    version: '1.0.0',
    description: 'Domain-agnostic financial calculation API',
    documentation: '/api/docs',
    endpoints: {
      'POST /api/npv': 'Calculate Net Present Value',
      'POST /api/irr': 'Calculate Internal Rate of Return',
      'POST /api/pmt': 'Calculate Payment',
      'POST /api/fv': 'Calculate Future Value',
      'POST /api/pv': 'Calculate Present Value',
      'POST /api/nper': 'Calculate Number of Periods',
      'POST /api/rate': 'Calculate Interest Rate',
      'POST /api/effect': 'Calculate Effective Annual Rate',
      'POST /api/nominal': 'Calculate Nominal Rate',
      'GET /health': 'Health check endpoint'
    },
    authentication: 'API Key required via X-API-Key header'
  });
});

// NPV Endpoint
app.post('/api/npv', authenticateApiKey, (req, res) => {
  try {
    const { rate, cashFlows } = req.body;

    if (rate === undefined || !Array.isArray(cashFlows)) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'rate (number) and cashFlows (array) are required'
      });
    }

    const npv = calculator.npv(Number(rate), cashFlows.map(Number));

    res.json({
      success: true,
      input: { rate, cashFlows },
      result: {
        npv,
        interpretation: npv > 0 ? 'Creates value' : 'Destroys value'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Calculation error',
      message: error.message
    });
  }
});

// IRR Endpoint
app.post('/api/irr', authenticateApiKey, (req, res) => {
  try {
    const { cashFlows, guess = 0.1 } = req.body;

    if (!Array.isArray(cashFlows)) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'cashFlows (array) is required'
      });
    }

    const irr = calculator.irr(cashFlows.map(Number), Number(guess));

    res.json({
      success: true,
      input: { cashFlows, guess },
      result: {
        irr,
        irrPercent: irr * 100
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Calculation error',
      message: error.message
    });
  }
});

// PMT Endpoint
app.post('/api/pmt', authenticateApiKey, (req, res) => {
  try {
    const { rate, nper, pv, fv = 0, type = 0 } = req.body;

    if (rate === undefined || nper === undefined || pv === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'rate, nper, and pv are required'
      });
    }

    const pmt = calculator.pmt(Number(rate), Number(nper), Number(pv), Number(fv), Number(type));

    res.json({
      success: true,
      input: { rate, nper, pv, fv, type },
      result: {
        pmt,
        absolutePmt: Math.abs(pmt)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Calculation error',
      message: error.message
    });
  }
});

// FV Endpoint
app.post('/api/fv', authenticateApiKey, (req, res) => {
  try {
    const { rate, nper, pmt, pv = 0, type = 0 } = req.body;

    if (rate === undefined || nper === undefined || pmt === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'rate, nper, and pmt are required'
      });
    }

    const fv = calculator.fv(Number(rate), Number(nper), Number(pmt), Number(pv), Number(type));

    res.json({
      success: true,
      input: { rate, nper, pmt, pv, type },
      result: {
        fv
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Calculation error',
      message: error.message
    });
  }
});

// PV Endpoint
app.post('/api/pv', authenticateApiKey, (req, res) => {
  try {
    const { rate, nper, pmt, fv = 0, type = 0 } = req.body;

    if (rate === undefined || nper === undefined || pmt === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'rate, nper, and pmt are required'
      });
    }

    const pv = calculator.pv(Number(rate), Number(nper), Number(pmt), Number(fv), Number(type));

    res.json({
      success: true,
      input: { rate, nper, pmt, fv, type },
      result: {
        pv,
        absolutePv: Math.abs(pv)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Calculation error',
      message: error.message
    });
  }
});

// NPER Endpoint
app.post('/api/nper', authenticateApiKey, (req, res) => {
  try {
    const { rate, pmt, pv, fv = 0, type = 0 } = req.body;

    if (rate === undefined || pmt === undefined || pv === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'rate, pmt, and pv are required'
      });
    }

    const nper = calculator.nper(Number(rate), Number(pmt), Number(pv), Number(fv), Number(type));

    res.json({
      success: true,
      input: { rate, pmt, pv, fv, type },
      result: {
        nper
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Calculation error',
      message: error.message
    });
  }
});

// RATE Endpoint
app.post('/api/rate', authenticateApiKey, (req, res) => {
  try {
    const { nper, pmt, pv, fv = 0, type = 0, guess = 0.1 } = req.body;

    if (nper === undefined || pmt === undefined || pv === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'nper, pmt, and pv are required'
      });
    }

    const rate = calculator.rate(Number(nper), Number(pmt), Number(pv), Number(fv), Number(type), Number(guess));

    res.json({
      success: true,
      input: { nper, pmt, pv, fv, type, guess },
      result: {
        rate,
        ratePercent: rate * 100
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Calculation error',
      message: error.message
    });
  }
});

// EFFECT Endpoint
app.post('/api/effect', authenticateApiKey, (req, res) => {
  try {
    const { nominalRate, npery } = req.body;

    if (nominalRate === undefined || npery === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'nominalRate and npery are required'
      });
    }

    const effectiveRate = calculator.effect(Number(nominalRate), Number(npery));

    res.json({
      success: true,
      input: { nominalRate, npery },
      result: {
        effectiveRate,
        effectiveRatePercent: effectiveRate * 100
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Calculation error',
      message: error.message
    });
  }
});

// NOMINAL Endpoint
app.post('/api/nominal', authenticateApiKey, (req, res) => {
  try {
    const { effectiveRate, npery } = req.body;

    if (effectiveRate === undefined || npery === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'effectiveRate and npery are required'
      });
    }

    const nominalRate = calculator.nominal(Number(effectiveRate), Number(npery));

    res.json({
      success: true,
      input: { effectiveRate, npery },
      result: {
        nominalRate,
        nominalRatePercent: nominalRate * 100
      },
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
  console.log(`🚀 TVM Calculator API running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔑 Default API Key: demo-key-12345`);
});

export default app;
