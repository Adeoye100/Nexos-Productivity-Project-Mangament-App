import { Router } from "express";

const router = Router();

router.get("/weather", async (req, res) => {
  const { lat, lon, q } = req.query as {
    lat?: string;
    lon?: string;
    q?: string;
  };

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: "OPENWEATHER_API_KEY is not configured" });
    return;
  }

  let url = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=imperial`;

  if (lat && lon) {
    url += `&lat=${lat}&lon=${lon}`;
  } else if (q) {
    url += `&q=${encodeURIComponent(q)}`;
  } else {
    res.status(400).json({ error: "Location parameters required (lat/lon or q)" });
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errData = await response.json();
      res.status(response.status).json({ error: "Failed to fetch weather data", details: errData });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    req.log.error({ error }, "Weather API error");
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

export default router;
