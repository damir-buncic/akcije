import { ElementHandle } from "puppeteer";
import { KonzumProduct } from "./d";
import { validate } from "../validation";
import { Product } from "@prisma/client";

export async function extractItemData(grid: ElementHandle<HTMLElement>) {
  return await grid?.evaluate((el: HTMLDivElement) => {
    const products: KonzumProduct[] = [];
    for (const item of el.children) {
      products.push({
        image: (item.querySelector(".product-default__image img") as HTMLImageElement)?.src,
        title: (item.querySelector(".product-default__title a") as HTMLHeadingElement)?.innerText,
        link: (item.querySelector(".product-default__title a") as HTMLAnchorElement)?.href,
        priceCents: (item.querySelector(".price--primary") as HTMLParagraphElement)?.innerText,
        dateUntil: (
          item.querySelector(".product-default__price-details-grid div:last-of-type strong") as HTMLDivElement
        )?.innerText,
      } as KonzumProduct);
    }

    return products;
  });
}

export function mapProducts(products: KonzumProduct[]): Product[] {
  const date = new Date();
  const dateFrom = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  return products
  .filter((p) => !!p.priceCents)
  .map((p) => {
      const dateTo = p.dateUntil.split(".").reverse().join("-");
      return {
        image: p.image,
        link: p.link,
        shop: "Konzum",
        title: p.title,
        dateFrom,
        dateTo,
        priceCents: +p.priceCents
          .split("\n")
          .map((p) => p.trim())
          .filter((p) => !!p)
          .join("")
          .split("€")[0],
        valid: validate(dateFrom, dateTo),
        product: JSON.stringify(p),
      } as Product;
    });
}
