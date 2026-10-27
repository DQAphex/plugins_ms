import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class GithubUrlDto {
  @ApiProperty({
    example: 'https://github.com/OWNER/REPO',
    description: 'URL del repositorio de GitHub'
  })
  @IsUrl({
    protocols: ['https'],
    require_protocol: true
  })
  repositoryUrl: string;
}
