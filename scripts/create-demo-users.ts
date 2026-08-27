#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  console.error("Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/create-demo-users.ts");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface DemoUser {
  email: string;
  password: string;
  fullName: string;
  role: "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT";
}

const DEMO_USERS: DemoUser[] = [
  {
    email: "admin@nrbvidyalaya.com",
    password: "Admin@123",
    fullName: "System Admin",
    role: "SUPER_ADMIN",
  },
  {
    email: "teacher@nrbvidyalaya.com",
    password: "Teacher@123",
    fullName: "Rajesh Kumar",
    role: "TEACHER",
  },
  {
    email: "student@nrbvidyalaya.com",
    password: "Student@123",
    fullName: "Priya Sharma",
    role: "STUDENT",
  },
];

async function createDemoUsers() {
  console.log("Creating demo users...\n");

  for (const demo of DEMO_USERS) {
    console.log(`Creating ${demo.role}: ${demo.email}`);

    const { data: existing } = await supabase.auth.admin.listUsers();
    const alreadyExists = existing?.users?.some((u) => u.email === demo.email);

    if (alreadyExists) {
      console.log(`  -> Already exists, skipping\n`);
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: demo.email,
      password: demo.password,
      email_confirm: true,
      user_metadata: {
        full_name: demo.fullName,
        role: demo.role,
      },
    });

    if (error) {
      console.error(`  -> Failed: ${error.message}\n`);
      continue;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: data.user.id,
            email: demo.email,
            full_name: demo.fullName,
            role: demo.role,
          },
          { onConflict: "id" }
        );

      if (profileError) {
        console.error(`  -> Profile error: ${profileError.message}`);
      } else {
        console.log(`  -> Created (ID: ${data.user.id})`);
      }
    }
    console.log();
  }

  console.log("Done. Demo accounts:");
  console.log("┌──────────────────────────────────┬─────────────┬────────────┐");
  console.log("│ Email                            │ Role        │ Password   │");
  console.log("├──────────────────────────────────┼─────────────┼────────────┤");
  for (const u of DEMO_USERS) {
    console.log(`│ ${u.email.padEnd(32)} │ ${u.role.padEnd(11)} │ ${u.password.padEnd(10)} │`);
  }
  console.log("└──────────────────────────────────┴─────────────┴────────────┘");
}

createDemoUsers().catch(console.error);
