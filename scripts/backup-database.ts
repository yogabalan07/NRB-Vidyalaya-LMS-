#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "fs";
import { resolve } from "path";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  "profiles",
  "courses",
  "lessons",
  "enrollments",
  "assignments",
  "submissions",
  "quizzes",
  "questions",
  "question_bank",
  "quiz_attempts",
  "attendance",
  "results",
  "certificates",
  "notifications",
  "payments",
  "blog_posts",
  "ai_conversations",
  "ai_messages",
];

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = resolve(
    import.meta.dirname,
    `../storage/backup-${timestamp}.json`
  );

  console.log("Starting database backup...");
  const backup: Record<string, unknown[]> = {};

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .limit(10000);

    if (error) {
      console.warn(`Warning: Could not backup ${table}: ${error.message}`);
      backup[table] = [];
    } else {
      backup[table] = data || [];
      console.log(`  ${table}: ${(data || []).length} rows`);
    }
  }

  writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`\nBackup saved to: ${backupPath}`);
}

backup().catch(console.error);
