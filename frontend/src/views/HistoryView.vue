<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from '../stores/user'
import { fetchUserPics } from '../services/picService'
import { useRouter } from 'vue-router'
import ResultCard from '../components/ResultCard.vue'
import BaseButton from '../components/BaseButton.vue'

const userStore = useUserStore()
const router = useRouter()

const predictions = ref([])
const loading = ref(true)

// Выход
const signOut = () => {
  userStore.signOut()
  router.push('/auth')
}

// Загрузка истории
const loadPredictions = async () => {
  if (!userStore.user) {
    router.push('/auth')
    return
  }

  try {
    const data = await fetchUserPics(userStore.user.id)
    predictions.value = data
  } catch (err) {
    console.error('[HistoryView] Ошибка загрузки:', err)
    alert('Не удалось загрузить историю')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPredictions()
})
</script>

<template>
  <div class="history-view">
    <h1 class="text-h1">История анализов</h1>

    <BaseButton text="Выйти" type="danger" @click="signOut" />
    <BaseButton text="На главную" type="secondary" @click="$router.push('/')" />

    <p v-if="loading" class="text-h4">Загрузка...</p>

    <div v-else-if="predictions.length === 0" class="empty">
      <p class="text-h5">У вас пока нет ни одного анализа.</p>
    </div>

    <div v-else class="predictions-list">
      <!-- Одна карточка на одну запись -->
      <div
          v-for="pred in predictions"
          :key="pred.id"
          class="prediction-item"
      >
        <img
            :src="pred.publicUrl"
            :alt="`Фото ${pred.fruit}`"
            class="prediction-item__image"
        />

        <ResultCard
            :fruit="pred.fruit"
            :confidence_1="pred.confidence_1"
            :isFresh="pred.isFresh"
            :confidence_2="pred.confidence_2"
            :fruit_top3="pred.fruit_top3 ? JSON.parse(pred.fruit_top3) : []"
            :cropped_base64="pred.mask"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/styles/components/HistoryView';
</style>