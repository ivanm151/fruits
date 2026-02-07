import { supabase } from './lib/supabase.js'
import * as functions from 'firebase-functions'

// Поддержка fetch
globalThis.fetch = fetch

const HF_BASE_URL =
    process.env.HF_BASE_URL ||
    functions.config().hf?.base_url ||
    'https://ivanm151-fruits.hf.space'

export const predictFull = async (req, res) => {
    const { file, pointX, pointY, userId } = req.body

    if (!file || !pointX || !pointY || !userId) {
        return res.status(400).json({
            error: 'File, pointX, pointY and userId are required'
        })
    }

    if (!file.data || typeof file.data !== 'string') {
        return res.status(400).json({ error: 'file.data must be base64 string' })
    }

    try {
        // --- 1. Предсказание от Hugging Face ---
        const buffer = Buffer.from(file.data, 'base64')

        const formData = new FormData()
        formData.append('file', new Blob([buffer], { type: file.type }), file.name)

        const url = new URL(`${HF_BASE_URL}/predict_full`)
        url.searchParams.append('point_x', pointX)
        url.searchParams.append('point_y', pointY)
        url.searchParams.append('return_cropped', 'true')
        url.searchParams.append('cropped_size', 224)

        const hfResponse = await fetch(url, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: formData
        })

        if (!hfResponse.ok) {
            const text = await hfResponse.text()
            console.error('[predictFull] HF Error:', hfResponse.status, text)
            return res.status(500).json({
                error: 'Prediction failed',
                status: hfResponse.status,
                details: text
            })
        }

        const prediction = await hfResponse.json()

        // --- 2. Парсим результат ---
        const topFruit = prediction.fruit_top3?.[0]
        if (!topFruit) {
            return res.status(400).json({ error: 'No fruit detected' })
        }

        const fruit = topFruit.fruit
        const confidence_1 = topFruit.confidence

        let isFresh = null
        const freshness = prediction.freshness
        const confidence_2 = prediction.freshness_confidence ?? 0

        if (typeof freshness === 'string') {
            isFresh = !freshness.toLowerCase().includes('rotten')
        }

        const cropped_base64 = prediction.cropped_base64 || null

        // --- 3. Генерация пути ---
        const fileExt = file.name.split('.').pop()
        const filePath = `${userId}/${Date.now()}.${fileExt}`

        // --- 4. Загрузка в Storage ---
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('pics')
            .upload(filePath, buffer, {
                contentType: file.type,
                cacheControl: '3600'
            })

        if (uploadError) {
            console.error('[predictFull] Storage upload failed:', uploadError.message)
            return res.status(500).json({ error: 'Upload failed' })
        }

        // --- 5. Сохранение в таблицу `pics` ---
        // ВАЖНО: "isFresh" — в кавычках, потому что в схеме она с большой буквы
        const { error: dbError } = await supabase
            .from('pics')
            .insert({
                user_id: userId,
                storage_path: uploadData.path,
                mask: cropped_base64,
                fruit,
                "isFresh": isFresh,
                confidence_1,
                confidence_2
            })

        if (dbError) {
            console.error('[predictFull] DB insert failed:', dbError.message)
            // Удаляем файл при ошибке БД
            await supabase.storage.from('pics').remove([uploadData.path])
            return res.status(500).json({ error: 'Database save failed' })
        }

        // --- 6. Ответ ---
        return res.json({
            ...prediction,
            result: {
                fruit,
                confidence_1,
                isFresh,
                confidence_2,
                cropped_base64
            }
        })
    } catch (err) {
        console.error('[predictFull] Unexpected error:', err.message)
        return res.status(500).json({
            error: 'Unexpected error',
            details: err.message
        })
    }
}