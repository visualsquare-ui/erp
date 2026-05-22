import fs from "node:fs";
import Module from "pg-query-emscripten";

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error("Usage: node scripts/validate-sql.mjs <file.sql> [...]");
  process.exit(1);
}

const pgQuery = await new Module();
let failed = false;

for (const file of files) {
  const sql = fs.readFileSync(file, "utf8");

  try {
    pgQuery.parse(sql);
    console.log(`SQL OK: ${file}`);
  } catch (error) {
    failed = true;
    console.error(`SQL FAIL: ${file}`);
    console.error(error.message || error);
  }
}

if (failed) {
  process.exit(1);
}
