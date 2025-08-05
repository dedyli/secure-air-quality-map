// A serverless backend proxy for Netlify to bypass CORS with the OpenAQ API.
// To deploy this:
// 1. Place this file in a `netlify/functions` directory.
// 2. Create a `netlify.toml` file in your root directory.
// 3. Run `npm install express serverless-http node-fetch@2 cors`.
// 4. Deploy to Netlify.

const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// Use CORS to allow requests from your frontend's origin
app.use(cors());

const OPENAQ_API_URL = 'https://api.openaq.org/v3/';
const OPENAQ_API_KEY = '9f408ed0e450f2c243ab27af6c475b1b8a4f0b6d776a82b55781cb0ab5190a89';

// Handle all requests to the function
app.get('/.netlify/functions/openaq/*', async (req, res) => {
    // Extract the API path after /openaq/
    const apiPath = req.path.replace('/.netlify/functions/openaq/', '');
    const searchParams = new URLSearchParams(req.query);
    const fullUrl = `${OPENAQ_API_URL}${apiPath}?${searchParams.toString()}`;

    console.log(`Proxying request to: ${fullUrl}`);

    try {
        const response = await fetch(fullUrl, {
            headers: {
                'Accept': 'application/json',
                'X-API-Key': OPENAQ_API_KEY
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAQ API Error:', errorText);
            return res.status(response.status).send(errorText);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Proxy Server Error:', error);
        res.status(500).json({ 
            message: 'Error fetching data from the proxy server.', 
            details: error.message 
        });
    }
});

// Export the handler for Netlify
module.exports.handler = serverless(app);