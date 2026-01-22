import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://arthxxuyccdphpmzktpw.supabase.co'
const supabaseAnonKey = 'sb_publishable_zkUHUYSp8HxAGCMBEzQX2w_HVKknROw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)