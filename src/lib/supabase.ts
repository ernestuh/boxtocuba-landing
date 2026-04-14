import { createClient } from '@supabase/supabase-js';

// Server-side only — service key never reaches the browser
export const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_KEY
);
