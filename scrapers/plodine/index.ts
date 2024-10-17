import { extractItemData, getDateFromImage, mapProducts } from "./helpers";
import puppeteer, { ElementHandle } from "puppeteer";
import { log, start, end } from "../../logger";

const MAIN_ACTIONS_MENU = ".menu__list";
const ACTION_CATEGORIES_SELECTOR = ".sidebar__list";
const ITEMS_HEADER_IMAGE = ".category__figure img";
const ITEMS_GRID_SELECTOR = ".category__wrap";

export async function scrape() {
  try {
    log("Plodine", "Info", "Starting!");
    start("Plodine");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

    // Open main page
    await page.goto("https://www.plodine.hr/");

    const menu = await page.waitForSelector(MAIN_ACTIONS_MENU);

    const mainLinks = await menu.evaluate((el) => {
      return [...el.querySelectorAll("a.menu__link")].map((a: HTMLAnchorElement) => a.href);
    });

    let categoryLinks = new Set<string>();

    for (const link of mainLinks) {
      await page.goto(link);
      const categories = await page.waitForSelector(ACTION_CATEGORIES_SELECTOR);

      //wait for  categories list
      const links = await categories.evaluate((el) => {
        return [...el.children].map((li: HTMLLIElement) => {
          return (li.firstChild as HTMLAnchorElement).href;
        });
      });

      links.forEach((l) => categoryLinks.add(l));
    }

    if (process.env.TEST === "true") {
      categoryLinks = new Set([[...categoryLinks][0]]);
    }

    let products = [];
    let pageNumber = 0;
    for (const link of categoryLinks) {
      pageNumber++;
      log("Plodine", "Info", `Fetching page ${link} (${pageNumber}/${categoryLinks.size})`);

      await page.goto(link);
      const image = await page.waitForSelector(ITEMS_HEADER_IMAGE);
      const imgSrc = await image.evaluate((img) => {
        return img.src;
      });

      const dates = await getDateFromImage(imgSrc);

      const grid = (await page.waitForSelector(ITEMS_GRID_SELECTOR)) as ElementHandle<HTMLDivElement>;
      products.push(...(await mapProducts(await extractItemData(grid), dates, link)));
    }

    log("Plodine", "Success", `Done, found ${products.length} products`);

    await browser.close();

    end("Plodine", products.length, products.filter((p) => p.valid).length);

    return products;
  } catch (e) {
    log("Plodine", "Error", `Error scraping`, e.toString());
    end("Plodine", 0, 0, true);
    return [];
  }
}
