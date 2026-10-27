import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({
    example: 'generador',
    description: 'Término de búsqueda'
  })
  @IsString()
  q: string;
}
