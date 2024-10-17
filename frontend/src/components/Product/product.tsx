import React from "react";
import { Product as TProduct } from "@prisma/client";
import style from "./product.module.scss";

type Props = {
  product: TProduct;
};

export const Product: React.FC<Props> = ({ product }) => {
  return (
    <div className={style.container}>
      <a href={product.link} className={style.link} />
      <div className={style.image}>
        <img src={product.image} className={style.productImage} />
        <img src={`/images/${product.shop.toLowerCase()}.png`} className={style.shopImage} />
      </div>
      <h4>{product.title}</h4>
      <div className={style.price}>{(product.priceCents / 100).toFixed(2).replace(".", ",")} €</div>
    </div>
  );
};
