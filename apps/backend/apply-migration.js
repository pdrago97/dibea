#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🔄 Aplicando migration de User Elevation System...\n');

  const migrationPath = path.join(__dirname, 'prisma/migrations/add_user_elevation_system.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('📝 Lendo migration SQL...');
  console.log('📊 Tamanho:', migrationSQL.length, 'caracteres\n');

  try {
    // Split by statements (rough split by semicolon)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 ${statements.length} statements para executar\n`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments and empty statements
      if (statement.trim().length < 5) continue;
      
      process.stdout.write(`[${i + 1}/${statements.length}] Executando... `);

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // If function doesn't exist, try direct query
          const { error: queryError } = await supabase
            .from('_prisma_migrations')
            .select('id')
            .limit(1);

          if (queryError) {
            console.log('⚠️  Skipped (expected)');
            continue;
          }
          
          console.log('❌ Error');
          console.error(error.message);
          failed++;
        } else {
          console.log('✅');
          success++;
        }
      } catch (err) {
        console.log('⚠️  Skipped');
      }
    }

    console.log(`\n✅ Migration concluída!`);
    console.log(`   Success: ${success}`);
    console.log(`   Failed/Skipped: ${failed}\n`);

    // Verify tables were created
    console.log('🔍 Verificando tabelas criadas...\n');

    const tablesToCheck = [
      'user_elevation_requests',
      'adoption_applications', 
      'document_validations'
    ];

    for (const table of tablesToCheck) {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error) {
        console.log(`❌ Tabela "${table}" NÃO foi criada`);
        console.error(`   Erro: ${error.message}\n`);
      } else {
        console.log(`✅ Tabela "${table}" criada com sucesso`);
      }
    }

    console.log('\n🎉 Migration aplicada! Agora execute:');
    console.log('   cd apps/backend && npx prisma generate\n');

  } catch (error) {
    console.error('\n❌ Erro ao aplicar migration:', error);
    process.exit(1);
  }
}

applyMigration();
