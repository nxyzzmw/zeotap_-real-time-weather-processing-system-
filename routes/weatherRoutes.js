const express = require('express');
const { saveWeatherData, checkAlerts } = require('../weatherService');
const Weather = require('../models/Weather');
const router = express.Router();

// Route for fetching weather summaries
router.get('/', async (req, res) => {
    const summaries = await Weather.aggregate([
        {
            $group: {
                _id: "$city",
                avgTemp: { $avg: "$temp" },
                maxTemp: { $max: "$temp" },
                minTemp: { $min: "$temp" },
                dominantWeather: { $first: "$main" }  // Simplified for demo
            }
        }
    ]);
    console.log(summaries)
    res.render('index', { summaries });
});

// Route for fetching alerts
router.get('/alerts', async (req, res) => {
    await checkAlerts();  // Check for any alert conditions
    res.render('alerts');
});

module.exports = router;
