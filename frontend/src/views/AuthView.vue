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

<style scoped lang="scss">
@use '../assets/styles/components/AuthView';
</style>