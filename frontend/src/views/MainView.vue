<script setup>
import { ref } from "vue";
import { useFruitStore } from "../stores/fruitStore";
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const store = useFruitStore();

const file = ref(null);
const pointX = ref(1000);
const pointY = ref(1000);

function onFileChange(e) {
  file.value = e.target.files[0];
}

async function onPredict() {
  if (!file.value) return;

  await store.predictFruit({
    file: file.value,
    pointX: pointX.value,
    pointY: pointY.value,
  });
}

const signOut = () => {
  userStore.signOut()
  console.log('[MainView] Пользователь вышел')
  router.push('/auth')
}
</script>

<template>
  <div class="fruits-view">
    <h1>Fruit prediction</h1>
    <button @click="signOut">Выйти</button>

    <input type="file" accept="image/*" @change="onFileChange" />

    <div>
      <label>
        X:
        <input type="number" v-model.number="pointX" />
      </label>

      <label>
        Y:
        <input type="number" v-model.number="pointY" />
      </label>
    </div>

    <button @click="onPredict" :disabled="store.loading">
      {{ store.loading ? "Predicting..." : "Predict" }}
    </button>

    <button @click="$router.push('/history')">Посмотреть историю</button>

    <p v-if="store.error" class="error">
      {{ store.error }}
    </p>

    <!-- Отображение результата в виде структурированной информации -->
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
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>