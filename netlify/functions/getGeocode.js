const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // --- FOR DEBUGGING ONLY ---
    // Replace the line below with your actual API key.
    // This must be the SAME key you pasted in getAirQuality.js
    const API_KEY = "AIzaSyB7tXsMopboB-twZRxqkZOGVZau-sqFjTM";

    // This line is no longer used.
    // const API_KEY_FROM_ENV = process.env.GOOGLE_MAPS_API_KEY;
    
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