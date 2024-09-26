export interface Geo {
  id: string;
  parent_id: string;
  code: string;
  name: string;
  children_ids: string[];
}

export interface OfferData {
  id: string;
  name: string;
  offer_currency: {
    id: string;
    name: string;
  };
  approval_time: number;
  payment_time: number;
  site_url: string;
  logo: string;
  stat: {
    cr: string;
    ar: string;
    ecpc: string;
    ecpl: string;
  };
  geo: Geo[];
}

export interface MappedOfferData {
  name: string;
  offer_currency: {
    id?: string;
    name: string;
  };
  approval_time: number;
  site_url: string;
  logo: string;
  geo: Array<{
    code: string;
    name: string;
  }>;
  rating: number;
}
