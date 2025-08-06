import { Category } from './category.interface';
import { Brand } from './brand.interface';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  model: string;
  stock: number;
  warrantyMonths: number;
  warrantyStart: Date;
  images?: string[];
  category: Category;
  brand: Brand;
  createdAt: Date;
  updatedAt: Date;
}