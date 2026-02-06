<script setup>
import { ref, computed } from "vue";
import { useFruitStore } from "../stores/fruitStore";
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();
const store = useFruitStore();

const file = ref(null);
const previewUrl = ref("");
const originalPointX = ref(null); // ✅ правильно
const originalPointY = ref(null); // ✅ правильно
const imageRef = ref(null);

// Вычисляем отображаемые координаты маркера
const displayMarker = computed(() => {
  if (
      originalPointX.value === null ||
      originalPointY.value === null ||
      !imageRef.value
  ) return null;

  const img = imageRef.value;
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;
  const displayWidth = img.clientWidth;
  const displayHeight = img.clientHeight;

  // Пропорции: scale = отображаемый размер / оригинальный размер
  const scaleX = displayWidth / naturalWidth;
  const scaleY = displayHeight / naturalHeight;

  return {
    left: originalPointX.value * scaleX,
    top: originalPointY.value * scaleY
  };
});

function onFileChange(e) {
  const selectedFile = e.target.files[0];
  if (!selectedFile) return;

  file.value = selectedFile;
  previewUrl.value = URL.createObjectURL(selectedFile);
  // Сброс координат
  originalPointX.value = null; // ✅ исправлено
  originalPointY.value = null; // ✅ исправлено
}

function onImageClick(event) {
  const img = imageRef.value;
  const rect = img.getBoundingClientRect();

  // Размеры отображаемого изображения
  const displayWidth = img.clientWidth;
  const displayHeight = img.clientHeight;

  // Реальные размеры изображения
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;

  // Координаты клика относительно изображения
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Масштаб: оригинал / отображение
  const scaleX = naturalWidth / displayWidth;
  const scaleY = naturalHeight / displayHeight;

  // Пересчитываем в оригинальные координаты
  const realX = Math.round(x * scaleX);
  const realY = Math.round(y * scaleY);

  originalPointX.value = realX; // ✅ исправлено
  originalPointY.value = realY; // ✅ исправлено
}

async function onPredict() {
  if (!file.value || originalPointX.value === null || originalPointY.value === null) return; // ✅ исправлено

  await store.predictFruit({
    file: file.value,
    pointX: originalPointX.value, // ✅ передаём оригинал
    pointY: originalPointY.value, // ✅ передаём оригинал
  });
}

const signOut = () => {
  userStore.signOut();
  console.log('[MainView] Пользователь вышел');
  router.push('/auth');
};
</script>

<template>
  <div class="fruits-view">
    <h1>Fruit prediction</h1>
    <button @click="signOut">Выйти</button>

    <input type="file" accept="image/*" @change="onFileChange" />

    <!-- Предпросмотр изображения -->
    <div v-if="previewUrl" class="image-preview-container">
      <img
          :src="previewUrl"
          alt="Preview"
          class="preview-image"
          @click="onImageClick"
          :class="{ clickable: originalPointX === null }"
          ref="imageRef"
      />
      <!-- Маркер поверх изображения -->
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

    <!-- Отображение координат (в оригинале) -->
    <div v-if="originalPointX !== null && originalPointY !== null" class="coordinates">
      <p><strong>Точка выбрана (в оригинале):</strong> X: {{ originalPointX }}, Y: {{ originalPointY }}</p>
    </div>

    <!-- Кнопка предсказания -->
    <button @click="onPredict" :disabled="store.loading || originalPointX === null">
      {{ store.loading ? "Predicting..." : "Predict" }}
    </button>

    <!-- Кнопка истории -->
    <button @click="$router.push('/history')">Посмотреть историю</button>

    <!-- Ошибки -->
    <p v-if="store.error" class="error">
      {{ store.error }}
    </p>

    <!-- Результат -->
    <div v-if="store.result" class="result">
      <p><strong>Фрукт:</strong> {{ store.result.fruit }}</p>
      <p><strong>Доверие:</strong> {{ (store.result.confidence_1 * 100).toFixed(2) }}%</p>
      <p><strong>Свежий:</strong> {{ store.result.isFresh ? '✅ Да' : '❌ Нет' }}</p>
      <p><strong>Доверие свежести:</strong> {{ (store.result.confidence_2 * 100).toFixed(2) }}%</p>
    </div>

    <!-- Обрезанное изображение -->
    <img
        v-if="store.result?.cropped_base64"
        :src="`data:image/png;base64,${store.result.cropped_base64}`"
        alt="Cropped fruit"
        class="cropped-image"
    />
  </div>
</template>

<style scoped>
.fruits-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.image-preview-container {
  position: relative;
  display: inline-block;
  margin: 20px 0;
  border: 2px dashed #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  display: block;
  border-radius: 6px;
}

.preview-image.clickable {
  cursor: crosshair;
  border: 1px solid #007cba;
}

.point-marker {
  position: absolute;
  background-color: #007cba;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  pointer-events: none;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.3);
}

.coordinates {
  margin: 10px 0;
  padding: 10px;
  background-color: #e8f4fd;
  border-radius: 6px;
  font-size: 0.95em;
  text-align: left;
}

.error {
  color: red;
  font-size: 0.9em;
  margin-top: 10px;
}

.result {
  margin-top: 20px;
  text-align: left;
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
  font-size: 0.95em;
}

.cropped-image {
  margin-top: 15px;
  max-width: 200px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>