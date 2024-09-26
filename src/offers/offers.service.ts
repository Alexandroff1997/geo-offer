import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer, OfferDocument } from './models/offer.model';
import { MappedOfferData, OfferData } from './interfaces/offer.interface';
import axios from 'axios';
import { GetOfferDto } from './dto/get-offer.dto';
import { CITYADS_OFFER_LIST_URL } from './common/offers.constants';

@Injectable()
export class OffersService implements OnModuleInit {
  private readonly logger: Logger = new Logger(OffersService.name);
  constructor(
    @InjectModel(Offer.name) private offerModel: Model<OfferDocument>,
  ) {}

  async onModuleInit() {
    await this.fetchOffers();
  }

  async fetchOffers() {
    let page = 1;
    const perpage = 500;
    const allMappedOffers = [];

    while (true) {
      try {
        const response = await axios.get(
          `${CITYADS_OFFER_LIST_URL}?page=${page}&perpage=${perpage}`,
        );

        const offers = response.data.offers;

        if (offers.length === 0) break;

        const mappedOffers = this.mapOffers(offers);
        allMappedOffers.push(...mappedOffers);

        for (const offer of mappedOffers) {
          const offerId = this.generateOfferId(offer);
          const offerData = {
            ...offer,
            offerId,
          };

          await this.offerModel.updateOne(
            { offerId },
            { $setOnInsert: offerData },
            { upsert: true },
          );
        }

        page++;
      } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
          this.logger.error(error.message);
        }
        break;
      }
    }

    return allMappedOffers;
  }

  generateOfferId(offer: MappedOfferData): string {
    return `${offer.name}-${offer.approval_time}-${offer.offer_currency.name}`;
  }

  mapOffers(data: OfferData[]): MappedOfferData[] {
    return data
      .filter((offer) => !offer.geo.some((g) => g.code === 'Wrld'))
      .map((offer) => {
        const approval_time = offer.approval_time;
        const payment_time = offer.payment_time;

        const firstCoeff = 10 * (1 - approval_time / 90);
        const secondCoeff = 100 * (1 - payment_time / 90);

        const ecpl = parseFloat(offer.stat.ecpl) || 0;

        let rating = ecpl;

        if (firstCoeff > 0) {
          rating *= firstCoeff;
        }

        if (secondCoeff > 0) {
          rating *= secondCoeff;
        }

        return {
          name: offer.name,
          offer_currency: {
            name: offer.offer_currency.name,
          },
          approval_time: offer.approval_time,
          site_url: offer.site_url,
          logo: offer.logo,
          geo: offer.geo.map((g) => ({
            code: g.code,
            name: g.name,
          })),
          rating,
        };
      });
  }

  async getOffersByGeo(getOfferDto: GetOfferDto) {
    try {
      const { geo, pageSize = 5, page = 0 } = getOfferDto;

      if (pageSize > 20) {
        throw new BadRequestException('The maximum value for pageSize is 20');
      }

      const offers = await this.offerModel
        .find({ 'geo.code': geo })
        .skip(page * pageSize)
        .limit(pageSize)
        .exec();

      if (offers.length === 0) {
        throw new NotFoundException(`Offers with current ${geo} not found`);
      }

      const totalOffers = await this.offerModel
        .countDocuments({ 'geo.code': geo })
        .exec();

      return {
        offers,
        totalOffers,
        additionalData: 'Additional data',
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        this.logger.error(error.message);
      }
      throw error;
    }
  }
}
