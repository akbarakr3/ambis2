import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_KEY is missing in server environment.');
}

export const supabaseServer = createClient(supabaseUrl || '', supabaseServiceKey || '', {
  auth: { persistSession: false },
});
