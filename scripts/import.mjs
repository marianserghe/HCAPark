import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const households = JSON.parse(readFileSync('./scripts/households-data.json', 'utf-8'));

const supabaseUrl = 'https://dmgkhhkruyonmwxfajls.supabase.co';
const supabaseKey = 'sb_publishable_aT__3XLfxIJ-W3H7ANiWQg_nwnhrQy8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importHouseholds() {
  console.log(`Importing ${households.length} households...`);

  // First, clear existing data
  const { error: deleteError } = await supabase
    .from('households')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (deleteError) {
    console.log('Clearing existing data:', deleteError.message);
  } else {
    console.log('Cleared existing households');
  }

  // Transform data for Supabase
  const records = households.map(h => ({
    house_number: h.house_number,
    street: h.street,
    full_address: h.full_address,
    last_name: h.last_name,
    first_name: h.first_name,
    spouse: h.spouse || null,
    phone: h.phone || null,
    email: h.email || null,
    status: h.paid ? 'paid' : 'unpaid',
    amount_paid: h.paid ? 50.00 : 0,
  }));

  // Insert in batches of 50
  const batchSize = 50;
  let imported = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('households').insert(batch);
    
    if (error) {
      console.error(`Error importing batch ${i}:`, error.message);
    } else {
      imported += batch.length;
      console.log(`Imported ${imported}/${records.length} households...`);
    }
  }

  console.log(`\n✅ Done! ${imported} households imported.`);
}

importHouseholds();