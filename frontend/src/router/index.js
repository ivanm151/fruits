import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import MainView from '../views/MainView.vue'

const routes = [
    {
        path: '/auth',
        name: 'Auth',
        component: AuthView,
        meta: { requiresGuest: true } // только для неавторизованных
    },
    {
        path: '/',
        name: 'Main',
        component: MainView,
        meta: { requiresAuth: true } // только для авторизованных
    },
    {
        path: '/:catchAll(.*)',
        redirect: '/auth'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Глобальная навигационная защита
router.beforeEach((to, from, next) => {
    const user = localStorage.getItem('user')

    if (to.meta.requiresAuth && !user) {
        next('/auth')
    } else if (to.meta.requiresGuest && user) {
        next('/')
    } else {
        next()
    }
})

export default router