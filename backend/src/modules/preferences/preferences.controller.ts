import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PreferencesService } from './preferences.service';
import { CreatePreferenceDto, UpdatePreferenceDto } from './dto/preference.dto';
import { Preference } from './entities/preference.entity';
import { PlansService } from '../plans/plans.service';

@ApiTags('preferences')
@Controller('preferences')
export class PreferencesController {
  constructor(
    private readonly preferencesService: PreferencesService,
    private readonly plansService: PlansService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取所有节奏偏好，可按计划ID筛选' })
  @ApiQuery({ name: 'planId', required: false, description: '按计划ID筛选' })
  findAll(@Query('planId') planId?: string): Preference[] {
    if (planId) return this.preferencesService.findByPlanId(planId);
    return this.preferencesService.findAll();
  }

  @Get('grouped')
  @ApiOperation({ summary: '按计划分组获取节奏偏好（包含计划标题和目的地）' })
  findAllGrouped() {
    const allPrefs = this.preferencesService.findAll();
    const plans = this.plansService.findAll();
    const groups: Record<string, Preference[]> = {};
    for (const p of allPrefs) {
      if (!groups[p.planId]) groups[p.planId] = [];
      groups[p.planId].push(p);
    }
    return plans.map((plan) => ({
      planId: plan.id,
      planTitle: plan.title,
      destination: plan.destination,
      preferences: groups[plan.id] || [],
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取节奏偏好' })
  @ApiParam({ name: 'id', description: '偏好ID' })
  findOne(@Param('id') id: string): Preference {
    return this.preferencesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建节奏偏好' })
  create(@Body() createPreferenceDto: CreatePreferenceDto): Preference {
    return this.preferencesService.create(createPreferenceDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新节奏偏好' })
  @ApiParam({ name: 'id', description: '偏好ID' })
  update(@Param('id') id: string, @Body() updatePreferenceDto: UpdatePreferenceDto): Preference {
    return this.preferencesService.update(id, updatePreferenceDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: '删除节奏偏好' })
  @ApiParam({ name: 'id', description: '偏好ID' })
  remove(@Param('id') id: string): boolean {
    return this.preferencesService.remove(id);
  }
}
