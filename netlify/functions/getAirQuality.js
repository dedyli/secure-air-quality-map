const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Get the API key from the secure environment variables
    const API_KEY = process.env.Maps_API_KEY;
    const API_URL = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${API_KEY}`;

    // The frontend will send the location data in the body of its request
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
            // If Google's API returns an error, pass it along
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