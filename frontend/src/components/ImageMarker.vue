<script setup>
import { ref, computed, defineEmits } from 'vue'
import BaseLabel from './BaseLabel.vue'

// Пропсы
const props = defineProps({
  // URL изображения (после выбора файла)
  previewUrl: {
    type: String,
    required: true
  },
  // Оригинальные координаты маркера
  originalPointX: {
    type: Number,
    default: null
  },
  originalPointY: {
    type: Number,
    default: null
  }
})

// Эмит событий
const emit = defineEmits(['update:originalPointX', 'update:originalPointY'])

// Ссылка на изображение
const imageRef = ref(null)

// Вычисляем позицию маркера на экране
const displayMarker = computed(() => {
  if (
      props.originalPointX === null ||
      props.originalPointY === null ||
      !imageRef.value
  ) return null

  const img = imageRef.value
  const naturalWidth = img.naturalWidth
  const naturalHeight = img.naturalHeight
  const displayWidth = img.clientWidth
  const displayHeight = img.clientHeight

  // Масштаб отображения
  const scaleX = displayWidth / naturalWidth
  const scaleY = displayHeight / naturalHeight

  return {
    left: props.originalPointX * scaleX,
    top: props.originalPointY * scaleY
  }
})

// Обработка клика по изображению
const onImageClick = (event) => {
  const img = imageRef.value
  const rect = img.getBoundingClientRect()

  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const scaleX = img.naturalWidth / img.clientWidth
  const scaleY = img.naturalHeight / img.clientHeight

  const realX = Math.round(x * scaleX)
  const realY = Math.round(y * scaleY)

  // Эмитим обновление координат
  emit('update:originalPointX', realX)
  emit('update:originalPointY', realY)
}
</script>

<template>
  <div class="image-marker">
    <BaseLabel text="Выберите точку на изображении" />

    <div class="image-preview-container">
      <img
          :src="previewUrl"
          alt="Preview"
          class="preview-image"
          @click="onImageClick"
          :class="{ clickable: originalPointX === null }"
          ref="imageRef"
      />
      <!-- Маркер -->
      <div
          v-if="displayMarker"
          class="point-marker"
          :style="{
          left: `${displayMarker.left}px`,
          top: `${displayMarker.top}px`,
          transform: 'translate(-50%, -50%)'
        }"
      >
        ✅
      </div>
    </div>

    <!-- Отображение координат -->
    <div
        v-if="originalPointX !== null && originalPointY !== null"
        class="coordinates"
    >
      <p>
        <strong>Точка выбрана (в оригинале):</strong>
        X: {{ originalPointX }}, Y: {{ originalPointY }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/styles/components/ImageMarker';
</style>