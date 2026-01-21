
import { createRouter, createWebHistory } from 'vue-router';

import FruitView from "../views/FruitView.vue";

const routes = [
    { path: '/', redirect: '/test' },
    { path: '/fruit', component: FruitView },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
