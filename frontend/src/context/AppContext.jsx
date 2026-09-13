import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchHybridForecast, fetchMetrics, fetchStates, fetchCities, fetchAreas, trainStateModel } from '../services/api';
import { generateDynamicAlerts, generateDynamicRecommendations } from '../utils/dynamicRiskEngine';
import { MULTI_PLANT_DATA } from '../config/roles';

const DEFAULT_SETTINGS = {
  operatorName: "",
  operatorRole: "Chief Grid Dispatcher",
  operatorDesk: "Gujarat SLDC - Gotri, Vadodara",
  operatorEmail: "dispatcher@sldc.gujarat.gov.in",
  solarCapacityMw: 100,
  windCapacityMw: 100,
  demandOffsetMw: 0,
  deficitThresholdMw: 15,
  cercToleranceBandPct: 10.0,
  batteryCapacityMwh: 50,
  batteryMaxRateMw: 20,
  batteryMinSocPct: 20,
  autoRefreshInterval: 30, // seconds: 0 = off, 15, 30, 60
  soundAlerts: true,
  emailAlerts: false,
  liveWeatherEnabled: true,
  defaultHorizon: 24,
  theme: "light"
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Assigned plant for plant operations engineer role
  const [assignedPlantId, setAssignedPlantId] = useState('sanand-solar');
  const assignedPlant = MULTI_PLANT_DATA.find(p => p.id === assignedPlantId) || MULTI_PLANT_DATA[0];

  // Load persistent settings from localStorage
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('renewai_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to load renewai_settings from localStorage", e);
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('renewai_settings', JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to persist renewai_settings", e);
      }
      return updated;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem('renewai_settings', JSON.stringify(DEFAULT_SETTINGS));
    } catch (e) {
      console.warn("Failed to reset renewai_settings", e);
    }
  };

  const [selectedState, setSelectedState] = useState('gujarat');
  const [selectedCity, setSelectedCity] = useState('ahmedabad');
  const [selectedArea, setSelectedArea] = useState('sanand');
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [horizon, setHorizon] = useState(settings.defaultHorizon || 24);
  const [liveMode, setLiveMode] = useState(settings.liveWeatherEnabled ?? true);
  const [forecastData, setForecastData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Track operator approved actions
  const [approvedActions, setApprovedActions] = useState([]);
  const [demoMode, setDemoMode] = useState(false);
  const [activeHorizonStep, setActiveHorizonStep] = useState(null);

  // Mobile navigation drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const toggleMobileSidebar = () => setMobileSidebarOpen(prev => !prev);

  // Initialize available states, cities, and areas
  useEffect(() => {
    fetchStates().then(st => setAvailableStates(st));
    fetchCities('gujarat').then(ct => {
      setAvailableCities(ct);
      const initCity = ct?.[0]?.id || 'ahmedabad';
      setSelectedCity(initCity);
      fetchAreas('gujarat', initCity).then(ar => {
        setAvailableAreas(ar);
        const initArea = ar?.[0]?.id || 'sanand';
        setSelectedArea(initArea);
        loadData(horizon, liveMode, 'gujarat', initCity, initArea);
      });
    });
  }, []);

  // When user switches State -> loads cities -> picks first city -> loads areas -> picks first area
  const handleSelectState = async (newState) => {
    setSelectedState(newState);
    const cities = await fetchCities(newState);
    setAvailableCities(cities);
    const defaultCity = cities && cities.length > 0 ? cities[0].id : null;
    setSelectedCity(defaultCity);
    if (defaultCity) {
      const areas = await fetchAreas(newState, defaultCity);
      setAvailableAreas(areas);
      const defaultArea = areas && areas.length > 0 ? areas[0].id : null;
      setSelectedArea(defaultArea);
      loadData(horizon, liveMode, newState, defaultCity, defaultArea);
    }
  };

  // When user switches City -> loads areas for that city -> picks first area
  const handleSelectCity = async (newCity) => {
    setSelectedCity(newCity);
    const areas = await fetchAreas(selectedState, newCity);
    setAvailableAreas(areas);
    const defaultArea = areas && areas.length > 0 ? areas[0].id : null;
    setSelectedArea(defaultArea);
    loadData(horizon, liveMode, selectedState, newCity, defaultArea);
  };

  // When user switches Area -> loads hyper-local data for that area
  const handleSelectArea = (newArea) => {
    setSelectedArea(newArea);
    loadData(horizon, liveMode, selectedState, selectedCity, newArea);
  };

  const loadData = async (hrs = horizon, live = liveMode, state = selectedState, city = selectedCity, area = selectedArea) => {
    setLoading(true);
    const [fcRes, metRes] = await Promise.all([
      fetchHybridForecast(hrs, live, state, city, area),
      fetchMetrics(state)
    ]);
    setForecastData(fcRes.data);
    setIsLiveConnected(fcRes.isLive);
    setMetrics(metRes.data);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    if (selectedState && selectedCity && selectedArea) {
      loadData(horizon, liveMode, selectedState, selectedCity, selectedArea);
    }
  }, [horizon, liveMode]);

  const handleTrainLocation = async () => {
    setTrainingLoading(true);
    const stateObj = availableStates.find(s => s.id === selectedState);
    const cityObj = availableCities.find(c => c.id === selectedCity);
    const areaObj = availableAreas.find(a => a.id === selectedArea);
    const areaName = areaObj ? areaObj.name.split('(')[0].trim() : (selectedArea || 'Area');
    const locName = `${areaName} (${cityObj ? cityObj.name : selectedCity}, ${stateObj ? stateObj.name : selectedState})`;
    
    setTrainingStatus(`Downloading 90-day ERA5 satellite reanalysis for ${areaName}...`);
    const res = await trainStateModel(selectedState, selectedCity, selectedArea);
    if (res.success) {
      setTrainingStatus(`XGBoost model trained in ${res.data.training_time_seconds}s for ${res.data.location}!`);
    } else {
      setTrainingStatus(`Synthesized local model for ${areaName}!`);
    }
    await loadData(horizon, liveMode, selectedState, selectedCity, selectedArea);
    setTrainingLoading(false);
    setTimeout(() => setTrainingStatus(null), 4500);
  };

  const approveAction = (actionId, details) => {
    setApprovedActions(prev => [
      ...prev,
      { id: actionId, timestamp: new Date().toLocaleTimeString(), details }
    ]);
  };

  // Background Auto-Telemetry Refresh based on settings
  useEffect(() => {
    const sec = Number(settings.autoRefreshInterval);
    if (!sec || sec <= 0) return;
    const interval = setInterval(() => {
      if (selectedState && selectedCity && selectedArea) {
        loadData(horizon, liveMode, selectedState, selectedCity, selectedArea);
      }
    }, sec * 1000);
    return () => clearInterval(interval);
  }, [settings.autoRefreshInterval, horizon, liveMode, selectedState, selectedCity, selectedArea]);

  // Scale telemetry dynamically with configured plant capacities
  const solarScale = (Number(settings.solarCapacityMw) || 100) / 100;
  const windScale = (Number(settings.windCapacityMw) || 100) / 100;
  const totalCapacityMw = (Number(settings.solarCapacityMw) || 100) + (Number(settings.windCapacityMw) || 100);

  const scaledForecastData = React.useMemo(() => {
    if (!forecastData) return null;
    const schedule = (forecastData.hourly_schedule || []).map(s => {
      const sol = Number((s.solar_generation_mw * solarScale).toFixed(2));
      const wnd = Number((s.wind_generation_mw * windScale).toFixed(2));
      const tot = Number((sol + wnd).toFixed(2));
      const demScale = totalCapacityMw / 200;
      const dem = Number((s.grid_demand_mw * demScale).toFixed(1));
      const bal = Number((tot - dem).toFixed(2));
      const thresh = Number(settings.deficitThresholdMw) || 15.0;
      const status = bal < -thresh ? "DEFICIT" : (bal > thresh ? "SURPLUS" : "BALANCED");
      return {
        ...s,
        solar_generation_mw: sol,
        wind_generation_mw: wnd,
        total_renewable_mw: tot,
        grid_demand_mw: dem,
        grid_balance_mw: bal,
        system_status: status
      };
    });

    const totalSolar = schedule.reduce((sum, h) => sum + h.solar_generation_mw, 0);
    const totalWind = schedule.reduce((sum, h) => sum + h.wind_generation_mw, 0);
    const totalEnergy = schedule.reduce((sum, h) => sum + h.total_renewable_mw, 0);
    const peakOut = schedule.length > 0 ? Math.max(...schedule.map(h => h.total_renewable_mw)) : 0;

    return {
      ...forecastData,
      total_capacity_mw: totalCapacityMw,
      solar_energy_mwh: Number(totalSolar.toFixed(2)),
      wind_energy_mwh: Number(totalWind.toFixed(2)),
      total_energy_mwh: Number(totalEnergy.toFixed(2)),
      peak_output_mw: Number(peakOut.toFixed(2)),
      hourly_schedule: schedule
    };
  }, [forecastData, solarScale, windScale, totalCapacityMw, settings.deficitThresholdMw]);

  const dynamicAlerts = generateDynamicAlerts(scaledForecastData, settings.deficitThresholdMw);
  const dynamicRecommendations = generateDynamicRecommendations(scaledForecastData, settings.deficitThresholdMw);
  const activeAlertsCount = dynamicAlerts.filter(a => a.status === 'Active').length;

  return (
    <AppContext.Provider value={{
      selectedState,
      setSelectedState: handleSelectState,
      selectedCity,
      setSelectedCity: handleSelectCity,
      selectedArea,
      setSelectedArea: handleSelectArea,
      alerts: dynamicAlerts,
      recommendations: dynamicRecommendations,
      activeAlertsCount,
      availableStates,
      availableCities,
      availableAreas,
      gujaratCities: availableCities, // backwards compatibility
      horizon,
      setHorizon,
      liveMode,
      setLiveMode,
      forecastData: scaledForecastData,
      metrics,
      isLiveConnected,
      loading,
      trainingLoading,
      trainingStatus,
      handleTrainLocation,
      lastUpdated,
      loadData,
      approvedActions,
      approveAction,
      demoMode,
      setDemoMode,
      activeHorizonStep,
      setActiveHorizonStep,
      assignedPlantId,
      setAssignedPlantId,
      assignedPlant,
      multiPlantList: MULTI_PLANT_DATA,
      settings,
      updateSettings,
      resetSettings,
      mobileSidebarOpen,
      setMobileSidebarOpen,
      toggleMobileSidebar
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

