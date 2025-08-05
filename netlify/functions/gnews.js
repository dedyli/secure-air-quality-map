const fetch = require('node-fetch');

// FOR TROUBLESHOOTING: API key is placed directly in the code.
const API_KEY = 'eb6e1360b30c6a7f876690a5ef785d0f';

exports.handler = async function (event) {
  const query = encodeURIComponent('"air pollution" OR "air quality"');
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=10&apikey=${API_KEY}`;

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
      body: JSON.stringify({ error: 'Failed to fetch news', details: error.message }),
    };
  }
};