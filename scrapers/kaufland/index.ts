import puppeteer, { ElementHandle } from "puppeteer";
import { waitAndClick } from "../utils";
import { extractItemData, getDatesFromTitle, mapProducts } from "./helpers";
import { log, start, end } from "../../logger";
import { Product } from "@prisma/client";

const ACTIONS_NAVBAR_SELECTOR = ".o-navigation-main__item.o-navigation-main__item--level-2 a";
const PAGE_SELECTOR = ".page__content";
const ACTIONS_CATEGORY_TITLE_SELECTOR = ".a-icon-tile-headline__subheadline";
const ACTIONS_GRID_SELECTOR = ".t-offers-overview__tiles";

export async function scrape() {
  try {
    log("Kaufland", "Info", "Starting!");
    start("Kaufland");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

    // Open main page
    await page.goto("https://www.kaufland.hr/");

    await waitAndClick(ACTIONS_NAVBAR_SELECTOR, page);

    // gets all categories from first action
    let content = await page.waitForSelector(PAGE_SELECTOR);
    let categoryLinks = await content.evaluate((main) => {
      return [...main.querySelectorAll(".m-recipe-reference-tile__link")].map((a: HTMLAnchorElement) => {
        return a.href;
      });
    });

    // gets all categories from sidebar - has more than previous one
    await page.goto(categoryLinks[0]);
    content = await page.waitForSelector(PAGE_SELECTOR);
    categoryLinks = await content.evaluate((main) => {
      return [...main.querySelectorAll(".t-offers-overview__categories a.m-accordion__link")].map(
        (a: HTMLAnchorElement) => {
          return a.href;
        }
      );
    });

    if (process.env.TEST === "true") {
      categoryLinks = [categoryLinks[0]];
    }

    let products: Product[] = [];
    let pageNumber = 0;
    for (const category of categoryLinks) {
      pageNumber++;
      log("Kaufland", "Info", `Fetching page ${category} (${pageNumber}/${categoryLinks.length})`);

      await page.goto(category);
      const title = await page.waitForSelector(ACTIONS_CATEGORY_TITLE_SELECTOR);
      if (!title) {
        log("Kaufland", "Error", `No title for ${category} (${pageNumber}/${categoryLinks.length})`);
      }
      const dates = await getDatesFromTitle(title);

      const grid = await page.waitForSelector(ACTIONS_GRID_SELECTOR);
      products.push(...mapProducts(await extractItemData(grid as ElementHandle<HTMLElement>), dates));
    }

    log("Kaufland", "Success", `Done, found ${products.length} products`);

    await browser.close();

    end("Kaufland", products.length, products.filter((p) => p.valid).length);

    return products;
  } catch (e) {
    log("Kaufland", "Error", `Error scraping`, e.toString());
    end("Kaufland", 0, 0, true);
    return [];
  }
}
