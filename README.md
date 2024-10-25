# zeotap_-real-time-weather-processing-system-

## Objective:
This project implements a **weather monitoring system** with **real-time data processing** using rollups and aggregates to generate daily weather summaries, alerting thresholds, and visualizations of weather data trends and alerts.

## Features:
- **Daily Weather Summary:** Rolled up daily weather data and calculate aggregates such as average, maximum, and minimum temperature, along with the dominant weather condition.
- **Alerting Thresholds:** Defined user-configurable temperature or weather condition thresholds (e.g., alert if temperature exceeds 35°C for two consecutive updates) and trigger alerts.
- **Visualizations:** Displayed daily summaries, historical trends, and alerts.

## Test Cases:
- **System Setup:** Ensured successful startup and connection to the OpenWeatherMap API.
- **Data Retrieval:** Tested weather data retrieval and parsing at configurable intervals.
- **Temperature Conversion:** Verified conversion of temperature values from Kelvin to Celsius or Fahrenheit.
- **Daily Summary:** Ensured correct daily summary calculations.
- **Alerting Thresholds:** Verified proper triggering of alerts when thresholds are breached.(Mail will sent to aishwarya.rajvedi@zeotap.com)

## Bonus:
- Added more weather parameters (e.g., humidity, wind speed).
- Integrated weather forecasts and summaries for predicted conditions.

## Running the Project:
### Tools Required:
- **VS Code**
- **Node.js**
- **MongoDB Compass** 

### Setup Instructions
1. Clone the project or download the ZIP file and extract it.
   ```bash
   git clone https://github.com/nxyzzmw/zeotap_-real-time-weather-processing-system-.git
2. Run the following command to install necessary packages:
   ```bash
   npm install mongoose express dotenv ejs
3. Start the project:
   ```bash
   node index.js
4. Open your browser and go to:
   ```bash
   http://localhost:3000





