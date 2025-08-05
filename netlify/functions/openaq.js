// Fixed serverless backend proxy for Netlify to bypass CORS with the OpenAQ API.
const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// Use CORS to allow requests from your frontend's origin
app.use(cors());
app.use(express.json());

const OPENAQ_API_URL = 'https://api.openaq.org/v3/';
const OPENAQ_API_KEY = '9f408ed0e450f2c243ab27af6c475b1b8a4f0b6d776a82b55781cb0ab5190a89';

// Handle all requests - Netlify functions receive the full path
app.get('*', async (req, res) => {
    try {
        // Extract the API endpoint from the request URL
        let apiPath = req.url;
        
        console.log(`[Function Log] Full request URL: ${req.url}`);
        console.log(`[Function Log] Request path: ${req.path}`);
        
        // Remove query string to get just the path
        if (apiPath.includes('?')) {
            apiPath = apiPath.split('?')[0];
        }
        
        // Extract just the endpoint name (latest, measurements, etc.)
        // The path will be something like /.netlify/functions/openaq/latest
        const pathParts = apiPath.split('/');
        const endpoint = pathParts[pathParts.length - 1] || 'latest';
        
        console.log(`[Function Log] Extracted endpoint: ${endpoint}`);
        
        // Build the full OpenAQ API URL
        const searchParams = new URLSearchParams(req.query);
        const fullUrl = `${OPENAQ_API_URL}${endpoint}?${searchParams.toString()}`;

        console.log(`[Function Log] Full OpenAQ URL: ${fullUrl}`);

        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-API-Key': OPENAQ_API_KEY,
                'User-Agent': 'Air-Quality-Dashboard/1.0'
            },
            timeout: 15000 // 15 second timeout
        });

        console.log(`[Function Log] OpenAQ API response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Function Error] OpenAQ API Error: ${response.status} - ${errorText}`);
            return res.status(response.status).json({ 
                error: 'OpenAQ API Error', 
                status: response.status, 
                message: errorText,
                requestedUrl: fullUrl
            });
        }

        const data = await response.json();
        
        // Set CORS headers
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        console.log(`[Function Log] Successfully returned ${data.results ? data.results.length : 0} results`);
        res.json(data);

    } catch (error) {
        console.error('[Function Error] Proxy Server Error:', error);
        res.status(500).json({ 
            error: 'Proxy Server Error', 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Handle preflight OPTIONS requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.sendStatus(200);
});

// Export the handler for Netlify
module.exports.handler = serverless(app);

// For local testing
if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Development server running on port ${port}`);
    });
}