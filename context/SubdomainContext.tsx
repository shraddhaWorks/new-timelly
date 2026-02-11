"use client";

import { createContext, useContext, ReactNode } from "react";

export type SubdomainSchool = {
  id: string;
  name: string;
  subdomain: string | null;
  logoUrl: string | null;
};

const SubdomainContext = createContext<SubdomainSchool | null>(null);

export function SubdomainProvider({
  school,
  children,
}: {
  school: SubdomainSchool | null;
  children: ReactNode;
}) {
  return (
    <SubdomainContext.Provider value={school}>
      {children}
    </SubdomainContext.Provider>
  );
}

export function useSubdomainSchool(): SubdomainSchool | null {
  return useContext(SubdomainContext);
}
