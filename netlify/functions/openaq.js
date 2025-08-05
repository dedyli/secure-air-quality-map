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
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// Proxy all GET requests to OpenAQ V3, stripping Netlify function prefix
router.get('/*', async (req, res) => {
  // Determine the API path after the function mount
  const rawPath = req.path; // e.g. '/.netlify/functions/openaq/parameters/2/latest'
  const prefix = '/.netlify/functions/openaq';
  // Remove the function prefix if present
  let endpoint = rawPath.startsWith(prefix)
    ? rawPath.slice(prefix.length)
    : rawPath;
  endpoint = endpoint.replace(/^\/+/, '');

  const queryString = req._parsedUrl.search || '';
  const targetUrl = `https://api.openaq.org/v3/${endpoint}${queryString}`;
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

app.use('/', router);

module.exports.handler = serverless(app);