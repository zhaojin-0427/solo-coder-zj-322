import { ApiProperty } from '@nestjs/swagger';

export type StaminaLevel = '低' | '中' | '高';
export type RestFrequency = '每15分钟' | '每30分钟' | '每45分钟' | '按需';

export class Preference {
  @ApiProperty({ description: '偏好ID' })
  id: string;

  @ApiProperty({ description: '关联计划ID' })
  planId: string;

  @ApiProperty({ description: '长者姓名' })
  elderName: string;

  @ApiProperty({ description: '体力等级', enum: ['低', '中', '高'] })
  staminaLevel: StaminaLevel;

  @ApiProperty({ description: '休息频率', enum: ['每15分钟', '每30分钟', '每45分钟', '按需'] })
  restFrequency: RestFrequency;

  @ApiProperty({ description: '是否怕晒' })
  sunSensitive: boolean;

  @ApiProperty({ description: '是否怕冷' })
  coldSensitive: boolean;

  @ApiProperty({ description: '可开始时间 (HH:mm)' })
  availableStartTime: string;

  @ApiProperty({ description: '可结束时间 (HH:mm)' })
  availableEndTime: string;

  @ApiProperty({ description: '备注' })
  notes: string;
}
