import { headers } from "next/headers";
import prisma from "@/lib/db";
import { extractSubdomain } from "@/lib/subdomain";
import { SubdomainProvider } from "@/context/SubdomainContext";

export default async function SubdomainSchoolFetcher({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const subdomain = extractSubdomain(host) ?? headersList.get("x-school-subdomain");

  let school: { id: string; name: string; subdomain: string | null; logoUrl: string | null } | null = null;

  if (subdomain) {
    const row = await prisma.school.findFirst({
      where: { subdomain, isActive: true },
      select: { id: true, name: true, subdomain: true, logoUrl: true },
    });
    if (row) school = row;
  }

  return <SubdomainProvider school={school}>{children}</SubdomainProvider>;
}
