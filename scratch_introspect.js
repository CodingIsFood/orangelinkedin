const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY']
);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) console.error(error);
  console.log("Profiles schema:", data && data.length ? Object.keys(data[0]) : "No data");
  
  const { error: err2 } = await supabase.from('support_tickets').select('*').limit(1);
  if (err2) console.log("support_tickets table error:", err2.message);
  else console.log("support_tickets table exists.");
}

run();
