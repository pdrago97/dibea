import { PrismaClient, UserRole, AnimalSpecies, AnimalSex, AnimalSize, AnimalStatus, TutorStatus, AdoptionStatus, ComplaintStatus, AppointmentStatus } from '@prisma/client';
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
      address: 'Viaduto do Chá, 15 - Centro - São Paulo/SP',
      active: true,
      configurations: {
        allowAdoptions: true,
        requireDocuments: true,
        maxAnimalsPerTutor: 3,
        workingHours: '08:00-17:00',
        emergencyPhone: '(11) 99999-9999'
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
      address: 'Rua das Flores, 123 - Vila Madalena - São Paulo/SP',
      cep: '05435-000',
      status: TutorStatus.ATIVO,
      municipalityId: municipality.id,
      housingType: 'CASA',
      hasExperience: true,
      notes: 'Tutor experiente, já teve 2 cães anteriormente'
    }
  });

  const tutor2 = await prisma.tutor.create({
    data: {
      name: 'Mariana Fernandes',
      cpf: '987.654.321-09',
      email: 'mariana.fernandes@email.com',
      phone: '(11) 91234-5678',
      address: 'Av. Paulista, 1000 - Bela Vista - São Paulo/SP',
      cep: '01310-100',
      status: TutorStatus.ATIVO,
      municipalityId: municipality.id,
      housingType: 'APARTAMENTO',
      hasExperience: false,
      notes: 'Primeira adoção, muito interessada em cuidar bem do animal'
    }
  });

  console.log('✅ Tutors created');

  // Create microchips
  const microchip1 = await prisma.microchip.create({
    data: {
      number: '982000123456789',
      manufacturer: 'PetID',
      implantDate: new Date('2023-01-15'),
      isActive: true
    }
  });

  const microchip2 = await prisma.microchip.create({
    data: {
      number: '982000987654321',
      manufacturer: 'AnimalChip',
      implantDate: new Date('2023-02-20'),
      isActive: true
    }
  });

  const microchip3 = await prisma.microchip.create({
    data: {
      number: '982000555666777',
      manufacturer: 'PetID',
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
      medicalHistory: 'Vacinado, vermifugado, castrado. Histórico de saúde excelente.',
      rescueDate: new Date('2023-01-10'),
      municipalityId: municipality.id,
      microchipId: microchip1.id,
      photos: ['https://example.com/rex1.jpg', 'https://example.com/rex2.jpg']
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
      medicalHistory: 'Vacinada, vermifugada, castrada. Sem problemas de saúde.',
      rescueDate: new Date('2023-02-15'),
      municipalityId: municipality.id,
      microchipId: microchip2.id,
      photos: ['https://example.com/luna1.jpg']
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
      medicalHistory: 'Vacinado, vermifugado, castrado. Tratamento para displasia de quadril concluído.',
      rescueDate: new Date('2023-03-01'),
      municipalityId: municipality.id,
      microchipId: microchip3.id,
      photos: ['https://example.com/buddy1.jpg', 'https://example.com/buddy2.jpg']
    }
  });

  console.log('✅ Animals created');

  // Create adoptions
  const adoption1 = await prisma.adoption.create({
    data: {
      animalId: animal2.id,
      tutorId: tutor1.id,
      status: AdoptionStatus.APROVADA,
      applicationDate: new Date('2023-02-20'),
      approvalDate: new Date('2023-02-25'),
      adoptionDate: new Date('2023-03-01'),
      notes: 'Adoção aprovada após visita domiciliar. Tutor demonstrou muito carinho e preparo.',
      homeVisitDate: new Date('2023-02-23'),
      homeVisitApproved: true
    }
  });

  const adoption2 = await prisma.adoption.create({
    data: {
      animalId: animal1.id,
      tutorId: tutor2.id,
      status: AdoptionStatus.PENDENTE,
      applicationDate: new Date('2024-01-15'),
      notes: 'Aguardando visita domiciliar para aprovação final.',
      homeVisitDate: new Date('2024-01-20'),
      homeVisitApproved: false
    }
  });

  console.log('✅ Adoptions created');

  // Create appointments
  const appointment1 = await prisma.appointment.create({
    data: {
      animalId: animal1.id,
      userId: vetUser.id,
      type: 'CONSULTA',
      scheduledDate: new Date('2024-01-25'),
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
      priority: 'ALTA',
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
