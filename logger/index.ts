import { Shop, LogLevel } from "@prisma/client";
import prisma from "../prisma";

export async function clear(shop?: string) {
  if (shop) {
    return prisma.$queryRaw`DELETE from log WHERE shop = ${shop}`;
  } else {
    return prisma.$queryRaw`TRUNCATE log`;
  }
}

export async function log(shop: Shop | null, level: LogLevel, message: string, trace?: string) {
  return prisma.log.create({
    data: {
      level,
      message,
      shop,
      trace,
      time: Date.now(),
    },
  });
}

export async function start(shop: Shop) {
  return prisma.stats.upsert({
    where: { shop: shop },
    update: {
      duration: null,
      productTotal: null,
      productValid: null,
      start: new Date(),
      state: "Running",
    },
    create: {
      shop,
      start: new Date(),
      state: "Running",
    },
  });
}

export async function end(shop: Shop, productTotal: number, productValid: number, error = false) {
  const stat = await prisma.stats.findFirst({ where: { shop } });
  if (stat) {
    await prisma.stats.update({
      where: { shop },
      data: {
        duration: Math.trunc((Date.now() - stat.start.valueOf()) / 1000),
        productTotal,
        productValid,
        state: error ? "Error" : "Success",
      },
    });
  }
}
