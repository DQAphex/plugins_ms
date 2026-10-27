import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID } from 'class-validator';

export class DiscoverDto {
  @ApiProperty({ example: ['plugins/plugin1', 'plugins/plugin2'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  paths: string[];
}

export class InstalledItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  pluginId: string;

  @ApiProperty({ example: 'v1.0.0' })
  @IsString()
  version: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  workspaceId: string;
}

export class InstalledDto {
  @ApiProperty({ type: [InstalledItemDto] })
  @IsArray()
  plugins: InstalledItemDto[];
}

export class InstallationEventDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  pluginId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  workspaceId: string;

  @ApiProperty({ example: 'install' })
  @IsString()
  event: string;

  @ApiProperty({ example: 'v1.0.0' })
  @IsString()
  version: string;

  @ApiProperty({ example: '2026-10-24T00:00:00.000Z' })
  timestamp: Date;
}
