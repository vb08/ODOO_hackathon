"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentalDashboardService = void 0;
const CarbonTransactionRepository_1 = require("../../repositories/CarbonTransactionRepository");
const EnvironmentalGoalRepository_1 = require("../../repositories/EnvironmentalGoalRepository");
const DepartmentRepository_1 = require("../../repositories/DepartmentRepository");
const AppError_1 = require("../../utils/AppError");
class EnvironmentalDashboardService {
    transactionRepo;
    goalRepo;
    departmentRepo;
    constructor(txRepo = new CarbonTransactionRepository_1.CarbonTransactionRepository(), goalRepo = new EnvironmentalGoalRepository_1.EnvironmentalGoalRepository(), deptRepo = new DepartmentRepository_1.DepartmentRepository()) {
        this.transactionRepo = txRepo;
        this.goalRepo = goalRepo;
        this.departmentRepo = deptRepo;
    }
    /**
     * Returns a complete dashboard snapshot of environmental metrics.
     */
    async getDashboardSummary(year) {
        // 1. Total Emissions
        const totalEmissions = await this.transactionRepo.getTotalApprovedEmissions();
        // 2. Department-wise Emissions
        const departmentEmissions = await this.transactionRepo.getDepartmentApprovedEmissions();
        // 3. Monthly Emissions
        const monthlyEmissions = await this.transactionRepo.getMonthlyApprovedEmissions(year);
        // 4. Monthly Emissions by Source Type
        const monthlyEmissionsBySource = await this.transactionRepo.getMonthlyApprovedEmissionsBySource(year);
        // 5. Goal Progress
        const goals = await this.goalRepo.findAll();
        const activeGoals = goals.filter((g) => g.year === year);
        const goalProgress = [];
        for (const goal of activeGoals) {
            const deptEmissionsMatch = departmentEmissions.find((d) => d.departmentId === goal.departmentId);
            const currentEmissions = deptEmissionsMatch ? deptEmissionsMatch.emissions : 0;
            const targetEmissions = goal.targetEmissions;
            let progressPercentage = 0;
            if (targetEmissions > 0) {
                progressPercentage = Math.round((currentEmissions / targetEmissions) * 100 * 100) / 100;
            }
            else if (currentEmissions > 0) {
                progressPercentage = 100; // infinite progress since limit was 0
            }
            goalProgress.push({
                departmentId: goal.departmentId,
                departmentName: goal.department?.name || "Unknown",
                year: goal.year,
                targetEmissions,
                currentEmissions,
                progressPercentage,
                status: goal.status,
            });
        }
        return {
            totalEmissions,
            departmentEmissions,
            monthlyEmissions,
            monthlyEmissionsBySource,
            goalProgress,
        };
    }
    /**
     * Retrieves goal progress details for a specific department and year.
     */
    async getDepartmentGoalProgress(departmentId, year) {
        const department = await this.departmentRepo.findById(departmentId);
        if (!department) {
            throw AppError_1.AppError.notFound(`Department with ID ${departmentId} not found.`);
        }
        const goal = await this.goalRepo.findByDepartmentAndYear(departmentId, year);
        if (!goal) {
            throw AppError_1.AppError.notFound(`Environmental goal for department ID ${departmentId} and year ${year} not found.`);
        }
        // Fetch department approved emissions from repository
        const deptEmissions = await this.transactionRepo.getDepartmentApprovedEmissions();
        const match = deptEmissions.find((d) => d.departmentId === departmentId);
        const currentEmissions = match ? match.emissions : 0;
        const targetEmissions = goal.targetEmissions;
        let progressPercentage = 0;
        if (targetEmissions > 0) {
            progressPercentage = Math.round((currentEmissions / targetEmissions) * 100 * 100) / 100;
        }
        else if (currentEmissions > 0) {
            progressPercentage = 100;
        }
        return {
            departmentId,
            departmentName: department.name,
            year,
            targetEmissions,
            currentEmissions,
            progressPercentage,
            status: goal.status,
        };
    }
}
exports.EnvironmentalDashboardService = EnvironmentalDashboardService;
