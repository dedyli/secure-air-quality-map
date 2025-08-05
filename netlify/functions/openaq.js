// netlify/functions/openaq.js
const express = require('express');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

// CORS middleware
router.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Proxy all GET requests to OpenAQ V3
router.get('/*', async (req, res) => {
  const endpointPath = req.params[0] || '';
  const queryString = req._parsedUrl.search || '';
  const targetUrl = `https://api.openaq.org/v3/${endpointPath}${queryString}`;
  console.log(`Proxying request to: ${targetUrl}`);

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error('Error proxying to OpenAQ:', err);
    return res.status(502).json({ error: 'Bad gateway' });
  }
});

// Mount router at root so requests to /.netlify/functions/openaq/* hit the handler
app.use('/', router);

module.exports.handler = serverless(app);