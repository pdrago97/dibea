#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRegister() {
    console.log('🧪 TESTE DE REGISTRO - DIBEA');
    console.log('============================\n');

    try {
        // Test data
        const testUser = {
            name: 'Pedro Teste',
            email: `teste${Date.now()}@dibea.com`,
            password: '123456',
            phone: '11999999999',
            zipCode: '88135185',
            role: 'CIDADAO'
        };

        console.log('📝 Dados do teste:');
        console.log(`   Nome: ${testUser.name}`);
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Telefone: ${testUser.phone}`);
        console.log(`   CEP: ${testUser.zipCode}\n`);

        // Test registration
        console.log('🔐 Testando registro...');
        const response = await fetch('http://localhost:3000/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ REGISTRO REALIZADO COM SUCESSO!');
            console.log(`   Token: ${data.token ? 'Gerado' : 'Não gerado'}`);
            console.log(`   Usuário ID: ${data.user?.id || 'N/A'}`);
            console.log(`   Nome: ${data.user?.name || 'N/A'}`);
            console.log(`   Email: ${data.user?.email || 'N/A'}`);
            console.log(`   Role: ${data.user?.role || 'N/A'}`);
            console.log(`   Município: ${data.user?.municipality || 'N/A'}`);
            console.log(`   Mensagem: ${data.message || 'N/A'}\n`);

            // Test login with new user
            console.log('🔑 Testando login com nova conta...');
            const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: testUser.password
                })
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
                console.log('✅ LOGIN REALIZADO COM SUCESSO!');
                console.log(`   Token válido: ${loginData.token ? 'Sim' : 'Não'}`);
                console.log(`   Usuário autenticado: ${loginData.user?.name || 'N/A'}\n`);
                
                console.log('🎉 TESTE COMPLETO: REGISTRO E LOGIN FUNCIONANDO!');
            } else {
                console.log('❌ ERRO NO LOGIN:');
                console.log(`   Status: ${loginResponse.status}`);
                console.log(`   Mensagem: ${loginData.message || 'Erro desconhecido'}\n`);
            }

        } else {
            console.log('❌ ERRO NO REGISTRO:');
            console.log(`   Status: ${response.status}`);
            console.log(`   Mensagem: ${data.message || 'Erro desconhecido'}`);
            console.log(`   Detalhes: ${JSON.stringify(data, null, 2)}\n`);
        }

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    }
}

// Test duplicate email
async function testDuplicateEmail() {
    console.log('🔄 TESTE DE EMAIL DUPLICADO');
    console.log('============================\n');

    try {
        const duplicateUser = {
            name: 'Usuário Duplicado',
            email: 'admin@dibea.com', // Email que já existe
            password: '123456',
            phone: '11888888888'
        };

        console.log('📝 Testando registro com email existente...');
        const response = await fetch('http://localhost:3000/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(duplicateUser)
        });

        const data = await response.json();

        if (response.status === 400 && data.message?.includes('já está em uso')) {
            console.log('✅ VALIDAÇÃO DE EMAIL DUPLICADO FUNCIONANDO!');
            console.log(`   Mensagem: ${data.message}\n`);
        } else {
            console.log('❌ VALIDAÇÃO DE EMAIL DUPLICADO FALHOU!');
            console.log(`   Status: ${response.status}`);
            console.log(`   Resposta: ${JSON.stringify(data, null, 2)}\n`);
        }

    } catch (error) {
        console.error('❌ Erro no teste de email duplicado:', error.message);
    }
}

// Run tests
async function runAllTests() {
    await testRegister();
    await testDuplicateEmail();
    
    console.log('🏁 TODOS OS TESTES CONCLUÍDOS!');
}

runAllTests();
