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

    <p v-if="store.error" class="error">
      {{ store.error }}
    </p>

    <pre v-if="store.result">
{{ store.result }}
    </pre>

    <img
        v-if="store.result?.cropped_base64"
        :src="`data:image/png;base64,${store.result.cropped_base64}`"
        alt="Cropped fruit"
    />
  </div>
</template>

<style scoped>
.fruits-view {
  max-width: 500px;
}

.error {
  color: red;
}
</style>
