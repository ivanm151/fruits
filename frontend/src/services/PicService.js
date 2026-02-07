import { api } from './api'

// Загрузка фото
export const uploadPicture = async (file, userId) => {
    const result = await api.uploadPicture(file, userId)
    if (result.error) throw new Error(result.error)
    return { filePath: result.filePath }
}

// Получение истории
export const fetchUserPics = async (userId) => {
    const result = await api.fetchUserPics(userId)
    if (result.error) throw new Error(result.error)
    return result
}