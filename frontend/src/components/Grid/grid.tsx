import React from "react";
import style from "./grid.module.scss";
import prisma from "../../../../prisma";
import { Product } from "../Product/product";

type Props = {
  searchParams?: { category?: string; page?: number; query?: string };
};

export const Grid = async ({ searchParams }: Props) => {
  console.log(searchParams);
  const where: Record<string, Object> = {};
  if (searchParams?.query) {
    where.title = { contains: searchParams.query };
  }
  const products = await prisma.product.findMany({ where, orderBy: { priceCents: "asc" }, take: 100 });

  return (
    <div className={style.container}>
      {products.map((p) => (
        <Product key={p.id} product={p} />
      ))}
    </div>
  );
};
