const cityInput = document.getElementById("cityInput");
const getWeatherBtn = document.getElementById("getWeatherBtn");
const weatherOutput = document.getElementById("weatherOutput");
const themeToggle = document.getElementById("themeToggle");
const unitToggle = document.getElementById("unitToggle");


let isCelsius = true;
let tempC = null;
let currentData = null;

// 🌆 Search by City
getWeatherBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) {
    weatherOutput.innerHTML = "<p>Please enter a city name 🏙️</p>";
    return;
  }
  await fetchWeatherByCity(city);
});

cityInput.addEventListener("keypress", e => {
  if (e.key === "Enter") getWeatherBtn.click();
});


// 📍 Auto-detect user location
window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        fetchWeather(latitude, longitude, "Your Location");
      },
      () => {
        weatherOutput.innerHTML = "<p>Allow location access or search a city 🌍</p>";
      }
    );
  }
});

// 🌤️ Fetch by city name
async function fetchWeatherByCity(city) {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results) {
      weatherOutput.innerHTML = "<p>City not found 😢</p>";
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];
    await fetchWeather(latitude, longitude, `${name}, ${country}`);
  } catch (err) {
    weatherOutput.innerHTML = "<p>Error fetching data 🚫</p>";
  }
}

// 🌡️ Fetch weather details
async function fetchWeather(lat, lon, locationName) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,pressure_msl`
    );
    const data = await res.json();
    tempC = data.current_weather.temperature;
    currentData = {
      ...data.current_weather,
      humidity: data.hourly.relativehumidity_2m[0],
      pressure: data.hourly.pressure_msl[0],
      location: locationName
    };
    displayWeather();
  } catch (err) {
    weatherOutput.innerHTML = "<p>Weather data unavailable ❌</p>";
  }
}

// 🕐 Display weather info
function displayWeather() {
  if (!currentData) return;

  const temp = isCelsius ? tempC : (tempC * 9/5 + 32).toFixed(1);
  const unit = isCelsius ? "°C" : "°F";
  const now = new Date().toLocaleString();

  weatherOutput.innerHTML = `
    <h2>${currentData.location}</h2>
    <p>${now}</p>
    <p>🌡️ Temperature: ${temp}${unit}</p>
    <p>💨 Wind Speed: ${currentData.windspeed} km/h</p>
    <p>💧 Humidity: ${currentData.humidity}%</p>
    <p>📊 Pressure: ${currentData.pressure} hPa</p>
  `;
}
function updateFavicon() {
  const favicon = document.querySelector('link[rel="icon"]');
  favicon.href = document.body.classList.contains('dark')
    ? 'favicon-dark.svg'
    : 'favicon.svg';
}
updateFavicon();
// 🌙 Dark / Light Theme
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = 
    document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// 🌡️ °C ↔ °F Toggle
unitToggle.addEventListener("click", () => {
  isCelsius = !isCelsius;
  unitToggle.textContent = isCelsius ? "°F" : "°C";
  displayWeather();
});
