<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Основные данные результата
  fruit: {
    type: String,
    required: true
  },
  confidence_1: {
    type: Number,
    required: true
  },
  // Свежесть: true, false или null (не определено)
  isFresh: {
    type: [Boolean, null],
    default: null
  },
  confidence_2: {
    type: [Number, null],
    default: null
  },
  // Топ-3 фруктов
  fruit_top3: {
    type: Array,
    default: () => []
  },
  // Обрезанное изображение (base64)
  cropped_base64: {
    type: String,
    default: null
  }
})

// Форматированное доверие
const confidenceFruitPercent = computed(() => {
  return (props.confidence_1 * 100).toFixed(2)
})

const confidenceFreshnessPercent = computed(() => {
  if (props.confidence_2 === null || isNaN(props.confidence_2)) return 'недоступно'
  return (props.confidence_2 * 100).toFixed(2)
})

// Текст статуса свежести
const freshnessText = computed(() => {
  if (props.isFresh === true) return '✅ Да'
  if (props.isFresh === false) return '❌ Нет'
  return '🟡 Не определено'
})

// Цвет текста свежести
const freshnessClass = computed(() => {
  if (props.isFresh === true) return 'fresh'
  if (props.isFresh === false) return 'rotten'
  return 'unknown'
})
</script>

<template>
  <div class="result-card">
    <!-- Картинка -->
    <div v-if="cropped_base64" class="result-card__image">
      <img
          :src="`data:image/png;base64,${cropped_base64}`"
          alt="Обрезанный фрагмент фрукта"
          class="result-card__img"
      />
    </div>

    <!-- Информация -->
    <div class="result-card__info">
      <p><strong>Фрукт:</strong> {{ fruit }}</p>
      <p><strong>Доверие:</strong> {{ confidenceFruitPercent }}%</p>

      <!-- Топ-3 фруктов -->
      <div v-if="fruit_top3.length > 1" class="result-card__top3">
        <strong>Топ-3 предположений:</strong>
        <ul>
          <li v-for="(item, index) in fruit_top3" :key="index">
            {{ index + 1 }}. {{ item.fruit }} — {{ (item.confidence * 100).toFixed(2) }}%
          </li>
        </ul>
      </div>

      <!-- Свежесть -->
      <p>
        <strong>Свежий:</strong>
        <span :class="`result-card__freshness ${freshnessClass}`">
          {{ freshnessText }}
        </span>
      </p>

      <!-- Доверие свежести -->
      <p>
        <strong>Доверие свежести:</strong>
        <span v-if="confidence_2 !== null && !isNaN(confidence_2)">
          {{ confidenceFreshnessPercent }}%
        </span>
        <span v-else>недоступно</span>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/styles/components/ResultCard';
</style>