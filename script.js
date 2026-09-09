// OpenWeatherMap API configuration
const API_KEY = '0ff1e8860f99e9428141ec888e8411dc'; // Free API key for demo
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const weatherContent = document.getElementById('weatherContent');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const initialMessage = document.getElementById('initialMessage');

// Event Listeners
searchBtn.addEventListener('click', searchWeather);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
});

// Search weather by city name
async function searchWeather() {
    const city = searchInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    showLoading(true);
    
    try {
        // Get coordinates for the city
        const geoResponse = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
        );
        
        if (!geoResponse.ok) throw new Error('City not found');
        
        const geoData = await geoResponse.json();
        
        if (geoData.length === 0) {
            showError('City not found. Please try again.');
            showLoading(false);
            return;
        }

        const { lat, lon, name, country } = geoData[0];

        // Get weather data
        const weatherResponse = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        
        const weatherData = await weatherResponse.json();

        // Get forecast data
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        
        const forecastData = await forecastResponse.json();

        // Display weather
        displayCurrentWeather(weatherData, name, country);
        displayForecast(forecastData);
        
        showLoading(false);
        hideError();
        weatherContent.style.display = 'block';
        initialMessage.style.display = 'none';

    } catch (err) {
        console.error('Error fetching weather:', err);
        showError('Failed to fetch weather data. Please try again.');
        showLoading(false);
    }
}

// Display current weather
function displayCurrentWeather(data, cityName, country) {
    const { main, weather, wind, clouds, visibility, sys } = data;

    // Update city info
    document.getElementById('cityName').textContent = `${cityName}, ${country}`;
    document.getElementById('weatherDescription').textContent = weather[0].description;

    // Update temperature
    document.getElementById('temp').textContent = Math.round(main.temp);
    document.getElementById('feelsLike').textContent = `${Math.round(main.feels_like)}°C`;

    // Update weather icon
    const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;
    document.getElementById('weatherIcon').src = iconUrl;

    // Update details
    document.getElementById('humidity').textContent = `${main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${wind.speed.toFixed(1)} m/s`;
    document.getElementById('pressure').textContent = `${main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(visibility / 1000).toFixed(1)} km`;
    document.getElementById('uvIndex').textContent = clouds.all + '%';
}

// Display 5-day forecast
function displayForecast(data) {
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';

    // Get forecast for every 24 hours (8 x 3-hour intervals)
    const dailyForecasts = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        // Store only one forecast per day (the first one available)
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                temp: Math.round(item.main.temp),
                icon: item.weather[0].icon,
                description: item.weather[0].description,
                date: day
            };
        }
    });

    // Display first 5 days
    Object.values(dailyForecasts).slice(0, 5).forEach(forecast => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <p class="date">${forecast.date}</p>
            <img class="forecast-icon" src="https://openweathermap.org/img/wn/${forecast.icon}@2x.png" alt="Weather">
            <p class="forecast-temp">${forecast.temp}°C</p>
            <p class="forecast-desc">${forecast.description}</p>
        `;
        forecastGrid.appendChild(forecastCard);
    });
}

// Show loading state
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

// Show error message
function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
    weatherContent.style.display = 'none';
}

// Hide error message
function hideError() {
    error.style.display = 'none';
}

// Load default city on page load
window.addEventListener('load', () => {
    searchInput.value = 'London';
    searchWeather();
});