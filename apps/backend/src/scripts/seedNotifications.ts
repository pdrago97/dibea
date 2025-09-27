import { PrismaClient } from '@prisma/client';
import { NotificationService } from '../services/notificationService';

const prisma = new PrismaClient();

async function seedNotifications() {
  try {
    console.log('🌱 Seeding notifications and tasks...');

    // Get some existing users and animals
    const users = await prisma.user.findMany({
      take: 5
    });

    const animals = await prisma.animal.findMany({
      take: 3
    });

    if (users.length === 0 || animals.length === 0) {
      console.log('❌ No users or animals found. Please seed users and animals first.');
      return;
    }

    const citizenUser = users.find(u => u.role === 'CIDADAO');
    const adminUser = users.find(u => u.role === 'ADMIN');
    const staffUser = users.find(u => u.role === 'FUNCIONARIO');

    // Create some adoption requests
    if (citizenUser && animals.length > 0) {
      console.log('📝 Creating adoption requests...');
      
      const adoption1 = await prisma.adoption.create({
        data: {
          animalId: animals[0].id,
          tutorId: citizenUser.id,
          status: 'PENDENTE',
          notes: 'Tenho experiência com cães e gostaria muito de adotar este animal.'
        }
      });

      // Create notification for new adoption request
      await NotificationService.createAdoptionNotification(
        adoption1.id,
        'NEW_REQUEST'
      );

      // Create task for adoption review
      await prisma.task.create({
        data: {
          title: `Revisar adoção - ${animals[0].name}`,
          description: `Revisar solicitação de adoção de ${animals[0].name} por ${citizenUser.name}`,
          type: 'ADOPTION_REVIEW',
          priority: 'HIGH',
          createdById: citizenUser.id,
          animalId: animals[0].id,
          adoptionId: adoption1.id,
          assignedToId: adminUser?.id,
          metadata: JSON.stringify({
            animalName: animals[0].name,
            tutorName: citizenUser.name,
            tutorEmail: citizenUser.email
          })
        }
      });

      console.log(`✅ Created adoption request for ${animals[0].name}`);
    }

    // Create some system notifications
    console.log('🔔 Creating system notifications...');

    for (const user of users) {
      // Welcome notification
      await NotificationService.createSystemNotification(
        'Bem-vindo ao DIBEA!',
        'Obrigado por se juntar à nossa plataforma de bem-estar animal. Explore os animais disponíveis para adoção.',
        user.id,
        'MEDIUM',
        '/animals'
      );

      // Animal update notification
      if (animals.length > 0) {
        await NotificationService.createAnimalNotification(
          animals[0].id,
          'NEW_ANIMAL',
          user.id,
          `${animals[0].name} foi recentemente cadastrado e está disponível para adoção!`
        );
      }
    }

    // Create some tasks
    console.log('📋 Creating tasks...');

    if (adminUser && animals.length > 1) {
      // Animal health check task
      await prisma.task.create({
        data: {
          title: `Exame veterinário - ${animals[1].name}`,
          description: `Agendar e realizar exame veterinário de rotina para ${animals[1].name}`,
          type: 'ANIMAL_UPDATE',
          priority: 'MEDIUM',
          createdById: adminUser.id,
          assignedToId: staffUser?.id,
          animalId: animals[1].id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          metadata: JSON.stringify({
            type: 'health_check',
            animalName: animals[1].name,
            lastCheckup: null
          })
        }
      });

      // Document verification task
      await prisma.task.create({
        data: {
          title: 'Verificar documentos de vacinação',
          description: 'Verificar e atualizar registros de vacinação dos animais recém-chegados',
          type: 'DOCUMENT_VERIFICATION',
          priority: 'HIGH',
          createdById: adminUser.id,
          assignedToId: staffUser?.id,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          metadata: JSON.stringify({
            type: 'vaccination_records',
            animalsCount: animals.length
          })
        }
      });

      console.log('✅ Created administrative tasks');
    }

    // Create some urgent notifications
    if (citizenUser) {
      await prisma.notification.create({
        data: {
          title: 'Documentação Pendente',
          message: 'Você possui documentos pendentes para finalizar seu processo de adoção. Clique para ver detalhes.',
          type: 'ALERT',
          category: 'ADOCAO',
          priority: 'URGENT',
          userId: citizenUser.id,
          actionType: 'VIEW',
          actionUrl: '/citizen/documents',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      await prisma.notification.create({
        data: {
          title: 'Nova Campanha de Vacinação',
          message: 'Campanha de vacinação gratuita acontecerá no próximo sábado. Inscreva seu pet!',
          type: 'INFO',
          category: 'CAMPANHA',
          priority: 'MEDIUM',
          userId: citizenUser.id,
          actionType: 'REDIRECT',
          actionUrl: '/campaigns/vaccination',
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
        }
      });
    }

    // Create notifications for staff
    if (staffUser) {
      await prisma.notification.create({
        data: {
          title: 'Relatório Mensal Pendente',
          message: 'O relatório mensal de atividades precisa ser enviado até o final da semana.',
          type: 'TASK',
          category: 'SISTEMA',
          priority: 'HIGH',
          userId: staffUser.id,
          actionType: 'COMPLETE',
          actionUrl: '/staff/reports/monthly'
        }
      });
    }

    // Create some read notifications to show variety
    const notifications = await prisma.notification.findMany({
      take: 3,
      orderBy: { createdAt: 'asc' }
    });

    for (const notification of notifications.slice(0, 2)) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'read',
          readAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24h
        }
      });
    }

    console.log('✅ Notifications and tasks seeded successfully!');

    // Print summary
    const notificationCount = await prisma.notification.count();
    const taskCount = await prisma.task.count();
    const adoptionCount = await prisma.adoption.count();

    console.log('\n📊 Summary:');
    console.log(`   Notifications: ${notificationCount}`);
    console.log(`   Tasks: ${taskCount}`);
    console.log(`   Adoptions: ${adoptionCount}`);

  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedNotifications();
}

export { seedNotifications };
