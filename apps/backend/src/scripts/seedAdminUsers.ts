import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seedAdminUsers() {
  try {
    console.log("🌱 Seeding admin users...");

    // Check if admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists:", existingAdmin.email);
      return;
    }

    // Get or create default municipality
    let municipality = await prisma.municipality.findFirst();

    if (!municipality) {
      console.log("📍 Creating default municipality...");
      municipality = await prisma.municipality.create({
        data: {
          name: "São Paulo",
          cnpj: "12.345.678/0001-90",
          address: "Av. Paulista, 1000",
          phone: "(11) 3000-0000",
          email: "admin@saopaulodigital.sp.gov.br",
          active: true,
        },
      });
      console.log("✅ Municipality created:", municipality.name);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Administrador DIBEA",
        email: "admin@dibea.com.br",
        passwordHash: hashedPassword,
        phone: "(11) 99999-0000",
        role: UserRole.ADMIN,
        active: true,
        municipalityId: municipality.id,
      },
    });

    console.log("✅ Admin user created:");
    console.log("   Email:", admin.email);
    console.log("   Password: admin123");
    console.log("   Role:", admin.role);

    // Create some test users
    const testUsers: Array<{
      name: string;
      email: string;
      role: UserRole;
      phone: string;
    }> = [
      {
        name: "João Silva",
        email: "joao@test.com",
        role: UserRole.FUNCIONARIO,
        phone: "(11) 98888-1111",
      },
      {
        name: "Maria Santos",
        email: "maria@test.com",
        role: UserRole.VETERINARIO,
        phone: "(11) 98888-2222",
      },
      {
        name: "Pedro Costa",
        email: "pedro@test.com",
        role: UserRole.CIDADAO,
        phone: "(11) 98888-3333",
      },
      {
        name: "Ana Paula",
        email: "ana@test.com",
        role: UserRole.CIDADAO,
        phone: "(11) 98888-4444",
      },
    ];

    console.log("\n🌱 Creating test users...");

    for (const userData of testUsers) {
      const password = await bcrypt.hash("senha123", 10);
      const user = await prisma.user.create({
        data: {
          ...userData,
          passwordHash: password,
          active: true,
          municipalityId: municipality.id,
        },
      });
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log("\n✅ Seeding completed successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Admin: admin@dibea.com.br / admin123");
    console.log("   Users: Any test user / senha123");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdminUsers().catch((error) => {
  console.error(error);
  process.exit(1);
});
