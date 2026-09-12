import axios from 'axios';
import { MOCK_HYBRID_FORECAST, MOCK_METRICS } from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

export const STATIC_STATE_CITIES = {
  gujarat: [
    { id: 'kutch', name: 'Kutch / Khavda', solar_park: 'Khavda Ultra Mega Solar Block', wind_park: 'Kutch Wind Corridor' },
    { id: 'ahmedabad', name: 'Ahmedabad', solar_park: 'Ahmedabad Rooftop & Sanand Cluster', wind_park: 'Dholera Wind Feeder' },
    { id: 'surat', name: 'Surat', solar_park: 'Hazira Coastal Solar Zone', wind_park: 'Surat Coastal Wind Corridor' },
    { id: 'rajkot', name: 'Rajkot', solar_park: 'Rajkot District Solar Cluster', wind_park: 'Gondal / Saurashtra Wind Farm' },
    { id: 'vadodara', name: 'Vadodara', solar_park: 'Vadodara Clean Energy Feeder', wind_park: 'Savli Wind Farm' },
    { id: 'patan', name: 'Patan / Charanka', solar_park: 'Charanka Solar Park', wind_park: 'North Gujarat Wind Feeder' },
    { id: 'bhavnagar', name: 'Bhavnagar', solar_park: 'Bhavnagar Coastal Solar Project', wind_park: 'Alang / Khambhat Wind Project' },
    { id: 'jamnagar', name: 'Jamnagar', solar_park: 'Jamnagar Mega Solar Facility', wind_park: 'Jamnagar Wind Park' }
  ],
  rajasthan: [
    { id: 'jodhpur', name: 'Jodhpur / Bhadla', solar_park: 'Bhadla Solar Park', wind_park: 'Bhadla Wind-Solar Hybrid' },
    { id: 'jaisalmer', name: 'Jaisalmer', solar_park: 'Jaisalmer Ultra Mega Solar', wind_park: 'Jaisalmer Wind Farm' },
    { id: 'bikaner', name: 'Bikaner', solar_park: 'Bikaner Ultra Mega Solar Complex', wind_park: 'Bikaner Desert Wind Array' },
    { id: 'jaipur', name: 'Jaipur', solar_park: 'Jaipur Peripheral Solar Park', wind_park: 'Sambhar Lake Wind Corridor' },
    { id: 'barmer', name: 'Barmer', solar_park: 'Barmer Solar Project', wind_park: 'Thar Barmer Wind Park' }
  ],
  karnataka: [
    { id: 'pavagada', name: 'Pavagada / Tumakuru', solar_park: 'Pavagada Shakti Sthala Solar Park', wind_park: 'Tumkur Hybrid Wind Hub' },
    { id: 'bengaluru', name: 'Bengaluru', solar_park: 'Bengaluru Substation Solar Farm', wind_park: 'Devanahalli Wind Project' },
    { id: 'chitradurga', name: 'Chitradurga', solar_park: 'Chitradurga Solar Project', wind_park: 'Chitradurga Wind Park' },
    { id: 'ballari', name: 'Ballari (Bellary)', solar_park: 'Ballari Mining Belt Solar Farm', wind_park: 'Kudligi Wind Park' },
    { id: 'gadag', name: 'Gadag', solar_park: 'Gadag Solar Feeder', wind_park: 'Gadag Wind Energy Project' }
  ],
  tamil_nadu: [
    { id: 'kamuthi', name: 'Kamuthi / Ramanathapuram', solar_park: 'Kamuthi Solar Power Project', wind_park: 'Ramanathapuram Coastal Wind' },
    { id: 'muppandal', name: 'Muppandal / Kanyakumari', solar_park: 'Kanyakumari Clean Solar Plant', wind_park: 'Muppandal Wind Farm (India\'s Largest)' },
    { id: 'chennai', name: 'Chennai', solar_park: 'Sriperumbudur Industrial Solar Zone', wind_park: 'Ennore Coastal Wind Array' },
    { id: 'coimbatore', name: 'Coimbatore', solar_park: 'Coimbatore Solar Project', wind_park: 'Palakkad Pass Wind Farm' },
    { id: 'tirunelveli', name: 'Tirunelveli', solar_park: 'Kayathar Solar Farm', wind_park: 'Kayathar Wind Turbines' }
  ],
  madhya_pradesh: [
    { id: 'rewa', name: 'Rewa', solar_park: 'Rewa Ultra Mega Solar', wind_park: 'Rewa Wind-Solar Integrator' },
    { id: 'indore', name: 'Indore', solar_park: 'Pithampur Clean Tech Solar Park', wind_park: 'Dewas / Jamgodrani Wind Farm' },
    { id: 'bhopal', name: 'Bhopal', solar_park: 'Mandideep Solar Feeder', wind_park: 'Berasia Wind Farm' },
    { id: 'neemuch', name: 'Neemuch / Mandsaur', solar_park: 'Welspun Neemuch Solar Project', wind_park: 'Mandsaur Wind Cluster' }
  ],
  maharashtra: [
    { id: 'pune', name: 'Pune', solar_park: 'Chakan / Talegaon Solar Hub', wind_park: 'Satara / Chalkewadi Wind Farm' },
    { id: 'mumbai', name: 'Mumbai', solar_park: 'Navi Mumbai Green Solar Grid', wind_park: 'Khandala Pass Wind Feeder' },
    { id: 'nagpur', name: 'Nagpur', solar_park: 'MIHAN Solar Power Project', wind_park: 'Wardha Wind Feeder' },
    { id: 'dhule', name: 'Dhule / Sakri', solar_park: 'Sakri Mega Solar Park', wind_park: 'Brahmanvel Wind Farm' }
  ]
};

