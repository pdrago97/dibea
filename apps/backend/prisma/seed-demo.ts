import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo database...');

  // Create municipality
  const municipality = await prisma.municipality.create({
    data: {
      id: 'mun-demo-001',
      name: 'São Paulo',
      state: 'SP',
      email: 'contato@saude.sp.gov.br',
      active: true,
    },
  });

  console.log('✅ Municipality created:', municipality.name);

  // Create users
  const users = [
    {
      id: 'user-admin-001',
      email: 'admin@dibea.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      name: 'Administrador DIBEA',
      role: 'ADMIN',
      municipalityId: municipality.id,
    },
    {
      id: 'user-vet-001',
      email: 'vet@dibea.com',
      passwordHash: await bcrypt.hash('vet123', 10),
      name: 'Dr. Maria Silva',
      role: 'VETERINARIO',
      municipalityId: municipality.id,
    },
    {
      id: 'user-func-001',
      email: 'func@dibea.com',
      passwordHash: await bcrypt.hash('func123', 10),
      name: 'João Santos',
      role: 'FUNCIONARIO',
      municipalityId: municipality.id,
    },
    {
      id: 'user-cidadao-001',
      email: 'cidadao@dibea.com',
      passwordHash: await bcrypt.hash('cidadao123', 10),
      name: 'Ana Costa',
      role: 'CIDADAO',
      municipalityId: municipality.id,
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.create({ data: userData });
    console.log('✅ User created:', user.email);
  }

  // Create animals
  const animals = [
    {
      id: 'animal-001',
      name: 'Rex',
      species: 'CANINO',
      breed: 'Labrador',
      sex: 'MACHO',
      age: 3,
      weight: 25.5,
      size: 'GRANDE',
      color: 'Dourado',
      description: 'Cão muito dócil e brincalhão, ótimo com crianças.',
      status: 'DISPONIVEL',
      municipalityId: municipality.id,
    },
    {
      id: 'animal-002',
      name: 'Luna',
      species: 'FELINO',
      breed: 'SRD',
      sex: 'FEMEA',
      age: 2,
      weight: 4.2,
      size: 'PEQUENO',
      color: 'Preta e branca',
      description: 'Gata carinhosa e independente.',
      status: 'DISPONIVEL',
      municipalityId: municipality.id,
    },
    {
      id: 'animal-003',
      name: 'Buddy',
      species: 'CANINO',
      breed: 'Poodle',
      sex: 'MACHO',
      age: 5,
      weight: 8.0,
      size: 'MEDIO',
      color: 'Branco',
      description: 'Cão muito inteligente e obediente.',
      status: 'ADOTADO',
      municipalityId: municipality.id,
    },
  ];

  for (const animalData of animals) {
    const animal = await prisma.animal.create({ data: animalData });
    console.log('✅ Animal created:', animal.name);
  }

  // Create agent interactions
  const interactions = [
    {
      userId: 'user-cidadao-001',
      agentName: 'DIBEA Agent Router',
      userInput: 'Quero adotar um cão',
      agentResponse: 'Ótimo! Temos vários cães disponíveis para adoção. Vou te mostrar os animais que temos.',
      responseTimeMs: 1200,
      success: true,
    },
    {
      userId: 'user-admin-001',
      agentName: 'DIBEA Analytics Agent',
      userInput: 'Quantos animais foram adotados este mês?',
      agentResponse: 'Este mês tivemos 15 adoções realizadas, sendo 8 cães e 7 gatos.',
      responseTimeMs: 800,
      success: true,
    },
  ];

  for (const interactionData of interactions) {
    const interaction = await prisma.agentInteraction.create({ data: interactionData });
    console.log('✅ Agent interaction created');
  }

  // Create metrics
  const today = new Date();
  const metrics = [
    {
      agentName: 'DIBEA Agent Router',
      date: today,
      totalInteractions: 45,
      successfulInteractions: 42,
      averageResponseTime: 1150,
    },
    {
      agentName: 'DIBEA Analytics Agent',
      date: today,
      totalInteractions: 12,
      successfulInteractions: 11,
      averageResponseTime: 850,
    },
  ];

  for (const metricData of metrics) {
    const metric = await prisma.agentMetrics.create({ data: metricData });
    console.log('✅ Agent metric created');
  }

  // Create system analytics
  const analytics = [
    { date: today, metricName: 'total_animals', metricValue: 3 },
    { date: today, metricName: 'available_animals', metricValue: 2 },
    { date: today, metricName: 'adopted_animals', metricValue: 1 },
    { date: today, metricName: 'total_users', metricValue: 4 },
    { date: today, metricName: 'active_users', metricValue: 4 },
  ];

  for (const analyticData of analytics) {
    const analytic = await prisma.systemAnalytics.create({ data: analyticData });
    console.log('✅ System analytic created');
  }

  console.log('🎉 Demo database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
