import { ElementHandle } from "puppeteer";
import { LidlProduct } from "./d";
import { validate } from "../validation";
import { Product } from "@prisma/client";

/**
 *
 * @param dateStr string format: <02.10. - 08.10.> | <od 02.10.>
 */
export function getDates(dateStr: string) {
  
  if (!dateStr) {
    return {};
  }
  
  dateStr = dateStr.toLocaleLowerCase();
  const year = new Date().getFullYear();
  if (dateStr.includes(" - ")) {
    const parts = dateStr.split(" - ");
    const from = [
      year,
      ...parts[0]
        .split(".")
        .filter((i) => !!i)
        .reverse(),
    ].join("-");

    const to = [
      year,
      ...parts[1]
        .split(".")
        .filter((i) => !!i)
        .reverse(),
    ].join("-");

    return {
      dateFrom: from,
      dateTo: to,
    };
  } else if (dateStr.startsWith("od ")) {
    const dates = dateStr.replace("od ", "").split(" do ");
    const from = [
      year,
      ...dates[0]
        .split(".")
        .filter((i) => !!i)
        .reverse(),
    ].join("-");

    let to = null;
    if(dates[1]) {
      to = [
        year,
        ...dates[1]
          .split(".")
          .filter((i) => !!i)
          .reverse(),
      ].join("-");

      return {
        dateFrom: from,
        dateTo: to
      };
    }
    return {
      dateFrom: from,
    };
  }

  return {};
}

/**
 *
 * @param price string <1.50>
 * @param priceInfo string < / kg> | < 500 g,1 kg = 1.98 € (14.92 kn)>
 * @returns {
 *    priceCents: number;
 *    priceUnit: string;
 *    unitPriceCents: number;
 *    unitPriceUnit: string;
 * }
 */
function getPrice(price: string, priceInfo: string) {
  const priceCents = +price?.replace(",", "").replace("-", "00");
  const trimmedInfo = (priceInfo ?? "")
    .trim()
    .replace("Redovna cijena za ", "")
    .replace("1 kg", "kg")
    .replace("1 L", "L");
  try {
    if (trimmedInfo.startsWith("/ ")) {
      const unit = trimmedInfo.replace("/ ", "");
      return {
        priceCents,
        priceUnit: `€/${unit}`,
        unitPriceCents: priceCents,
        unitPriceUnit: `€/${unit}`,
      };
    } else if (trimmedInfo.includes(",")) {
      const [quantity, unitInfo, err] = trimmedInfo.split(",");
      if (err) {
        return {
          priceCents,
        };
      }
      const [unitQuantity, priceInfo] = unitInfo.split("=");
      const [unitPrice] = priceInfo.split(" €");
      return {
        priceCents,
        priceUnit: `€/${quantity}`,
        unitPriceCents: +unitPrice.trim().replace(".", ""),
        unitPriceUnit: `€/${unitQuantity.trim().trim()}`,
      };
    } else if (trimmedInfo.includes("=")) {
      const [unitQuantity, priceInfo] = trimmedInfo.split("=");
      const [unitPrice] = priceInfo.split(" €");
      return {
        priceCents,
        unitPriceCents: +unitPrice.trim().replace(".", ""),
        unitPriceUnit: `€/${unitQuantity.trim()}`,
      };
    } else {
      return {
        priceCents,
        unitPriceUnit: `€/${trimmedInfo}`,
      };
    }
  } catch (e) {
    console.error("\n\nError parsing price\n\n", price, priceInfo);
    return {
      priceCents,
    };
  }
}

export async function extractItemData(grid: ElementHandle<HTMLDivElement>) {
  return await grid?.evaluate((el: HTMLDivElement) => {
    const tiles = el.querySelectorAll(".ods-tile.product-grid-box");
    const products = [];
    for (const tile of tiles) {
      products.push({
        link: (tile.querySelector(".ods-tile__link") as HTMLAnchorElement)?.href,
        date: (tile.querySelector(".product-grid-box__availabilities") as HTMLSpanElement)?.innerText,
        image: (tile.querySelector(".ods-image-gallery__image") as HTMLImageElement)?.src,
        title: (tile.querySelector(".product-grid-box__title") as HTMLHeadingElement)?.innerText,
        subtitle: (tile.querySelector(".product-grid-box__desc") as HTMLHeadingElement)?.innerText,
        price: (tile.querySelector(".m-price__price.m-price__price--small") as HTMLDivElement)?.innerText,
        priceInfo: (tile.querySelector(".price-footer") as HTMLDivElement)?.innerText,
      } as LidlProduct);
    }

    return products;
  });
}

export function mapProducts(products: LidlProduct[]): Product[] {
  return products.map((p) => {
    const dates = getDates(p.date);
    return {
      image: p.image,
      link: p.link,
      shop: "Lidl",
      title: p.title,
      subtitle: p.subtitle,
      ...dates,
      priceCents: getPrice(p.price, p.priceInfo).priceCents,
      product: JSON.stringify(p),
      valid: validate(dates.dateFrom, dates.dateTo),
    } as Product;
  });
}
