#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.argv[2];

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

if (!adminEmail) {
  console.error("Usage: tsx scripts/generate-admin.ts <email>");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function makeAdmin() {
  console.log(`Making ${adminEmail} an admin...`);

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", adminEmail)
    .single();

  if (fetchError || !profile) {
    console.error("User not found:", adminEmail);
    process.exit(1);
  }

  if (profile.role === "SUPER_ADMIN" || profile.role === "ADMIN") {
    console.log(`User ${adminEmail} is already a ${profile.role}`);
    process.exit(0);
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "ADMIN", updated_at: new Date().toISOString() })
    .eq("id", profile.id);

  if (error) {
    console.error("Failed to update role:", error.message);
    process.exit(1);
  }

  console.log(`Successfully made ${adminEmail} an ADMIN`);
}

makeAdmin().catch(console.error);
