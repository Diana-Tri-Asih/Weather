const { ipcRenderer } = require('electron');

// API KEY 
const API_KEY = 'c5904b7ec90aff016c6c343caf4db43d';

const canvas = document.getElementById('weatherCanvas');
const ctx = canvas.getContext('2d');

// Weather emoji untuk canvas 
const weatherEmoji = {
  sunny: '\u2600\uFE0F',   
  rainy: '\u2614',          
  cloudy: '\u2601\uFE0F',   
  clear: '\uD83C\uDF24\uFE0F', 
  snow: '\u2744\uFE0F'    
};

const messages = {
  sunny: ['Cerah banget hari ini!'],
  rainy: ['Hujan nih, bawa payung ya!'],
  cloudy: ['Berawan tapi masih oke kok!'],
  clear: ['Langit cerah banget!']
};

// Draw emoji character on canvas
function drawCharacter(weatherType) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const emoji = weatherEmoji[weatherType] || weatherEmoji.cloudy;
  
  ctx.font = '80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, canvas.width / 2, canvas.height / 2);
}

// Get weather type from API response
function getWeatherType(main) {
  const m = main.toLowerCase();
  if (m.includes('clear')) return 'clear';
  if (m.includes('rain')) return 'rainy';
  if (m.includes('cloud')) return 'cloudy';
  if (m.includes('sun')) return 'sunny';
  return 'cloudy';
}

// Get random message
function getRandomMessage(weatherType) {
  const msgs = messages[weatherType] || messages.cloudy;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// Location display (Lucide icon)
function setLocation(name) {
  const el = document.getElementById('location');
  el.innerHTML = `<span class="icon"><i data-lucide="map-pin"></i></span> ${name}`;
  lucide.createIcons(); 
}

// Fetch weather data
async function fetchWeather(city) {
  try {
    document.getElementById('weatherMessage').textContent = 'Tunggu sebentar ya~';
    document.getElementById('weatherMessage').classList.add('loading');
    
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    
    console.log('Fetching:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Response:', data);
    
    if (data.cod !== 200) {
      throw new Error(data.message || 'City not found');
    }
    
    const weatherType = getWeatherType(data.weather[0].main);
    const temp = Math.round(data.main.temp);
    const location = data.name;
    const humidity = data.main.humidity;
    const windSpeed = Math.round(data.wind.speed * 3.6);
    
    document.getElementById('temperature').textContent = `${temp}\u00B0C`; // °C
    setLocation(location);
    document.getElementById('humidity').textContent = humidity;
    document.getElementById('wind').textContent = windSpeed;
    document.getElementById('weatherMessage').textContent = getRandomMessage(weatherType);
    document.getElementById('weatherMessage').classList.remove('loading');
    
    drawCharacter(weatherType);
    
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('weatherMessage').textContent = 
      `Error: ${error.message} \nCek API key atau nama kota ya!`;
    document.getElementById('weatherMessage').classList.remove('loading');
    
    document.getElementById('temperature').textContent = '--\u00B0C';
    setLocation('--');
    document.getElementById('humidity').textContent = '--';
    document.getElementById('wind').textContent = '--';
  }
}

// Event listeners
document.getElementById('btnMinimize').addEventListener('click', () => {
  ipcRenderer.send('minimize');
});

document.getElementById('btnClose').addEventListener('click', () => {
  ipcRenderer.send('close');
});

document.getElementById('btnSearch').addEventListener('click', () => {
  const city = document.getElementById('cityInput').value.trim();
  if (city) fetchWeather(city);
});

document.getElementById('btnRefresh').addEventListener('click', () => {
  const city = document.getElementById('cityInput').value.trim() || 'Jakarta';
  fetchWeather(city);
});

document.getElementById('cityInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const city = document.getElementById('cityInput').value.trim();
    if (city) fetchWeather(city);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  drawCharacter('cloudy');
  setLocation('--');
  setTimeout(() => {
    fetchWeather('Jakarta');
  }, 500);
});