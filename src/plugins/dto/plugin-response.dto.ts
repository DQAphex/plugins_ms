import { ApiProperty } from '@nestjs/swagger';

export class PluginResponseDto {
  @ApiProperty({ format: 'uuid' })
  pluginId: string;

  @ApiProperty({ example: 'Generador de Plugins' })
  name: string;

  @ApiProperty({ example: 'General' })
  pluginCategory: string;

  @ApiProperty({ example: 'Diego Quioza' })
  author: string;

  @ApiProperty({ example: 'dquioza@smu.cl' })
  email: string;

  @ApiProperty({
    example: 'https://github.com/OWNER/plugins'
  })
  repositoryUrl: string;

  @ApiProperty({ example: '1.0.0' })
  latestVersion: string;

  @ApiProperty({ example: 'v1.0.0' })
  releaseTag: string;

  @ApiProperty({ example: '2026-09-08T00:00:00.000Z' })
  pluginCreatedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}