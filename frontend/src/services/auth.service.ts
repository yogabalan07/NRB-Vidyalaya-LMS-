import { createClient, type Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Profile, Role } from "@/types/auth";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    email: row.email as string,
    full_name: row.full_name as string,
    role: (row.role as Role) || "STUDENT",
    phone: (row.phone as string) || undefined,
    avatar_url: (row.avatar_url as string) || undefined,
    status: (row.status as string) || "active",
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function authedClient(session: Session) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${session.access_token}` },
    },
  });
}

export const authService = {
  async signUp(email: string, password: string, fullName: string, phone?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || "",
          role: "STUDENT",
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session) return null;

    const client = authedClient(session);
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error || !data) return null;
    return mapProfile(data);
  },

  async updateProfile(
    userId: string,
    updates: { full_name?: string; phone?: string; avatar_url?: string }
  ): Promise<Profile | null> {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session) return null;

    const client = authedClient(session);
    const { data, error } = await client
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();
    if (error || !data) return null;
    return mapProfile(data);
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};
