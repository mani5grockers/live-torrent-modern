import axios from "axios";

const backend = axios.create({
  baseURL: "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor
backend.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
backend.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default backend;

// torrent service
export const getTorrentInfo = (torrentId) => {
  if (!torrentId) {
    return Promise.reject(new Error("Torrent ID is required"));
  }
  return backend.get("/torrent/info", { params: { torrentId } });
};

export const searchProviders = () => backend.get("/search/providers");
export const searchEngine = (params) => backend.get("/search", { params });

// yts movies service
export const getMoviesList = (params = {}) => backend.get("/yts/list", { params });
export const getMovieDetails = (id) => {
  if (!id) {
    return Promise.reject(new Error("Movie ID is required"));
  }
  return backend.get(`/yts/movie/${id}`);
};
export const getSuggestedMovies = (id) => {
  if (!id) {
    return Promise.reject(new Error("Movie ID is required"));
  }
  return backend.get(`/yts/movie/${id}/suggestions`);
};

// movies captions
export const loadCaptions = (imdbID) => {
  if (!imdbID) {
    return Promise.reject(new Error("IMDB ID is required"));
  }
  return backend.get("/captions", { params: { imdbid: imdbID } });
};
