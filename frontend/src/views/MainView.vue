<script setup>
import { ref } from 'vue'
import { useFruitStore } from '../stores/fruitStore'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import ResultCard from '../components/ResultCard.vue'
import ImageMarker from '../components/ImageMarker.vue'
import BaseLabel from '../components/BaseLabel.vue'

const userStore = useUserStore()
const router = useRouter()
const store = useFruitStore()

const file = ref(null)
const previewUrl = ref('')
const originalPointX = ref(null)
const originalPointY = ref(null)

// Обработчик выбора файла
function onFileChange(e) {
  const selectedFile = e.target.files[0]
  if (!selectedFile) return

  file.value = selectedFile
  previewUrl.value = URL.createObjectURL(selectedFile)
  originalPointX.value = null
  originalPointY.value = null
}

// Предсказание
async function onPredict() {
  if (!file.value || originalPointX.value === null || originalPointY.value === null) return

  await store.predictFruit({
    file: file.value,
    pointX: originalPointX.value,
    pointY: originalPointY.value
  })
}

// Выход
const signOut = () => {
  userStore.signOut()
  console.log('[MainView] Пользователь вышел')
  router.push('/auth')
}
</script>

<template>
  <div class="main-view">
    <h1 class="text-h1">Fruit prediction</h1>

    <BaseButton text="Выйти" type="danger" @click="signOut" />

    <BaseLabel text="Загрузите изображение" />
    <input
        type="file"
        accept="image/*"
        @change="onFileChange"
        class="hidden-input"
    />

    <!-- Используем компонент маркера -->
    <ImageMarker
        v-if="previewUrl"
        :preview-url="previewUrl"
        :original-point-x="originalPointX"
        :original-point-y="originalPointY"
        @update:original-point-x="val => originalPointX = val"
        @update:original-point-y="val => originalPointY = val"
    />

    <BaseButton
        text="Предсказать"
        :loading="store.loading"
        :disabled="!originalPointX"
        @click="onPredict"
    />

    <BaseButton
        text="Посмотреть историю"
        type="secondary"
        @click="$router.push('/history')"
    />

    <p v-if="store.error" class="error">
      {{ store.error }}
    </p>

    <ResultCard
        v-if="store.result"
        :fruit="store.result.fruit"
        :confidence_1="store.result.confidence_1"
        :isFresh="store.result.isFresh"
        :confidence_2="store.result.confidence_2"
        :fruit_top3="[{ fruit: store.result.fruit, confidence: store.result.confidence_1 }]"
        :cropped_base64="store.result.cropped_base64"
    />
  </div>
</template>

<style scoped lang="scss">
@use '../assets/styles/components/MainView';
</style>