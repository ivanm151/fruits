import { api } from './api'

export const predictFull = async ({ file, pointX, pointY }) => {
    const result = await api.predictFull(file, pointX, pointY)
    if (result.error) throw new Error(result.error)
    return result
}