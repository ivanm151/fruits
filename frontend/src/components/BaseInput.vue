<script setup>
// Определяем пропсы
defineProps({
  // Тип input: text, password, email и т.д.
  type: {
    type: String,
    default: 'text'
  },
  // Плейсхолдер
  placeholder: {
    type: String,
    default: ''
  },
  // Значение (для v-model)
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // Ошибка (если есть)
  error: {
    type: String,
    default: ''
  },
  // Минимальная длина
  minlength: {
    type: Number,
    default: null
  },
  // Максимальная длина
  maxlength: {
    type: Number,
    default: null
  },
  // Отключено
  disabled: {
    type: Boolean,
    default: false
  }
})

// Эмитим обновление значения (для v-model)
const emit = defineEmits(['update:modelValue'])

const handleChange = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="base-input__wrapper">
    <!-- Поле ввода -->
    <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :minlength="minlength"
        :maxlength="maxlength"
        :disabled="disabled"
        @input="handleChange"
        class="base-input"
        :class="{ 'base-input--error': !!error }"
    />

    <!-- Сообщение об ошибке -->
    <p v-if="error" class="base-input__error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/styles/components/BaseInput';
</style>