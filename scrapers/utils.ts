import { Page } from "puppeteer";
import { Product } from "./d";

export const printMissingData = (product: Product) => {
  const missing = [];
  if (!product.dateTo) missing.push("dateUntil");
  if (!product.image) missing.push("image");
  if (!product.link) missing.push("link");
  if (!product.priceCents) missing.push("priceCents");
  if (!product.priceUnit) missing.push("priceUnit");
  if (!product.shop) missing.push("shop");
  if (!product.unitPriceCents) missing.push("unitPriceCents");
  if (!product.unitPriceUnit) missing.push("unitPriceUnit");
  if (missing.length > 0) {
    console.log(product.title + " " + missing.join("|"));
  }
};

export async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      var totalHeight = 0;
      var distance = 400;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

export async function waitAndClick(selector: string, page: Page) {
  const element = await page.waitForSelector(selector);
  await element?.evaluate((el: HTMLAnchorElement) => el.click());
}
