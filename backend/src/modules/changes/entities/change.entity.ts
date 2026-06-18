import { ApiProperty } from '@nestjs/swagger';

export type ChangeType = '提前返回' | '更改集合点' | '其他';

export class Change {
  @ApiProperty({ description: '变更ID' })
  id: string;

  @ApiProperty({ description: '关联计划ID' })
  planId: string;

  @ApiProperty({ description: '长者姓名' })
  elderName: string;

  @ApiProperty({ description: '变更类型', enum: ['提前返回', '更改集合点', '其他'] })
  changeType: ChangeType;

  @ApiProperty({ description: '原值' })
  oldValue: string;

  @ApiProperty({ description: '新值' })
  newValue: string;

  @ApiProperty({ description: '变更原因' })
  changeReason: string;

  @ApiProperty({ description: '变更时间' })
  changeTime: string;

  @ApiProperty({ description: '影响说明' })
  impactNotes: string;
}
