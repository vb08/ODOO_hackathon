import { ICarbonTransactionRepository } from "../../interfaces/ICarbonTransactionRepository";
import { IEnvironmentalGoalRepository } from "../../interfaces/IEnvironmentalGoalRepository";
import { IDepartmentRepository } from "../../interfaces/IDepartmentRepository";
import { CarbonTransactionRepository } from "../../repositories/CarbonTransactionRepository";
import { EnvironmentalGoalRepository } from "../../repositories/EnvironmentalGoalRepository";
import { DepartmentRepository } from "../../repositories/DepartmentRepository";
import { AppError } from "../../utils/AppError";

export interface GoalProgressResult {
  departmentId: string;
  departmentName: string;
  year: number;
  targetEmissions: number;
  currentEmissions: number;
  progressPercentage: number;
  status: string;
}

export class EnvironmentalDashboardService {
  private transactionRepo: ICarbonTransactionRepository;
  private goalRepo: IEnvironmentalGoalRepository;
  private departmentRepo: IDepartmentRepository;

  constructor(
    txRepo: ICarbonTransactionRepository = new CarbonTransactionRepository(),
    goalRepo: IEnvironmentalGoalRepository = new EnvironmentalGoalRepository(),
    deptRepo: IDepartmentRepository = new DepartmentRepository()
  ) {
    this.transactionRepo = txRepo;
    this.goalRepo = goalRepo;
    this.departmentRepo = deptRepo;
  }

  /**
   * Returns a complete dashboard snapshot of environmental metrics.
   */
  public async getDashboardSummary(year: number): Promise<{
    totalEmissions: number;
    departmentEmissions: { departmentId: string; departmentName: string; emissions: number }[];
    monthlyEmissions: { month: number; emissions: number }[];
    monthlyEmissionsBySource: { month: number; sourceType: string; emissions: number }[];
    goalProgress: GoalProgressResult[];
  }> {
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

    const goalProgress: GoalProgressResult[] = [];
    for (const goal of activeGoals) {
      const deptEmissionsMatch = departmentEmissions.find((d) => d.departmentId === goal.departmentId);
      const currentEmissions = deptEmissionsMatch ? deptEmissionsMatch.emissions : 0;
      
      const targetEmissions = goal.targetEmissions;
      let progressPercentage = 0;
      if (targetEmissions > 0) {
        progressPercentage = Math.round((currentEmissions / targetEmissions) * 100 * 100) / 100;
      } else if (currentEmissions > 0) {
        progressPercentage = 100; // infinite progress since limit was 0
      }

      goalProgress.push({
        departmentId: goal.departmentId,
        departmentName: (goal as any).department?.name || "Unknown",
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
  public async getDepartmentGoalProgress(departmentId: string, year: number): Promise<GoalProgressResult> {
    const department = await this.departmentRepo.findById(departmentId);
    if (!department) {
      throw AppError.notFound(`Department with ID ${departmentId} not found.`);
    }

    const goal = await this.goalRepo.findByDepartmentAndYear(departmentId, year);
    if (!goal) {
      throw AppError.notFound(`Environmental goal for department ID ${departmentId} and year ${year} not found.`);
    }

    // Fetch department approved emissions from repository
    const deptEmissions = await this.transactionRepo.getDepartmentApprovedEmissions();
    const match = deptEmissions.find((d) => d.departmentId === departmentId);
    const currentEmissions = match ? match.emissions : 0;

    const targetEmissions = goal.targetEmissions;
    let progressPercentage = 0;
    if (targetEmissions > 0) {
      progressPercentage = Math.round((currentEmissions / targetEmissions) * 100 * 100) / 100;
    } else if (currentEmissions > 0) {
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
