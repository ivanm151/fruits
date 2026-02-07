<script setup>
defineProps({
  // Текст метки
  text: {
    type: String,
    required: true
  },
  // Пометка "обязательное поле"
  required: {
    type: Boolean,
    default: false
  },
  // HTML for атрибут (если привязан к input)
  htmlFor: {
    type: String,
    default: undefined
  }
})
</script>

<template>
  <label
      :for="htmlFor"
      class="base-label"
  >
    {{ text }}
    <span v-if="required" class="base-label__required">*</span>
  </label>
</template>

<style scoped lang="scss">
@use '../assets/styles/components/BaseButton';
</style>