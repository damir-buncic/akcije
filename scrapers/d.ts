export type Product = {
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  priceCents: number;
  priceUnit?: string;
  unitPriceCents?: number;
  unitPriceUnit?: string;
  dateFrom?: string;
  dateTo?: string;
  shop: string;
  valid: boolean;
  product: string;
};
