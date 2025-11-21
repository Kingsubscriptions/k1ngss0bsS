const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase credentials (from .env)
const supabaseUrl = 'https://mfocjlndrxeufwexdkev.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mb2NqbG5kcnhldWZ3ZXhka2V2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM4MDAxMCwiZXhwIjoyMDczOTU2MDEwfQ.aLmsyxWiKZcf2yJYxIsR_pf8rGuj5OoQMJRt_ESdVho';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// -------------------------------------------------------------------
// Load local products.ts and extract the exported array safely
function loadLocalProducts() {
    const content = fs.readFileSync('src/data/products.ts', 'utf8');
    const startIdx = content.indexOf('export const products');
    const bracketIdx = content.indexOf('[', startIdx);
    let depth = 1;
    let i = bracketIdx + 1;
    let inString = false;
    let stringChar = null;
    let escaped = false;
    for (; i < content.length; i++) {
        const ch = content[i];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\') { escaped = true; continue; }
        if (!inString && (ch === '"' || ch === "'" || ch === '`')) { inString = true; stringChar = ch; continue; }
        if (inString && ch === stringChar) { inString = false; stringChar = null; continue; }
        if (!inString) {
            if (ch === '[') depth++;
            if (ch === ']') { depth--; if (depth === 0) break; }
        }
    }
    const arrayText = content.substring(bracketIdx, i + 1);
    // Evaluate safely – file only contains plain objects
    return eval('(' + arrayText + ')');
}

(async () => {
    console.log('🔗 Connecting to Supabase...');
    const localProducts = loadLocalProducts();
    console.log(`✅ Loaded ${localProducts.length} products from local file.`);

    // Fetch current DB product IDs
    const { data: dbProducts, error: fetchErr } = await supabase
        .from('products')
        .select('id')
        .order('id');
    if (fetchErr) { console.error('❌ Error fetching DB products:', fetchErr); return; }
    const dbIds = new Set(dbProducts.map(p => p.id));
    const localIds = new Set(localProducts.map(p => p.id));

    // Delete rows not present locally
    const idsToDelete = [...dbIds].filter(id => !localIds.has(id));
    if (idsToDelete.length) {
        console.log(`🗑️ Deleting ${idsToDelete.length} stale rows...`);
        const { error: delErr } = await supabase.from('products').delete().in('id', idsToDelete);
        if (delErr) console.error('❌ Delete error:', delErr); else console.log('✅ Stale rows removed.');
    } else {
        console.log('✅ No stale rows to delete.');
    }

    // Prepare upsert payload (match DB column names)
    const upsertPayload = localProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: typeof p.price === 'object' ? p.price : { monthly: p.price },
        image: p.image || '',
        category: p.category,
        features: p.features || [],
        long_description: p.longDescription || '',
        stock: p.stock !== undefined ? p.stock : true,
        popular: p.popular || false,
        plans: p.plans || [],
        rating: p.rating || 5,
        tags: p.tags || [],
        badge: p.badge || ''
    }));

    console.log(`⬆️ Upserting ${upsertPayload.length} products...`);
    const { data: upserted, error: upErr } = await supabase
        .from('products')
        .upsert(upsertPayload, { onConflict: 'id' })
        .select();
    if (upErr) { console.error('❌ Upsert error:', upErr); return; }
    console.log(`✅ Upsert complete. DB now contains ${upserted.length} rows.`);
    console.log('🎉 All products are now in sync with Supabase.');
})();
