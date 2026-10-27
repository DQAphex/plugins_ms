import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsISO8601,
  IsString,
  IsUrl,
  Length,
  Matches
} from 'class-validator';

export class CreatePluginDto {
  @ApiProperty({
    example: 'Generador de Plugins',
    description: 'Nombre del plugin',
    maxLength: 100
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    example: 'General',
    description: 'Categoría del plugin'
  })
  @IsString()
  @Length(1, 100)
  pluginCategory: string;

  @ApiProperty({
    example: 'Diego Quioza',
    description: 'Autor del plugin'
  })
  @IsString()
  @Length(1, 100)
  author: string;

  @ApiProperty({
    example: 'dquioza@smu.cl',
    description: 'Correo del autor'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'https://github.com/OWNER/plugins',
    description: 'URL del repositorio de GitHub'
  })
  @IsUrl({
    protocols: ['https'],
    require_protocol: true
  })
  repositoryUrl: string;

  @ApiProperty({
    example: '1.0.0',
    description: 'Versión publicada en GitHub Releases'
  })
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, {
    message: 'latestVersion debe tener formato MAJOR.MINOR.PATCH'
  })
  latestVersion: string;

  @ApiProperty({
    example: 'v1.0.0',
    description: 'Tag asociado a la Release'
  })
  @IsString()
  @Matches(/^v\d+\.\d+\.\d+$/, {
    message: 'releaseTag debe tener formato vMAJOR.MINOR.PATCH'
  })
  releaseTag: string;

  @ApiProperty({
    example: '2026-09-08T00:00:00.000Z',
    description: 'Fecha original de creación del plugin en formato ISO 8601'
  })
  @IsISO8601()
  pluginCreatedAt: string;
}