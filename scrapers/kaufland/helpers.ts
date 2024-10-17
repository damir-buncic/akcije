import { validate } from "../validation";
import { Product } from "@prisma/client";
import { KauflandProduct } from "./d";
import { ElementHandle } from "puppeteer";

export async function getDatesFromTitle(title) {
  // Vrijedi od 04.10.2023 do 10.10.2023
  let titleText: string = await title.evaluate((el: HTMLDivElement) => el.innerText);
  if (titleText.startsWith("Vrijedi od ")) {
    titleText = titleText.replace("Vrijedi od ", "");
  }

  if (titleText.includes(" do ")) {
    const [from, to] = titleText.split(" do ");
    return {
      dateFrom: from.split(".").reverse().join("-"),
      dateTo: to.split(".").reverse().join("-"),
    };
  }

  return {};
}

export async function extractItemData(grid: ElementHandle<HTMLElement>) {
  return grid.evaluate((el) => {
    return [...el.querySelectorAll(".m-offer-tile")].map((tile: HTMLDivElement) => {
      return {
        link: (tile.querySelector("a.m-offer-tile__link") as HTMLAnchorElement)?.href,
        image2: (tile.querySelector(".m-offer-tile__image img") as HTMLImageElement)?.src,
        image: (tile.querySelector(".m-offer-tile__image img") as HTMLImageElement)?.dataset?.src,
        title: (tile.querySelector(".m-offer-tile__title") as HTMLHeadingElement)?.innerText,
        subtitle: (tile.querySelector(".m-offer-tile__subtitle") as HTMLHeadingElement)?.innerText,
        quantity: (tile.querySelector(".m-offer-tile__quantity") as HTMLDivElement)?.innerText,
        unitPrice: (tile.querySelector(".m-offer-tile__basic-price") as HTMLDivElement)?.innerText,
        priceCents: (tile.querySelector(".a-pricetag__price") as HTMLDivElement)?.innerText,
        priceCentsDiscount: (tile.querySelector(".a-pricetag--k-card .a-pricetag__price") as HTMLDivElement)?.innerText,
      };
    });
  });
}

export function mapProducts(products: KauflandProduct[], dates: { dateFrom?: string; dateTo?: string }) {
  return products.map((product) => {
    let title = product.subtitle + " " + (product.title ?? "");
    let subtitle = undefined;
    const quantity = product.quantity;
    if (quantity) {
      if (title.includes(quantity)) {
        title = title.replace(quantity, "");
      }
      subtitle = quantity;
    }

    let price = (product.priceCentsDiscount ?? product.priceCents)
      ?.replaceAll(".", "")
      .replaceAll("-", "00")
      .replace(" €", "");

    let unitPrice = 0;
    let unitPriceUnit = "";
    if (product.unitPrice) {
      const unitPriceParts = product.unitPrice.split(" ");
      unitPrice = +(unitPriceParts[2]?.replaceAll(",", "") ?? 0);
      unitPriceUnit = "€/" + unitPriceParts[1];
    }

    return {
      image: product.image ?? product.image2,
      link: product.link,
      shop: "Kaufland",
      title: title.trim(),
      subtitle,
      priceCents: +(price ?? 0),
      ...dates,
      product: JSON.stringify({ ...product, ...dates }),
      valid: validate(dates.dateFrom, dates.dateTo),
    } as Product;
  });
}
