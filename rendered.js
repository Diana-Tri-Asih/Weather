const API_KEY = 'https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric'; // Ganti dengan API key kamu
const canvas = document.getElementById('weatherCanvas');
const ctx = canvas.getContext('2d');

// Weather emoji 
const weatherEmoji = {
  sunny:  '\u2600\uFE0F',       
  rainy:  '\u2614\uFE0F',      
  cloudy: '\u2601\uFE0F',      
  snowy:  '\u2744\uFE0F',       
  clear:  '\uD83C\uDF24\uFE0F'  
};

const messages = {
  sunny:  ['Cerah banget hari ini!'],
  rainy:  ['Hujan nih, bawa payung ya!'],
  cloudy: ['Berawan tapi masih oke kok!'],
  snowy:  ['Salju turun!'],
  clear:  ['Langit cerah banget!']
};

function drawPixelArt(weatherType) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const emoji = weatherEmoji[weatherType] || weatherEmoji.cloudy;

  ctx.font = '80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, canvas.width / 2, canvas.height / 2);
}

function getWeatherType(main, description) {
  main = main.toLowerCase();
  description = description.toLowerCase();

  if (main.includes('clear')) return 'sunny';
  if (main.includes('rain') || main.includes('drizzle')) return 'rainy';
  if (main.includes('snow')) return 'snowy';
  if (main.includes('cloud')) return 'cloudy';
  return 'cloudy';
}

function getRandomMessage(weatherType) {
  const msgs = messages[weatherType] || messages.cloudy;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// Location (Lucide) 
function setLocation(name) {
  const el = document.getElementById('location');
  el.innerHTML = `<span class="icon"><i data-lucide="map-pin"></i></span> ${name}`;
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function getWeather(city = 'Jakarta') {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=id`
    );
    const data = await response.json();

    if (data.cod !== 200) {
      throw new Error(data.message);
    }

    const weatherType = getWeatherType(data.weather[0].main, data.weather[0].description);
    const temp = Math.round(data.main.temp);
    const location = data.name;
    const humidity = data.main.humidity;
    const wind = Math.round(data.wind.speed * 3.6); // m/s to km/h

    document.getElementById('temperature').textContent = `${temp}\u00B0C`;
    setLocation(location);
    document.getElementById('humidity').textContent = humidity;
    document.getElementById('wind').textContent = wind;
    document.getElementById('weatherMessage').textContent = getRandomMessage(weatherType);

    drawPixelArt(weatherType);

  } catch (error) {
    console.error('Error fetching weather:', error);
    document.getElementById('weatherMessage').textContent = 'Waduh, error nih! Coba lagi ya~';
    setLocation('--');
  }
}

function refreshWeather() {
  const cityInput = document.getElementById('cityInput');
  const city = cityInput.value.trim() || 'Jakarta';

  document.getElementById('weatherMessage').textContent = 'Loading...';
  getWeather(city);
}

function searchCity(event) {
  if (event.key === 'Enter') {
    refreshWeather();
  }
}

function minimizeWindow() {
  require('electron').remote.getCurrentWindow().minimize();
}

function closeWindow() {
  require('electron').remote.getCurrentWindow().close();
}

// Load weather on start
refreshWeather();

// Auto refresh every 10 minutes
setInterval(refreshWeather, 600000);