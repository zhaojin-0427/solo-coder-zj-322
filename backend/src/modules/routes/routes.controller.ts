import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RoutesService } from './routes.service';
import { CreateRouteDto, UpdateRouteDto } from './dto/route.dto';
import { Route } from './entities/route.entity';

@ApiTags('routes')
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @ApiOperation({ summary: '获取所有路线，可按计划ID筛选' })
  @ApiQuery({ name: 'planId', required: false, description: '按计划ID筛选' })
  findAll(@Query('planId') planId?: string): Route[] {
    if (planId) return this.routesService.findByPlanId(planId);
    return this.routesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取路线' })
  @ApiParam({ name: 'id', description: '路线ID' })
  findOne(@Param('id') id: string): Route {
    return this.routesService.findOne(id);
  }

  @Get('selected/:planId')
  @ApiOperation({ summary: '获取计划的已选中路线' })
  @ApiParam({ name: 'planId', description: '计划ID' })
  findSelected(@Param('planId') planId: string): Route | null {
    return this.routesService.findSelected(planId);
  }

  @Post()
  @ApiOperation({ summary: '手动创建路线' })
  create(@Body() createRouteDto: CreateRouteDto): Route {
    return this.routesService.create(createRouteDto);
  }

  @Post('generate/:planId')
  @ApiOperation({ summary: '根据计划和偏好自动生成多版本推荐路线' })
  @ApiParam({ name: 'planId', description: '计划ID' })
  generate(@Param('planId') planId: string): Route[] {
    return this.routesService.generate(planId);
  }

  @Post(':id/select')
  @ApiOperation({ summary: '选中路线为最终路线' })
  @ApiParam({ name: 'id', description: '路线ID' })
  select(@Param('id') id: string): Route {
    return this.routesService.selectRoute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新路线' })
  @ApiParam({ name: 'id', description: '路线ID' })
  update(@Param('id') id: string, @Body() updateRouteDto: UpdateRouteDto): Route {
    return this.routesService.update(id, updateRouteDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: '删除路线' })
  @ApiParam({ name: 'id', description: '路线ID' })
  remove(@Param('id') id: string): boolean {
    return this.routesService.remove(id);
  }
}
