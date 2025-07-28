const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // --- FOR DEBUGGING ONLY ---
    // Replace the line below with your actual API key.
    // This completely bypasses the Netlify environment variable.
    const API_KEY = "AIzaSyB7tXsMopboB-twZRxqkZOGVZau-sqFjTM"; 
    
    // This line is no longer used, but we leave it here for reference.
    // const API_KEY_FROM_ENV = process.env.GOOGLE_MAPS_API_KEY;

    const API_URL = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${API_KEY}`;

    const { latitude, longitude } = JSON.parse(event.body);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                location: { latitude, longitude },
            }),
        });

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
            body: JSON.stringify({ error: 'Failed to fetch air quality data' }),
        };
    }
};