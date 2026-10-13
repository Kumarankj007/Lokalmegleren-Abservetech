"use client";

import { useEffect } from "react";
import GetLedigeList from "../api/dynamicPagesapi/LedigeList";
import Banner from "./banner";
import Content from "./content";

export default function Ledige() {
  const { ledigeList, FetchLedigeList } = GetLedigeList();

  useEffect(() => {
    FetchLedigeList();
  }, [FetchLedigeList]);

  const data = ledigeList ?? [];
  const banner = data[0];
  const cards = data.slice(1);
  return (
    <>
      <Banner data={banner} />
      <Content items={cards} />
    </>
  );
}
