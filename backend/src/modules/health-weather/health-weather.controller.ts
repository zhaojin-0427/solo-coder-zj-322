import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { HealthWeatherService } from './health-weather.service';
import {
  HealthWeatherConfig,
  ElderHealthCheckin,
  ElderTravelAdvice,
  PlanHealthWeatherSummary,
  HealthStatistics,
} from './entities/health-weather.entity';
import {
  CreateHealthWeatherConfigDto,
  UpdateHealthWeatherConfigDto,
  CreateElderHealthCheckinDto,
  ConfirmCheckinDto,
} from './dto/health-weather.dto';

@ApiTags('health-weather')
@Controller('health-weather')
export class HealthWeatherController {
  constructor(private readonly healthWeatherService: HealthWeatherService) {}

  @Get('configs')
  @ApiOperation({ summary: '获取所有健康天气配置' })
  @ApiOkResponse({ type: [HealthWeatherConfig] })
  findAllConfigs(): HealthWeatherConfig[] {
    return this.healthWeatherService.findAllConfigs();
  }

  @Get('configs/plan/:planId')
  @ApiOperation({ summary: '按计划ID获取健康天气配置' })
  @ApiOkResponse({ type: HealthWeatherConfig })
  findConfigByPlanId(@Param('planId') planId: string): HealthWeatherConfig | undefined {
    return this.healthWeatherService.findConfigByPlanId(planId);
  }

  @Get('configs/:id')
  @ApiOperation({ summary: '获取单个健康天气配置' })
  @ApiOkResponse({ type: HealthWeatherConfig })
  findOneConfig(@Param('id') id: string): HealthWeatherConfig {
    return this.healthWeatherService.findOneConfig(id);
  }

  @Post('configs')
  @ApiOperation({ summary: '创建健康天气配置' })
  @ApiOkResponse({ type: HealthWeatherConfig })
  createConfig(@Body() dto: CreateHealthWeatherConfigDto): HealthWeatherConfig {
    return this.healthWeatherService.createConfig(dto);
  }

  @Put('configs/:id')
  @ApiOperation({ summary: '更新健康天气配置' })
  @ApiOkResponse({ type: HealthWeatherConfig })
  updateConfig(@Param('id') id: string, @Body() dto: UpdateHealthWeatherConfigDto): HealthWeatherConfig {
    return this.healthWeatherService.updateConfig(id, dto);
  }

  @Delete('configs/:id')
  @ApiOperation({ summary: '删除健康天气配置' })
  removeConfig(@Param('id') id: string): boolean {
    return this.healthWeatherService.removeConfig(id);
  }

  @Get('checkins')
  @ApiOperation({ summary: '获取所有健康登记' })
  @ApiQuery({ name: 'planId', required: false, description: '按计划ID过滤' })
  @ApiOkResponse({ type: [ElderHealthCheckin] })
  findAllCheckins(@Query('planId') planId?: string): ElderHealthCheckin[] {
    if (planId) return this.healthWeatherService.findCheckinsByPlanId(planId);
    return this.healthWeatherService.findAllCheckins();
  }

  @Get('checkins/:id')
  @ApiOperation({ summary: '获取单个健康登记' })
  @ApiOkResponse({ type: ElderHealthCheckin })
  findOneCheckin(@Param('id') id: string): ElderHealthCheckin {
    return this.healthWeatherService.findOneCheckin(id);
  }

  @Post('checkins')
  @ApiOperation({ summary: '创建长辈健康登记' })
  @ApiOkResponse({ type: ElderHealthCheckin })
  createCheckin(@Body() dto: CreateElderHealthCheckinDto): ElderHealthCheckin {
    return this.healthWeatherService.createCheckin(dto);
  }

  @Post('checkins/:id/confirm')
  @ApiOperation({ summary: '确认单个健康登记' })
  @ApiOkResponse({ type: ElderHealthCheckin })
  confirmCheckin(@Param('id') id: string, @Body() dto: ConfirmCheckinDto): ElderHealthCheckin {
    return this.healthWeatherService.confirmCheckin(id, dto);
  }

  @Post('checkins/confirm-plan/:planId')
  @ApiOperation({ summary: '批量确认某计划的所有未确认登记' })
  @ApiOkResponse({ type: [ElderHealthCheckin] })
  confirmBatchCheckins(@Param('planId') planId: string, @Body() dto: ConfirmCheckinDto): ElderHealthCheckin[] {
    return this.healthWeatherService.confirmBatchCheckins(planId, dto);
  }

  @Delete('checkins/:id')
  @ApiOperation({ summary: '删除健康登记' })
  removeCheckin(@Param('id') id: string): boolean {
    return this.healthWeatherService.removeCheckin(id);
  }

  @Get('advices/plan/:planId')
  @ApiOperation({ summary: '生成并获取指定计划每位长辈的出行建议' })
  @ApiOkResponse({ type: [ElderTravelAdvice] })
  generateAdviceByPlanId(@Param('planId') planId: string): ElderTravelAdvice[] {
    return this.healthWeatherService.generateAdviceByPlanId(planId);
  }

  @Get('summary/plan/:planId')
  @ApiOperation({ summary: '获取指定计划的健康天气风险摘要' })
  @ApiOkResponse({ type: PlanHealthWeatherSummary })
  getPlanSummary(@Param('planId') planId: string): PlanHealthWeatherSummary {
    return this.healthWeatherService.getPlanSummary(planId);
  }

  @Get('summaries')
  @ApiOperation({ summary: '获取所有计划的健康天气摘要' })
  @ApiOkResponse({ type: [PlanHealthWeatherSummary] })
  getAllPlanSummaries(): PlanHealthWeatherSummary[] {
    return this.healthWeatherService.getAllPlanSummaries();
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取健康天气相关统计数据' })
  @ApiOkResponse({ type: HealthStatistics })
  getHealthStatistics(): HealthStatistics {
    return this.healthWeatherService.getHealthStatistics();
  }

  @Get('unconfirmed')
  @ApiOperation({ summary: '获取未确认/未登记的长辈列表' })
  @ApiQuery({ name: 'planId', required: false, description: '按计划ID过滤' })
  getUnconfirmedElders(@Query('planId') planId?: string) {
    return this.healthWeatherService.getUnconfirmedElders(planId);
  }
}
