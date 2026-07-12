import { ILeaderboardRepository } from "../../interfaces/ILeaderboardRepository";
import { LeaderboardRepository } from "../../repositories/LeaderboardRepository";
import { prisma } from "../../database/db";

export interface ESGDashboardSummary {
  esgScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  volunteerHours: number;
  csrImpactScore: number;
  activeChallengesCount: number;
  challengeCompletionRate: number;
  employeeEngagementRate: number;
  badgeDistribution: any[];
  redemptionHistory: any[];
  leaderboard: any[];
  departmentRankings: any[];
}

export class GamificationDashboardService {
  private leaderboardRepo: ILeaderboardRepository;

  constructor(leaderboardRepo: ILeaderboardRepository = new LeaderboardRepository()) {
    this.leaderboardRepo = leaderboardRepo;
  }

  public async getSummary(departmentId?: string): Promise<ESGDashboardSummary> {
    const now = new Date();

    // 1. Fetch CSR Activites and Volunteer Hours
    const volunteerAcks = await prisma.volunteerParticipation.findMany({
      where: {
        status: "APPROVED",
        proofStatus: "VERIFIED",
        deletedAt: null,
        ...(departmentId ? { employee: { departmentId } } : {}),
      },
      include: {
        csrActivity: true,
        employee: true,
      },
    });

    const volunteerHours = volunteerAcks.reduce((sum, ack) => sum + ack.hoursEarned, 0.0);

    const totalCSRActivities = await prisma.cSRActivity.count({
      where: { deletedAt: null },
    });

    // CSR Impact Score = (totalActivities * 10) + volunteerHours
    const csrImpactScore = Math.round((totalCSRActivities * 10 + volunteerHours) * 100) / 100;

    // 2. Fetch Active Challenges
    const activeChallengesCount = await prisma.challenge.count({
      where: {
        status: "ACTIVE",
        startDate: { lte: now },
        endDate: { gte: now },
        deletedAt: null,
      },
    });

    // 3. Challenge Completion Rate
    const challengeParticipations = await prisma.challengeParticipation.findMany({
      where: {
        deletedAt: null,
        ...(departmentId ? { employee: { departmentId } } : {}),
      },
    });

    const totalChallengeParticipations = challengeParticipations.length;
    const completedChallengesCount = challengeParticipations.filter((cp) => cp.status === "COMPLETED").length;
    const challengeCompletionRate = totalChallengeParticipations > 0
      ? Math.round((completedChallengesCount / totalChallengeParticipations) * 100 * 100) / 100
      : 100.0;

    // 4. Employee Engagement Rate (unique employees participating in CSR or Challenges / total employees)
    const participatingEmployees = new Set<string>();
    volunteerAcks.forEach((v) => participatingEmployees.add(v.employeeId));
    challengeParticipations.forEach((c) => participatingEmployees.add(c.employeeId));

    const totalEmployeesCount = await prisma.employee.count({
      where: { deletedAt: null, ...(departmentId ? { departmentId } : {}) },
    });

    const employeeEngagementRate = totalEmployeesCount > 0
      ? Math.round((participatingEmployees.size / totalEmployeesCount) * 100 * 100) / 100
      : 100.0;

    // 5. Badge Distribution (badge name and unlock count)
    const badgeUnlocks = await prisma.employeeBadge.findMany({
      where: {
        deletedAt: null,
        ...(departmentId ? { employee: { departmentId } } : {}),
      },
      include: {
        badge: true,
      },
    });

    const badgeCounts: Record<string, number> = {};
    badgeUnlocks.forEach((bu) => {
      badgeCounts[bu.badge.name] = (badgeCounts[bu.badge.name] || 0) + 1;
    });

    const badgeDistribution = Object.keys(badgeCounts).map((name) => ({
      badgeName: name,
      unlockCount: badgeCounts[name],
    }));

    // 6. Recent Redemptions
    const recentRedemptions = await prisma.rewardRedemption.findMany({
      where: {
        deletedAt: null,
        ...(departmentId ? { employee: { departmentId } } : {}),
      },
      orderBy: { redeemedAt: "desc" },
      take: 10,
      include: {
        reward: true,
        employee: true,
      },
    });

    const redemptionHistory = recentRedemptions.map((r) => ({
      id: r.id,
      title: r.reward.title,
      employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
      redeemedAt: r.redeemedAt,
      status: r.status,
      xpCost: r.reward.xpCost,
    }));

    // 7. Leaderboard (filtered by department if provided)
    let leaderboard: any[] = await this.leaderboardRepo.findAll();
    if (departmentId) {
      leaderboard = leaderboard
        .filter((l) => l.employee.departmentId === departmentId)
        .map((l, index) => ({
          ...l,
          rank: index + 1, // Recalculate local rank for department
        }));
    }

    // 8. Department Rankings (ranked based on average XP or total volunteer hours)
    const departments = await prisma.department.findMany({
      where: { deletedAt: null },
      include: {
        employees: {
          where: { deletedAt: null },
        },
      },
    });

    const departmentRankings = departments.map((dept) => {
      const totalDeptHours = volunteerAcks
        .filter((v) => v.employee.departmentId === dept.id)
        .reduce((sum, v) => sum + v.hoursEarned, 0.0);
      
      const totalDeptXp = dept.employees.reduce((sum, emp) => sum + emp.xp, 0);
      const avgDeptXp = dept.employees.length > 0 ? totalDeptXp / dept.employees.length : 0;

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        totalVolunteerHours: totalDeptHours,
        averageXp: Math.round(avgDeptXp),
      };
    }).sort((a, b) => b.totalVolunteerHours - a.totalVolunteerHours);

