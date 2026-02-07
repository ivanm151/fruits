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

            // Проверка на наличие данных о фруктах
            if (!prediction || !prediction.fruit_top3 || prediction.fruit_top3.length === 0) {
                throw new Error('Фрукт не распознан')
            }

            const topFruit = prediction.fruit_top3[0]
            const fruit = topFruit.fruit
            const confidence_1 = topFruit.confidence

            // --- ОПРЕДЕЛЕНИЕ СВЕЖЕСТИ ---
            let isFresh = null
            let confidence_2 = prediction.freshness_confidence ?? 0
            let freshness = prediction.freshness

            if (freshness === null || freshness === undefined) {
                // Свежесть не определена для этого фрукта
                console.log(`[fruitStore] Свежесть не определена для фрукта: ${fruit}`)
            } else if (typeof freshness === 'string') {
                isFresh = !freshness.toLowerCase().includes('rotten')
            } else {
                console.warn('[fruitStore] Неожиданный тип freshness:', typeof freshness)
            }

            const cropped_base64 = prediction.cropped_base64 || null

            // Сохраняем результат
            result.value = {
                fruit,
                confidence_1,
                isFresh, // может быть true, false, null
                confidence_2,
                cropped_base64,
                freshnessStatus: isFresh === null
                    ? 'unknown'
                    : isFresh ? 'fresh' : 'rotten'
            }

            // Проверка авторизации
            if (!userStore.user?.id) {
                throw new Error('Пользователь не авторизован')
            }

            const userId = userStore.user.id

            // Загрузка фото
            const { filePath } = await uploadPicture(file, userId)

            // Сохранение в БД
            const { data, error: dbError } = await supabase
                .from('pics')
                .insert([
                    {
                        user_id: userId,
                        storage_path: filePath,
                        mask: cropped_base64,
                        fruit,
                        isFresh, // сохраняем как NULL, если не определено
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