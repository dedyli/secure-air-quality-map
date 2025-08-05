// File: netlify/functions/gnews.js
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  // Add CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const API_KEY = process.env.GNEWS_API_KEY;

  if (!API_KEY) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: "GNews API Key is not configured." }) 
    };
  }

  try {
    const url = `https://gnews.io/api/v4/search?q=air%20pollution%20OR%20air%20quality&lang=en&max=10&apikey=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Air-Quality-Dashboard/1.0'
      }
    });

    const data = await response.text();
    
    return {
      statusCode: response.status,
      headers,
      body: data,
    };
  } catch (error) {
    console.error('News proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'News proxy error', 
        details: error.message 
      }),
    };
  }
};