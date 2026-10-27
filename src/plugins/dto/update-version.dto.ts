import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateVersionDto {
  @ApiProperty({ example: 'v1.1.0' })
  @IsString()
  version: string;
}

export class RollbackDto {
  @ApiProperty({ example: 'v1.0.0' })
  @IsString()
  version: string;
}
