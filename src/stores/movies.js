import { defineStore } from "pinia";
import {
  getMoviesList,
  getSuggestedMovies,
  getMovieDetails
} from "../utils/axios";

export const useMoviesStore = defineStore("movies", {
  state: () => ({
    res: null
  }),
  
  getters: {
    page: (state) => (state.res ? state.res.page_number : 1),
    pages: (state) => (state.res ? Math.ceil(state.res.movie_count / state.res.limit) : 1),
    movies: (state) => (state.res ? state.res.movies : [])
  },
  
  actions: {
    async loadMoviesList(params = {}) {
      try {
        const res = await getMoviesList(params);
        if (res.data.status !== "ok") {
          throw new Error(res.data.status_message);
        }
        this.res = res.data.data;
        return res.data.data;
      } catch (error) {
        console.error("Failed to load movies list:", error);
        throw error;
      }
    },
    
    async loadMovieDetails(id) {
      try {
        const res = await getMovieDetails(id);
        if (res.data.status !== "ok") {
          throw new Error(res.data.status_message);
        }
        return res.data.data.movie;
      } catch (error) {
        console.error("Failed to load movie details:", error);
        throw error;
      }
    },
    
    async loadSuggestedMovies(id) {
      try {
        const res = await getSuggestedMovies(id);
        if (res.data.status !== "ok") {
          throw new Error(res.data.status_message);
        }
        return res.data.data.movies;
      } catch (error) {
        console.error("Failed to load suggested movies:", error);
        throw error;
      }
    },
    
    async loadMoviePage(id) {
      try {
        const movie = await this.loadMovieDetails(id);
        const suggestedMovies = await this.loadSuggestedMovies(id);
        return {
          ...movie,
          suggestedMovies
        };
      } catch (error) {
        console.error("Failed to load movie page:", error);
        throw error;
      }
    }
  }
});