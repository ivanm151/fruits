import { defineStore } from 'pinia'
import { ref } from 'vue'
import { signUp as signUpService, signIn as signInService } from '../services/authService'

export const useUserStore = defineStore('user', () => {
    const user = ref(null)

    const signUp = async (login, password) => {
        const userData = await signUpService(login, password)
        user.value = userData
        localStorage.setItem('user', JSON.stringify(user.value))
    }

    const signIn = async (login, password) => {
        const userData = await signInService(login, password)
        user.value = userData
        localStorage.setItem('user', JSON.stringify(user.value))
    }

    const signOut = () => {
        user.value = null
        localStorage.removeItem('user')
    }

    const init = () => {
        const saved = localStorage.getItem('user')
        if (saved) user.value = JSON.parse(saved)
    }

    return { user, signUp, signIn, signOut, init }
})