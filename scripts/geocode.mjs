import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://dmgkhhkruyonmwxfajls.supabase.co';
const supabaseKey = 'sb_publishable_aT__3XLfxIJ-W3H7ANiWQg_nwnhrQy8';
const hereApiKey = 'fOLsRJBzbQTclu5TbUbrgYA9xVwpclFzgKisf_meiJo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function geocodeAddress(address) {
  const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(address)}&apiKey=${hereApiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return {
        lat: data.items[0].position.lat,
        lng: data.items[0].position.lng
      };
    }
  } catch (error) {
    console.error(`Geocoding failed for ${address}:`, error.message);
  }
  
  return null;
}

async function geocodeAllHouseholds() {
  console.log('Fetching households without coordinates...');
  
  const { data: households, error } = await supabase
    .from('households')
    .select('id, full_address')
    .is('latitude', null);
  
  if (error) {
    console.error('Error fetching:', error.message);
    return;
  }
  
  console.log(`Found ${households.length} households to geocode...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < households.length; i++) {
    const h = households[i];
    process.stdout.write(`[${i + 1}/${households.length}] ${h.full_address}... `);
    
    const coords = await geocodeAddress(h.full_address);
    
    if (coords) {
      const { error: updateError } = await supabase
        .from('households')
        .update({ latitude: coords.lat, longitude: coords.lng })
        .eq('id', h.id);
      
      if (updateError) {
        console.log(`❌ Update failed: ${updateError.message}`);
        failCount++;
      } else {
        console.log(`✓ (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
        successCount++;
      }
    } else {
      console.log('❌ Not found');
      failCount++;
    }
    
    // Rate limiting - HERE allows 10 requests/second
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  console.log(`\n✅ Done! ${successCount} geocoded, ${failCount} failed.`);
}

geocodeAllHouseholds();