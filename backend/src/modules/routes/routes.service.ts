import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { Route, Waypoint, Difficulty } from './entities/route.entity';
import { CreateRouteDto, UpdateRouteDto } from './dto/route.dto';
import { PlansService } from '../plans/plans.service';
import { PreferencesService } from '../preferences/preferences.service';
import { FeedbacksService } from '../feedbacks/feedbacks.service';
import { StaminaLevel, RestFrequency } from '../preferences/entities/preference.entity';

const generateId = () => Math.random().toString(36).substring(2, 10);

const STAMINA_WEIGHT: Record<StaminaLevel, number> = { 低: 0.6, 中: 0.85, 高: 1.1 };
const STAMINA_REST_BONUS: Record<StaminaLevel, number> = { 低: 8, 中: 5, 高: 3 };
const REST_FREQ_MINUTES: Record<RestFrequency, number> = {
  '每15分钟': 15,
  '每30分钟': 30,
  '每45分钟': 45,
  '按需': 30,
};

const mockRoutes: Route[] = [
  {
    id: 'route-001',
    planId: 'plan-001',
    versionName: 'v1.0-轻松版',
    waypoints: [
      { name: '人民公园正门', latitude: 31.2310, longitude: 121.4720, restMinutes: 0, reason: '集合点，人员汇合' },
      { name: '荷花池休息亭', latitude: 31.2315, longitude: 121.4730, restMinutes: 15, reason: '阴凉处，适合首次休息' },
      { name: '美术馆前广场', latitude: 31.2320, longitude: 121.4740, restMinutes: 10, reason: '开阔地带，可稍作活动' },
      { name: '人民公园北门', latitude: 31.2325, longitude: 121.4750, restMinutes: 0, reason: '散场出口' },
    ],
    totalWalkMinutes: 55,
    totalRestMinutes: 25,
    difficulty: 'easy',
    recommendations: [
      '建议携带遮阳帽，公园内树荫较多',
      '荷花池附近有公共卫生间',
      '北门出口可打车，交通便利',
    ],
  },
  {
    id: 'route-002',
    planId: 'plan-002',
    versionName: 'v1.0-标准路线',
    waypoints: [
      { name: '外滩十六铺码头', latitude: 31.2350, longitude: 121.4900, restMinutes: 0, reason: '出发点' },
      { name: '外滩观景台A', latitude: 31.2360, longitude: 121.4910, restMinutes: 12, reason: '江风凉爽，拍照休息' },
      { name: '陈毅广场', latitude: 31.2370, longitude: 121.4920, restMinutes: 8, reason: '历史景点解说' },
      { name: '外白渡桥', latitude: 31.2380, longitude: 121.4930, restMinutes: 10, reason: '地标建筑合影' },
      { name: '外滩源', latitude: 31.2390, longitude: 121.4940, restMinutes: 0, reason: '终点，附近有咖啡馆' },
    ],
    totalWalkMinutes: 85,
    totalRestMinutes: 30,
    difficulty: 'easy',
    recommendations: [
      '建议早上出发，避开正午日晒',
      '沿线每隔500米有公共卫生间',
      '外白渡桥人流量大，注意安全',
    ],
  },
  {
    id: 'route-003',
    planId: 'plan-003',
    versionName: 'v1.0-老街深度游',
    waypoints: [
      { name: '豫园商城入口', latitude: 31.2270, longitude: 121.4920, restMinutes: 0, reason: '集合点' },
      { name: '九曲桥', latitude: 31.2275, longitude: 121.4925, restMinutes: 15, reason: '经典景点，有遮阳廊' },
      { name: '湖心亭茶室', latitude: 31.2278, longitude: 121.4928, restMinutes: 20, reason: '品茶休息，室内阴凉' },
      { name: '老街主街', latitude: 31.2280, longitude: 121.4935, restMinutes: 10, reason: '逛街购物稍歇' },
      { name: '城隍庙出口', latitude: 31.2285, longitude: 121.4945, restMinutes: 0, reason: '行程结束' },
    ],
    totalWalkMinutes: 110,
    totalRestMinutes: 45,
    difficulty: 'moderate',
    recommendations: [
      '老街人多拥挤，建议携带便携椅',
      '湖心亭可饮茶补充水分',
      '城隍庙附近餐饮选择丰富',
      '注意石板路较滑，穿防滑鞋',
    ],
  },
];

@Injectable()
export class RoutesService {
  private routes: Route[] = [...mockRoutes];

  constructor(
    private readonly plansService: PlansService,
    private readonly preferencesService: PreferencesService,
    @Inject(forwardRef(() => FeedbacksService))
    private readonly feedbacksService: FeedbacksService,
  ) {}

