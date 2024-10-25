const Weather = require('../models/Weather'); // Adjust the path according to your project structure

async function insertWeatherData(city, weatherData) {
    const newWeather = new Weather({
        city: city,
        temp: weatherData.main.temp,
        main: weatherData.weather[0].main,
        dt: weatherData.dt  // Ensure this field is populated correctly
    });

    try {
        await newWeather.save();
        console.log(`Weather data for ${city} saved successfully`);
    } catch (err) {
        console.error("Error saving weather data:", err);
    }
}
