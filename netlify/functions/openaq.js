// A simpler, more robust proxy for Netlify Functions.
const fetch = require('node-fetch');

exports.handler = async function (event) {
  // Securely get the API key from Netlify's environment variables
  const API_KEY = process.env.OPENAQ_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OPENAQ_API_KEY is not configured." })
    };
  }
  
  const API_ENDPOINT = 'https://api.openaq.org/v3';

  // Reconstruct the URL safely
  const path = event.path.replace('/.netlify/functions/openaq', '');
  const queryString = new URLSearchParams(event.queryStringParameters).toString();
  const url = `${API_ENDPOINT}${path}?${queryString}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': API_KEY
      }
    });

    // Pass the response from OpenAQ directly back to the browser
    const data = await response.text(); // Use .text() to handle all response types
    return {
      statusCode: response.status,
      body: data,
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy Server Error', details: error.message }),
    };
  }
};