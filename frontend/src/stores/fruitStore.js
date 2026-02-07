import { defineStore } from 'pinia'
import { ref } from 'vue'
import { predictFull } from '../services/huggingface'
import { uploadPicture } from '../services/picService'
import { useUserStore } from './user'

export const useFruitStore = defineStore('fruit', () => {
    const loading = ref(false)
    const error = ref(null)
    const result = ref(null)
    const userStore = useUserStore()

    const predictFruit = async ({ file, pointX, pointY }) => {
        loading.value = true
        error.value = null
        result.value = null

        try {
            // Шаг 1: Предсказание
            const prediction = await predictFull({
                file,
                pointX,
                pointY,
                returnCropped: true,
                croppedSize: 224,
            })

            if (!prediction || !prediction.fruit_top3 || prediction.fruit_top3.length === 0) {
                throw new Error('Фрукт не распознан')
            }

            const topFruit = prediction.fruit_top3[0]
            const fruit = topFruit.fruit
            const confidence_1 = topFruit.confidence

            let isFresh = null
            let confidence_2 = prediction.freshness_confidence ?? 0
            let freshness = prediction.freshness

            if (freshness === null || typeof freshness === 'undefined') {
                console.log(`[fruitStore] Свежесть не определена: ${fruit}`)
            } else if (typeof freshness === 'string') {
                isFresh = !freshness.toLowerCase().includes('rotten')
            }

            const cropped_base64 = prediction.cropped_base64 || null

            result.value = {
                fruit,
                confidence_1,
                isFresh,
                confidence_2,
                cropped_base64,
                freshnessStatus: isFresh === null ? 'unknown' : isFresh ? 'fresh' : 'rotten'
            }

            if (!userStore.user?.id) throw new Error('Не авторизован')

            const userId = userStore.user.id

            // Шаг 2: Загрузка фото
            const { filePath } = await uploadPicture(file, userId)

            // Результат уже сохранён в БД через функцию? Да!
            // Если `apiPredictFull` или `apiUploadPicture` сохраняют в БД — ничего больше не нужно
            console.log('[fruitStore] Анализ завершён и сохранён на сервере')
        } catch (err) {
            console.error('[fruitStore] Ошибка:', err)
            error.value = err.message || 'Ошибка анализа'
        } finally {
            loading.value = false
        }
    }

    return { loading, error, result, predictFruit }
})