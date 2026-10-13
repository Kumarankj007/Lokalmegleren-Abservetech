// app/context/MetaContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
// import Head from "next/head";

type MetaDataType = {
  title: string;
  description: string;
  ogImage: string;
};

type MetaContextType = {
  meta: MetaDataType;
  setMeta: (meta: Partial<MetaDataType>) => void;
};

const defaultMeta: MetaDataType = {
  title: "Default Title",
  description: "Default description",
  ogImage: new URL(`https://content.hostgator.com/img/temp-url-public-html-addon-folder.png`).toString(),
};

const MetaContext = createContext<MetaContextType>({
  meta: defaultMeta,
  setMeta: () => {},
});

export function useMeta() {
  return useContext(MetaContext);
}

export function MetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMetaState] = useState<MetaDataType>(defaultMeta);

  const setMeta = (newMeta: Partial<MetaDataType>) => {
    setMetaState(prev => ({ ...prev, ...newMeta }));
  };

  return (
    <MetaContext.Provider value={{ meta, setMeta }}>
      <head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image" content={meta.ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={meta.ogImage} />
      </head>
      {children}
    </MetaContext.Provider>
  );
}
