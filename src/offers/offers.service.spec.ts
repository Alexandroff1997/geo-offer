import { Test, TestingModule } from '@nestjs/testing';
import { OffersService } from './offers.service';
import { getModelToken } from '@nestjs/mongoose';
import { Offer } from './models/offer.model';
import axios from 'axios';
import { MappedOfferData, OfferData } from './interfaces/offer.interface';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { GetOfferDto } from './dto/get-offer.dto';
import { mockLogger } from '../../test/helpers/test-helpers';

jest.mock('axios');

describe('OffersService', () => {
  let offersService: OffersService;
  let offerModel: any;

  beforeEach(async () => {
    offerModel = {
      updateOne: jest.fn(),
      find: jest.fn().mockReturnValueOnce({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
      skip: jest.fn(),
      limit: jest.fn(),
      countDocuments: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        {
          provide: getModelToken(Offer.name),
          useValue: offerModel,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    offersService = module.get<OffersService>(OffersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('#fetchOffers', () => {
    const netWorkError = 'Network error';
    const mockResponse = {
      data: {
        offers: [
          {
            name: 'Test Offer 1',
            offer_currency: { name: 'USD' },
            approval_time: 30,
            site_url: 'https://example.com/1',
            logo: 'https://example.com/logo1.png',
            geo: [{ code: 'US', name: 'United States' }],
            stat: { ecpl: '2.5' },
          },
        ],
      },
    };
    const mockEmptyOffersResponse = {
      data: {
        offers: [],
      },
    };

    it('should fetch and write offers to the database', async () => {
      (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);
      (axios.get as jest.Mock).mockResolvedValueOnce(mockEmptyOffersResponse);

      const result = await offersService.fetchOffers();

      expect(result.length).toBe(1);
      expect(offerModel.updateOne).toHaveBeenCalledWith(
        { offerId: expect.any(String) },
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should catch error and stop fetching on failure', async () => {
      jest.spyOn(Logger, 'log');

      (axios.get as jest.Mock).mockRejectedValue(new Error(netWorkError));

      await offersService.fetchOffers();

      expect(offerModel.updateOne).not.toHaveBeenCalled();
    });
  });

  describe('#generateOfferId', () => {
    const expectedOfferId = 'Test Offer-30-USD';
    const exampleOffer: MappedOfferData = {
      name: 'Test Offer',
      approval_time: 30,
      offer_currency: { name: 'USD' },
      site_url: '',
      logo: '',
      geo: [],
      rating: 0,
    };

    it('should generate correct offer id with valid MappedOfferData', () => {
      const result = offersService.generateOfferId(exampleOffer);

      expect(result).toBe(expectedOfferId);
    });
  });

  describe('#mapOffers', () => {
    const offers: OfferData[] = [
      {
        name: 'Offer 1',
        geo: [
          {
            code: 'Wrld',
            name: 'Worldwide',
            id: '',
            parent_id: '',
            children_ids: [],
          },
        ],
        approval_time: 30,
        payment_time: 60,
        stat: {
          ecpl: '1.5',
          cr: '',
          ar: '',
          ecpc: '',
        },
        id: '',
        offer_currency: {
          id: '',
          name: '',
        },
        site_url: '',
        logo: '',
      },
      {
        name: 'Offer 2',
        geo: [
          {
            code: 'US',
            name: 'United States',
            id: '',
            parent_id: '',
            children_ids: [],
          },
        ],
        approval_time: 45,
        payment_time: 75,
        stat: {
          ecpl: '2.0',
          cr: '',
          ar: '',
          ecpc: '',
        },
        id: '',
        offer_currency: {
          id: '',
          name: '',
        },
        site_url: '',
        logo: '',
      },
    ];
    const expectedRating = 166.66666666666663;

    it('should filter out offers with geo code "Wrld"', () => {
      const result = offersService.mapOffers(offers);

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Offer 2');
    });

    it('should calculate rating based on approval_time and payment_time', () => {
      const result = offersService.mapOffers(offers);

      expect(result.length).toBe(1);
      expect(result[0].rating).toBe(expectedRating);
    });
  });

  describe('#getOffersByGeo', () => {
    it('should throw BadRequestException if pageSize is greater than 20', async () => {
      const getOfferDto: GetOfferDto = { geo: 'US', pageSize: 21, page: 0 };

      await expect(offersService.getOffersByGeo(getOfferDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if no offers are found', async () => {
      offerModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const getOfferDto: GetOfferDto = { geo: 'US', pageSize: 5, page: 0 };

      await expect(offersService.getOffersByGeo(getOfferDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