export const fetchStates = async () => {
  try {
    const res = await client.get('/states');
    return res.data.states;
  } catch (err) {
    return [
      { id: 'gujarat', name: 'Gujarat', default_city: 'kutch' },
      { id: 'rajasthan', name: 'Rajasthan', default_city: 'jodhpur' },
      { id: 'karnataka', name: 'Karnataka', default_city: 'pavagada' },
      { id: 'tamil_nadu', name: 'Tamil Nadu', default_city: 'kamuthi' },
      { id: 'madhya_pradesh', name: 'Madhya Pradesh', default_city: 'rewa' },
      { id: 'maharashtra', name: 'Maharashtra', default_city: 'pune' },
    ];
  }
};

export const fetchCities = async (state = 'gujarat') => {
  try {
    const res = await client.get(`/cities?state=${state}`);
    return res.data.cities;
  } catch (err) {
    return STATIC_STATE_CITIES[state] || STATIC_STATE_CITIES.gujarat;
  }
};

export const fetchAreas = async (state = 'gujarat', city = 'ahmedabad') => {
  try {
    const res = await client.get(`/areas?state=${state}&city=${city}`);
    return res.data.areas;
  } catch (err) {
    return [
      { id: 'substation_1', name: `${city.toUpperCase()} Primary Feeder`, substation: 'Regional Substation 66kV' },
      { id: 'substation_2', name: `${city.toUpperCase()} Industrial Grid`, substation: 'Industrial Substation 132kV' }
    ];
  }
};

export const fetchGujaratCities = async () => {
  return fetchCities('gujarat');
};

export const fetchHybridForecast = async (hours = 24, live = true, state = 'gujarat', city = null, area = null) => {
  try {
    let url = `/forecast/hybrid?state=${state}&hours=${hours}&live=${live}`;
    if (city) {
      url += `&city=${city}`;
    }
    if (area) {
      url += `&area=${area}`;
    }
    const res = await client.get(url);
    return { data: res.data, isLive: true };
  } catch (err) {
    console.warn(`Backend unreachable for state ${state} (${city} / ${area}), using cached profile:`, err.message);
    const fallback = { ...MOCK_HYBRID_FORECAST };
    return { data: fallback, isLive: false };
  }
};

export const trainStateModel = async (state = 'gujarat', city = null, area = null) => {
  try {
    let url = `/train?state=${state}`;
    if (city) {
      url += `&city=${city}`;
    }
    if (area) {
      url += `&area=${area}`;
    }
    const res = await client.post(url);
    return { success: true, data: res.data };
  } catch (err) {
    return { 
      success: false, 
      message: `Offline simulation: Local model synthesized for ${area || city || state}.` 
    };
  }
};

export const fetchMetrics = async (state = null) => {
  try {
    const url = state ? `/metrics?state=${state}` : '/metrics';
    const res = await client.get(url);
    return { data: res.data, isLive: true };
  } catch (err) {
    return { data: MOCK_METRICS, isLive: false };
  }
};
