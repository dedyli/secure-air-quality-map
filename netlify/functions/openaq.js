const fetch = require('node-fetch');

exports.handler = async function (event) {
  const API_ENDPOINT = 'https://api.openaq.org/v3';
  const API_KEY = process.env.OPENAQ_API_KEY;

  // This line correctly removes the function's path
  const path = event.path.replace('/.netlify/functions/openaq', '');
  const queryString = new URLSearchParams(event.queryStringParameters).toString();
  const url = `${API_ENDPOINT}${path}?${queryString}`;

  try {
    const response = await fetch(url, {
      headers: { 'X-API-Key': API_KEY }
    });
    const data = await response.text();
    return {
      statusCode: response.status,
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy error' }),
    };
  }
};
