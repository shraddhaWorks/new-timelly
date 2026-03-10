/**
 * Deletes all student data: students (cascade to fees, payments, etc.) then their User accounts.
 * Load env from .env if present. Run from project root:
 *   node --env-file=.env scripts/delete-all-students.js
 * Or (Node < 20): set DATABASE_URL and run node scripts/delete-all-students.js
 */
const path = require("path");
const fs = require("fs");
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  });
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({
    select: { id: true, userId: true, admissionNumber: true },
  });
  console.log(`Found ${students.length} student(s) to delete.`);
  if (students.length === 0) {
    console.log("Nothing to delete.");
    return;
  }
  const userIds = students.map((s) => s.userId);
  const deletedStudents = await prisma.student.deleteMany({});
  console.log(`Deleted ${deletedStudents.count} student record(s).`);
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: userIds } },
  });
  console.log(`Deleted ${deletedUsers.count} user account(s).`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
