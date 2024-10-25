const axios = require('axios');
const Weather = require('./models/Weather');
const nodemailer = require('nodemailer');
const API_KEY = process.env.OPENWEATHER_API_KEY;
const CITIES = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

async function fetchWeatherData(city) {
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;
    console.log(data)

    return {
        city,
        main: data.weather[0].main,
        temp: data.main.temp - 273.15,        // Convert from Kelvin to Celsius
        feels_like: data.main.feels_like - 273.15,
        dt: data.dt
    };
}

async function saveWeatherData() {
    for (let city of CITIES) {
        const weatherData = await fetchWeatherData(city);
        const weather = new Weather(weatherData);
        await weather.save();
        console.log(`Weather data for ${city} saved.`);
    }
}

async function checkAlerts() {
    const recentData = await Weather.find().sort({ dt: -1 }).limit(10); // Get recent data

    recentData.forEach(data => {
        if (data.temp > 30) {
            // Trigger alert if temperature exceeds threshold
            console.log(`Alert: ${data.city} temperature is ${data.temp}°C!`);
            sendAlertEmail(data.city, data.temp);
        }
    });
}

async function sendAlertEmail(city, temp) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'aishwarya.rajvedi@zeotap.com',
        subject: 'Weather Alert',
        text: `Alert: Temperature in ${city} has exceeded the threshold. Current temperature is ${temp}°C.`
    };

    await transporter.sendMail(mailOptions);
    console.log('Alert email sent.');
}

// Export both functions in a single statement
module.exports = { saveWeatherData, checkAlerts };
