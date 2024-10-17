"use client";

import React, { useState } from "react";
import style from "./sidebar.module.scss";
import { useSearchParams, useRouter } from "next/navigation";
import { FaSearch, FaTimes } from "react-icons/fa";

export const Sidebar = () => {
  const searchParams = useSearchParams();
  const q = searchParams.get("query");
  const [query, setQuery] = useState(q || "");
  const router = useRouter();

  const submitHandler: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const newParams = new URLSearchParams(searchParams);
    if (!query) {
      newParams.delete("query");
    } else {
      newParams.set("query", query);
    }
    router.replace(`/?${newParams.toString()}`);
  };

  const clearFilter: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("query");
    router.replace(`/?${newParams.toString()}`);
    setQuery("");
  };

  return (
    <aside className={style.sidebar}>
      <div className={style.search}>
        <form noValidate onSubmit={submitHandler}>
          <FaSearch />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pretraga" />
        </form>
        {q && (
          <form className={style.clear} noValidate onSubmit={clearFilter}>
            <button type="submit" title="Obriši filter">
              <FaTimes />
            </button>
          </form>
        )}
      </div>
    </aside>
  );
};
