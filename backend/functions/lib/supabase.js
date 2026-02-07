import { createClient } from '@supabase/supabase-js'
import * as functions from 'firebase-functions'

const supabaseUrl = process.env.SUPABASE_URL || functions.config().supabase?.url
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || functions.config().supabase?.service_key

if (!supabaseUrl) {
    throw new Error('SUPABASE_URL не установлен. Выполни: firebase functions:config:set supabase.url="https://your-project.supabase.co"')
}

if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_KEY не установлен. Выполни: firebase functions:config:set supabase.service_key="..."')
}

// ✅ Правильное имя переменной: supabaseServiceKey
export const supabase = createClient(supabaseUrl, supabaseServiceKey)