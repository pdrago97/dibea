import { PrismaClient, UserRole, AnimalSpecies, AnimalSex, AnimalSize, AnimalStatus, TutorStatus, AdoptionStatus, ComplaintStatus, AppointmentStatus, HousingType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting REAL database seeding...');

  // Clear existing data first
  console.log('🧹 Clearing existing data...');
  await prisma.agentInteraction.deleteMany();
  await prisma.agentMetrics.deleteMany();
  await prisma.systemAnalytics.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.whatsappConversation.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.adoption.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.microchip.deleteMany();
  await prisma.tutor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.municipality.deleteMany();

  // Create municipality
  const municipality = await prisma.municipality.create({
    data: {
      name: 'Prefeitura Municipal de São Paulo',
      email: 'dibea@prefeitura.sp.gov.br',
      phone: '(11) 3113-9000',
      cnpj: '46.395.000/0001-39',
      active: true,
      configurations: {
        allowAdoptions: true,
        requireDocuments: true,
        maxAnimalsPerTutor: 3
      }
    }
  });

  console.log('✅ Municipality created:', municipality.name);

  // Create users with real data
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dibea.com',
      passwordHash: hashedPassword,
      name: 'Dr. Carlos Silva',
      role: UserRole.ADMIN,
      phone: '(11) 99999-0001',
      active: true,
      municipalityId: municipality.id
    }
  });

  const vetUser = await prisma.user.create({
    data: {
      email: 'vet@dibea.com',
      passwordHash: await bcrypt.hash('vet123', 10),
      name: 'Dra. Maria Santos',
      role: UserRole.VETERINARIO,
      phone: '(11) 99999-0002',
      active: true,
      municipalityId: municipality.id
    }
  });

  const funcUser = await prisma.user.create({
    data: {
      email: 'func@dibea.com',
      passwordHash: await bcrypt.hash('func123', 10),
      name: 'João Oliveira',
      role: UserRole.FUNCIONARIO,
      phone: '(11) 99999-0003',
      active: true,
      municipalityId: municipality.id
    }
  });

  const cidadaoUser = await prisma.user.create({
    data: {
      email: 'cidadao@dibea.com',
      passwordHash: await bcrypt.hash('cidadao123', 10),
      name: 'Ana Costa',
      role: UserRole.CIDADAO,
      phone: '(11) 99999-0004',
      active: true,
      municipalityId: municipality.id
    }
  });

  console.log('✅ Users created');

  // Create real tutors
  const tutor1 = await prisma.tutor.create({
    data: {
      name: 'Pedro Henrique Silva',
      cpf: '123.456.789-01',
      email: 'pedro.silva@email.com',
      phone: '(11) 98765-4321',
      fullAddress: 'Rua das Flores, 123 - Vila Madalena',
      zipCode: '05435-000',
      city: 'São Paulo',
      state: 'SP',
      status: TutorStatus.ATIVO,
      municipalityId: municipality.id,
      housingType: HousingType.CASA,
      hasExperience: true,
      observations: 'Tutor experiente, já teve 2 cães anteriormente'
    }
  });

  const tutor2 = await prisma.tutor.create({
    data: {
      name: 'Mariana Fernandes',
      cpf: '987.654.321-09',
      email: 'mariana.fernandes@email.com',
      phone: '(11) 91234-5678',
      fullAddress: 'Av. Paulista, 1000 - Bela Vista',
      zipCode: '01310-100',
      city: 'São Paulo',
      state: 'SP',
      status: TutorStatus.ATIVO,
      municipalityId: municipality.id,
      housingType: HousingType.APARTAMENTO,
      hasExperience: false,
      observations: 'Primeira adoção, muito interessada em cuidar bem do animal'
    }
  });

  console.log('✅ Tutors created');

  // Create microchips
  const microchip1 = await prisma.microchip.create({
    data: {
      number: '982000123456789',
      implantDate: new Date('2023-01-15'),
      isActive: true
    }
  });

  const microchip2 = await prisma.microchip.create({
    data: {
      number: '982000987654321',
      implantDate: new Date('2023-02-20'),
      isActive: true
    }
  });

  const microchip3 = await prisma.microchip.create({
    data: {
      number: '982000555666777',
      implantDate: new Date('2023-03-10'),
      isActive: true
    }
  });

  console.log('✅ Microchips created');

  // Create real animals
  const animal1 = await prisma.animal.create({
    data: {
      name: 'Rex',
      species: AnimalSpecies.CANINO,
      breed: 'Labrador',
      sex: AnimalSex.MACHO,
      size: AnimalSize.GRANDE,
      age: 3,
      weight: 28.5,
      color: 'Dourado',
      status: AnimalStatus.DISPONIVEL,
      description: 'Rex é um cão muito carinhoso e brincalhão. Adora crianças e se dá bem com outros animais. Está castrado e com todas as vacinas em dia.',
      rescueDate: new Date('2023-01-10'),
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
      age: 2,
      weight: 4.2,
      color: 'Preta e branca',
      status: AnimalStatus.ADOTADO,
      description: 'Luna é uma gatinha muito carinhosa e independente. Gosta de carinho mas também valoriza seu espaço. Ideal para apartamento.',
      rescueDate: new Date('2023-02-15'),
      municipalityId: municipality.id,
      microchipId: microchip2.id
    }
  });

  const animal3 = await prisma.animal.create({
    data: {
      name: 'Buddy',
      species: AnimalSpecies.CANINO,
      breed: 'Golden Retriever',
      sex: AnimalSex.MACHO,
      size: AnimalSize.GRANDE,
      age: 5,
      weight: 32.0,
      color: 'Dourado claro',
      status: AnimalStatus.DISPONIVEL,
      description: 'Buddy é um cão adulto muito calmo e obediente. Perfeito para famílias com crianças. Já foi treinado e conhece comandos básicos.',
      rescueDate: new Date('2023-03-01'),
      municipalityId: municipality.id,
      microchipId: microchip3.id
    }
  });

  console.log('✅ Animals created');

  // Create adoptions
  const adoption1 = await prisma.adoption.create({
    data: {
      animalId: animal2.id,
      tutorId: tutor1.id,
      status: AdoptionStatus.APROVADA,
      requestDate: new Date('2023-02-20'),
      approvalDate: new Date('2023-02-25'),
      completionDate: new Date('2023-03-01'),
      notes: 'Adoção aprovada após visita domiciliar. Tutor demonstrou muito carinho e preparo.'
    }
  });

  const adoption2 = await prisma.adoption.create({
    data: {
      animalId: animal1.id,
      tutorId: tutor2.id,
      status: AdoptionStatus.PENDENTE,
      requestDate: new Date('2024-01-15'),
      notes: 'Aguardando visita domiciliar para aprovação final.'
    }
  });

  console.log('✅ Adoptions created');

  // Create appointments
  const appointment1 = await prisma.appointment.create({
    data: {
      animalId: animal1.id,
      userId: vetUser.id,
      type: 'CONSULTA',
      date: new Date('2024-01-25'),
      status: AppointmentStatus.AGENDADO,
      notes: 'Consulta de rotina e aplicação de vacina anual',
      municipalityId: municipality.id
    }
  });

  console.log('✅ Appointments created');

  // Create complaints
  const complaint1 = await prisma.complaint.create({
    data: {
      userId: cidadaoUser.id,
      type: 'MAUS_TRATOS',
      description: 'Animal abandonado na Rua Augusta, 500. Aparenta estar desnutrido e ferido.',
      location: 'Rua Augusta, 500 - Consolação - São Paulo/SP',
      status: ComplaintStatus.ABERTA,
      priority: 1,
      municipalityId: municipality.id
    }
  });

  console.log('✅ Complaints created');

  console.log('🎉 Real database seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`- Municipality: ${municipality.name}`);
  console.log(`- Users: 4 (Admin, Vet, Funcionário, Cidadão)`);
  console.log(`- Tutors: 2`);
  console.log(`- Animals: 3 (1 adotado, 2 disponíveis)`);
  console.log(`- Adoptions: 2 (1 aprovada, 1 pendente)`);
  console.log(`- Appointments: 1`);
  console.log(`- Complaints: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
