import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeprecateDto {
  @ApiProperty({ example: 'Plugin obsoleto, usar alternativa' })
  @IsString()
  reason: string;
}
