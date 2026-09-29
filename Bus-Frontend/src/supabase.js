import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ylkbeildfsqpgccwgcwa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_O6Iaju4uzdrB15n8bMcUSA_t3Zv97aj';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
