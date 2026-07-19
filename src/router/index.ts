import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/new-game', name: 'new-game', component: () => import('@/views/NewGameView.vue') },
  { path: '/game', name: 'game', component: () => import('@/views/GameView.vue') },
  {
    path: '/saved-games',
    name: 'saved-games',
    component: () => import('@/views/SavedGamesView.vue'),
  },
  { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
