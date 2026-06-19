import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto, UpdateFeedbackDto, PublishRouteDto } from './dto/feedback.dto';
import { RouteFeedback, RouteConsensus } from './entities/feedback.entity';

@ApiTags('feedbacks')
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Get()
  @ApiOperation({ summary: '获取所有反馈，可按路线ID或计划ID筛选' })
  @ApiQuery({ name: 'routeId', required: false, description: '按路线ID筛选' })
  @ApiQuery({ name: 'planId', required: false, description: '按计划ID筛选' })
  findAll(@Query('routeId') routeId?: string, @Query('planId') planId?: string): RouteFeedback[] {
    if (routeId) return this.feedbacksService.findByRouteId(routeId);
    if (planId) return this.feedbacksService.findByPlanId(planId);
    return this.feedbacksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取反馈' })
  @ApiParam({ name: 'id', description: '反馈ID' })
  findOne(@Param('id') id: string): RouteFeedback {
    return this.feedbacksService.findOne(id);
  }

  @Get('consensus/:routeId')
  @ApiOperation({ summary: '计算路线的共识分和风险标签' })
  @ApiParam({ name: 'routeId', description: '路线ID' })
  calculateConsensus(@Param('routeId') routeId: string): RouteConsensus {
    return this.feedbacksService.calculateConsensus(routeId);
  }

  @Get('plan-consensus/:planId')
  @ApiOperation({ summary: '计算计划下所有路线的共识分并排序' })
  @ApiParam({ name: 'planId', description: '计划ID' })
  calculatePlanConsensus(@Param('planId') planId: string): RouteConsensus[] {
    return this.feedbacksService.calculatePlanRoutesConsensus(planId);
  }

  @Get('threshold')
  @ApiOperation({ summary: '获取共识分阈值' })
  getThreshold(): { threshold: number } {
    return { threshold: this.feedbacksService.getConsensusThreshold() };
  }

  @Get('publish-stats')
  @ApiOperation({ summary: '获取发布统计数据' })
  getPublishStats() {
    return this.feedbacksService.getPublishStats();
  }

  @Get('low-consensus-reasons')
  @ApiOperation({ summary: '获取低共识高发原因统计' })
  getLowConsensusReasons() {
    return this.feedbacksService.getLowConsensusReasonsStats();
  }

  @Get('acceptance-by-stamina')
  @ApiOperation({ summary: '获取不同体力等级的反馈接受度' })
  getAcceptanceByStamina() {
    return this.feedbacksService.getFeedbackAcceptanceByStamina();
  }

  @Post()
  @ApiOperation({ summary: '提交路线反馈' })
  create(@Body() createFeedbackDto: CreateFeedbackDto): RouteFeedback {
    return this.feedbacksService.create(createFeedbackDto);
  }

  @Post('publish')
  @ApiOperation({ summary: '发布路线（共识分达标可直接发布，未达标需人工确认）' })
  publishRoute(@Body() dto: PublishRouteDto) {
    return this.feedbacksService.publishRoute(dto);
  }

  @Get('publish-record/:routeId')
  @ApiOperation({ summary: '获取路线的发布记录' })
  @ApiParam({ name: 'routeId', description: '路线ID' })
  getPublishRecord(@Param('routeId') routeId: string) {
    return this.feedbacksService.getPublishRecord(routeId);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新反馈' })
  @ApiParam({ name: 'id', description: '反馈ID' })
  update(@Param('id') id: string, @Body() updateFeedbackDto: UpdateFeedbackDto): RouteFeedback {
    return this.feedbacksService.update(id, updateFeedbackDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: '删除反馈' })
  @ApiParam({ name: 'id', description: '反馈ID' })
  remove(@Param('id') id: string): boolean {
    return this.feedbacksService.remove(id);
  }
}
