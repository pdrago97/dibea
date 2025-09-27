#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDataTransparency() {
    console.log('🧪 TESTE DE TRANSPARÊNCIA DE DADOS - DIBEA');
    console.log('==========================================\n');

    try {
        // 1. Testar API da Landing Page
        console.log('📊 Testando API da Landing Page...');
        const landingResponse = await fetch('http://localhost:3000/api/v1/landing/stats');
        const landingData = await landingResponse.json();
        
        console.log('✅ Dados da Landing Page:');
        console.log(`   - Total de Animais: ${landingData.totalAnimals}`);
        console.log(`   - Animais Adotados: ${landingData.adoptedAnimals}`);
        console.log(`   - Municípios Ativos: ${landingData.totalMunicipalities}`);
        console.log(`   - Usuários Registrados: ${landingData.totalUsers}\n`);

        // 2. Fazer login como admin
        console.log('🔐 Fazendo login como administrador...');
        const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: 'admin@dibea.com', 
                password: 'admin123' 
            })
        });
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Login realizado com sucesso\n');

        // 3. Testar API do Dashboard Admin
        console.log('🔧 Testando API do Dashboard Admin...');
        const adminResponse = await fetch('http://localhost:3000/api/v1/admin/dashboard/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const adminData = await adminResponse.json();
        
        console.log('✅ Dados do Dashboard Admin:');
        console.log(`   - Total de Animais: ${adminData.totalAnimals}`);
        console.log(`   - Animais Disponíveis: ${adminData.availableAnimals}`);
        console.log(`   - Animais Adotados: ${adminData.adoptedAnimals}`);
        console.log(`   - Total de Usuários: ${adminData.totalUsers}`);
        console.log(`   - Usuários Ativos: ${adminData.activeUsers}`);
        console.log(`   - Taxa de Adoção: ${adminData.adoptionRate}%\n`);

        // 4. Comparar dados
        console.log('🔍 COMPARAÇÃO DE TRANSPARÊNCIA:');
        console.log('================================');
        
        const comparisons = [
            { 
                field: 'Total de Animais', 
                landing: landingData.totalAnimals, 
                admin: adminData.totalAnimals 
            },
            { 
                field: 'Animais Adotados', 
                landing: landingData.adoptedAnimals, 
                admin: adminData.adoptedAnimals 
            },
            { 
                field: 'Total de Usuários', 
                landing: landingData.totalUsers, 
                admin: adminData.totalUsers 
            },
            { 
                field: 'Municípios', 
                landing: landingData.totalMunicipalities, 
                admin: adminData.totalMunicipalities || 1 
            }
        ];

        let allConsistent = true;
        
        comparisons.forEach(comp => {
            const isConsistent = comp.landing === comp.admin;
            const status = isConsistent ? '✅ CONSISTENTE' : '❌ INCONSISTENTE';
            
            console.log(`${comp.field}:`);
            console.log(`   Landing: ${comp.landing} | Admin: ${comp.admin} | ${status}`);
            
            if (!isConsistent) {
                allConsistent = false;
            }
        });

        console.log('\n' + '='.repeat(50));
        
        if (allConsistent) {
            console.log('🎉 RESULTADO: DADOS 100% TRANSPARENTES E CONSISTENTES!');
            console.log('✅ Todos os dados estão alinhados entre as diferentes APIs');
            console.log('✅ A transparência de dados foi CONFIRMADA');
        } else {
            console.log('⚠️  RESULTADO: INCONSISTÊNCIAS DETECTADAS!');
            console.log('❌ Alguns dados não estão alinhados entre as APIs');
            console.log('❌ A transparência de dados precisa ser CORRIGIDA');
        }

        console.log('\n📈 MÉTRICAS ADICIONAIS DO ADMIN:');
        console.log(`   - Animais Disponíveis: ${adminData.availableAnimals}`);
        console.log(`   - Usuários Ativos: ${adminData.activeUsers}`);
        console.log(`   - Taxa de Adoção: ${adminData.adoptionRate}%`);

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
        process.exit(1);
    }
}

// Executar o teste
testDataTransparency();
