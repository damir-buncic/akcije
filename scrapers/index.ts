import prisma from "../prisma";
import { log, clear } from "../logger";
import { scrape as scrapeKonzum } from "./konzum";
import { scrape as scrapeKaufland } from "./kaufland";
import { scrape as scrapeLidl } from "./lidl";
import { scrape as scrapePlodine } from "./plodine";
import { scrape as scrapeSpar } from "./spar";
import { Product, Shop } from "@prisma/client";

const scraper: Shop | string = process.argv[2];

async function scrape() {
  await clear(scraper);
  const start = Date.now();
  let products: Product[] = [];
  switch (scraper) {
    case "Konzum":
      products = await scrapeKonzum();
      break;
    case "Kaufland":
      products = await scrapeKaufland();
      break;
    case "Lidl":
      products = await scrapeLidl();
      break;
    case "Plodine":
      products = await scrapePlodine();
      break;
    case "Spar":
      products = await scrapeSpar();
      break;
    default:
      const konzumProducts = await scrapeKonzum();
      const kauflandProducts = await scrapeKaufland();
      const lidlProducts = await scrapeLidl();
      const plodineProducts = await scrapePlodine();
      const sparProducts = await scrapeSpar();

      products = [
        ...konzumProducts,
        ...kauflandProducts,
        ...lidlProducts,
        ...plodineProducts,
        ...sparProducts,
      ] as Product[];
      break;
  }

  await updateProducts(products, scraper);

  const durationSeconds = (Date.now() - start) / 1000;
  const duration = `${Math.trunc(durationSeconds / 60)} minutes ${Math.round(durationSeconds % 60)} seconds`;

  log(null, "Success", `Scraped ${products.length} products in ${duration}`);
}

async function updateProducts(products: Product[], shop: string | Shop) {
  if (isShop(shop)) {
    log(null, "Info", `Updating ${shop} products`);
    await prisma.$transaction([
      prisma.product.deleteMany({ where: { shop } }),
      prisma.product.createMany({ data: products }),
    ]);
  } else {
    log(null, "Info", `Updating products`);
    await prisma.$transaction([prisma.$queryRaw`TRUNCATE product;`, prisma.product.createMany({ data: products })]);
  }
}

function isShop(v: string | Shop): v is Shop {
  return Object.values(Shop).includes(v as Shop);
}

scrape();
