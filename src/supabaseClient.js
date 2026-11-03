import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hjsfxdghfpdryliavgpz.supabase.co'
const supabaseKey = 'sb_publishable_1m8IxJSO7s_Sv9JR6muvMw_LKdg4E4e'

export const supabase = createClient(supabaseUrl, supabaseKey)