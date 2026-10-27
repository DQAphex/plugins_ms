import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkPluginItemDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID()
  pluginId: string;
}

export class BulkInstallDto {
  @ApiProperty({ type: [BulkPluginItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkPluginItemDto)
  plugins: BulkPluginItemDto[];
}
