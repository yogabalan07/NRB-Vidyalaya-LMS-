import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing VITE_SUPABASE_URL. Create a frontend/.env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before building."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_ANON_KEY. Create a frontend/.env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before building."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
