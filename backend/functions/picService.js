import { supabase } from './lib/supabase.js'

// Загрузка фото
export const uploadPicture = async (req, res) => {
    const { file, userId } = req.body

    if (!file || !userId) {
        return res.status(400).json({ error: 'File and userId required' })
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${fileExt}`

    const buffer = Buffer.from(file.data, 'base64')

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pics')
        .upload(filePath, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
        })

    if (uploadError) {
        return res.status(500).json({ error: uploadError.message })
    }

    return res.json({ filePath: uploadData.path })
}

// Получение истории
export const fetchUserPics = async (req, res) => {
    const { userId } = req.query

    if (!userId) {
        return res.status(400).json({ error: 'userId required' })
    }

    const { data, error } = await supabase
        .from('pics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        return res.status(500).json({ error: error.message })
    }

    const result = data.map(pic => {
        const { data: { publicUrl } } = supabase.storage
            .from('pics')
            .getPublicUrl(pic.storage_path)

        return {
            ...pic,
            publicUrl,
            fruit_top3: pic.fruit_top3 ? JSON.parse(pic.fruit_top3) : null
        }
    })

    return res.json(result)
}