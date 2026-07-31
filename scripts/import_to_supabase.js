// Supabase Data Importer — imports all 3732 Zepto products into Supabase PostgreSQL
// Run: node scripts/import_to_supabase.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://bhotkxonwfjzshleygmn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob3RreG9ud2ZqenNobGV5Z21uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTUyODQxNywiZXhwIjoyMTAxMTA0NDE3fQ.r_lkw2yzi2Q_dWb_LpHSK22J9t0A-mq42AJyeED9qI8';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Proper CSV parser that handles quoted fields (e.g. "Dairy, Bread & Batter")
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  console.log('🚀 Starting Supabase import...\n');

  // --- Parse CSV ---
  const csvPath = path.join(__dirname, '..', 'zepto_v2.csv');
  const raw = fs.readFileSync(csvPath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim());
  console.log(`📄 CSV loaded: ${lines.length - 1} data rows`);

  // Build category map
  const categoryMap = {};
  let catId = 1;
  const categoryGroups = {};

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 8) continue;
    const mrpRaw = parseInt(cols[2], 10);
    const spRaw = parseInt(cols[5], 10);
    if (isNaN(mrpRaw) || isNaN(spRaw)) continue;

    const category = cols[0];
    if (!categoryGroups[category]) {
      categoryGroups[category] = 0;
      categoryMap[category] = catId++;
    }
    categoryGroups[category]++;

    rows.push({
      category,
      name: cols[1],
      mrp: mrpRaw,
      discountPercent: parseInt(cols[3], 10) || 0,
      availableQuantity: parseInt(cols[4], 10) || 0,
      discountedSellingPrice: spRaw,
      weightInGms: parseInt(cols[6], 10) || 0,
      outOfStock: cols[7].toUpperCase() === 'TRUE',
      quantity: (cols[8] || '1').replace(/\r/g, ''),
    });
  }

  console.log(`✅ Parsed ${rows.length} valid products across ${Object.keys(categoryGroups).length} categories\n`);

  // --- Insert Categories ---
  console.log('📦 Inserting categories...');
  const categoryRows = Object.entries(categoryGroups).map(([name, count]) => ({
    id: categoryMap[name],
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    product_count: count,
  }));

  const { error: catError } = await supabase
    .from('categories')
    .upsert(categoryRows, { onConflict: 'id' });

  if (catError) {
    console.error('❌ Category insert failed:', catError.message);
    console.error('→ Make sure you ran the CREATE TABLE SQL in Supabase SQL Editor first!');
    process.exit(1);
  }
  console.log(`✅ ${categoryRows.length} categories inserted\n`);

  // --- Insert Products in batches of 200 ---
  console.log('🛒 Inserting products in batches...');
  const productRows = rows.map((row, idx) => {
    const id = idx + 1;
    const prefix = row.category.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    return {
      id,
      sku: `${prefix}-${String(id).padStart(4, '0')}`,
      name: row.name,
      category: row.category,
      category_id: categoryMap[row.category],
      mrp: parseFloat((row.mrp / 100).toFixed(2)),
      discount_percent: row.discountPercent,
      selling_price: parseFloat((row.discountedSellingPrice / 100).toFixed(2)),
      weight_gms: row.weightInGms,
      available_quantity: row.availableQuantity,
      out_of_stock: row.outOfStock,
      quantity_desc: row.quantity,
    };
  });

  const BATCH_SIZE = 200;
  let inserted = 0;
  for (let i = 0; i < productRows.length; i += BATCH_SIZE) {
    const batch = productRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Batch ${Math.floor(i/BATCH_SIZE)+1} failed:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    process.stdout.write(`\r  → ${inserted}/${productRows.length} products inserted...`);
  }

  console.log(`\n✅ All ${inserted} products inserted!\n`);
  console.log('🎉 Import complete! Your Supabase DB is ready.');
  console.log(`   Products: ${inserted}`);
  console.log(`   Categories: ${categoryRows.length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
