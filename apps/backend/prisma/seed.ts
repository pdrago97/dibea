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
      configurations: {
        maxAnimalsPerTutor: 3,
        adoptionRequiresApproval: true,
        enableWhatsappBot: true,
        workingHours: {
          start: '08:00',
          end: '17:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        }
      }
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

  // Create sample tutors
  const tutor1 = await prisma.tutor.upsert({
    where: { cpf: '123.456.789-01' },
    update: {},
    create: {
      cpf: '123.456.789-01',
      rg: '12.345.678-9',
      name: 'Ana Costa',
      email: 'ana.costa@email.com',
      phone: '(11) 91234-5678',
      fullAddress: 'Rua das Flores, 456 - Jardim Primavera',
      zipCode: '01234-567',
      city: 'São Paulo',
      state: 'SP',
      housingType: 'CASA',
      hasExperience: true,
      municipalityId: municipality.id
    }
  });

  const tutor2 = await prisma.tutor.upsert({
    where: { cpf: '987.654.321-09' },
    update: {},
    create: {
      cpf: '987.654.321-09',
      rg: '98.765.432-1',
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      phone: '(11) 98765-4321',
      fullAddress: 'Av. Central, 789 - Vila Nova',
      zipCode: '09876-543',
      city: 'São Paulo',
      state: 'SP',
      housingType: 'APARTAMENTO',
      hasExperience: false,
      municipalityId: municipality.id
    }
  });

  console.log('✅ Sample tutors created');

  // Create sample microchips
  const microchip1 = await prisma.microchip.create({
    data: {
      number: '982000123456789',
      municipalityId: municipality.id
    }
  });

  const microchip2 = await prisma.microchip.create({
    data: {
      number: '982000987654321',
      municipalityId: municipality.id
    }
  });

  console.log('✅ Sample microchips created');

  // Create sample animals
  const animal1 = await prisma.animal.create({
    data: {
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

  const animal2 = await prisma.animal.create({
    data: {
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

  // Create medical history for animals
  await prisma.medicalHistory.createMany({
    data: [
      {
        animalId: animal1.id,
        type: 'VACINA',
        description: 'Vacina V10',
        date: new Date('2023-01-15'),
        veterinarian: 'Dr. João Silva'
      },
      {
        animalId: animal1.id,
        type: 'PROCEDIMENTO',
        description: 'Castração',
        date: new Date('2023-02-10'),
        veterinarian: 'Dr. João Silva'
      },
      {
        animalId: animal2.id,
        type: 'VACINA',
        description: 'Vacina Tríplice Felina',
        date: new Date('2023-01-20'),
        veterinarian: 'Dr. João Silva'
      }
    ]
  });

  console.log('✅ Medical history created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Created demo accounts:');
  console.log('👑 Admin: admin@dibea.com / admin123');
  console.log('🩺 Veterinário: vet@dibea.com / vet123');
  console.log('👨‍💼 Funcionário: func@dibea.com / func123');
  console.log('👤 Cidadão: cidadao@dibea.com / cidadao123');
  console.log('\n🐕 Created sample animals:');
  console.log('• Rex (Cão Labrador) - Disponível para adoção');
  console.log('• Luna (Gata SRD) - Disponível para adoção');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
