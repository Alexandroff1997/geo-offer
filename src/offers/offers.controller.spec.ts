import { Test, TestingModule } from '@nestjs/testing';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { GetOfferQueryDto } from './dto/get-offer-query.dto';

describe('OffersController', () => {
  let offersController: OffersController;
  let offersService: Partial<OffersService>;

  beforeEach(async () => {
    offersService = {
      fetchOffers: jest.fn().mockResolvedValue(['firstOffer', 'secondOffer']),
      getOffersByGeo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OffersController],
      providers: [
        {
          provide: OffersService,
          useValue: offersService,
        },
      ],
    }).compile();

    offersController = module.get<OffersController>(OffersController);
  });

  describe('#getAll', () => {
    it('should return an array of offers', async () => {
      const result = await offersController.getAll();
      expect(result).toEqual(['firstOffer', 'secondOffer']);
      expect(offersService.fetchOffers).toHaveBeenCalled();
    });
  });

  describe('#getOffers', () => {
    it('should return offers for geo location', async () => {
      const geo = 'RU';
      const query = { page: 1, pageSize: 10 } as GetOfferQueryDto;

      offersService.getOffersByGeo = jest
        .fn()
        .mockResolvedValue(['firstOffer', 'secondOffer']);

      const result = await offersController.getOffers(geo, query);

      expect(result).toEqual(['firstOffer', 'secondOffer']);
      expect(offersService.getOffersByGeo).toHaveBeenCalledWith({
        geo,
        ...query,
      });
    });
  });
});
