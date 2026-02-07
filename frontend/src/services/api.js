const API_BASE = import.meta.env.VITE_API_BASE

function getBase64Data(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string') return null
    const parts = dataUrl.split(',')
    if (parts.length !== 2) return null
    return parts[1] // base64
}

export const api = {
    async predictFull(file, pointX, pointY) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = () => {
                const base64 = getBase64Data(reader.result)
                if (!base64) return reject(new Error('Invalid Data URL format'))

                const user = localStorage.getItem('user')
                const userId = user ? JSON.parse(user).id : null
                if (!userId) return reject(new Error('Not authenticated'))

                fetch(`${API_BASE}/apiPredictFull`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file: {
                            data: base64,
                            name: file.name,
                            type: file.type
                        },
                        pointX,
                        pointY,
                        userId // ✅ Передаём
                    })
                })
                    .then(async (res) => {
                        const text = await res.text()
                        try {
                            const data = JSON.parse(text)
                            if (!res.ok) return reject(new Error(data.error || 'Prediction failed'))
                            resolve(data)
                        } catch (e) {
                            reject(new Error(`Invalid JSON: ${text}`))
                        }
                    })
                    .catch(err => reject(new Error(`Network error: ${err.message}`)))
            }

            reader.onerror = () => reject(new Error('FileReader failed'))
            reader.readAsDataURL(file)
        })
    },

    async signUp(login, password) {
        const res = await fetch(`${API_BASE}/apiSignUp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password })
        })
        const data = await res.json()
        if (res.ok) return data
        throw new Error(data.error || 'Sign up failed')
    },

    async signIn(login, password) {
        const res = await fetch(`${API_BASE}/apiSignIn`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password })
        })
        const data = await res.json()
        if (res.ok) return data
        throw new Error(data.error || 'Sign in failed')
    },


    async uploadPicture(file, userId) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = () => {
                const base64 = getBase64Data(reader.result)
                if (!base64) {
                    return reject(new Error('Failed to extract base64 from file'))
                }

                fetch(`${API_BASE}/apiUploadPicture`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        file: {
                            data: base64,
                            name: file.name,
                            type: file.type
                        },
                        userId
                    })
                })
                    .then(async (res) => {
                        const data = await res.json()
                        if (!res.ok) {
                            return reject(new Error(data.error || 'Upload failed'))
                        }
                        resolve(data)
                    })
                    .catch(err => reject(new Error(`Network error: ${err.message}`)))
            }

            reader.onerror = () => reject(new Error('FileReader failed to read file'))
            reader.readAsDataURL(file)
        })
    },

    async fetchUserPics(userId) {
        const res = await fetch(`${API_BASE}/apiFetchUserPics?userId=${userId}`)
        if (!res.ok) {
            const text = await res.text()
            throw new Error(`Fetch pics failed: ${text}`)
        }
        return await res.json()
    }
}


