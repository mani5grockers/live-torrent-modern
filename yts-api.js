import express from "express";
import axios from "axios";

const router = express.Router();

// YTS API base URLs with fallbacks
const YTS_BASE_URLS = [
  "https://yts.mx/api/v2",
  "https://yts.lt/api/v2",
  "https://yts.am/api/v2"
];

let currentYtsIndex = 0;

const getYtsUrl = () => YTS_BASE_URLS[currentYtsIndex];

const fetchWithFallback = async (endpoint, params = {}) => {
  for (let i = 0; i < YTS_BASE_URLS.length; i++) {
    try {
      const response = await axios.get(`${YTS_BASE_URLS[i]}${endpoint}`, {
        params,
        timeout: 10000
      });
      currentYtsIndex = i; // Update working index
      return response.data;
    } catch (error) {
      console.warn(`YTS API attempt ${i + 1} failed:`, error.message);
      if (i === YTS_BASE_URLS.length - 1) {
        throw error;
      }
    }
  }
};

// Input validation
const validateQueryParams = (params) => {
  const validated = {};
  
  if (params.query_term) validated.query_term = String(params.query_term).substring(0, 100);
  if (params.page) validated.page = Math.min(Math.max(parseInt(params.page) || 1, 1), 100);
  if (params.genre) validated.genre = String(params.genre).substring(0, 50);
  if (params.limit) validated.limit = Math.min(Math.max(parseInt(params.limit) || 20, 1), 50);
  if (params.minimum_rating) validated.minimum_rating = Math.min(Math.max(parseFloat(params.minimum_rating) || 0, 0), 10);
  if (params.sort_by) validated.sort_by = String(params.sort_by).substring(0, 50);
  if (params.order_by) validated.order_by = ["asc", "desc"].includes(params.order_by) ? params.order_by : "desc";
  
  return validated;
};

router.get("/list", async (req, res) => {
  try {
    const { query: q } = req;
    const params = validateQueryParams({
      query_term: q.query || q.q || "",
      page: q.page || q.p || 1,
      genre: q.genre || q.g || "all",
      limit: q.limit || q.l || 20,
      minimum_rating: q.rate || q.r || 0,
      sort_by: q.sort || q.s || "date_added",
      order_by: q.order || q.o || "desc"
    });

    const data = await fetchWithFallback("/list_movies.json", {
      ...params,
      with_rt_ratings: true
    });

    res.json(data);
  } catch (error) {
    console.error("YTS list error:", error.message);
    res.status(500).json({
      status: "error",
      status_message: "Failed to fetch movie list from YTS API"
    });
  }
});

router.get("/movie/:id", async (req, res) => {
  try {
    const movieId = req.params.id.replace(/[^a-zA-Z0-9-]/g, "");
    
    if (!movieId) {
      return res.status(400).json({
        status: "error",
        status_message: "Invalid movie ID"
      });
    }

    const data = await fetchWithFallback("/movie_details.json", {
      with_images: true,
      with_cast: true,
      movie_id: movieId
    });

    res.json(data);
  } catch (error) {
    console.error("YTS movie details error:", error.message);
    res.status(500).json({
      status: "error",
      status_message: "Failed to fetch movie details from YTS API"
    });
  }
});

router.get("/movie/:id/suggestions", async (req, res) => {
  try {
    const movieId = req.params.id.replace(/[^a-zA-Z0-9-]/g, "");
    
    if (!movieId) {
      return res.status(400).json({
        status: "error",
        status_message: "Invalid movie ID"
      });
    }

    const data = await fetchWithFallback("/movie_suggestions.json", {
      movie_id: movieId
    });

    res.json(data);
  } catch (error) {
    console.error("YTS suggestions error:", error.message);
    res.status(500).json({
      status: "error",
      status_message: "Failed to fetch movie suggestions from YTS API"
    });
  }
});

export default router;
