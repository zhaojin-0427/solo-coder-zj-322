import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { Plan } from './entities/plan.entity';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: '获取所有出行计划' })
  findAll(): Plan[] {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取出行计划' })
  @ApiParam({ name: 'id', description: '计划ID' })
  findOne(@Param('id') id: string): Plan {
    return this.plansService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建出行计划' })
  create(@Body() createPlanDto: CreatePlanDto): Plan {
    return this.plansService.create(createPlanDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新出行计划' })
  @ApiParam({ name: 'id', description: '计划ID' })
  update(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto): Plan {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: '删除出行计划' })
  @ApiParam({ name: 'id', description: '计划ID' })
  remove(@Param('id') id: string): boolean {
    return this.plansService.remove(id);
  }
}
