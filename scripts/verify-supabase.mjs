import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://evycxmysydmbjsxyzpzt.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_lkPj9RHfG-P9Q03PN0t7Dg_-pOq0u4A';

console.log('==================================================');
console.log('SURGE — Supabase Connection & Table Verification');
console.log('==================================================');
console.log(`Endpoint URL: ${supabaseUrl}`);
console.log(`Key Prefix:   ${supabaseKey.substring(0, 16)}...`);
console.log('--------------------------------------------------');

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const startTime = Date.now();
  console.log('[1/3] Testing Supabase Connectivity & Auth...');
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: supabaseKey }
    });
    const data = await res.json();
    const elapsed = Date.now() - startTime;
    console.log(`  ✓ Auth Service Connected: ${data.name || 'GoTrue'} ${data.version || ''} (${elapsed}ms)`);
  } catch (err) {
    console.error(`  ✗ Auth Service Error: ${err.message}`);
  }

  console.log('[2/3] Checking table: "todos"...');
  try {
    const { data, error, status } = await supabase.from('todos').select();
    if (error) {
      if (error.code === 'PGRST205') {
        console.log(`  ℹ Table "todos" does not exist yet (Code: PGRST205 - not in schema cache).`);
      } else {
        console.log(`  ! Query error on "todos": [${error.code}] ${error.message} (HTTP ${status})`);
      }
    } else {
      console.log(`  ✓ Table "todos" exists! Rows: ${data?.length ?? 0}`);
    }
  } catch (err) {
    console.error(`  ✗ Table query failed: ${err.message}`);
  }

  console.log('[3/3] Checking table: "plants" (SURGE Schema)...');
  try {
    const { data, error, status } = await supabase.from('plants').select();
    if (error) {
      if (error.code === 'PGRST205') {
        console.log(`  ℹ Table "plants" does not exist yet (Code: PGRST205 - not in schema cache).`);
      } else {
        console.log(`  ! Query error on "plants": [${error.code}] ${error.message} (HTTP ${status})`);
      }
    } else {
      console.log(`  ✓ Table "plants" exists! Rows: ${data?.length ?? 0}`);
    }
  } catch (err) {
    console.error(`  ✗ Table query failed: ${err.message}`);
  }

  console.log('--------------------------------------------------');
  console.log('Verification Complete.');
  console.log('==================================================');
}

verify();