  private enrichRouteWithConsensus(route: Route): Route {
    try {
      const consensus = this.feedbacksService.calculateConsensus(route.id);
      const publishRecord = this.feedbacksService.getPublishRecord(route.id);
      return {
        ...route,
        consensusScore: consensus.consensusScore,
        isConsensusReached: consensus.isConsensusReached,
        feedbackCount: consensus.feedbackCount,
        riskTags: consensus.riskTags,
        lowConsensusReasons: consensus.lowConsensusReasons,
        recommendedRank: consensus.recommendedRank,
        isForcedPublish: publishRecord?.isForced,
        manualConfirmReason: publishRecord?.manualReason,
        publisher: publishRecord?.publisher,
        publishTime: publishRecord?.publishTime,
      };
    } catch (_e) {
      return route;
    }
  }

  findAll(): Route[] {
    return this.routes.map((r) => this.enrichRouteWithConsensus(r));
  }

  findOne(id: string): Route {
    const route = this.routes.find((r) => r.id === id);
    if (!route) throw new NotFoundException(`路线 ${id} 不存在`);
    return this.enrichRouteWithConsensus(route);
  }

  findByPlanId(planId: string): Route[] {
    const routes = this.routes.filter((r) => r.planId === planId);
    try {
      const consensusList = this.feedbacksService.calculatePlanRoutesConsensus(planId);
      return routes.map((r) => {
        const consensus = consensusList.find((c) => c.routeId === r.id);
        const publishRecord = this.feedbacksService.getPublishRecord(r.id);
        return {
          ...r,
          consensusScore: consensus?.consensusScore ?? 0,
          isConsensusReached: consensus?.isConsensusReached ?? false,
          feedbackCount: consensus?.feedbackCount ?? 0,
          riskTags: consensus?.riskTags ?? [],
          lowConsensusReasons: consensus?.lowConsensusReasons ?? [],
          recommendedRank: consensus?.recommendedRank ?? 999,
          isForcedPublish: publishRecord?.isForced,
          manualConfirmReason: publishRecord?.manualReason,
          publisher: publishRecord?.publisher,
          publishTime: publishRecord?.publishTime,
        };
      }).sort((a, b) => (a.recommendedRank ?? 999) - (b.recommendedRank ?? 999));
    } catch (_e) {
      return routes.map((r) => this.enrichRouteWithConsensus(r));
    }
  }

  create(dto: CreateRouteDto): Route {
    const route: Route = {
      id: 'route-' + generateId(),
      planId: dto.planId,
      versionName: dto.versionName,
      waypoints: dto.waypoints,
      totalWalkMinutes: dto.totalWalkMinutes,
      totalRestMinutes: dto.totalRestMinutes,
      difficulty: dto.difficulty,
      recommendations: dto.recommendations || [],
    };
    this.routes.push(route);
    return route;
  }

  update(id: string, dto: UpdateRouteDto): Route {
    const idx = this.routes.findIndex((r) => r.id === id);
    if (idx === -1) throw new NotFoundException(`路线 ${id} 不存在`);
    this.routes[idx] = { ...this.routes[idx], ...dto };
    return this.routes[idx];
  }

  remove(id: string): boolean {
    const idx = this.routes.findIndex((r) => r.id === id);
    if (idx === -1) throw new NotFoundException(`路线 ${id} 不存在`);
    this.routes.splice(idx, 1);
    return true;
  }

