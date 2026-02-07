<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import BaseInput from '../components/BaseInput.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseLabel from '../components/BaseLabel.vue'

const userStore = useUserStore()
const router = useRouter()

const isLoginMode = ref(true)
const login = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

// Валидация
const loginError = ref('')
const passwordError = ref('')

const validateForm = () => {
  loginError.value = ''
  passwordError.value = ''

  let isValid = true

  if (!login.value || login.value.length < 3) {
    loginError.value = 'Логин должен быть не менее 3 символов'
    isValid = false
  }

  if (!password.value || password.value.length < 6) {
    passwordError.value = 'Пароль должен быть не менее 6 символов'
    isValid = false
  }

  return isValid
}

// Обработка формы
const handleSubmit = async () => {
  if (!validateForm()) return

  error.value = ''
  loading.value = true

  try {
    if (isLoginMode.value) {
      await userStore.signIn(login.value, password.value)
      //console.log('[AuthView] Успешный вход:', userStore.user)
    } else {
      await userStore.signUp(login.value, password.value)
      //console.log('[AuthView] Успешная регистрация:', userStore.user)
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

<template>
  <div class="auth-container">
    <h1 class="text-h1">Добро пожаловать</h1>

    <!-- Переключение режима -->
    <div class="tabs">
      <BaseButton
          type="primary"
          :text="'Вход'"
          @click="isLoginMode = true"
          :class="{ active: isLoginMode }"
      />
      <BaseButton
          type="secondary"
          :text="'Регистрация'"
          @click="isLoginMode = false"
          :class="{ active: !isLoginMode }"
      />
    </div>

    <!-- Форма -->
    <form @submit.prevent="handleSubmit" class="auth-form">
      <div class="input-group">
        <BaseLabel text="Логин" required htmlFor="login-input" />
        <BaseInput
            id="login-input"
            v-model="login"
            placeholder="Введите логин"
            minlength="3"
            :error="loginError"
        />
      </div>

      <div class="input-group">
        <BaseLabel text="Пароль" required htmlFor="password-input" />
        <BaseInput
            id="password-input"
            v-model="password"
            type="password"
            placeholder="Введите пароль"
            minlength="6"
            :error="passwordError"
        />
      </div>

      <BaseButton
          :text="isLoginMode ? 'Войти' : 'Зарегистрироваться'"
          :loading="loading"
          type="primary"
          native-type="submit"
      />
    </form>

    <!-- Отображение общей ошибки -->
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/styles/components/AuthView';
</style>