import {
  ConflictException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { GetOfferQueryDto } from './dto/get-offer-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Start synchronization with an external source' })
  @ApiResponse({
    status: 200,
    description: 'Synchronization started successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Synchronization is already in progress',
  })
  async syncOffers() {
    try {
      await this.offersService.syncOffers();
      return { message: 'Synchronization started successfully' };
    } catch (error) {
      if (error.message === 'Synchronization is already in progress') {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @UsePipes(new ValidationPipe())
  @Get('all')
  @ApiOperation({ summary: 'Retrieve all offers' })
  @ApiResponse({ status: 200, description: 'List of all offers' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async getAll() {
    const result = await this.offersService.fetchOffers();
    return result;
  }

  @Get('geo-stats')
  @ApiOperation({ summary: 'Retrieve GEO statistics' })
  @ApiResponse({ status: 200, description: 'List of GEO with offer counts' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async getGeoStats() {
    return this.offersService.getGeoStats();
  }

  @ApiOperation({
    summary:
      'Retrieve a list of all GEOs with the corresponding number of offers',
  })
  @ApiParam({
    name: 'geo',
    required: true,
    description: 'Geographic location code',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Number of offers per page',
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Current page number',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of offers for the specified location',
  })
  @ApiResponse({
    status: 404,
    description: 'Offers not found for the specified location',
  })
  @Get(':geo')
  async getOffers(
    @Param('geo') geo: string,
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: GetOfferQueryDto,
  ) {
    return this.offersService.getOffersByGeo({ geo, ...query });
  }
}
