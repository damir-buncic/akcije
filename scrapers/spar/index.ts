import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { extractItemData, mapProducts } from "./helpers";
puppeteer.use(StealthPlugin());
import { log, start, end } from "../../logger";
import { ElementHandle } from "puppeteer";

const ACTION_CATEGORIES_GRID_SELECTOR = ".content-main"; //".tile-grid.container";

export async function scrape() {
  try {
    log("Spar", "Info", "Starting!");
    start("Spar");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

    // Open main page
    await page.goto("https://www.spar.hr/aktualne-ponude");

    const categoryGrid = await page.waitForSelector(ACTION_CATEGORIES_GRID_SELECTOR);

    let categoryLinks = await categoryGrid.evaluate((el: HTMLDivElement) => {
      return [...el.querySelectorAll("article > a")].map((a: HTMLAnchorElement) => a.href);
    });

    if (process.env.TEST === "true") {
      categoryLinks = [categoryLinks[0]];
    }

    let products = [];
    let pageNumber = 0;
    for (const link of categoryLinks) {
      pageNumber++;
      log("Spar", "Info", `Fetching page ${link} (${pageNumber}/${categoryLinks.length})`);

      await page.goto(link);
      try {
        const grid = (await page.waitForSelector(ACTION_CATEGORIES_GRID_SELECTOR, {
          timeout: 5000,
        })) as ElementHandle<HTMLDivElement>;
        products.push(...mapProducts(await extractItemData(grid), link));
      } catch (e) {
        log("Spar", "Info", `No grid ${link}`);
      }
    }

    log("Spar", "Success", `Done, found ${products.length} products`);

    await browser.close();

    end("Spar", products.length, products.filter((p) => p.valid).length);

    return products;
  } catch (e) {
    log("Spar", "Error", `Error scraping`, e.toString());
    end("Spar", 0, 0, true);
    return [];
  }
}
