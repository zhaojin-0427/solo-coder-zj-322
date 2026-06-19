import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { RouteFeedback, RouteConsensus, AcceptanceLevel, RiskTag } from './entities/feedback.entity';
import { CreateFeedbackDto, UpdateFeedbackDto, PublishRouteDto } from './dto/feedback.dto';
import { RoutesService } from '../routes/routes.service';
import { PreferencesService } from '../preferences/preferences.service';
import { StaminaLevel, RestFrequency } from '../preferences/entities/preference.entity';
import { Route } from '../routes/entities/route.entity';

const generateId = () => Math.random().toString(36).substring(2, 10);

const ACCEPTANCE_SCORE: Record<AcceptanceLevel, number> = {
  '完全接受': 100,
  '基本接受': 75,
  '有条件接受': 50,
  '难以接受': 25,
};

const STAMINA_WEIGHT: Record<StaminaLevel, number> = {
  '低': 1.4,
  '中': 1.0,
  '高': 0.7,
};

const REST_FREQ_WEIGHT: Record<RestFrequency, number> = {
  '每15分钟': 1.3,
  '每30分钟': 1.0,
  '每45分钟': 0.8,
  '按需': 0.9,
};

const CONSENSUS_THRESHOLD = 70;

const mockFeedbacks: RouteFeedback[] = [
  {
    id: 'feedback-001',
    routeId: 'route-001',
    planId: 'plan-001',
    elderName: '王奶奶',
    staminaLevel: '中',
    acceptanceLevel: '完全接受',
    concernReason: '',
    suggestedWalkAdjustmentMinutes: 0,
    needSunProtection: true,
    needColdProtection: false,
    needNearToilet: false,
    otherSuggestions: '路线安排很合理',
    feedbackTime: '2024-06-01T07:30:00.000Z',
    feedbackWeight: 1.0,
  },
  {
    id: 'feedback-002',
    routeId: 'route-001',
    planId: 'plan-001',
    elderName: '李爷爷',
    staminaLevel: '低',
    acceptanceLevel: '基本接受',
    concernReason: '担心步行时间过长，腿脚容易酸痛',
    suggestedWalkAdjustmentMinutes: -10,
    needSunProtection: false,
    needColdProtection: true,
    needNearToilet: true,
    otherSuggestions: '希望能多安排休息',
    feedbackTime: '2024-06-01T07:35:00.000Z',
    feedbackWeight: 1.4,
  },
  {
    id: 'feedback-003',
    routeId: 'route-002',
    planId: 'plan-002',
    elderName: '张奶奶',
    staminaLevel: '高',
    acceptanceLevel: '完全接受',
    concernReason: '',
    suggestedWalkAdjustmentMinutes: 15,
    needSunProtection: true,
    needColdProtection: false,
    needNearToilet: false,
    otherSuggestions: '希望能多走一些景点',
    feedbackTime: '2024-06-05T06:30:00.000Z',
    feedbackWeight: 0.7,
  },
  {
    id: 'feedback-004',
    routeId: 'route-003',
    planId: 'plan-003',
    elderName: '陈爷爷',
    staminaLevel: '中',
    acceptanceLevel: '基本接受',
    concernReason: '老街人太多，担心拥挤',
    suggestedWalkAdjustmentMinutes: -5,
    needSunProtection: false,
    needColdProtection: false,
    needNearToilet: true,
    otherSuggestions: '',
    feedbackTime: '2024-06-10T09:00:00.000Z',
    feedbackWeight: 1.0,
  },
  {
    id: 'feedback-005',
    routeId: 'route-003',
    planId: 'plan-003',
    elderName: '刘奶奶',
    staminaLevel: '低',
    acceptanceLevel: '有条件接受',
    concernReason: '天气太热，怕中暑，步行时间太长',
    suggestedWalkAdjustmentMinutes: -20,
    needSunProtection: true,
    needColdProtection: true,
    needNearToilet: true,
    otherSuggestions: '必须走阴凉处，多安排室内休息',
    feedbackTime: '2024-06-10T09:05:00.000Z',
    feedbackWeight: 1.4,
  },
];

