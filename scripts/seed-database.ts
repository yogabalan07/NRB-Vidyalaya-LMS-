#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding database...");

  const seedPath = resolve(import.meta.dirname, "../supabase/seed/seed.sql");
  const seedSql = readFileSync(seedPath, "utf-8");

  const { error } = await supabase.rpc("exec_sql", { sql: seedSql });
  if (error) {
    console.error("Seed failed:", error.message);
    console.log("Note: You may need to run the seed SQL directly in Supabase dashboard.");
    console.log("Seed file:", seedPath);
    process.exit(1);
  }

  console.log("Database seeded successfully");
}

seed().catch(console.error);
