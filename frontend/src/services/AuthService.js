import { api } from './api'

export const signUp = async (login, password) => {
    const response = await api.signUp(login, password)
    if (response.error) throw new Error(response.error)
    return response.user
}

export const signIn = async (login, password) => {
    const response = await api.signIn(login, password)
    if (response.error) throw new Error(response.error)
    return response.user
}