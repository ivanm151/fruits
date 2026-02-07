import * as functions from 'firebase-functions'
import cors from 'cors'

import { signUp, signIn } from './auth.js'
import { uploadPicture, fetchUserPics } from './picService.js'
import { predictFull } from './predict.js'

const corsHandler = cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://fruits-freshness.web.app',
        'https://your-app.firebaseapp.com'
    ]
})

// Прокси-функция
const wrap = (fn) => (req, res) =>
    corsHandler(req, res, () => fn(req, res))

export const apiSignUp = functions.https.onRequest(wrap(signUp))
export const apiSignIn = functions.https.onRequest(wrap(signIn))
export const apiPredictFull = functions.https.onRequest(wrap(predictFull))
export const apiUploadPicture = functions.https.onRequest(wrap(uploadPicture))
export const apiFetchUserPics = functions.https.onRequest(wrap(fetchUserPics))