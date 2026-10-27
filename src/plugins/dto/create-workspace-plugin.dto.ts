import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateWorkspacePluginDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del workspace del microservicio Tenants'
  })
  @IsUUID()
  workspaceId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID del plugin registrado en el catálogo'
  })
  @IsUUID()
  pluginId: string;
}