    // --- 9. COMPOSITE ESG SCORE CALCULATIONS ---

    // A. Environmental Score (based on goal target breaches)
    const envGoals = await prisma.environmentalGoal.findMany({
      where: { deletedAt: null, ...(departmentId ? { departmentId } : {}) },
    });
    const envSuccessCount = envGoals.filter((g) => g.status !== "EXCEEDED").length;
    const environmentalScore = envGoals.length > 0
      ? Math.round((envSuccessCount / envGoals.length) * 100 * 100) / 100
      : 100.0;

    // B. Governance Score (average score of completed audits * 0.6 + compliance issue resolution rate * 0.4)
    const audits = await prisma.audit.findMany({
      where: { deletedAt: null, ...(departmentId ? { departmentId } : {}) },
    });
    const completedAudits = audits.filter((a) => a.status === "COMPLETED");
    const auditsScoreSum = completedAudits.reduce((sum, a) => sum + (a.percentage || 0.0), 0.0);
    const auditsScoreAvg = completedAudits.length > 0 ? auditsScoreSum / completedAudits.length : 100.0;

    const issues = await prisma.complianceIssue.findMany({
      where: {
        deletedAt: null,
        ...(departmentId ? { audit: { departmentId } } : {}),
      },
    });
    const resolvedIssues = issues.filter((i) => ["RESOLVED", "CLOSED"].includes(i.status));
    const issueResolutionRate = issues.length > 0 ? (resolvedIssues.length / issues.length) * 100 : 100.0;

    const governanceScore = Math.round((auditsScoreAvg * 0.6 + issueResolutionRate * 0.4) * 100) / 100;

    // C. Social Score (based on social goal completions)
    const socialGoals = await prisma.socialGoal.findMany({
      where: { deletedAt: null, ...(departmentId ? { departmentId } : {}) },
    });
    const socialSuccessCount = socialGoals.filter((g) => g.status === "ACHIEVED").length;
    const socialScore = socialGoals.length > 0
      ? Math.round((socialSuccessCount / socialGoals.length) * 100 * 100) / 100
      : 100.0;

    // ESG Score = (Environmental * 40%) + (Social * 30%) + (Governance * 30%)
    const esgScore = Math.round((environmentalScore * 0.40 + socialScore * 0.30 + governanceScore * 0.30) * 100) / 100;

    return {
      esgScore,
      environmentalScore,
      socialScore,
      governanceScore,
      volunteerHours,
      csrImpactScore,
      activeChallengesCount,
      challengeCompletionRate,
      employeeEngagementRate,
      badgeDistribution,
      redemptionHistory,
      leaderboard,
      departmentRankings,
    };
  }
}
