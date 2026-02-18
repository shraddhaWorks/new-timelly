import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Keep Prisma connection count low in dev/serverless to avoid exhausting pooled sessions.
// Also append statement timeout for heavier operations.
const base = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!base) {
  throw new Error("Missing DATABASE_URL or DIRECT_URL for Prisma.");
}

function withParam(url: string, key: string, value: string) {
  if (!url) return url;
  const hasQuery = url.includes("?");
  const encodedKey = `${key}=`;
  if (url.includes(encodedKey)) return url;
  return `${url}${hasQuery ? "&" : "?"}${key}=${value}`;
}

let connectionString = base || "";
if (connectionString) {
  connectionString = withParam(connectionString, "statement_timeout", "120000");
  connectionString = withParam(connectionString, "connection_limit", "1");
  connectionString = withParam(connectionString, "pool_timeout", "20");
}

const prismaClientSingleton = () => {
  const pool = new Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 20000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
  });
};

declare const globalThis: {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// In serverless environments (like Vercel), we still want to reuse the connection
// but we need to handle it differently. The globalThis check works in both dev and production.
if (!globalThis.prismaGlobal) {
  globalThis.prismaGlobal = prisma;
}
