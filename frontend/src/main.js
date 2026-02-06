import './assets/styles/main.scss';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import {useUserStore} from "./stores/user.js";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount('#app');

// Инициализация пользователя из localStorage
const userStore = useUserStore()
userStore.init() // ← ключевая строка!