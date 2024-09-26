import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OfferDocument = HydratedDocument<Offer>;

class OfferCurrency {
  id?: string;
  name: string;
}

@Schema({ timestamps: true })
export class Offer {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  offer_currency: OfferCurrency;

  @Prop({ required: true })
  approval_time: string;

  @Prop({ required: true })
  site_url: string;

  @Prop({ required: true })
  logo: string;

  @Prop({ required: true })
  geo: {
    code: string;
    name: string;
  }[];
  @Prop({ required: true })
  rating: number;

  @Prop({ required: true, unique: true })
  offerId: string;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
