import { PartialType } from '@nestjs/mapped-types';
import { CreatePluginDto } from './create-plugin.dto.js';

export class UpdatePluginDto extends PartialType(CreatePluginDto) {}