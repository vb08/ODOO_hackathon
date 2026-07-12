"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = require("../helpers/bcrypt");
const roles_1 = require("../constants/roles");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
async function main() {
    logger_1.logger.info("🌱 Seeding database with master data...");
    // 1. Seed Roles
    const rolesData = [
        { code: roles_1.RoleCode.ADMIN, name: "Administrator", description: "System Administrator with full access rights" },
        { code: roles_1.RoleCode.ESG_MANAGER, name: "ESG Manager", description: "Corporate ESG Officer responsible for ESG audits and actions" },
        { code: roles_1.RoleCode.DEPARTMENT_HEAD, name: "Department Head", description: "Unit leader responsible for department targets and employees" },
        { code: roles_1.RoleCode.EMPLOYEE, name: "Employee", description: "General organization worker participating in ESG objectives" },
    ];
    const dbRoles = {};
    for (const role of rolesData) {
        const dbRole = await prisma.role.upsert({
            where: { code: role.code },
            update: { name: role.name, description: role.description },
            create: { code: role.code, name: role.name, description: role.description },
        });
        dbRoles[role.code] = dbRole.id;
        logger_1.logger.info(`Role upserted: ${role.code} (${dbRole.id})`);
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
        logger_1.logger.info(`Setting upserted: ${setting.key}`);
    }
    // 3. Seed Root Admin User & Employee Profile (1-to-1)
    const adminEmail = "admin@ecosphere.com";
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt_1.BcryptHelper.hash("admin123");
        // Create Admin User & Employee within a transaction for integrity
        await prisma.$transaction(async (tx) => {
            const adminUser = await tx.user.create({
                data: {
                    email: adminEmail,
                    passwordHash: hashedPassword,
                    roleId: dbRoles[roles_1.RoleCode.ADMIN],
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
            logger_1.logger.info(`Admin User created: ${adminEmail}`);
            logger_1.logger.info(`Admin Employee Profile created: EMP000`);
        });
    }
    else {
        logger_1.logger.info("Admin user already seeded.");
    }
    logger_1.logger.info("🎉 Database seeding completed successfully.");
}
main()
    .catch((e) => {
    logger_1.logger.error("Error seeding database:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
