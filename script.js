const WEATHER_CODES = {
    0:  { desc: "Clear sky", icon: "☀️", theme: "clear", message: "Clear skies — a great time to get outside." },
    1:  { desc: "Mainly clear", icon: "🌤️", theme: "clear", message: "Mostly clear skies with a little cloud cover." },
    2:  { desc: "Partly cloudy", icon: "⛅", theme: "cloudy", message: "A mix of sunshine and clouds today." },
    3:  { desc: "Overcast", icon: "☁️", theme: "cloudy", message: "A cloudy day ahead. Keep things comfortable." },
    45: { desc: "Foggy", icon: "🌫️", theme: "fog", message: "Visibility may be reduced. Take it easy on the roads." },
    48: { desc: "Rime fog", icon: "🌫️", theme: "fog", message: "Foggy conditions are hanging around." },
    51: { desc: "Light drizzle", icon: "🌦️", theme: "rain", message: "A light drizzle is in the forecast." },
    53: { desc: "Moderate drizzle", icon: "🌦️", theme: "rain", message: "Don't forget a light layer for the drizzle." },
    55: { desc: "Dense drizzle", icon: "🌧️", theme: "rain", message: "A wetter day — an umbrella could be useful." },
    61: { desc: "Slight rain", icon: "🌧️", theme: "rain", message: "Light rain is around. An umbrella may come in handy." },
    63: { desc: "Moderate rain", icon: "🌧️", theme: "rain", message: "Rainy conditions today. Stay dry out there." },
    65: { desc: "Heavy rain", icon: "🌧️", theme: "rain", message: "Heavy rain is expected. Plan accordingly." },
    71: { desc: "Slight snow", icon: "🌨️", theme: "snow", message: "Snowy conditions — wrap up warm." },
    73: { desc: "Moderate snow", icon: "❄️", theme: "snow", message: "A proper winter day. Keep warm." },
    75: { desc: "Heavy snow", icon: "❄️", theme: "snow", message: "Heavy snow is around. Travel carefully." },
    77: { desc: "Snow grains", icon: "🌨️", theme: "snow", message: "Cold and snowy conditions today." },
    80: { desc: "Slight rain showers", icon: "🌦️", theme: "rain", message: "Passing showers are possible." },
    81: { desc: "Moderate rain showers", icon: "🌧️", theme: "rain", message: "Keep an umbrella nearby for the showers." },
    82: { desc: "Violent rain showers", icon: "⛈️", theme: "storm", message: "Strong showers are possible. Stay weather-aware." },
    85: { desc: "Slight snow showers", icon: "🌨️", theme: "snow", message: "Snow showers may pass through." },
    86: { desc: "Heavy snow showers", icon: "❄️", theme: "snow", message: "Heavy snow showers are possible." },
    95: { desc: "Thunderstorm", icon: "⛈️", theme: "storm", message: "Thunderstorms are possible. Stay safe indoors if needed." },
    96: { desc: "Thunderstorm with hail", icon: "⛈️", theme: "storm", message: "Thunderstorms with hail are possible." },
    99: { desc: "Thunderstorm with heavy hail", icon: "⛈️", theme: "storm", message: "Severe thunderstorm conditions are possible." }
  };
  
  const statusEl = document.getElementById("status");
  const weatherCard = document.getElementById("weatherCard");
  const searchForm = document.getElementById("searchForm");
  const cityInput = document.getElementById("cityInput");
  const locationBtn = document.getElementById("locationBtn");
  const statusTitle = document.getElementById("statusTitle");
  const statusMessage = document.getElementById("statusMessage");
  const updatedText = document.getElementById("updatedText");
  
  let currentTimeTimer;
  
  function showLoading(title, message = "Getting the latest weather...") {
    statusEl.classList.remove("hidden", "error");
    statusTitle.textContent = title;
    statusMessage.textContent = message;
    weatherCard.classList.remove("visible");
  
    locationBtn.disabled = true;
    locationBtn.style.opacity = "0.65";
  }
  
  function hideStatus() {
    statusEl.classList.add("hidden");
  
    locationBtn.disabled = false;
    locationBtn.style.opacity = "1";
  }
  
  function showError(message) {
    statusEl.classList.remove("hidden");
    statusEl.classList.add("error");
  
    statusTitle.textContent = "Something went wrong";
    statusMessage.textContent = message;
  
    weatherCard.classList.remove("visible");
  
    locationBtn.disabled = false;
    locationBtn.style.opacity = "1";
  }
  
  function getWeatherInfo(code) {
    return WEATHER_CODES[code] || {
      desc: "Unknown conditions",
      icon: "🌡️",
      theme: "cloudy",
      message: "Current weather information is available."
    };
  }
  
  function windDirection(degrees) {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  
    return dirs[Math.round(degrees / 45) % 8];
  }
  
  function formatDateTime(date = new Date()) {
    const dateText = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric"
    }).format(date);
  
    const timeText = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  
    return {
      dateText,
      timeText
    };
  }
  
  function updateClock() {
    const {
      dateText,
      timeText
    } = formatDateTime();
  
    document.getElementById("currentDate").textContent = dateText;
    document.getElementById("currentTime").textContent = timeText;
  }
  
  function startClock() {
    clearInterval(currentTimeTimer);
  
    updateClock();
  
    currentTimeTimer = setInterval(updateClock, 30000);
  }
  
  function setTheme(theme) {
    document.body.dataset.theme = theme;
  }
  
  async function fetchWeather(lat, lon, locationLabel, locationDetail) {
    const url = new URL(
      "https://api.open-meteo.com/v1/forecast"
    );
  
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lon);
  
    url.searchParams.set(
      "current",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "precipitation"
      ].join(",")
    );
  
    url.searchParams.set("timezone", "auto");
  
    const res = await fetch(url);
  
    if (!res.ok) {
      throw new Error(
        "The weather service is temporarily unavailable."
      );
    }
  
    const data = await res.json();
  
    const current = data.current;
  
    const info = getWeatherInfo(
      current.weather_code
    );
  
    const unit =
      data.current_units.temperature_2m;
  
    document.getElementById(
      "locationName"
    ).textContent = locationLabel;
  
    document.getElementById(
      "locationDetail"
    ).textContent =
      locationDetail || "Current location";
  
    document.getElementById(
      "weatherVisual"
    ).textContent = info.icon;
  
    document.getElementById(
      "temperature"
    ).textContent =
      `${Math.round(current.temperature_2m)}${unit}`;
  
    document.getElementById(
      "feelsLike"
    ).textContent =
      `Feels like ${Math.round(current.apparent_temperature)}${unit}`;
  
    document.getElementById(
      "condition"
    ).textContent = info.desc;
  
    document.getElementById(
      "humidity"
    ).textContent =
      `${current.relative_humidity_2m}%`;
  
    document.getElementById(
      "windSpeed"
    ).textContent =
      `${current.wind_speed_10m} ${data.current_units.wind_speed_10m}`;
  
    document.getElementById(
      "windDirection"
    ).textContent =
      windDirection(current.wind_direction_10m);
  
    document.getElementById(
      "precipitation"
    ).textContent =
      `${current.precipitation} ${data.current_units.precipitation}`;
  
    document.getElementById(
      "weatherMessage"
    ).textContent = info.message;
  
    document.getElementById(
      "coordinates"
    ).textContent =
      `${Number(lat).toFixed(2)}°, ${Number(lon).toFixed(2)}°`;
  
    setTheme(info.theme);
  
    updatedText.textContent =
      `Updated ${new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date())}`;
  
    hideStatus();
  
    weatherCard.classList.remove("visible");
  
    requestAnimationFrame(() => {
      weatherCard.classList.add("visible");
    });
  
    startClock();
  }
  
  async function searchByCity(city) {
    showLoading(
      `Searching for "${city}"`,
      "Finding the best matching location..."
    );
  
    const geoUrl = new URL(
      "https://geocoding-api.open-meteo.com/v1/search"
    );
  
    geoUrl.searchParams.set("name", city);
    geoUrl.searchParams.set("count", "1");
    geoUrl.searchParams.set("language", "en");
    geoUrl.searchParams.set("format", "json");
  
    const geoRes = await fetch(geoUrl);
  
    if (!geoRes.ok) {
      throw new Error(
        "Unable to search for that location right now."
      );
    }
  
    const geoData = await geoRes.json();
  
    if (
      !geoData.results ||
      geoData.results.length === 0
    ) {
      throw new Error(
        `No results found for "${city}". Try another spelling.`
      );
    }
  
    const place = geoData.results[0];
  
    const label = place.name;
  
    const detail = [
      place.admin1,
      place.country
    ]
      .filter(Boolean)
      .join(", ");
  
    showLoading(
      `Loading ${label}`,
      "Fetching the latest weather conditions..."
    );
  
    await fetchWeather(
      place.latitude,
      place.longitude,
      label,
      detail
    );
  }
  
  function loadByGeolocation() {
    if (!navigator.geolocation) {
      showError(
        "Geolocation is not supported by your browser. Search for a city instead."
      );
  
      return;
    }
  
    showLoading(
      "Detecting your location",
      "Please allow location access if your browser asks."
    );
  
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const {
            latitude,
            longitude
          } = pos.coords;
  
          showLoading(
            "Loading your weather",
            "Almost there..."
          );
  
          await fetchWeather(
            latitude,
            longitude,
            "Your Location",
            `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`
          );
  
        } catch (err) {
  
          showError(
            err.message ||
            "Could not load weather data."
          );
        }
      },
  
      (err) => {
  
        const messages = {
          1: "Location access was denied. Search for a city or allow location access.",
          2: "Unable to determine your location. Try searching for a city.",
          3: "Location request timed out. Please try again."
        };
  
        showError(
          messages[err.code] ||
          "Could not get your location."
        );
      },
  
      {
        enableHighAccuracy: false,
        timeout: 10000
      }
    );
  }
  
  searchForm.addEventListener(
    "submit",
    async (event) => {
  
      event.preventDefault();
  
      const city =
        cityInput.value.trim();
  
      if (!city) {
  
        showError(
          "Enter a city name to search."
        );
  
        cityInput.focus();
  
        return;
      }
  
      try {
  
        await searchByCity(city);
  
      } catch (err) {
  
        showError(
          err.message ||
          "Something went wrong while searching."
        );
      }
    }
  );
  
  locationBtn.addEventListener(
    "click",
    loadByGeolocation
  );
  
  updateClock();
  
  loadByGeolocation();