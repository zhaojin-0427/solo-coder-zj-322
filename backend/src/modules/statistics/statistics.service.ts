import { Injectable } from '@nestjs/common';
import { PlansService } from '../plans/plans.service';
import { PreferencesService } from '../preferences/preferences.service';
import { RoutesService } from '../routes/routes.service';
import { ChangesService } from '../changes/changes.service';
import { FeedbacksService } from '../feedbacks/feedbacks.service';
import { CareTasksService } from '../care-tasks/care-tasks.service';
import { HealthWeatherService } from '../health-weather/health-weather.service';
import { StaminaLevel } from '../preferences/entities/preference.entity';
import {
  OverviewStatistics,
  PlanRateItem,
  HeatmapItem,
  SatisfactionByStamina,
  ConsensusStats,
  LowConsensusReasonItem,
  FeedbackAcceptanceByStaminaItem,
  ConsensusByRouteItem,
  CareTaskStats,
  CareFailureReasonItem,
  CarePriorityDistributionItem,
  CarePlanBurdenItem,
  HealthReminderStats,
  HealthConcernStatItem,
  WeatherRiskChangeStatItem,
} from './entities/statistics.entity';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly plansService: PlansService,
    private readonly preferencesService: PreferencesService,
    private readonly routesService: RoutesService,
    private readonly changesService: ChangesService,
    private readonly feedbacksService: FeedbacksService,
    private readonly careTasksService: CareTasksService,
    private readonly healthWeatherService: HealthWeatherService,
  ) {}

  getOverview(): OverviewStatistics {
    const planStats = this.plansService.getStats();
    const planCompletionRate = planStats.total > 0 ? planStats.completed / planStats.total : 0;

    const allRoutes = this.routesService.findAll();
    const totalRestCount = allRoutes.reduce(
      (sum, r) => sum + r.waypoints.filter((w) => w.restMinutes > 0).length,
      0,
    );
    const avgRestCount = allRoutes.length > 0 ? Number((totalRestCount / allRoutes.length).toFixed(2)) : 0;

    const changeStats = this.changesService.getChangeStats();
    const topChangeNodes = changeStats.topChangeNodes;

    const feedbackAcceptance = this.feedbacksService.getFeedbackAcceptanceByStamina();
    const satisfactionByStamina: SatisfactionByStamina = {
      低: feedbackAcceptance['低'].total > 0 ? feedbackAcceptance['低'].acceptanceRate / 100 : 0,
      中: feedbackAcceptance['中'].total > 0 ? feedbackAcceptance['中'].acceptanceRate / 100 : 0,
      高: feedbackAcceptance['高'].total > 0 ? feedbackAcceptance['高'].acceptanceRate / 100 : 0,
    };

    return {
      planCompletionRate: Number(planCompletionRate.toFixed(2)),
      avgRestCount,
      topChangeNodes,
      satisfactionByStamina,
      totalPlans: planStats.total,
      totalChanges: changeStats.total,
    };
  }

  getPlanRate(): PlanRateItem[] {
    const routeStats = this.routesService.getPlanRoutesStats();
    const plans = this.plansService.findAll();
    return plans.map((plan) => {
      const stat = routeStats[plan.id] || { total: 0, completed: 0, rate: 0 };
      return {
        planId: plan.id,
        title: plan.title,
        totalRoutes: stat.total,
        completedRoutes: stat.completed,
        completionRate: stat.rate,
      };
    });
  }

  getHeatmap(): HeatmapItem[] {
    const changeStats = this.changesService.getChangeStats();
    return changeStats.heatmap;
  }

  getRouteCompletion() {
    const allRoutes = this.routesService.findAll();
    if (allRoutes.length === 0) {
      return [];
    }

    const routeCompletionMap: Record<string, { total: number; completed: number }> = {};
    const planStats = this.plansService.getStats();
    const planMap: Record<string, boolean> = {};
    for (const plan of planStats.plans) {
      planMap[plan.id] = plan.status === 'completed';
    }

    for (const route of allRoutes) {
      const key = route.versionName || route.id;
      if (!routeCompletionMap[key]) {
        routeCompletionMap[key] = { total: 0, completed: 0 };
      }
      routeCompletionMap[key].total++;
      if (planMap[route.planId]) {
        routeCompletionMap[key].completed++;
      }
    }

    return Object.entries(routeCompletionMap).map(([routeName, stats]) => ({
      routeName,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    }));
  }

  getPeakHours() {
    const changes = this.changesService.findAll();
    const hourCount: Record<string, number> = {};
    for (let h = 8; h <= 18; h++) {
      hourCount[`${String(h).padStart(2, '0')}:00`] = 0;
    }
    for (const c of changes) {
      try {
        const date = new Date(c.changeTime);
        const hour = date.getHours();
        if (hour >= 8 && hour <= 18) {
          const key = `${String(hour).padStart(2, '0')}:00`;
          hourCount[key] = (hourCount[key] || 0) + 1;
        }
      } catch (_e) { /* ignore */ }
    }
    const result = Object.entries(hourCount).map(([hour, cnt]) => ({
      hour,
      changeCount: cnt,
    }));
    return result;
  }

  getSatisfaction() {
    const acceptance = this.feedbacksService.getFeedbackAcceptanceByStamina();
    return [
      { staminaLevel: '体力低', satisfactionRate: acceptance['低'].acceptanceRate },
      { staminaLevel: '体力中', satisfactionRate: acceptance['中'].acceptanceRate },
      { staminaLevel: '体力高', satisfactionRate: acceptance['高'].acceptanceRate },
    ];
  }

  getChangeHotspots() {
    const changeStats = this.changesService.getChangeStats();
    const nodes = changeStats.topChangeNodes || [];

    if (nodes.length === 0) {
      return [];
    }

    return nodes.map((n, i) => ({
      rank: i + 1,
      nodeName: n.node,
      changeCount: n.count,
      impactLevel: n.count >= 5 ? 'high' : n.count >= 3 ? 'medium' : 'low',
    }));
  }

  getConsensusStats(): ConsensusStats {
    const publishStats = this.feedbacksService.getPublishStats();
    return {
      consensusPassRate: Math.round(publishStats.passRate * 100),
      totalPublished: publishStats.totalPublished,
      consensusPassedCount: publishStats.consensusPassed,
      forcedPublishCount: publishStats.forcedCount,
      consensusThreshold: publishStats.consensusThreshold,
    };
  }

  getLowConsensusReasons(): LowConsensusReasonItem[] {
    const reasons = this.feedbacksService.getLowConsensusReasonsStats();
    const total = reasons.reduce((sum, r) => sum + r.count, 0);
    return reasons.map((r) => ({
      reason: r.reason,
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }));
  }

  getFeedbackAcceptanceByStamina(): FeedbackAcceptanceByStaminaItem[] {
    const data = this.feedbacksService.getFeedbackAcceptanceByStamina();
    const levels: StaminaLevel[] = ['低', '中', '高'];
    return levels.map((level) => ({
      staminaLevel: level,
      totalFeedbacks: data[level].total,
      acceptedCount: data[level].accepted,
      acceptanceRate: data[level].acceptanceRate,
    }));
  }

  getConsensusByRoute(): ConsensusByRouteItem[] {
    const allRoutes = this.routesService.findAll();
    return allRoutes.map((route) => {
      const publishRecord = this.feedbacksService.getPublishRecord(route.id);
      const consensus = route.consensusScore !== undefined ? route.consensusScore : 0;
      const isReached = route.isConsensusReached !== undefined ? route.isConsensusReached : false;
      const feedbackCount = route.feedbackCount !== undefined ? route.feedbackCount : 0;
      return {
        routeId: route.id,
        routeVersionName: route.versionName,
        consensusScore: consensus,
        isConsensusReached: isReached,
        feedbackCount: feedbackCount,
        isForced: publishRecord?.isForced || false,
      };
    }).sort((a, b) => b.consensusScore - a.consensusScore);
  }

  getCareTaskStats(): CareTaskStats {
    const stats = this.careTasksService.getStats();
    return {
      total: stats.total,
      completed: stats.completed,
      pending: stats.pending,
      inProgress: stats.inProgress,
      failed: stats.failed,
      assigned: stats.assigned,
      completionRate: stats.completionRate,
      overdue: stats.overdue,
    };
  }

  getCareFailureReasons(): CareFailureReasonItem[] {
    const stats = this.careTasksService.getStats();
    const total = stats.failureReasons.reduce((sum, r) => sum + r.count, 0);
    return stats.failureReasons.map((r) => ({
      reason: r.reason,
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }));
  }

  getCarePriorityDistribution(): CarePriorityDistributionItem[] {
    const stats = this.careTasksService.getStats();
    return stats.priorityDistribution.map((p) => ({
      priority: p.priority,
      count: p.count,
      completed: p.completed,
    }));
  }

  getCarePlanBurden(): CarePlanBurdenItem[] {
    const burden = this.careTasksService.getPlanBurden();
    const plans = this.plansService.findAll();
    const planMap: Record<string, string> = {};
    plans.forEach((p) => {
      planMap[p.id] = p.title;
    });
    return burden.map((b) => ({
      planId: b.planId,
      planTitle: planMap[b.planId] || b.planId,
      taskCount: b.taskCount,
      criticalCount: b.criticalCount,
      highCount: b.highCount,
    }));
  }

  getHealthReminderStats(): HealthReminderStats {
    const stats = this.healthWeatherService.getHealthStatistics();
    return {
      totalConfigs: stats.totalConfigs,
      totalCheckins: stats.totalCheckins,
      overallConfirmationRate: stats.overallConfirmationRate,
      totalHighRiskElders: stats.totalHighRiskElders,
      totalMediumRiskElders: stats.totalMediumRiskElders,
      totalLowRiskElders: stats.totalLowRiskElders,
      totalShortenRouteSuggestions: stats.totalShortenRouteSuggestions,
      configCoverageRate: stats.configCoverageRate,
    };
  }

  getTopHealthConcerns(): HealthConcernStatItem[] {
    const stats = this.healthWeatherService.getHealthStatistics();
    return stats.topHealthConcerns;
  }

  getWeatherRiskChangeDistribution(): WeatherRiskChangeStatItem[] {
    const stats = this.healthWeatherService.getHealthStatistics();
    return stats.weatherRiskChangeDistribution.map((w) => ({
      weatherRiskLevel: w.weatherRiskLevel,
      changeCount: w.changeCount,
      planCount: w.planCount,
      avgChangesPerPlan: w.avgChangesPerPlan,
    }));
  }

  getAll() {
    const ov = this.getOverview();
    const overview = {
      totalPlans: ov.totalPlans,
      averageCompletionRate: Math.round(ov.planCompletionRate * 100),
      averageRestCount: ov.avgRestCount,
      totalChanges: ov.totalChanges,
    };
    return {
      overview,
      routeCompletionRates: this.getRouteCompletion(),
      peakHourDistribution: this.getPeakHours(),
      satisfactionByStamina: this.getSatisfaction(),
      changeHotspots: this.getChangeHotspots(),
      consensusStats: this.getConsensusStats(),
      lowConsensusReasons: this.getLowConsensusReasons(),
      feedbackAcceptanceByStamina: this.getFeedbackAcceptanceByStamina(),
      consensusByRoute: this.getConsensusByRoute(),
      careTaskStats: this.getCareTaskStats(),
      careFailureReasons: this.getCareFailureReasons(),
      carePriorityDistribution: this.getCarePriorityDistribution(),
      carePlanBurden: this.getCarePlanBurden(),
      healthReminderStats: this.getHealthReminderStats(),
      topHealthConcerns: this.getTopHealthConcerns(),
      weatherRiskChangeDistribution: this.getWeatherRiskChangeDistribution(),
    };
  }
}
