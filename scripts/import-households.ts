// HCA Park - Household Import Script
// Run: npx ts-node scripts/import-households.ts

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load households from JSON
const householdsPath = path.join(__dirname, 'households-data.json');
const householdsData = JSON.parse(fs.readFileSync(householdsPath, 'utf-8'));

// Supabase config (set these in .env.local)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!; // Service key for admin access

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importHouseholds() {
  console.log(`Importing ${householdsData.length} households...`);

  // Transform data for Supabase
  const records = householdsData.map((h: any) => ({
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
    // lat/lng will be added via geocoding script
  }));

  // Insert in batches of 100
  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const { error } = await supabase.from('households').insert(batch);
    
    if (error) {
      console.error(`Error importing batch ${i}:`, error);
    } else {
      imported += batch.length;
      console.log(`Imported ${imported}/${records.length} households...`);
    }
  }

  console.log(`✅ Import complete! ${imported} households imported.`);
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  // Using HERE Geocoding API (you have this key in TOOLS.md)
  const apiKey = 'YOUR_HERE_API_KEY';
  const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apiKey=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return {
        lat: data.items[0].position.lat,
        lng: data.items[0].position.lng,
      };
    }
  } catch (error) {
    console.error(`Geocoding failed for ${address}:`, error);
  }
  
  return null;
}

async function geocodeAllHouseholds() {
  console.log('Geocoding all households...');
  
  const { data: households, error } = await supabase
    .from('households')
    .select('id, full_address')
    .is('latitude', null);

  if (error) {
    console.error('Error fetching households:', error);
    return;
  }

  console.log(`Found ${households.length} households to geocode...`);

  for (const h of households) {
    const coords = await geocodeAddress(h.full_address);
    
    if (coords) {
      const { error } = await supabase
        .from('households')
        .update({ latitude: coords.lat, longitude: coords.lng })
        .eq('id', h.id);
      
      if (error) {
        console.error(`Error updating ${h.id}:`, error);
      } else {
        console.log(`✓ Geocoded: ${h.full_address}`);
      }
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('✅ Geocoding complete!');
}

// Run
importHouseholds();