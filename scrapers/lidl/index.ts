import puppeteer from "puppeteer";
import { extractItemData, mapProducts } from "./helpers";
import { autoScroll, waitAndClick } from "../utils";
import { log, start, end } from "../../logger";

const ACTIONS_LINK_SELECTOR = ".n-header__main-navigation-link--first";
const ACTION_CATEGORIES_SELECTOR = ".ATheHeroStage__SliderTrack";
const ITEMS_GRID_SELECTOR = "div.ATheCampaign__Page";

export async function scrape() {
  try {
    log("Lidl", "Info", "Starting!");
    start("Lidl");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

    // Open main page
    await page.goto("https://www.lidl.hr/");

    await waitAndClick(ACTIONS_LINK_SELECTOR, page);

    //wait for  categories list
    const categories = await page.waitForSelector(ACTION_CATEGORIES_SELECTOR);
    let categoryLinks = await categories.evaluate((el) => {
      return [...el.children].map((li: HTMLLIElement) => {
        return (li.firstChild as HTMLAnchorElement).href;
      });
    });

    if (process.env.TEST === "true") {
      categoryLinks = [categoryLinks[0]];
    }

    let products = [];
    let pageNumber = 0;
    for (const link of categoryLinks) {
      pageNumber++;
      log("Lidl", "Info", `Fetching page ${link} (${pageNumber}/${categoryLinks.length})`);
      await page.goto(link);
      await autoScroll(page);
      const grid = await page.waitForSelector(ITEMS_GRID_SELECTOR);
      products.push(...mapProducts(await extractItemData(grid)));
    }

    log("Lidl", "Success", `Done, found ${products.length} products`);

    await browser.close();

    end("Lidl", products.length, products.filter((p) => p.valid).length);

    return products;
  } catch (e) {
    log("Lidl", "Error", `Error scraping`, e.toString());
    end("Lidl", 0, 0, true);
    return [];
  }
}
