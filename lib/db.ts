import { PrismaClient } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

// Use DIRECT_URL to avoid Supabase pooler's 60s statement timeout (causes "statement timeout" errors)
// Append statement_timeout for long-running operations (school create, etc.)
const base = process.env.DIRECT_URL || process.env.DATABASE_URL!;
const connectionString = base.includes("?")
  ? `${base}&statement_timeout=120000`
  : `${base}?statement_timeout=120000`;

const adapter = new PrismaPg({
  connectionString,
  ssl: { rejectUnauthorized: false }, // required for Supabase/remote Postgres
});

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}