const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const API_KEY = process.env.Maps_API_KEY;
    
    // Get lat/lng from the query string
    const { lat, lng } = event.queryStringParameters;
    const API_URL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            const errorData = await response.json();
            return {
                statusCode: response.status,
                body: JSON.stringify(errorData),
            };
        }
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch geocode data' }),
        };
    }
};