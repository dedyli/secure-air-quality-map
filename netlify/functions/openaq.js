const fetch = require('node-fetch');

// FOR TROUBLESHOOTING: API key is placed directly in the code.
const API_KEY = '9f408ed0e450f2c243ab27af6c475b1b8a4f0b6d776a82b55781cb0ab5190a89';

exports.handler = async function (event) {
  const API_ENDPOINT = 'https://api.openaq.org/v3';

  // This logic correctly removes the function's own path to prevent nesting.
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
      body: JSON.stringify({ error: 'Proxy error', details: error.message }),
    };
  }
};