import { PrismaClient, UserRole, AnimalSpecies, AnimalSex, AnimalSize, AnimalStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default municipality
  const municipality = await prisma.municipality.upsert({
    where: { cnpj: '12.345.678/0001-90' },
    update: {},
    create: {
      name: 'Prefeitura Municipal de Exemplo',
      cnpj: '12.345.678/0001-90',
      address: 'Rua Principal, 123 - Centro - Cidade Exemplo - SP',
      phone: '(11) 1234-5678',
      email: 'contato@exemplo.gov.br',
      settings: {},
      active: true
    }
  });

  console.log('✅ Municipality created:', municipality.name);

  // Create demo users with exact emails from frontend
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dibea.com' },
    update: {},
    create: {
      email: 'admin@dibea.com',
      passwordHash: adminPassword,
      name: 'Administrador Sistema',
      phone: '(11) 99999-9999',
      role: UserRole.ADMIN,
      municipalityId: municipality.id
    }
  });

  const vetPassword = await bcrypt.hash('vet123', 10);
  const vetUser = await prisma.user.upsert({
    where: { email: 'vet@dibea.com' },
    update: {},
    create: {
      email: 'vet@dibea.com',
      passwordHash: vetPassword,
      name: 'Dr. João Silva',
      phone: '(11) 88888-8888',
      role: UserRole.VETERINARIO,
      municipalityId: municipality.id
    }
  });

  const funcPassword = await bcrypt.hash('func123', 10);
  const funcUser = await prisma.user.upsert({
    where: { email: 'func@dibea.com' },
    update: {},
    create: {
      email: 'func@dibea.com',
      passwordHash: funcPassword,
      name: 'Maria Santos',
      phone: '(11) 77777-7777',
      role: UserRole.FUNCIONARIO,
      municipalityId: municipality.id
    }
  });

  const cidadaoPassword = await bcrypt.hash('cidadao123', 10);
  const cidadaoUser = await prisma.user.upsert({
    where: { email: 'cidadao@dibea.com' },
    update: {},
    create: {
      email: 'cidadao@dibea.com',
      passwordHash: cidadaoPassword,
      name: 'Ana Cidadã',
      phone: '(11) 66666-6666',
      role: UserRole.CIDADAO,
      municipalityId: municipality.id
    }
  });

  console.log('✅ Demo users created');

  // Create sample microchips
  const microchip1 = await prisma.microchip.upsert({
    where: { number: '982000123456789' },
    update: {},
    create: {
      number: '982000123456789',
      municipalityId: municipality.id
    }
  });

  const microchip2 = await prisma.microchip.upsert({
    where: { number: '982000987654321' },
    update: {},
    create: {
      number: '982000987654321',
      municipalityId: municipality.id
    }
  });

  console.log('✅ Sample microchips created');

  // Create sample animals (using upsert to avoid duplicates)
  const animal1 = await prisma.animal.upsert({
    where: { qrCode: 'QR_REX_001' },
    update: {},
    create: {
      name: 'Rex',
      species: AnimalSpecies.CANINO,
      breed: 'Labrador',
      sex: AnimalSex.MACHO,
      size: AnimalSize.GRANDE,
      birthDate: new Date('2020-03-15'),
      weight: 25.5,
      color: 'Dourado',
      temperament: 'Dócil, brincalhão, ótimo com crianças',
      observations: 'Animal muito sociável, castrado, todas as vacinas em dia',
      status: AnimalStatus.DISPONIVEL,
      qrCode: 'QR_REX_001',
      municipalityId: municipality.id,
      microchipId: microchip1.id
    }
  });

  const animal2 = await prisma.animal.upsert({
    where: { qrCode: 'QR_LUNA_002' },
    update: {},
    create: {
      name: 'Luna',
      species: AnimalSpecies.FELINO,
      breed: 'SRD',
      sex: AnimalSex.FEMEA,
      size: AnimalSize.MEDIO,
      birthDate: new Date('2021-07-20'),
      weight: 4.2,
      color: 'Preta e branca',
      temperament: 'Carinhosa, independente, gosta de carinho',
      observations: 'Gata muito carinhosa, castrada, vermifugada',
      status: AnimalStatus.DISPONIVEL,
      qrCode: 'QR_LUNA_002',
      municipalityId: municipality.id,
      microchipId: microchip2.id
    }
  });

  console.log('✅ Sample animals created');

  // Create more animals for better stats
  await prisma.animal.upsert({
    where: { qrCode: 'QR_THOR_003' },
    update: {},
    create: {
      name: 'Thor',
      species: AnimalSpecies.CANINO,
      breed: 'Pastor Alemão',
      sex: AnimalSex.MACHO,
      size: AnimalSize.GRANDE,
      birthDate: new Date('2019-05-10'),
      weight: 35.0,
      color: 'Preto e marrom',
      temperament: 'Protetor, leal, inteligente',
      observations: 'Ótimo cão de guarda, treinado, todas as vacinas em dia',
      status: AnimalStatus.DISPONIVEL,
      qrCode: 'QR_THOR_003',
      municipalityId: municipality.id
    }
  });

  await prisma.animal.upsert({
    where: { qrCode: 'QR_MEL_004' },
    update: {},
    create: {
      name: 'Mel',
      species: AnimalSpecies.FELINO,
      breed: 'Siamês',
      sex: AnimalSex.FEMEA,
      size: AnimalSize.PEQUENO,
      birthDate: new Date('2022-03-15'),
      weight: 3.5,
      color: 'Creme com pontas escuras',
      temperament: 'Vocal, carinhosa, brincalhona',
      observations: 'Gata muito comunicativa, castrada, vacinada',
      status: AnimalStatus.DISPONIVEL,
      qrCode: 'QR_MEL_004',
      municipalityId: municipality.id
    }
  });

  await prisma.animal.upsert({
    where: { qrCode: 'QR_BOB_005' },
    update: {},
    create: {
      name: 'Bob',
      species: AnimalSpecies.CANINO,
      breed: 'Beagle',
      sex: AnimalSex.MACHO,
      size: AnimalSize.MEDIO,
      birthDate: new Date('2021-11-20'),
      weight: 12.0,
      color: 'Tricolor',
      temperament: 'Alegre, curioso, amigável',
      observations: 'Cão muito ativo, adora brincar, castrado e vacinado',
      status: AnimalStatus.ADOTADO,
      qrCode: 'QR_BOB_005',
      municipalityId: municipality.id
    }
  });

  console.log('✅ Additional animals created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Created demo accounts:');
  console.log('👑 Admin: admin@dibea.com / admin123');
  console.log('🩺 Veterinário: vet@dibea.com / vet123');
  console.log('👨‍💼 Funcionário: func@dibea.com / func123');
  console.log('👤 Cidadão: cidadao@dibea.com / cidadao123');
  console.log('\n🐕 Created sample animals:');
  console.log('• Rex (Cão Labrador) - Disponível');
  console.log('• Luna (Gata SRD) - Disponível');
  console.log('• Thor (Pastor Alemão) - Disponível');
  console.log('• Mel (Siamês) - Disponível');
  console.log('• Bob (Beagle) - Adotado');
  console.log('\n📊 Stats:');
  console.log('• Total de animais: 5');
  console.log('• Disponíveis para adoção: 4');
  console.log('• Adotados: 1');
  console.log('• Municípios ativos: 1');
  console.log('• Usuários registrados: 4');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
