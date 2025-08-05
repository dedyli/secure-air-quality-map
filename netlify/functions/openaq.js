// netlify/functions/openaq.js
const express    = require('express');
const serverless = require('serverless-http');

const app    = express();
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

// catch all GETs
router.get('/*', async (req, res) => {
  // originalUrl includes everything after your domain, e.g.
  // "/.netlify/functions/openaq/parameters/2/latest?limit=1000"
  let url = req.originalUrl;

  // strip off "/.netlify/functions/openaq"
  url = url.replace(/^\/\.netlify\/functions\/openaq/, '');

  // build target
  const target = `https://api.openaq.org/v3${url}`;
  console.log(`Proxy → ${target}`);

  try {
    const upstream = await fetch(target);
    const data     = await upstream.json();
    return res.json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(502).json({ error: 'Bad gateway' });
  }
});

// mount at root
app.use('/', router);

module.exports.handler = serverless(app);
