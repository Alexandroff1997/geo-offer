import { IsOptional, IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetOfferDto {
  @ApiProperty({
    required: false,
    description: 'Geographic location code',
  })
  @IsString()
  geo: string;

  @ApiProperty({
    required: false,
    description: 'Number of offers per page',
  })
  @IsOptional()
  @IsInt()
  pageSize?: number;

  @ApiProperty({
    required: false,
    description: 'Current page number',
  })
  @IsOptional()
  @IsInt()
  page?: number;
}
