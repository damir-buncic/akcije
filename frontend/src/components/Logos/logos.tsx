import React from "react";
import style from "./logos.module.scss";

export const Logos = () => {
  return (
    <div className={style.container}>
      <img src="/images/konzum.png" />
      <img src="/images/kaufland.png" />
      <img src="/images/plodine.png" />
      <img src="/images/lidl.png" />
      <img src="/images/spar.png" />
    </div>
  );
};
