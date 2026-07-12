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
        logger_1.logger.info(`Emission Factor upserted: ${factor.name}`);
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
        logger_1.logger.info(`ESG Policy upserted: ${policy.code}`);
    }
    // 6. Seed Gamification Badges
    const badgesData = [
        { name: "Eco Warrior", description: "Earned for crossing 100 XP threshold", xpThreshold: 100, iconUrl: "http://ecosphere.com/badges/eco_warrior.png" },
        { name: "Sustain Master", description: "Earned for crossing 500 XP threshold", xpThreshold: 500, iconUrl: "http://ecosphere.com/badges/sustain_master.png" },
        { name: "ESG Champion", description: "Earned for crossing 1000 XP threshold", xpThreshold: 1000, iconUrl: "http://ecosphere.com/badges/esg_champion.png" }
    ];
    for (const badge of badgesData) {
        await prisma.badge.upsert({
            where: { name: badge.name },
            update: { description: badge.description, xpThreshold: badge.xpThreshold, iconUrl: badge.iconUrl },
            create: {
                name: badge.name,
                description: badge.description,
                xpThreshold: badge.xpThreshold,
                iconUrl: badge.iconUrl,
                createdByUserId: adminId
            }
        });
        logger_1.logger.info(`Badge upserted: ${badge.name}`);
    }
    // 7. Seed Gamification Rewards
    const rewardsData = [
        { title: "1 Day Paid Time Off", description: "Redeemable for 1000 XP", xpCost: 1000, stock: 10 },
        { title: "Free Organic Coffee", description: "Redeemable for 50 XP", xpCost: 50, stock: 100 },
        { title: "Exclusive ESG Corporate Hoodie", description: "Redeemable for 300 XP", xpCost: 300, stock: 15 }
    ];
    for (const reward of rewardsData) {
        const existingReward = await prisma.reward.findFirst({ where: { title: reward.title } });
        if (!existingReward) {
            await prisma.reward.create({
                data: {
                    title: reward.title,
                    description: reward.description,
                    xpCost: reward.xpCost,
                    stock: reward.stock,
                    createdByUserId: adminId
                }
            });
            logger_1.logger.info(`Reward seeded: ${reward.title}`);
        }
    }
    // 8. Seed Challenges
    const challengesData = [
        {
            title: "Zero Single-Use Plastic Challenge",
            description: "Avoid using any single-use plastic cups, bottles, or packaging at the workplace for one week.",
            baseXp: 100,
            difficultyMultiplier: 1.2,
            completionBonus: 50,
            earlySubmissionBonus: 25,
            status: "ACTIVE",
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        },
        {
            title: "Green Transportation Quest",
            description: "Commute to work using public transport, carpooling, bicycling, or walking for 5 consecutive days.",
            baseXp: 200,
            difficultyMultiplier: 1.5,
            completionBonus: 100,
            earlySubmissionBonus: 50,
            status: "ACTIVE",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
    ];
    for (const challenge of challengesData) {
        const existingChallenge = await prisma.challenge.findFirst({ where: { title: challenge.title } });
        if (!existingChallenge) {
            await prisma.challenge.create({
                data: {
                    title: challenge.title,
                    description: challenge.description,
                    baseXp: challenge.baseXp,
                    difficultyMultiplier: challenge.difficultyMultiplier,
                    completionBonus: challenge.completionBonus,
                    earlySubmissionBonus: challenge.earlySubmissionBonus,
                    status: challenge.status,
                    startDate: challenge.startDate,
                    endDate: challenge.endDate,
                    createdByUserId: adminId
                }
            });
            logger_1.logger.info(`Challenge seeded: ${challenge.title}`);
        }
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
