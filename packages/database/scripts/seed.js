#!/usr/bin/env node

/**
 * Seed script for Sedona CRM database
 *
 * Usage:
 *   pnpm db:seed                    # Run all seeds
 *   pnpm db:seed -- --file=crm      # Run specific seed file
 *
 * Environment variables required:
 *   - DATABASE_URL or SUPABASE_DB_URL
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUPABASE_DIR = join(__dirname, '..', 'supabase');

// Seed files in order of execution
const SEED_FILES = [
  'seed.sql',         // Base: orgs, users, members
  'seed_crm.sql',     // CRM: pipelines, companies, contacts, deals
  'seed_invoice.sql', // Invoice: clients, products, invoices, quotes
  'seed_projects.sql',// Projects: projects, tasks, time entries
  'seed_tickets.sql', // Tickets: categories, tickets, messages
  'seed_hr.sql',      // HR: employees, leaves, contracts
];

async function runSeed() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    console.log('\nTo run seeds locally, you can use:');
    console.log('  pnpm db:seed:local');
    console.log('\nOr set the environment variables:');
    console.log('  export SUPABASE_URL=your_url');
    console.log('  export SUPABASE_SERVICE_ROLE_KEY=your_key');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  // Parse command line arguments
  const args = process.argv.slice(2);
  const fileArg = args.find(arg => arg.startsWith('--file='));
  const specificFile = fileArg ? fileArg.split('=')[1] : null;

  let filesToRun = SEED_FILES;

  if (specificFile) {
    const fileName = specificFile.endsWith('.sql') ? specificFile : `seed_${specificFile}.sql`;
    if (!SEED_FILES.includes(fileName)) {
      console.error(`Error: Unknown seed file "${fileName}"`);
      console.log('Available files:', SEED_FILES.join(', '));
      process.exit(1);
    }
    filesToRun = [fileName];
  }

  console.log('🌱 Starting database seed...\n');

  for (const file of filesToRun) {
    const filePath = join(SUPABASE_DIR, file);
    console.log(`📄 Running ${file}...`);

    try {
      const sql = readFileSync(filePath, 'utf-8');

      // Execute SQL via Supabase RPC (requires a function to be created)
      // For now, we'll use the REST API approach
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        // If RPC doesn't exist, print instructions
        if (error.message.includes('function') || error.code === 'PGRST202') {
          console.log(`   ⚠️  Direct SQL execution not available via API.`);
          console.log(`   Please run manually: psql -f ${filePath}`);
        } else {
          throw error;
        }
      } else {
        console.log(`   ✅ ${file} completed`);
      }
    } catch (err) {
      console.error(`   ❌ Error in ${file}:`, err.message);
    }
  }

  console.log('\n✨ Seed process completed!');
  console.log('\nNote: If SQL execution via API is not available, run seeds directly with:');
  console.log('  supabase db reset  # Resets and runs all migrations + seed');
  console.log('  OR');
  console.log('  psql $DATABASE_URL -f packages/database/supabase/seed.sql');
}

runSeed().catch(console.error);
