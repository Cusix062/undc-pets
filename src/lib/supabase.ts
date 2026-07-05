import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qmrxpsghabvexankbfcv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Pq0zBSUypb5mGuKmjoJprg_fku4AkTe';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
