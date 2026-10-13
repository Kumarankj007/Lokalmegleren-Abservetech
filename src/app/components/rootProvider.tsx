"use client"; 
import { MetaProvider } from "../_context/MetaData";
export default function RootProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <MetaProvider>
      {children}
      </MetaProvider>
  );
}
