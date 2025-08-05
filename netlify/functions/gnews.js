// File: netlify/functions/gnews.js
const fetch = require('node-fetch');

// This handler will run when you call /.netlify/functions/gnews
exports.handler = async function (event, context) {
  // Get your secret API key from Netlify's environment variables
  const NEWS_API_KEY = process.env.GNEWS_API_KEY;

  if (!NEWS_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "News API key is not configured." }),
    };
  }

  const query = encodeURIComponent('"air pollution" OR "air quality"');
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=10&apikey=${NEWS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch news', details: error.message }),
    };
  }
};