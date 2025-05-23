import React, { useState, useEffect} from 'react';

import './WeatherModule.css';
import sun from './weatherIcons/sun.png';
import rain from './weatherIcons/rain.png';
import snow from './weatherIcons/snow.png';
import cloud from './weatherIcons/cloud.png';
import thunder from './weatherIcons/lightrainthunder.png';

import urlStart from '../Global';

function WeatherModule() {

  const [weatherCode , setWeatherCode] = useState(1000);
  const [weatherDesctiption , setWeatherDescription] = useState('Sunny');
  const [temperature , setTemperature] = useState(20);


  function setWeatherData(codeIn){
    setWeatherCode(codeIn);
  // Clear, Sunny
  if (codeIn === 1000) {
    setWeatherDescription('Sunny');
  }
  // Partly Cloudy, Mostly Cloudy, Cloudy
  else if ([1001, 1100, 1101, 1102, 1103].includes(codeIn)) {
    setWeatherDescription('Cloudy');
  }
  // Fog conditions
  else if ([2000, 2100].includes(codeIn)) {
    setWeatherDescription('Foggy');
  }
  // Rain conditions (drizzle, light rain, rain, heavy rain)
  else if ([4000, 4001, 4200, 4201].includes(codeIn)) {
    setWeatherDescription('Rain');
  }
  // Snow conditions
  else if ([5000, 5001, 5100, 5101].includes(codeIn)) {
    setWeatherDescription('Snow');
  }
  // Freezing rain conditions
  else if ([6000, 6001, 6200, 6201].includes(codeIn)) {
    setWeatherDescription('Freezing Rain');
  }
  // Ice pellets
  else if ([7000, 7101, 7102].includes(codeIn)) {
    setWeatherDescription('Ice Pellets');
  }
  // Thunderstorm
  else if (codeIn === 8000) {
    setWeatherDescription('Thunder');
  }
  // Default if no match
  else {
    setWeatherDescription('Unknown');
  }


  }

  function getWeatherIcon(codeIn){

  if (codeIn === 1000) return sun;
  

  if ([1001, 1100, 1101, 1102, 1103].includes(codeIn)) return cloud;
  

  if ([2000, 2100].includes(codeIn)) return cloud;
  

  if ([4000, 4001, 4200, 4201].includes(codeIn)) return rain;
  

  if ([5000, 5001, 5100, 5101].includes(codeIn)) return snow;
  

  if ([6000, 6001, 6200, 6201].includes(codeIn)) return rain; 
  

  if ([7000, 7101, 7102].includes(codeIn)) return snow;
  

  if (codeIn === 8000) return thunder;
  
  // Default to sun if no match
  return sun;

  }


  async function getWeather(){
    try {
      const response = await fetch(urlStart + 'api/getWeatherData',{
        method: 'GET',
        headers: {
          "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
          'Content-Type': 'application/json'
        },
      }
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('data:', data);
      console.log(data.data.values.temperature)
      setTemperature(data.data.values.temperature);
      setWeatherData(data.data.values.weatherCode);

    } catch (error) {
    }
  }

  useEffect(() => {
    getWeather();
  }, []);


  return (
    <div className='moduleBase'>
        <p> {weatherDesctiption}</p>
        <img src={getWeatherIcon(weatherCode)} className='weatherIcon'/>
    <p> {temperature}°C</p>
    </div>
  );
}

export default WeatherModule;