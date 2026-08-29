export const environment = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
