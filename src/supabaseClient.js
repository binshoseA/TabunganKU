import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wrodxlismbtobxyvlsqp.supabase.co' 
const supabaseKey = 'sb_publishable_tRYh026pKrsz3yAehp-Klg_8Pd8U3Oa' 

export const supabase = createClient(supabaseUrl, supabaseKey)