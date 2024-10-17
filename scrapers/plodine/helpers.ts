import Tesseract from "tesseract.js";
import sharp from "sharp";
import fetch from "node-fetch";
import { ElementHandle } from "puppeteer";
import { PlodineProduct } from "./d";
import { Product } from "@prisma/client";
import { validate } from "../validation";

export const getDateFromImage = async (image: string) => {
  let fimg = await fetch(image);
  let fimgb = Buffer.from(await fimg.arrayBuffer());
  const imgBuff = await sharp(fimgb).extract({ width: 170, height: 35, left: 800, top: 70 }).grayscale().toBuffer();

  return Tesseract.recognize(imgBuff, "hrv")
    .catch((err) => console.error(err))
    .then((data) => {
      if (data && data.data && data.data.text) {
        const year = new Date().getFullYear();
        const dates = data.data.text.replace("\n", "").split(" do ");
        const from = [
          year,
          ...dates[0]
            .split(".")
            .filter((i) => !!i)
            .reverse(),
        ].join("-");
        if (dates[1]) {
          const to = [
            year,
            ...dates[1]
              .split(".")
              .filter((i) => !!i)
              .reverse(),
          ].join("-");

          return { dateFrom: from, dateTo: to };
        }
        return { dateFrom: from };
      }

      return {};
    });
};

export async function extractItemData(grid: ElementHandle<HTMLDivElement>) {
  return grid?.evaluate((el: HTMLDivElement) => {
    const products = [];
    for (const item of el.children) {
      products.push({
        image: (item.querySelector("img.card__img") as HTMLImageElement)?.src,
        title: (item.querySelector(".card__title") as HTMLHeadingElement)?.innerText,
        subtitle: (item.querySelector(".card__description") as HTMLParagraphElement)?.innerText,
        quantity: (item.querySelector(".card__quantity") as HTMLParagraphElement)?.innerText,
        price: (item.querySelector(".card__price .regular") as HTMLDivElement)?.innerText,
      } as PlodineProduct);
    }

    return products;
  });
}

export function mapProducts(
  products: PlodineProduct[],
  dates: { dateFrom?: string; dateTo?: string },
  link: string
): Product[] {
  return products
    .filter((p) => !!p.price)
    .map((p) => {
      return {
        image: p.image,
        link: link,
        shop: "Plodine",
        title: p.title,
        subtitle: getSubtitle(p.subtitle, p.quantity),
        ...dates,
        priceCents: Number(p.price.replace(",", "").replace("€", "")),
        product: JSON.stringify({ ...p, ...dates }),
        valid: validate(dates.dateFrom, dates.dateTo),
      } as Product;
    });
}

function getSubtitle(subtitle, quantity) {
  if (subtitle) {
    if (quantity) {
      return `${subtitle}, ${quantity}`;
    }
    return subtitle;
  }
  return quantity;
}
