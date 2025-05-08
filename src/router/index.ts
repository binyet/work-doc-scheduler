import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import { publicRouters } from './all';

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: publicRouters
});
export default router;
