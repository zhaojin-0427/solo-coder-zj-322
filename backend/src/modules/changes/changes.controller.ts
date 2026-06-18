import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ChangesService } from './changes.service';
import { CreateChangeDto, UpdateChangeDto } from './dto/change.dto';
import { Change } from './entities/change.entity';

@ApiTags('changes')
@Controller('changes')
export class ChangesController {
  constructor(private readonly changesService: ChangesService) {}

  @Get()
  @ApiOperation({ summary: '获取所有途中变更，可按计划ID筛选' })
  @ApiQuery({ name: 'planId', required: false, description: '按计划ID筛选' })
  findAll(@Query('planId') planId?: string): Change[] {
    if (planId) return this.changesService.findByPlanId(planId);
    return this.changesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取途中变更' })
  @ApiParam({ name: 'id', description: '变更ID' })
  findOne(@Param('id') id: string): Change {
    return this.changesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '记录途中变更' })
  create(@Body() createChangeDto: CreateChangeDto): Change {
    return this.changesService.create(createChangeDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新途中变更' })
  @ApiParam({ name: 'id', description: '变更ID' })
  update(@Param('id') id: string, @Body() updateChangeDto: UpdateChangeDto): Change {
    return this.changesService.update(id, updateChangeDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: '删除途中变更' })
  @ApiParam({ name: 'id', description: '变更ID' })
  remove(@Param('id') id: string): boolean {
    return this.changesService.remove(id);
  }
}
