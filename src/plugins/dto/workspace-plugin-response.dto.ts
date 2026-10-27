import { ApiProperty } from '@nestjs/swagger';

export class WorkspacePluginResponseDto {
  @ApiProperty({ format: 'uuid' })
  workspacePluginId: string;

  @ApiProperty({ format: 'uuid' })
  workspaceId: string;

  @ApiProperty({ format: 'uuid' })
  pluginId: string;

  @ApiProperty()
  installedAt: Date;

  @ApiProperty()
  updatedAt: Date;
}