import { PrismaClient } from "@prisma/client";
import { BcryptHelper } from "../helpers/bcrypt";
import { RoleCode } from "../constants/roles";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();

async function main() {
  logger.info("🌱 Seeding database with master data...");

  // 1. Seed Roles
  const rolesData = [
    { code: RoleCode.ADMIN, name: "Administrator", description: "System Administrator with full access rights" },
    { code: RoleCode.ESG_MANAGER, name: "ESG Manager", description: "Corporate ESG Officer responsible for ESG audits and actions" },
    { code: RoleCode.DEPARTMENT_HEAD, name: "Department Head", description: "Unit leader responsible for department targets and employees" },
    { code: RoleCode.EMPLOYEE, name: "Employee", description: "General organization worker participating in ESG objectives" },
  ];

  const dbRoles: Record<string, string> = {};

  for (const role of rolesData) {
    const dbRole = await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name, description: role.description },
      create: { code: role.code, name: role.name, description: role.description },
    });
    dbRoles[role.code] = dbRole.id;
    logger.info(`Role upserted: ${role.code} (${dbRole.id})`);
  }

  // 2. Seed Default Settings
  const settingsData = [
    { key: "AUTO_EMISSION_CALC", value: "true", description: "Enables automatic carbon calculations based on resource logs" },
    { key: "BADGE_AUTO_AWARD", value: "true", description: "Allows system to instantly credit achievements upon challenge completions" },
    { key: "EVIDENCE_REQUIREMENT", value: "true", description: "Forces document uploads when uploading compliance/ESG logs" },
    { key: "NOTIFICATION_SETTINGS", value: JSON.stringify({ email: true, inApp: true }), description: "Globally configures active communication channels" },
  ];

  for (const setting of settingsData) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: { key: setting.key, value: setting.value, description: setting.description },
    });
    logger.info(`Setting upserted: ${setting.key}`);
  }

  // 3. Seed Root Admin User & Employee Profile (1-to-1)
  const adminEmail = "admin@ecosphere.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await BcryptHelper.hash("admin123");

    // Create Admin User & Employee within a transaction for integrity
    await prisma.$transaction(async (tx) => {
      const adminUser = await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash: hashedPassword,
          roleId: dbRoles[RoleCode.ADMIN],
        },
      });

      const adminEmployee = await tx.employee.create({
        data: {
          firstName: "EcoSphere",
          lastName: "Administrator",
          employeeId: "EMP000",
          email: adminEmail,
          userId: adminUser.id,
        },
      });

      // Update User audits
      await tx.user.update({
        where: { id: adminUser.id },
        data: {
          createdByUserId: adminUser.id,
        },
      });

      // Update Employee audits
      await tx.employee.update({
        where: { id: adminEmployee.id },
        data: {
          createdByUserId: adminUser.id,
        },
      });

      logger.info(`Admin User created: ${adminEmail}`);
      logger.info(`Admin Employee Profile created: EMP000`);
    });
  } else {
    logger.info("Admin user already seeded.");
  }

  // 4. Seed Initial Emission Factors
  const factorsData = [
    { name: "Grid Electricity", factor: 0.85, unit: "kWh", sourceType: "Electricity", description: "Average CO2 emissions per kWh from the national power grid" },
    { name: "Diesel Fuel", factor: 2.68, unit: "liter", sourceType: "Diesel", description: "CO2 emissions per liter of diesel fuel burned" },
    { name: "Petrol Fuel", factor: 2.31, unit: "liter", sourceType: "Petrol", description: "CO2 emissions per liter of petrol fuel burned" },
    { name: "Natural Gas", factor: 1.88, unit: "m3", sourceType: "Natural Gas", description: "CO2 emissions per cubic meter of natural gas" },
    { name: "Water Consumption", factor: 0.34, unit: "m3", sourceType: "Water", description: "Embedded emissions in water sourcing and processing per cubic meter" },
    { name: "General Waste landfill", factor: 0.52, unit: "kg", sourceType: "Waste", description: "Methane equivalent emissions per kg of unsorted waste sent to landfill" },
    { name: "Business Travel (Air short-haul)", factor: 0.15, unit: "km", sourceType: "Business Travel", description: "CO2 emissions per passenger-kilometer for flights under 1500km" }
  ];

  // Retrieve admin user id for audits
  const admin = await prisma.user.findFirst({ where: { email: adminEmail } });
  const adminId = admin ? admin.id : null;

  for (const factor of factorsData) {
    await prisma.emissionFactor.upsert({
      where: { name: factor.name },
      update: { factor: factor.factor, unit: factor.unit, sourceType: factor.sourceType, description: factor.description },
      create: {
        name: factor.name,
        factor: factor.factor,
        unit: factor.unit,
        sourceType: factor.sourceType,
        description: factor.description,
        createdByUserId: adminId
      }
    });
    logger.info(`Emission Factor upserted: ${factor.name}`);
  }

  // 5. Seed ESG Policies
  const policiesData = [
    { title: "Environmental Protection & Anti-Pollution Policy", code: "POL-001", content: "Guidelines and regulations to protect the local environment, reduce waste, and avoid hazardous pollution across all departments.", version: "1.0", status: "ACTIVE" },
    { title: "Corporate Social Responsibility (CSR) Action Framework", code: "POL-002", content: "Details of organization commitments to community health programs, safety provisions, and employee CSR activity guidelines.", version: "1.0", status: "ACTIVE" },
    { title: "Corporate Governance & Ethical Standards Code", code: "POL-003", content: "Our corporate whistleblower procedures, compliance review boards, and standards of professional conduct guidelines.", version: "1.0", status: "DRAFT" }
  ];

  for (const policy of policiesData) {
    await prisma.eSGPolicy.upsert({
      where: { code: policy.code },
      update: { title: policy.title, content: policy.content, version: policy.version, status: policy.status },
      create: {
        title: policy.title,
        code: policy.code,
        content: policy.content,
        version: policy.version,
        status: policy.status,
        createdByUserId: adminId
      }
    });
    logger.info(`ESG Policy upserted: ${policy.code}`);
  }

  logger.info("🎉 Database seeding completed successfully.");
}

main()
  .catch((e) => {
    logger.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