@Injectable()
export class FeedbacksService {
  private feedbacks: RouteFeedback[] = [...mockFeedbacks];
  private publishedRoutes: Map<string, { isForced: boolean; manualReason?: string; publisher: string; publishTime: string; consensusScore: number }> = new Map();

  constructor(
    @Inject(forwardRef(() => RoutesService))
    private readonly routesService: RoutesService,
    private readonly preferencesService: PreferencesService,
  ) {}

  findAll(): RouteFeedback[] {
    return this.feedbacks;
  }

  findOne(id: string): RouteFeedback {
    const feedback = this.feedbacks.find((f) => f.id === id);
    if (!feedback) throw new NotFoundException(`反馈 ${id} 不存在`);
    return feedback;
  }

  findByRouteId(routeId: string): RouteFeedback[] {
    return this.feedbacks.filter((f) => f.routeId === routeId);
  }

  findByPlanId(planId: string): RouteFeedback[] {
    return this.feedbacks.filter((f) => f.planId === planId);
  }

  private calculateFeedbackWeight(staminaLevel: StaminaLevel, planId: string, elderName: string): number {
    const prefs = this.preferencesService.findByPlanId(planId);
    const pref = prefs.find((p) => p.elderName === elderName);
    const restFreqWeight = pref ? REST_FREQ_WEIGHT[pref.restFrequency] : 1.0;
    return STAMINA_WEIGHT[staminaLevel] * restFreqWeight;
  }

  create(dto: CreateFeedbackDto): RouteFeedback {
    const route = this.routesService.findOne(dto.routeId);
    if (!route) throw new NotFoundException(`路线 ${dto.routeId} 不存在`);

    const existing = this.feedbacks.find(
      (f) => f.routeId === dto.routeId && f.elderName === dto.elderName
    );
    if (existing) {
      throw new BadRequestException(`该长者已对此路线提交过反馈，请编辑现有反馈`);
    }

    const weight = this.calculateFeedbackWeight(dto.staminaLevel, dto.planId, dto.elderName);

    const feedback: RouteFeedback = {
      id: 'feedback-' + generateId(),
      routeId: dto.routeId,
      planId: dto.planId,
      elderName: dto.elderName,
      staminaLevel: dto.staminaLevel,
      acceptanceLevel: dto.acceptanceLevel,
      concernReason: dto.concernReason,
      suggestedWalkAdjustmentMinutes: dto.suggestedWalkAdjustmentMinutes,
      needSunProtection: dto.needSunProtection,
      needColdProtection: dto.needColdProtection,
      needNearToilet: dto.needNearToilet,
      otherSuggestions: dto.otherSuggestions || '',
      feedbackTime: dto.feedbackTime || new Date().toISOString(),
      feedbackWeight: weight,
    };
    this.feedbacks.push(feedback);
    return feedback;
  }

  update(id: string, dto: UpdateFeedbackDto): RouteFeedback {
    const idx = this.feedbacks.findIndex((f) => f.id === id);
    if (idx === -1) throw new NotFoundException(`反馈 ${id} 不存在`);
    this.feedbacks[idx] = { ...this.feedbacks[idx], ...dto };
    return this.feedbacks[idx];
  }

  remove(id: string): boolean {
    const idx = this.feedbacks.findIndex((f) => f.id === id);
    if (idx === -1) throw new NotFoundException(`反馈 ${id} 不存在`);
    this.feedbacks.splice(idx, 1);
    return true;
  }

