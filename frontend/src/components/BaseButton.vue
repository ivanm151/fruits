<script setup>
import { computed } from "vue";

const props = defineProps({
  // Текст кнопки
  text: {
    type: String,
    required: true
  },
  // Состояние загрузки
  loading: {
    type: Boolean,
    default: false
  },
  // Отключено
  disabled: {
    type: Boolean,
    default: false
  },
  // Тип кнопки
  type: {
    type: String,
    default: 'primary', // 'primary', 'secondary', 'danger'
    validator: (value) => ['primary', 'secondary', 'danger'].includes(value)
  }
})

// Генерация текста с учётом состояния
const displayText = computed(() => {
  if (props.loading) return 'Загрузка...'
  return props.text
})
</script>

<template>
  <button
      :class="['base-button', `base-button--${type}`, { 'base-button--disabled': disabled || loading }]"
      :disabled="disabled || loading"
  >
    {{ displayText }}
  </button>
</template>

<style scoped lang="scss">
@use '../assets/styles/components/BaseButton';
</style>