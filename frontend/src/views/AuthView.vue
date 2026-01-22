<template>
  <div class="auth-container">
    <h1>Добро пожаловать</h1>

    <!-- Переключение режима -->
    <div class="tabs">
      <button @click="isLoginMode = true" :class="{ active: isLoginMode }">
        Вход
      </button>
      <button @click="isLoginMode = false" :class="{ active: !isLoginMode }">
        Регистрация
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="auth-form">
      <input
          v-model="login"
          type="text"
          placeholder="Логин"
          required
          minlength="3"
      />
      <input
          v-model="password"
          type="password"
          placeholder="Пароль"
          required
          minlength="6"
      />

      <button type="submit" :disabled="loading">
        {{ loading ? 'Загрузка...' : (isLoginMode ? 'Войти' : 'Зарегистрироваться') }}
      </button>
    </form>

    <!-- Отображение ошибки -->
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const isLoginMode = ref(true)
const login = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// Обработка формы
const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    if (isLoginMode.value) {
      await userStore.signIn(login.value, password.value)
      console.log('[AuthView] Успешный вход:', userStore.user)
    } else {
      await userStore.signUp(login.value, password.value)
      console.log('[AuthView] Успешная регистрация:', userStore.user)
    }
    router.push('/')
  } catch (err) {
    error.value = err.message
    console.error('[AuthView] Ошибка авторизации:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
}

.tabs button {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  background: #f8f8f8;
  cursor: pointer;
}

.tabs button.active {
  background: #007bff;
  color: white;
  font-weight: bold;
}

.auth-form input {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.auth-form button {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.auth-form button:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
  font-size: 14px;
}
</style>