  calculateConsensus(routeId: string): RouteConsensus {
    const route = this.routesService.findOne(routeId);
    const feedbacks = this.findByRouteId(routeId);

    if (feedbacks.length === 0) {
      return {
        routeId,
        consensusScore: 0,
        isConsensusReached: false,
        feedbackCount: 0,
        riskTags: [],
        lowConsensusReasons: ['暂无反馈数据'],
        suggestedAdjustmentMinutes: 0,
        recommendedRank: 999,
        acceptanceByStamina: {
          '低': { count: 0, avgAcceptance: 0 },
          '中': { count: 0, avgAcceptance: 0 },
          '高': { count: 0, avgAcceptance: 0 },
        },
      };
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;
    const riskTagSet = new Set<RiskTag>();
    const concernReasons: string[] = [];
    let totalAdjustment = 0;

    const staminaStats: Record<StaminaLevel, { scores: number[]; count: number }> = {
      '低': { scores: [], count: 0 },
      '中': { scores: [], count: 0 },
      '高': { scores: [], count: 0 },
    };

    for (const fb of feedbacks) {
      const score = ACCEPTANCE_SCORE[fb.acceptanceLevel];
      const weight = fb.feedbackWeight;
      totalWeightedScore += score * weight;
      totalWeight += weight;

      staminaStats[fb.staminaLevel].scores.push(score);
      staminaStats[fb.staminaLevel].count++;

      totalAdjustment += fb.suggestedWalkAdjustmentMinutes * weight;

      if (fb.needSunProtection) riskTagSet.add('避晒');
      if (fb.needColdProtection) riskTagSet.add('避冷');
      if (fb.needNearToilet) riskTagSet.add('靠近厕所');

      if (fb.suggestedWalkAdjustmentMinutes < -10) riskTagSet.add('需缩短步行');
      if (fb.suggestedWalkAdjustmentMinutes > 10) riskTagSet.add('需延长步行');

      if (fb.concernReason && fb.concernReason.trim()) {
        concernReasons.push(fb.concernReason);
      }

      if (fb.acceptanceLevel === '有条件接受' || fb.acceptanceLevel === '难以接受') {
        if (fb.concernReason && fb.concernReason.trim()) {
          concernReasons.push(fb.concernReason);
        }
      }
    }

    if (route.difficulty === 'hard') riskTagSet.add('坡度较大');

    const consensusScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
    const avgAdjustment = totalWeight > 0 ? Math.round(totalAdjustment / totalWeight) : 0;

    const riskTags = Array.from(riskTagSet);

    const lowConsensusReasons: string[] = [];
    if (consensusScore < CONSENSUS_THRESHOLD) {
      const reasonCount: Record<string, number> = {};
      for (const reason of concernReasons) {
        reasonCount[reason] = (reasonCount[reason] || 0) + 1;
      }
      const sortedReasons = Object.entries(reasonCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([reason]) => reason);
      lowConsensusReasons.push(...sortedReasons);

      if (lowConsensusReasons.length === 0) {
        lowConsensusReasons.push('部分同行者对路线安排有顾虑');
      }
    }

    const acceptanceByStamina: Record<StaminaLevel, { count: number; avgAcceptance: number }> = {
      '低': {
        count: staminaStats['低'].count,
        avgAcceptance: staminaStats['低'].count > 0
          ? Math.round(staminaStats['低'].scores.reduce((a, b) => a + b, 0) / staminaStats['低'].count)
          : 0,
      },
      '中': {
        count: staminaStats['中'].count,
        avgAcceptance: staminaStats['中'].count > 0
          ? Math.round(staminaStats['中'].scores.reduce((a, b) => a + b, 0) / staminaStats['中'].count)
          : 0,
      },
      '高': {
        count: staminaStats['高'].count,
        avgAcceptance: staminaStats['高'].count > 0
          ? Math.round(staminaStats['高'].scores.reduce((a, b) => a + b, 0) / staminaStats['高'].count)
          : 0,
      },
    };

    return {
      routeId,
      consensusScore,
      isConsensusReached: consensusScore >= CONSENSUS_THRESHOLD,
      feedbackCount: feedbacks.length,
      riskTags,
      lowConsensusReasons,
      suggestedAdjustmentMinutes: avgAdjustment,
      recommendedRank: 999,
      acceptanceByStamina,
    };
  }

  calculatePlanRoutesConsensus(planId: string): RouteConsensus[] {
    const routes = this.routesService.findRawByPlanId(planId);
    const consensusList = routes.map((route) => this.calculateConsensus(route.id));

    consensusList.sort((a, b) => {
      if (a.consensusScore !== b.consensusScore) {
        return b.consensusScore - a.consensusScore;
      }
      return a.feedbackCount - b.feedbackCount;
    });

    consensusList.forEach((c, idx) => {
      c.recommendedRank = idx + 1;
    });

    return consensusList;
  }

  publishRoute(dto: PublishRouteDto): { route: Route; consensus: RouteConsensus; isForced: boolean } {
    const consensus = this.calculateConsensus(dto.routeId);

    if (!consensus.isConsensusReached && !dto.manualConfirmReason) {
      throw new BadRequestException(
        `该路线共识分(${consensus.consensusScore})未达到阈值(${CONSENSUS_THRESHOLD})，请填写人工确认原因后强制发布`
      );
    }

    const isForced = !consensus.isConsensusReached;

    if (isForced && (!dto.manualConfirmReason || dto.manualConfirmReason.trim().length === 0)) {
      throw new BadRequestException('强制发布必须填写人工确认原因');
    }

    this.publishedRoutes.set(dto.routeId, {
      isForced,
      manualReason: dto.manualConfirmReason,
      publisher: dto.publisher,
      publishTime: new Date().toISOString(),
      consensusScore: consensus.consensusScore,
    });

    const route = this.routesService.selectRoute(dto.routeId);

    return { route, consensus, isForced };
  }

  getPublishRecord(routeId: string) {
    return this.publishedRoutes.get(routeId) || null;
  }

  getPublishStats() {
    const records = Array.from(this.publishedRoutes.entries());
    const totalPublished = records.length;
    const forcedCount = records.filter(([_, r]) => r.isForced).length;
    const consensusPassed = records.filter(([_, r]) => r.consensusScore >= CONSENSUS_THRESHOLD).length;
    const passRate = totalPublished > 0 ? consensusPassed / totalPublished : 0;

    return {
      totalPublished,
      forcedCount,
      consensusPassed,
      passRate,
      consensusThreshold: CONSENSUS_THRESHOLD,
    };
  }

  getLowConsensusReasonsStats() {
    const allFeedbacks = this.findAll();
    const lowAcceptanceFeedbacks = allFeedbacks.filter(
      (f) => f.acceptanceLevel === '有条件接受' || f.acceptanceLevel === '难以接受'
    );

    const reasonCount: Record<string, number> = {};
    for (const fb of lowAcceptanceFeedbacks) {
      if (fb.concernReason && fb.concernReason.trim()) {
        reasonCount[fb.concernReason] = (reasonCount[fb.concernReason] || 0) + 1;
      }
    }

    return Object.entries(reasonCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([reason, count]) => ({ reason, count }));
  }

  getFeedbackAcceptanceByStamina() {
    const allFeedbacks = this.findAll();
    const staminaData: Record<StaminaLevel, { total: number; accepted: number }> = {
      '低': { total: 0, accepted: 0 },
      '中': { total: 0, accepted: 0 },
      '高': { total: 0, accepted: 0 },
    };

    for (const fb of allFeedbacks) {
      staminaData[fb.staminaLevel].total++;
      if (fb.acceptanceLevel === '完全接受' || fb.acceptanceLevel === '基本接受') {
        staminaData[fb.staminaLevel].accepted++;
      }
    }

    return {
      '低': {
        total: staminaData['低'].total,
        accepted: staminaData['低'].accepted,
        acceptanceRate: staminaData['低'].total > 0
          ? Math.round((staminaData['低'].accepted / staminaData['低'].total) * 100)
          : 0,
      },
      '中': {
        total: staminaData['中'].total,
        accepted: staminaData['中'].accepted,
        acceptanceRate: staminaData['中'].total > 0
          ? Math.round((staminaData['中'].accepted / staminaData['中'].total) * 100)
          : 0,
      },
      '高': {
        total: staminaData['高'].total,
        accepted: staminaData['高'].accepted,
        acceptanceRate: staminaData['高'].total > 0
          ? Math.round((staminaData['高'].accepted / staminaData['高'].total) * 100)
          : 0,
      },
    };
  }

  getConsensusThreshold(): number {
    return CONSENSUS_THRESHOLD;
  }
}
