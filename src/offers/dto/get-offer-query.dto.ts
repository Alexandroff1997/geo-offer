import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetOfferQueryDto {
  @ApiProperty({
    required: false,
    default: 5,
    description: 'Number of offers per page from query',
  })
  @IsOptional()
  pageSize?: number = 5;

  @ApiProperty({
    required: false,
    default: 0,
    description: 'Number of offers per page from query',
  })
  @IsOptional()
  page?: number = 0;
}
