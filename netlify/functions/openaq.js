// File: netlify/functions/openaq.js
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

  const API_ENDPOINT = 'https://api.openaq.org/v3';
  const API_KEY = process.env.OPENAQ_API_KEY;

  if (!API_KEY) {
    return { 
      statusCode: 500, 
      headers,
      body: JSON.stringify({ error: "OpenAQ API Key is not configured." }) 
    };
  }

  try {
    // Extract the path after the function name
    let path = event.path.replace('/.netlify/functions/openaq', '') || '/locations';
    
    // Build query string from parameters
    const queryParams = event.queryStringParameters || {};
    const queryString = new URLSearchParams(queryParams).toString();
    
    // Construct the full URL
    const url = `${API_ENDPOINT}${path}${queryString ? '?' + queryString : ''}`;
    
    console.log('Fetching from URL:', url); // For debugging

    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'X-API-Key': API_KEY,
        'User-Agent': 'Air-Quality-Dashboard/1.0'
      },
      timeout: 10000 // 10 second timeout
    });

    // Log response details for debugging
    console.log('OpenAQ API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAQ API Error:', response.status, errorText);
      
      // Return a more helpful error response
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `OpenAQ API Error: ${response.status}`,
          details: errorText,
          url: url 
        }),
      };
    }

    const data = await response.text();
    
    return {
      statusCode: 200,
      headers,
      body: data,
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Proxy error', 
        details: error.message,
        stack: error.stack 
      }),
    };
  }
};