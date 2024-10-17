import { Product } from "@prisma/client";
import { SparProduct } from "./d";
import { validate } from "../validation";
import { ElementHandle } from "puppeteer";

export async function extractItemData(grid: ElementHandle<HTMLDivElement>) {
  return grid.evaluate((el: HTMLDivElement) => {
    return [...el.querySelectorAll(".tile-basic--product")].map((product: HTMLAnchorElement) => {
      return {
        title: (product.querySelector(".tile-basic__headline--product-slim") as HTMLDivElement)?.innerText,
        subtitle: (product.querySelector(".tile-basic__text") as HTMLDivElement)?.innerText,
        image: (product.querySelector(".tile-basic__image") as HTMLImageElement)?.src,
        price: (product.querySelector(".price-tag__price-main") as HTMLParagraphElement)?.innerText,
        dates: (product.querySelector(".tile-basic__validity") as HTMLDivElement)?.innerText,
      };
    });
  });
}

export const mapProducts = (products: SparProduct[], link: string): Product[] => {
  return products.map((p) => {
    if(!p.price) {
      return null;
    }
    const dates = convertDates(p.dates);
    return {
      title: p.title,
      image: p.image,
      link: link,
      priceCents: +p.price.replace(" €", "").replace(",", ""),
      shop: "Spar",
      ...dates,
      subtitle: getSubtitleAndUnitData(p.subtitle).subtitle,
      valid: validate(dates.dateFrom, dates.dateTo),
      product: JSON.stringify({ ...p, ...dates }),
    };
  }).filter(p => !!p) as Product[];
};

const getSubtitleAndUnitData = (subtitleData: string) => {
  if (subtitleData.includes("\n")) {
    let [subtitle, unitData] = subtitleData.split("\n");
    if (unitData) {
      unitData = unitData.replaceAll("već od", "=").replace(" od ", " = ");
      if (unitData.includes("/")) {
        const [unitPriceUnit, unitPrice] = unitData.split("/")[0].split("=");
        return {
          subtitle,
          unitPriceCents: +unitPrice.replace(",", "").replace("€", "").trim(),
          unitPriceUnit: unitPriceUnit.trim(),
        };
      } else {
        return { subtitle: subtitle + ", " + unitData };
      }
    }
    return { subtitle };
  }

  return { subtitle: subtitleData };
};

const convertDates = (dates: string) => {
  if (dates.includes("Vrijedi")) {
    const parts = dates.replace("Vrijedi\n", "").split(" - ");
    return {
      dateFrom: convertDate(parts[0]),
      dateTo: convertDate(parts[1]),
    };
  }

  return {};
};

const convertDate = (date: string) => {
  const [d, m, y] = date.split(".");
  return `20${y}-${m}-${d}`;
};
