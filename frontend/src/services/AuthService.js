import { supabase } from './lib/supabase'
import { hashPassword } from './lib/crypto'

// Регистрация
export const signUp = async (login, password) => {
    const salt = Math.random().toString(36).substring(2, 15)
    const password_hash = await hashPassword(password, salt)

    const { data, error } = await supabase
        .from('users')
        .insert([{ login, password_hash, salt }])
        .select()
        .single()

    if (error) throw error
    return data
}

// Логин
export const signIn = async (login, password) => {
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('login', login)
        .single()

    if (error || !user) throw new Error('Invalid login or password')

    const password_hash = await hashPassword(password, user.salt)
    if (password_hash !== user.password_hash) {
        throw new Error('Invalid password')
    }

    return user
}