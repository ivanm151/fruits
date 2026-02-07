import { supabase } from './lib/supabase.js'
import { hashPassword } from './lib/crypto.js'

// Регистрация
export const signUp = async (req, res) => {
    const { login, password } = req.body

    if (!login || !password) {
        return res.status(400).json({ error: 'Login and password required' })
    }

    const salt = Math.random().toString(36).substring(2, 15)
    const password_hash = await hashPassword(password, salt)

    const { data, error } = await supabase
        .from('users')
        .insert([{ login, password_hash, salt }])
        .select('id, login')
        .single()

    if (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'User already exists' })
        return res.status(500).json({ error: error.message })
    }

    return res.json({ user: data })
}

// Логин
export const signIn = async (req, res) => {
    const { login, password } = req.body

    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('login', login)
        .single()

    if (error || !user) {
        return res.status(401).json({ error: 'Invalid login or password' })
    }

    const password_hash = await hashPassword(password, user.salt)
    if (password_hash !== user.password_hash) {
        return res.status(401).json({ error: 'Invalid password' })
    }

    return res.json({ user: { id: user.id, login: user.login } })
}