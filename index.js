const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
const ejs = require('ejs');
const path = require('path');
const nodemailer = require('nodemailer');

dotenv.config();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/rule_engine')//replace your db name and port number
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));
// Define Weather model
const weatherSchema = new mongoose.Schema({
    city: String,
    main: String,
    temp: Number,
    feels_like: Number,
    humidity: Number,   // New parameter
    wind_speed: Number,  // New parameter
    dt: { type: Date, default: Date.now }
});
const Weather = mongoose.model('Weather', weatherSchema);

// Express setup
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITIES = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

// Alert thresholds
const alertThresholds = {
    temperature: 30,  // Temperature threshold
};

// Email transporter (for email alerts)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to fetch weather data
async function fetchWeatherData(city) {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;

    return {
        city,
        main: data.weather[0].main,
        temp: data.main.temp,  // Temperature in Kelvin
        feels_like: data.main.feels_like,
        humidity: data.main.humidity, // New parameter
        wind_speed: data.wind.speed,   // New parameter
        dt: data.dt * 1000  // Convert Unix timestamp to milliseconds
    };
}

// Function to send email alerts
async function sendEmailAlert(city, temp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ALERT_EMAIL,
        subject: `Weather Alert: ${city}`,
        text: `The temperature in ${city} has exceeded the threshold of ${alertThresholds.temperature}°C. Current temp: ${temp}°C.`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Alert email sent for ${city}.`);
    } catch (error) {
        console.error(`Failed to send email alert for ${city}:`, error);
    }
}

// Function to track and alert based on thresholds
async function trackWeatherAlerts(city, tempCelsius) {
    if (tempCelsius > alertThresholds.temperature) {
        console.log(`Temperature in ${city} is ${tempCelsius}°C, exceeding the threshold.`);
        await sendEmailAlert(city, tempCelsius);
    }
}

// Function to save weather data
async function saveWeatherData() {
    for (let city of CITIES) {
        const weatherData = await fetchWeatherData(city);
        const weather = new Weather(weatherData);
        await weather.save();

        // Convert temperature to Celsius for alerting
        const tempCelsius = weatherData.temp - 273.15;
        await trackWeatherAlerts(city, tempCelsius);  // Track alerts
        console.log(`Weather data for ${city} saved.`);
    }
}

// Function to convert temperatures based on user preference
function convertTemperature(temp, unit) {
    if (unit === 'Celsius') {
        return temp - 273.15; // Convert from Kelvin to Celsius
    } else if (unit === 'Fahrenheit') {
        return (temp - 273.15) * 9 / 5 + 32; // Convert from Kelvin to Fahrenheit
    } else {
        return temp; // Return Kelvin as is
    }
}

// Route for fetching weather summaries
app.get('/', async (req, res) => {
    const unit = req.query.unit || 'Celsius'; // Default to Celsius if not specified

    // Fetch and save weather data each time the page is loaded
    await saveWeatherData();

    // Fetch summaries after saving the data
    const summaries = await Weather.aggregate([
        {
            $group: {
                _id: "$city",
                avgTemp: { $avg: "$temp" },
                maxTemp: { $max: "$temp" },
                minTemp: { $min: "$temp" },
                avgHumidity: { $avg: "$humidity" }, // New aggregation for humidity
                avgWindSpeed: { $avg: "$wind_speed" }, // New aggregation for wind speed
                dominantWeather: { $first: "$main" }  // Simplified for demo
            }
        }
    ]);

    // Convert temperatures based on user selection
    summaries.forEach(summary => {
        summary.avgTemp = convertTemperature(summary.avgTemp, unit);
        summary.maxTemp = convertTemperature(summary.maxTemp, unit);
        summary.minTemp = convertTemperature(summary.minTemp, unit);
        summary.unit = unit; // Store the selected unit for display
    });

    // console.log(summaries);
    res.render('index', { summaries });
});

// Function to fetch weather forecasts
async function fetchWeatherForecast(city) {
    const url = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;

    return data.list.map(item => ({
        dt: item.dt * 1000,
        temp: item.main.temp,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        main: item.weather[0].main,
    }));
}

// Route for fetching weather forecasts
app.get('/forecast', async (req, res) => {
    const forecasts = {};
    for (let city of CITIES) {
        forecasts[city] = await fetchWeatherForecast(city);
    }

    res.render('forecast', { forecasts });
});

// Start the server and fetch weather data
app.listen(3000, async () => {
    console.log('Server running on http://localhost:3000');
});
