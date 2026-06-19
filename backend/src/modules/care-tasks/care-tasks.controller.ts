import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CareTasksService } from './care-tasks.service';
import { CreateCareTaskDto, UpdateCareTaskDto, ClaimTaskDto, CompleteTaskDto, FailTaskDto } from './dto/care-task.dto';
import { CareTask, CareTaskPriority, CareTaskStatus } from './entities/care-task.entity';

@ApiTags('care-tasks')
@Controller('care-tasks')
export class CareTasksController {
  constructor(private readonly careTasksService: CareTasksService) {}

  @Get()
  @ApiOperation({ summary: '获取所有照护任务，支持筛选' })
  @ApiQuery({ name: 'planId', required: false, description: '按计划ID筛选' })
  @ApiQuery({ name: 'priority', required: false, description: '按重要等级筛选' })
  @ApiQuery({ name: 'status', required: false, description: '按状态筛选' })
  findAll(
    @Query('planId') planId?: string,
    @Query('priority') priority?: CareTaskPriority,
    @Query('status') status?: CareTaskStatus,
  ): CareTask[] {
    return this.careTasksService.findAll({ planId, priority, status });
  }

  @Get('stats')
  @ApiOperation({ summary: '获取照护任务统计数据' })
  @ApiQuery({ name: 'planId', required: false, description: '按计划ID筛选' })
  getStats(@Query('planId') planId?: string) {
    return this.careTasksService.getStats(planId);
  }

  @Get('plan-burden')
  @ApiOperation({ summary: '获取各计划照护负担分布' })
  getPlanBurden() {
    return this.careTasksService.getPlanBurden();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取照护任务详情' })
  @ApiParam({ name: 'id', description: '任务ID' })
  findOne(@Param('id') id: string): CareTask {
    return this.careTasksService.findOne(id);
  }

  @Get('plan/:planId')
  @ApiOperation({ summary: '根据计划ID获取照护任务列表' })
  @ApiParam({ name: 'planId', description: '计划ID' })
  findByPlanId(@Param('planId') planId: string): CareTask[] {
    return this.careTasksService.findByPlanId(planId);
  }

  @Post()
  @ApiOperation({ summary: '创建照护任务' })
  create(@Body() createCareTaskDto: CreateCareTaskDto): CareTask {
    return this.careTasksService.create(createCareTaskDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新照护任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  update(@Param('id') id: string, @Body() updateCareTaskDto: UpdateCareTaskDto): CareTask {
    return this.careTasksService.update(id, updateCareTaskDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: '删除照护任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  remove(@Param('id') id: string): boolean {
    return this.careTasksService.remove(id);
  }

  @Post(':id/claim')
  @ApiOperation({ summary: '领取照护任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  claimTask(@Param('id') id: string, @Body() claimTaskDto: ClaimTaskDto): CareTask {
    return this.careTasksService.claimTask(id, claimTaskDto);
  }

  @Post(':id/start')
  @ApiOperation({ summary: '开始执行照护任务' })
  @ApiParam({ name: 'id', description: '任务ID' })
  startTask(@Param('id') id: string): CareTask {
    return this.careTasksService.startTask(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '标记照护任务完成' })
  @ApiParam({ name: 'id', description: '任务ID' })
  completeTask(@Param('id') id: string, @Body() completeTaskDto: CompleteTaskDto): CareTask {
    return this.careTasksService.completeTask(id, completeTaskDto);
  }

  @Post(':id/fail')
  @ApiOperation({ summary: '标记照护任务未完成' })
  @ApiParam({ name: 'id', description: '任务ID' })
  failTask(@Param('id') id: string, @Body() failTaskDto: FailTaskDto): CareTask {
    return this.careTasksService.failTask(id, failTaskDto);
  }
}
