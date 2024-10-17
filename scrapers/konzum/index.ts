import puppeteer, { ElementHandle } from "puppeteer";
import { extractItemData, mapProducts } from "./helpers";
import { log, start, end } from "../../logger";
import { Product } from "@prisma/client";

export async function scrape() {
  try {
    log("Konzum", "Info", "Starting!");
    start("Konzum");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

    // Open main page
    await page.goto("https://www.konzum.hr/web/posebne-ponude?per_page=100");

    const pagination = await page.waitForSelector("ul.pagination");

    const cnt = await pagination.evaluate((el) => {
      const children = [...el.children] as HTMLLIElement[];
      return children[children.length - 2].innerText;
    });

    let pages = Array.from({ length: +cnt }, (_, i) => i + 1);
    if (process.env.TEST === "true") {
      pages = [1];
    }

    let products: Product[] = [];
    for (let p of pages) {
      log("Konzum", "Info", `Fetching page ${p} of ${cnt}`);
      await page.goto("https://www.konzum.hr/web/posebne-ponude?per_page=100&page=" + p);
      const grid = await page.waitForSelector(".product-list ");
      products.push(...mapProducts(await extractItemData(grid as ElementHandle<HTMLElement>)));
    }

    log("Konzum", "Success", `Done, found ${products.length} products`);

    await browser.close();

    end("Konzum", products.length, products.filter((p) => p.valid).length);

    return products;
  } catch (e) {
    log("Konzum", "Error", `Error scraping`, e.toString());
    end("Konzum", 0, 0, true);
    return [];
  }
}
