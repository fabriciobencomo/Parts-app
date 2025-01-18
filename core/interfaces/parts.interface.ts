export interface Parts {
  autoParts: AutoPart[];
}

export interface AutoPart {
  id:           number;
  name:         string;
  category:     string;
  price:        number;
  manufacturer: string;
  stock:        number;
  image:        string;
}
