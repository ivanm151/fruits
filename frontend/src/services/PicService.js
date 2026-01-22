import { supabase } from './lib/supabase'

// Загрузка фото
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