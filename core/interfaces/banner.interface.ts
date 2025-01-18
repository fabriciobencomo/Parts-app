export interface Banners {
  offers: Offer[];
}

export interface Offer {
  id:          number;
  title:       string;
  description: string;
  imageUrl:    string;
  link:        string;
  validUntil:  Date;
}
