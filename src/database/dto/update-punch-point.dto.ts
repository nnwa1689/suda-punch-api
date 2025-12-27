import { PartialType } from '@nestjs/swagger';
import { CreatePunchPointDto } from './create-punch-point.dto';

export class UpdatePunchPointDto extends PartialType(CreatePunchPointDto) {}