  private buildRouteForVersion(
    planId: string,
    plan: any,
    prefs: any[],
    walkScale: number,
    restScale: number,
    versionLabel: string,
  ): Route {
    const avgStaminaWeight =
      prefs.reduce((sum, p) => sum + STAMINA_WEIGHT[p.staminaLevel], 0) / prefs.length;
    const avgStaminaLevel: StaminaLevel =
      avgStaminaWeight <= 0.7 ? '低' : avgStaminaWeight <= 0.97 ? '中' : '高';
    const hasSunSensitive = prefs.some((p) => p.sunSensitive);
    const hasColdSensitive = prefs.some((p) => p.coldSensitive);
    const avgRestFreq =
      prefs.reduce((sum, p) => sum + REST_FREQ_MINUTES[p.restFrequency], 0) / prefs.length;
    const minStartTime = prefs
      .map((p) => p.availableStartTime)
      .sort((a, b) => (a > b ? 1 : -1))[0];
    const maxEndTime = prefs
      .map((p) => p.availableEndTime)
      .sort((a, b) => (a < b ? 1 : -1))[0];

    const baseWalk = plan.estimatedWalkMinutes;
    const adjustedWalk = Math.round(baseWalk * walkScale);
    const restIntervalMinutes = Math.max(15, Math.min(45, Math.round(avgRestFreq * restScale)));
    const restCount = Math.max(1, Math.floor(adjustedWalk / restIntervalMinutes));
    const restBasePerStop = STAMINA_REST_BONUS[avgStaminaLevel];
    const totalRest = restCount * (restBasePerStop + (hasSunSensitive ? 3 : 0));

    const baseLat = 31.23 + (parseInt(planId.replace(/\D/g, '')) % 10) * 0.002;
    const baseLng = 121.47 + (parseInt(planId.replace(/\D/g, '')) % 10) * 0.003;

    const waypoints: Waypoint[] = [];
    const totalPoints = restCount + 2;
    const walkPerLeg = adjustedWalk / (totalPoints - 1);

    waypoints.push({
      name: `${plan.destination}集合点`,
      latitude: baseLat,
      longitude: baseLng,
      restMinutes: 0,
      reason: `出发集合，建议${minStartTime}前到达`,
    });

    for (let i = 1; i <= restCount; i++) {
      const progress = i / (totalPoints - 1);
      const isSunnyStop = hasSunSensitive && i % 2 === 1;
      waypoints.push({
        name: `${plan.destination}中途休息点${i}${isSunnyStop ? '(阴凉)' : ''}`,
        latitude: baseLat + progress * 0.008,
        longitude: baseLng + progress * 0.01,
        restMinutes: restBasePerStop + (isSunnyStop ? 3 : 0),
        reason: isSunnyStop
          ? `步行${Math.round(walkPerLeg * i)}分钟后休息，此处树荫茂密适合怕晒长者`
          : `步行${Math.round(walkPerLeg * i)}分钟后短暂休息，活动筋骨`,
      });
    }

    waypoints.push({
      name: `${plan.destination}终点`,
      latitude: baseLat + 0.008,
      longitude: baseLng + 0.01,
      restMinutes: 0,
      reason: `行程结束，建议${maxEndTime}前到达附近停车场`,
    });

    const diffScore = (adjustedWalk / 60) * plan.stepSlope * walkScale;
    let difficulty: Difficulty = 'easy';
    if (diffScore >= 5) difficulty = 'hard';
    else if (diffScore >= 2.5) difficulty = 'moderate';

    const recommendations: string[] = [];
    if (hasSunSensitive) {
      recommendations.push('同行长者中有怕晒人士，已优先安排阴凉休息点，建议携带遮阳伞和防晒霜');
    }
    if (hasColdSensitive) {
      recommendations.push('同行长者中有怕冷人士，建议多备一件外套，休息点避开风口');
    }
    recommendations.push(`根据体力水平${avgStaminaLevel}，已调整为每${restIntervalMinutes}分钟休息一次`);
    if (plan.stepSlope >= 4) {
      recommendations.push('路线坡度较大，建议携带拐杖，上下坡注意安全');
    }
    if (plan.toiletPoints && plan.toiletPoints.length > 0) {
      recommendations.push(`沿途有${plan.toiletPoints.length}个卫生间点，可按需使用`);
    }
    recommendations.push(`可用时间窗口：${minStartTime} - ${maxEndTime}，请合理安排节奏`);
    recommendations.push(`本版本：${versionLabel}，适合大多数同行者`);

    return {
      id: 'route-' + generateId(),
      planId,
      versionName: versionLabel,
      waypoints,
      totalWalkMinutes: adjustedWalk,
      totalRestMinutes: totalRest,
      difficulty,
      recommendations,
      isSelected: false,
    };
  }

  generate(planId: string): Route[] {
    const plan = this.plansService.findOne(planId);
    const prefs = this.preferencesService.findByPlanId(planId);
    if (prefs.length === 0) {
      throw new BadRequestException('该计划还没有设置同行长者偏好，无法生成路线');
    }

    this.routes = this.routes.filter((r) => r.planId !== planId);

    const versions: Array<{ walkScale: number; restScale: number; label: string }> = [
      { walkScale: 0.7, restScale: 0.7, label: '轻松版（推荐体弱长者）' },
      { walkScale: 1.0, restScale: 1.0, label: '标准版（平衡）' },
      { walkScale: 1.4, restScale: 1.4, label: '深度版（推荐体力好）' },
    ];

    const routes = versions.map((v) =>
      this.buildRouteForVersion(planId, plan, prefs, v.walkScale, v.restScale, v.label),
    );
    this.routes.push(...routes);
    return routes;
  }

  selectRoute(id: string): Route {
    const route = this.findOne(id);
    this.routes.forEach((r) => {
      if (r.planId === route.planId) r.isSelected = false;
    });
    route.isSelected = true;
    return route;
  }

  findSelected(planId: string): Route | null {
    return this.routes.find((r) => r.planId === planId && r.isSelected) || null;
  }

  getPlanRoutesStats() {
    const stats: Record<string, { total: number; completed: number; rate: number }> = {};
    const planStats = this.plansService.getStats();
    for (const plan of planStats.plans) {
      const routesOfPlan = this.routes.filter((r) => r.planId === plan.id);
      stats[plan.id] = {
        total: routesOfPlan.length,
        completed: plan.status === 'completed' ? routesOfPlan.length : 0,
        rate: plan.status === 'completed' && routesOfPlan.length > 0 ? 1 : 0,
      };
    }
    return stats;
  }
}
