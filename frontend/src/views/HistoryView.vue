<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore } from '../stores/user'
import { useFruitStore } from '../stores/fruitStore'
import { fetchUserPics } from '../services/picService'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const fruitStore = useFruitStore()
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
    <h1>История анализов</h1>
    <button @click="signOut">Выйти</button>

    <p v-if="loading">Загрузка...</p>

    <div v-else-if="predictions.length === 0" class="empty">
      <p>У вас пока нет ни одного анализа.</p>
    </div>

    <div v-else class="predictions-list">
      <div
          v-for="pred in predictions"
          :key="pred.id"
          class="prediction-card"
      >
        <img
            :src="pred.publicUrl"
            :alt="`Фото ${pred.fruit}`"
            class="prediction-image"
        />

        <div class="prediction-info">
          <h3>{{ pred.fruit }}</h3>
          <p>
            <strong>Свежий:</strong>
            <span :class="pred.isFresh ? 'fresh' : 'rotten'">
              {{ pred.isFresh ? '✅ Да' : '❌ Нет' }}
            </span>
          </p>
          <p><strong>Доверие фрукта:</strong> {{ (pred.confidence_1 * 100).toFixed(2) }}%</p>
          <p><strong>Доверие свежести:</strong> {{ (pred.confidence_2 * 100).toFixed(2) }}%</p>
          <p class="date">
            <small>{{ new Date(pred.created_at).toLocaleString() }}</small>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

button {
  display: block;
  margin: 0 0 20px auto;
  padding: 8px 16px;
  font-size: 14px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.empty {
  text-align: center;
  color: #666;
  font-style: italic;
}

.predictions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.prediction-card {
  display: flex;
  gap: 16px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.prediction-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.prediction-info {
  padding: 16px;
  flex: 1;
}

.prediction-info h3 {
  margin: 0 0 8px 0;
  font-size: 1.2em;
  color: #2c3e50;
}

.fresh {
  color: green;
}

.rotten {
  color: red;
}

.date {
  color: #999;
  margin-top: 8px;
}
</style>