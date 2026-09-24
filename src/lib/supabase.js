import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kemetwenttjawedzquqh.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_whx2NpETLD2LNVuVW1z2LQ_OtJzQGt3';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
