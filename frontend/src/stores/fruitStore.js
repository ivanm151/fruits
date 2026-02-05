import { defineStore } from 'pinia'
import { ref } from 'vue'
import { predictFull } from '../services/huggingface'
import { uploadPicture } from '../services/picService'
import { useUserStore } from './user'
import { supabase } from '../services/lib/supabase'

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
            // Шаг 1: Предсказание от HF
            const prediction = await predictFull({
                file,
                pointX,
                pointY,
                returnCropped: true,
                croppedSize: 224,
            })

            // Извлекаем данные
            const topFruit = prediction.fruit_top3[0]
            const fruit = topFruit.fruit
            const confidence_1 = topFruit.confidence
            const freshness = prediction.freshness
            const isFresh = !freshness.toLowerCase().includes('rotten')
            const confidence_2 = prediction.freshness_confidence
            const cropped_base64 = prediction.cropped_base64

            // Сохраняем временный результат (до загрузки)
            result.value = {
                fruit,
                confidence_1,
                isFresh,
                confidence_2,
                cropped_base64,
            }

            // Шаг 2: Загрузка исходного файла в storage
            const userId = userStore.user.id
            const { filePath } = await uploadPicture(file, userId)

            // Шаг 3: Сохранение в таблицу `pics`
            const { data, error: dbError } = await supabase
                .from('pics')
                .insert([
                    {
                        user_id: userId,
                        storage_path: filePath,
                        mask: cropped_base64, // или использовать как base64-изображение
                        fruit,
                        isFresh,
                        confidence_1,
                        confidence_2,
                    },
                ])
                .select()

            if (dbError) throw dbError

            console.log('[fruitStore] Результат сохранён в БД:', data)
        } catch (err) {
            console.error('[fruitStore] Ошибка при предсказании:', err)
            error.value = err.message || 'Ошибка распознавания'
        } finally {
            loading.value = false
        }
    }

    return { loading, error, result, predictFruit }
})