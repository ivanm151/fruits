import { supabase } from './lib/supabase'

// Загрузка фото + метаданные
export const uploadPicture = async (file, userId) => {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${fileExt}`

    // 1. Загрузка в бакет
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pics')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        })

    if (uploadError) {
        console.error('[picService] Ошибка загрузки:', uploadError)
        throw new Error(`Ошибка загрузки: ${uploadError.message}`)
    }

    // ✅ Используем путь из ответа (на всякий случай)
    const uploadedPath = uploadData?.path || filePath

    // 2. Получаем публичную ссылку
    const { data: { publicUrl } } = supabase.storage
        .from('pics')
        .getPublicUrl(uploadedPath)

    // 3. Получаем размеры изображения
    const img = new Image()
    img.src = publicUrl

    await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = () => reject(new Error('Не удалось загрузить изображение для получения размеров'))
    })

    // 4. Сохраняем метаданные в таблицу `pics`
    const { data: dbData, error: dbError } = await supabase
        .from('pics')
        .insert({
            user_id: userId,
            storage_path: uploadedPath,
            original_name: file.name,
            mime_type: file.type,
            size_bytes: file.size,
            width: img.width,
            height: img.height
        })
        .select()

    if (dbError) {
        console.error('[picService] Ошибка сохранения в БД:', dbError)
        throw new Error(`Ошибка БД: ${dbError.message}`)
    }

    // Возвращаем данные с настоящим ID из БД
    const pic = dbData[0]
    return {
        ...pic,
        publicUrl,
        id: pic.id // используем настоящий ID из таблицы
    }
}

// Получение фото пользователя
export const fetchUserPics = async (userId) => {
    const { data, error } = await supabase
        .from('pics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[picService] Ошибка получения фото:', error)
        throw error
    }

    return data.map(pic => {
        const { data: { publicUrl } } = supabase.storage
            .from('pics')
            .getPublicUrl(pic.storage_path)
        return {
            ...pic,
            publicUrl
        }
    })
}