const express = require("express");
const router = express.Router();
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");

/**
 * GET /api/geocode/reverse
 * Reverse geocode coordinates to address
 */
router.get("/reverse", async (req, res) => {
  try {
    const { lat, lng, language = "en" } = req.query;

    if (!lat || !lng) {
      return sendError(res, "Latitude and longitude are required", HTTP_STATUS.BAD_REQUEST);
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "UniNest/1.0 (student housing platform)",
          "Accept-Language": language,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    return sendSuccess(res, data);
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return sendError(res, "Geocoding failed", HTTP_STATUS.SERVER_ERROR, error);
  }
});

/**
 * GET /api/geocode/search
 * Search for locations by query
 */
router.get("/search", async (req, res) => {
  try {
    const { q, language = "en", limit = 5 } = req.query;

    if (!q) {
      return sendError(res, "Search query is required", HTTP_STATUS.BAD_REQUEST);
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=${limit}`,
      {
        headers: {
          "User-Agent": "UniNest/1.0 (student housing platform)",
          "Accept-Language": language,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    return sendSuccess(res, data);
  } catch (error) {
    console.error("Geocoding search failed:", error);
    return sendError(res, "Geocoding search failed", HTTP_STATUS.SERVER_ERROR, error);
  }
});

/**
 * POST /api/geocode/nearby-places
 * Fetch nearby places using Overpass API
 */
router.post("/nearby-places", async (req, res) => {
  try {
    const { lat, lng, radius = 1500, categories = [] } = req.body;

    if (!lat || !lng) {
      return sendError(res, "Latitude and longitude are required", HTTP_STATUS.BAD_REQUEST);
    }

    const categoryQueries = categories.map(cat => {
      switch(cat) {
        case 'supermarket': return 'shop=supermarket';
        case 'restaurant': return 'amenity=restaurant';
        case 'pharmacy': return 'amenity=pharmacy';
        case 'bank': return 'amenity=bank';
        case 'bus_station': return 'highway=bus_stop';
        case 'cafe': return 'amenity=cafe';
        default: return '';
      }
    }).filter(Boolean);

    if (categoryQueries.length === 0) {
      return sendSuccess(res, []);
    }

    const query = `
      [out:json][timeout:25];
      (
        ${categoryQueries.map(cat => `node[${cat}](around:${radius},${lat},${lng});`).join('\n')}
      );
      out body;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'User-Agent': 'UniNest/1.0 (student housing platform)',
      },
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json();
    
    const places = data.elements.map(el => {
      let category = 'other';
      if (el.tags?.shop === 'supermarket') category = 'supermarket';
      else if (el.tags?.amenity === 'restaurant') category = 'restaurant';
      else if (el.tags?.amenity === 'pharmacy') category = 'pharmacy';
      else if (el.tags?.amenity === 'bank') category = 'bank';
      else if (el.tags?.highway === 'bus_stop') category = 'bus_station';
      else if (el.tags?.amenity === 'cafe') category = 'cafe';

      return {
        id: el.id,
        lat: el.lat,
        lng: el.lon,
        name: el.tags?.name || category,
        category,
      };
    }).slice(0, 50);

    return sendSuccess(res, places);
  } catch (error) {
    console.error("Nearby places fetch failed:", error);
    return sendError(res, "Failed to fetch nearby places", HTTP_STATUS.SERVER_ERROR, error);
  }
});

module.exports = router;
