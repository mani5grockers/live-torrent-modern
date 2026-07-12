import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("./views/Home.vue")
  },
  {
    path: "/explorer",
    name: "explorer",
    component: () => import("./views/Explorer.vue")
  },
  {
    path: "/player",
    name: "player",
    component: () => import("./views/Player.vue")
  },
  {
    path: "/search",
    name: "search",
    component: () => import("./views/Search.vue")
  },
  {
    path: "/movies",
    name: "movies",
    component: () => import("./views/movies/Movies.vue")
  },
  {
    path: "/movies/:id",
    name: "movie",
    component: () => import("./views/movies/Movie.vue")
  },
  {
    path: "/bookmarks",
    name: "bookmarks",
    component: () => import("./views/Bookmarks.vue")
  },
  {
    path: "/about",
    name: "about",
    component: () => import("./views/About.vue")
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("./views/NotFound.vue")
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
